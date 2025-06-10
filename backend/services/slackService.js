require('dotenv').config();
const { App } = require('@slack/bolt');
const path = require('path');
const fs = require('fs').promises;
const { parseTask } = require('../utils/taskUtils');
const { addNewIssue } = require('./jiraService');
const { getNextAssignee } = require('../utils/teamUtils');

const TASKS_FILE = path.join(__dirname, 'tasks.json');

function initializeSlackApp(receiver) {
    const slackApp = new App({
        token: process.env.SLACK_BOT_TOKEN,
        receiver,
    });

    // Listen for messages in #project-tasks
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

    return slackApp;
}

async function sendSlackMessage(slackApp, channelId, message) {
    try {
        const result = await slackApp.client.chat.postMessage({
            channel: channelId,
            text: message,
        });
        return result;
    } catch (error) {
        console.error('Error sending Slack message:', error);
        throw error;
    }
}

module.exports = {
    initializeSlackApp,
    sendSlackMessage
};