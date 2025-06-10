require('dotenv').config();
const JiraClient = require('jira-client');
const path = require('path');
const fs = require('fs').promises;

// Initialize Jira client
const jira = new JiraClient({
    protocol: 'https',
    host: process.env.JIRA_URL,
    username: process.env.JIRA_EMAIL,
    password: process.env.JIRA_API_TOKEN,
    apiVersion: '3',
    strictSSL: false,
});

// Test Jira connection
async function testJiraConnection() {
    try {
        const user = await jira.getCurrentUser();
        console.log('Jira connection successful:', user.displayName, user.emailAddress);
        // Verify project access
        const project = await jira.getProject(process.env.JIRA_PROJECT_KEY);
        
        console.log('Project access confirmed:', project.key, project.name);
    } catch (error) {
        console.error('Jira connection failed:', JSON.stringify(error));
    }
}

// Format date for Jira API
function formatJiraDate(date) {
    const pad = (num) => String(num).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Add a new issue to Jira
async function addNewIssue(description, deadline, assigneeAccountId) {
    return await jira.addNewIssue({
        fields: {
            project: { key: process.env.JIRA_PROJECT_KEY },
            summary: description,
            issuetype: { name: 'Task' },
            assignee: { accountId: assigneeAccountId },
            duedate: deadline,
        },
    });
}

// Search Jira issues
async function searchJiraIssues(jql, fields = ['key', 'summary', 'assignee', 'status', 'created', 'duedate'], maxResults = 100) {
    return await jira.searchJira(jql, {
        fields,
        maxResults
    });
}

// Get issue changelog
async function getIssueChangelog(issueId) {
    return await jira.getIssueChangelog(issueId);
}

module.exports = {
    jira,
    testJiraConnection,
    formatJiraDate,
    addNewIssue,
    searchJiraIssues,
    getIssueChangelog
};