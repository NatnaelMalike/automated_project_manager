const fs = require('fs').promises;
const path = require('path');

const TEAM_FILE = path.join(__dirname, '..', 'team.json');
const STATE_FILE = path.join(__dirname, '..', 'state.json');

// Get next assignee using round-robin
async function getNextAssignee() {
    const team = JSON.parse(await fs.readFile(TEAM_FILE));
    const state = JSON.parse(await fs.readFile(STATE_FILE));
    let nextIndex = (state.lastAssigneeIndex + 1) % team.length;
    await fs.writeFile(STATE_FILE, JSON.stringify({ lastAssigneeIndex: nextIndex }, null, 2));
    return team[nextIndex];
}

// Find Slack ID from Jira account ID
async function findSlackId(jiraAccountId) {
    const team = JSON.parse(await fs.readFile(TEAM_FILE));
    const member = team.find(member => member.jiraAccountId === jiraAccountId);
    return member ? member.id : 'Unassigned';
}

module.exports = {
    getNextAssignee,
    findSlackId
};