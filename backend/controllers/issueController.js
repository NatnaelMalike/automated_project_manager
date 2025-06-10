require('dotenv').config();
const { jira } = require('../services/jiraService');

exports.getIssuesByProjectKey = async (req, res) => {
  try {
    const jql = `project = ${process.env.JIRA_PROJECT_KEY}`;
    const issues = await jira.searchJira(jql);
    res.status(200).json({
      total: issues.total,
      issues: issues.issues.map(issue => ({
        id: issue.id,
        key: issue.key,
        self: issue.self,
        fields: {
          summary: issue.fields.summary,
          issuetype: {
            name: issue.fields.issuetype.name,
            iconUrl: issue.fields.issuetype.iconUrl
          },
          project: {
            key: issue.fields.project.key,
            name: issue.fields.project.name
          },
          status: {
            name: issue.fields.status.name
          },
          priority: {
            name: issue.fields.priority.name
          },
          assignee: {
            displayName: issue.fields.assignee?.displayName || null,
            accountId: issue.fields.assignee?.accountId || null
          },
          creator: {
            displayName: issue.fields.creator.displayName,
            accountId: issue.fields.creator.accountId
          },
          created: issue.fields.created,
          updated: issue.fields.updated,
          duedate: issue.fields.duedate
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
};