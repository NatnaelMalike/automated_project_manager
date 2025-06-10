require('dotenv').config();
const express = require('express');
const { ExpressReceiver, App } = require('@slack/bolt');
const path = require('path');
const fs = require('fs').promises;
const cron = require('node-cron');
const { monitorTasks, monitorTaskChanges } = require('./services/monitorService');
const { initializeSlackApp } = require('./services/slackService');
const { testJiraConnection, addNewIssue } = require('./services/jiraService');
const { initializeLastCheck } = require('./utils/fileUtils');
const { getNextAssignee } = require('./utils/teamUtils');
const { parseTask } = require('./utils/taskUtils');
const projectsRouter = require('./routes');

const TASKS_FILE = path.join(__dirname, 'tasks.json');
// Initialize ExpressReceiver
const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    endpoints: '/slack/events',
});

const app = express();

// Initialize Slack app
    const slackApp = new App({
        token: process.env.SLACK_BOT_TOKEN,
        receiver,
    });
// Middleware setup
app.use("/",receiver.router);
app.use(express.json());
app.use('/api/projects', projectsRouter);
// URL verification endpoint
receiver.router.post('/slack/events', (req, res) => {
    if (req.body.type === 'url_verification') {
        return res.json({ challenge: req.body.challenge });
    }
    res.status(200).end();
});
slackApp.message(async ({ message, say, logger }) => {
    if (message.channel !== process.env.SLACK_TASK_CHANNEL_ID) {
        return;
    }

    if (message.subtype === 'bot_message' || message.bot_id) {
        logger.info('Ignoring message from a bot.');
        return;
    }

    logger.info(`Received message in #project-tasks: ${message.text}`);
    
    try {
        const { description, deadline } = parseTask(message.text);
        if (!description) {
            await say('Could not parse task description. Please provide a clear task.');
            return;
        }

        const assignee = await getNextAssignee();
        const issue = await addNewIssue(description, deadline, assignee.jiraAccountId);

        const tasks = JSON.parse(await fs.readFile(TASKS_FILE));
        tasks.push({
            jiraId: issue.id,
            description,
            assignee: assignee.id,
            deadline,
            slackTs: message.ts,
        });
        await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));

        await say(`Created Jira issue ${issue.key} for "${description}" assigned to ${assignee.id}, due ${deadline}.`);
    } catch (error) {
        console.error('Error processing task:', error);
        await say(`Failed to create Jira issue: ${error.message || 'Unknown error'}.`);
    }
});

// Initialize services
initializeLastCheck();
testJiraConnection();
cron.schedule('0 */6 * * *', monitorTasks);
cron.schedule('30 * * * * *', monitorTaskChanges);
// Error handling
slackApp.error(async (error) => {
    console.error('Slack app error:', error);
});
app.use('/', receiver.router);
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = { app, slackApp };