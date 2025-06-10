require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { searchJiraIssues, getIssueChangelog, formatJiraDate } = require('./jiraService');
const { findSlackId } = require('../utils/teamUtils');
const { sendSlackMessage } = require('./slackService');

const LAST_CHECK_FILE = path.join(__dirname, '..', 'last_check.json');

// Monitor tasks stuck in "To Do" status
async function monitorTasks() {
    try {
        console.log('Checking for tasks stuck in "To Do"...');
        const now = new Date();
        const stuckTasks = [];

        // JQL query to find tasks in "To Do" status in the project
        const jql = `project = ${process.env.JIRA_PROJECT_KEY} AND status = "To Do"`;
        const searchResults = await searchJiraIssues(jql);

        for (const issue of searchResults.issues) {
            // Fetch changelog to determine time in "To Do" status
            const issueDetails = await getIssueChangelog(issue.id);
            let statusChangeTime = new Date(issue.fields.created); // Fallback to creation date

            // Find the latest transition to "To Do"
            for (const entry of issueDetails.values.reverse()) {
                for (const item of entry.items) {
                    if (item.field === 'status' && item.toString.toLowerCase() === 'to do') {
                        statusChangeTime = new Date(entry.created);
                        break;
                    }
                }
            }

            const hoursInStatus = (now - statusChangeTime) / (1000 * 60 * 60);
            if (hoursInStatus > 6) {
                stuckTasks.push({
                    jiraId: issue.id,
                    key: issue.key,
                    description: issue.fields.summary,
                    assignee: issue.fields.assignee ? issue.fields.assignee.accountId : 'Unassigned',
                    assigneeSlackId: issue.fields.assignee ? (await findSlackId(issue.fields.assignee.accountId)) : 'Unassigned',
                    deadline: issue.fields.duedate || 'Not set',
                    statusChangeTime: statusChangeTime.toLocaleString(),
                    hoursStuck: hoursInStatus.toFixed(2),
                });
            }
        }

        if (stuckTasks.length > 0) {
            const message = `*Tasks Stuck in "To Do" for >6 Hours*\n\n` +
                stuckTasks.map(task => {
                    return `• *${task.key}*: ${task.description}\n` +
                           `  - Assignee: ${task.assigneeSlackId !== 'Unassigned' ? `<@${task.assigneeSlackId}>` : 'Unassigned'}\n` +
                           `  - Deadline: ${task.deadline}\n` +
                           `  - Stuck Since: ${task.statusChangeTime}\n` +
                           `  - Hours Stuck: ${task.hoursStuck}\n`;
                }).join('\n');

            // Get the Slack app instance
            const slackApp = require('../index').slackApp;
            await sendSlackMessage(slackApp, process.env.PROJECT_MANAGER_SLACK_ID, message);
            console.log(`Notified project manager about ${stuckTasks.length} stuck tasks.`);
        } else {
            console.log('No tasks stuck in "To Do" for >6 hours.');
        }
    } catch (error) {
        console.error('Error in monitorTasks:', error.message, error.stack);
    }
}

// Monitor for task changes
async function monitorTaskChanges() {
    try {
        console.log('Checking for Jira task changes...');
        const now = new Date();
        let lastCheckTime;

        // Read and validate last_check.json
        try {
            const content = await fs.readFile(LAST_CHECK_FILE, 'utf8');
            if (!content || content.trim() === '') {
                console.warn('last_check.json is empty, resetting to now...');
                lastCheckTime = now;
                await fs.writeFile(LAST_CHECK_FILE, JSON.stringify({ lastCheck: now.toISOString() }, null, 2));
            } else {
                const lastCheckData = JSON.parse(content);
                lastCheckTime = new Date(lastCheckData.lastCheck);
                if (isNaN(lastCheckTime)) {
                    console.warn('Invalid lastCheck time in last_check.json, resetting to now...');
                    lastCheckTime = now;
                    await fs.writeFile(LAST_CHECK_FILE, JSON.stringify({ lastCheck: now.toISOString() }, null, 2));
                }
            }
        } catch (error) {
            console.error('Error reading last_check.json:', error.message);
            lastCheckTime = now;
            await fs.writeFile(LAST_CHECK_FILE, JSON.stringify({ lastCheck: now.toISOString() }, null, 2));
            console.log('Reset last_check.json due to error');
        }

        const changedTasks = [];

        // JQL query with Jira-compatible date format
        const jql = `project = ${process.env.JIRA_PROJECT_KEY} AND updated >= "${formatJiraDate(lastCheckTime)}"`;
        console.log(`JQL Query: ${jql}`); // Debug JQL
        
        const searchResults = await searchJiraIssues(
            jql, 
            ['key', 'summary', 'assignee', 'status', 'duedate', 'updated']
        ).catch(error => {
            console.error('Jira API error:', JSON.stringify(error, null, 2));
            throw new Error(`Jira API error: ${error.message || JSON.stringify(error)}`);
        });

        for (const issue of searchResults.issues) {
            const issueDetails = await getIssueChangelog(issue.id).catch(error => {
                console.error(`Error fetching changelog for ${issue.key}:`, error.message);
                return { values: [] }; // Continue with empty changelog
            });
            const recentChanges = issueDetails.values.filter(entry => new Date(entry.created) > lastCheckTime);

            if (recentChanges.length > 0) {
                const changes = recentChanges.map(entry => {
                    return entry.items.map(item => {
                        return `${item.field} changed from "${item.fromString || 'none'}" to "${item.toString || 'none'}"`;
                    }).join(', ');
                }).join('; ');

                changedTasks.push({
                    key: issue.key,
                    summary: issue.fields.summary,
                    assignee: issue.fields.assignee ? issue.fields.assignee.accountId : 'Unassigned',
                    assigneeSlackId: issue.fields.assignee ? (await findSlackId(issue.fields.assignee.accountId)) : 'Unassigned',
                    status: issue.fields.status.name,
                    updated: new Date(issue.fields.updated).toLocaleString(),
                    changes: changes || 'No specific changes logged',
                });
            }
        }

        if (changedTasks.length > 0) {
            const message = `*Jira Tasks Updated Since Last Check*\n\n` +
                changedTasks.map(task => {
                    return `• *${task.key}*: ${task.summary}\n` +
                           `  - Assignee: ${task.assigneeSlackId !== 'Unassigned' ? `<@${task.assigneeSlackId}>` : 'Unassigned'}\n` +
                           `  - Status: ${task.status}\n` +
                           `  - Updated: ${task.updated}\n` +
                           `  - Changes: ${task.changes}\n`;
                }).join('\n');
                require('../routes').updateRecentChanges(changedTasks);
            // Get the Slack app instance
            const slackApp = require('../index').slackApp;
            await sendSlackMessage(slackApp, process.env.PROJECT_MANAGER_SLACK_ID, message);
            console.log(`Notified project manager about ${changedTasks.length} changed tasks.`);
        } else {
            console.log('No tasks changed since last check.');
        }

        // Update last check time
        await fs.writeFile(LAST_CHECK_FILE, JSON.stringify({ lastCheck: now.toISOString() }, null, 2));
    } catch (error) {
        console.error('Error in monitorTaskChanges:', error.message, error.stack);
    }
}

module.exports = {
    monitorTasks,
    monitorTaskChanges
};