AI-Project Manager
AI-Project Manager is a Slack bot that automates task creation and monitoring for Jira projects. It listens for task requests in a Slack channel, creates corresponding Jira issues, assigns them to team members using a round-robin strategy, and proactively monitors tasks for delays or updates, notifying the project manager via Slack DMs.
Features

Task Creation: Automatically creates Jira tasks from messages in a designated Slack channel (#project-tasks).
Smart Parsing: Uses natural language processing (via compromise) to extract task descriptions and deadlines.
Round-Robin Assignment: Assigns tasks to team members in a fair, rotating order.
Proactive Monitoring:
Checks every 6 hours for tasks stuck in "To Do" status for over 6 hours.
Monitors Jira for task updates every 30 minutes and notifies the project manager of changes.


Slack Notifications: Sends detailed alerts to the project manager for stuck tasks or updates, including issue details and change logs.

Tech Stack

Node.js: Backend runtime environment.
Express: Web server framework.
@slack/bolt: Slack API integration for bot functionality.
jira-client: Jira API client for task creation and monitoring.
compromise: NLP library for parsing task descriptions and deadlines.
node-cron: Scheduler for periodic task monitoring.
File System: Stores team, task, and state data in JSON files.

Prerequisites

Node.js (v16 or higher)
A Slack workspace with a bot user configured
A Jira instance with API access
Environment variables set in a .env file

Installation

Clone the Repository:
git clone https://github.com/your-username/ai-project-manager.git
cd ai-project-manager


Install Dependencies:
npm install


Set Up Environment Variables:Create a .env file in the backend directory with the following:
SLACK_BOT_TOKEN=your-slack-bot-token
SLACK_SIGNING_SECRET=your-slack-signing-secret
JIRA_URL=your-jira-url (e.g., your-domain.atlassian.net)
JIRA_EMAIL=your-jira-email
JIRA_API_TOKEN=your-jira-api-token
JIRA_PROJECT_KEY=your-project-key (e.g., PM)
PROJECT_MANAGER_SLACK_ID=slack-user-id (e.g., U12345678)
PORT=3000


Configure Team Data:Edit backend/team.json to include your team members’ Slack and Jira IDs:
[
  { "id": "SLACK_USER_ID_1", "jiraAccountId": "JIRA_ACCOUNT_ID_1" },
  { "id": "SLACK_USER_ID_2", "jiraAccountId": "JIRA_ACCOUNT_ID_2" }
]


Run the Application:
cd backend
npm start



Usage

Task Creation:

Post a message in the #project-tasks Slack channel (e.g., "Create a report by next Friday").
The bot parses the message, creates a Jira issue, assigns it to a team member, and confirms in Slack.


Monitoring:

The bot checks Jira every 6 hours for tasks stuck in "To Do" for over 6 hours and notifies the project manager.
Every 30 minutes, it checks for task updates (e.g., status or assignee changes) and sends Slack DMs with details.


Testing:

Use the test endpoint to trigger monitoring manually:curl http://localhost:3000/test-changes


Update a Jira issue (e.g., change status of PM-15) to verify notifications.



Project Structure
ai-project-manager/
├── backend/
│   ├── index.js          # Main application logic
│   ├── team.json        # Team member Slack and Jira IDs
│   ├── tasks.json       # Stores Slack-created task metadata
│   ├── state.json       # Tracks round-robin assignment state
│   ├── last_check.json  # Stores last monitoring timestamp
│   ├── .env             # Environment variables
│   └── package.json     # Dependencies and scripts
├── README.md            # Project documentation

Configuration

Slack Setup:

Create a Slack app with chat:write, commands, and events scopes.
Subscribe to message.channels events for the #project-tasks channel.
Install the app in your workspace and get the bot token and signing secret.


Jira Setup:

Generate an API token at https://id.atlassian.com/manage-profile/security/api-tokens.
Ensure the Jira user has access to the project (JIRA_PROJECT_KEY).


Cron Schedules:

Stuck tasks: Every 6 hours (0 */6 * * *).
Task updates: Every 30 minutes (*/30 * * * *).



Troubleshooting

JSON Parse Errors:

Check last_check.json, team.json, tasks.json, and state.json for valid JSON.
Delete invalid files to trigger reinitialization on restart.


Jira API Errors:

Verify JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN, and JIRA_PROJECT_KEY in .env.
Ensure the Jira status is "To Do" (case-sensitive) or update the script to match your workflow.


Slack Notifications:

Confirm PROJECT_MANAGER_SLACK_ID is correct and the bot has chat:write scope.
Check Slack API rate limits if notifications fail.



Contributing

Fork the repository.
Create a feature branch (git checkout -b feature/your-feature).
Commit changes (git commit -m "Add your feature").
Push to the branch (git push origin feature/your-feature).
Open a pull request with a clear description.


Contact
For questions or support, contact Natnael Malike or open an issue on GitHub.

⭐ Star this repo if you find it useful! Contributions and feedback are welcome.
