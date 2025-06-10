# 🤖 Automated Project Manager

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Slack](https://img.shields.io/badge/Slack-4A154B?logo=slack&logoColor=white)](https://slack.com)
[![Jira](https://img.shields.io/badge/Jira-0052CC?logo=jira&logoColor=white)](https://www.atlassian.com/software/jira)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://reactjs.org)

> A powerful integration between Slack and Jira that automates task management and provides real-time project monitoring.

## ✨ Features

### 🔄 Automated Task Management
- **Slack Integration**: Automatically creates Jira issues from messages posted in a designated Slack channel
- **Smart Parsing**: Uses natural language processing to extract task descriptions and deadlines
- **Fair Assignment**: Distributes tasks among team members using a round-robin strategy

### 📊 Proactive Monitoring
- **Stuck Task Detection**: Identifies tasks that have been in "To Do" status for too long
- **Change Tracking**: Monitors Jira for task updates and notifies stakeholders
- **Real-time Notifications**: Sends detailed alerts to the project manager via Slack DMs

### 📱 Interactive Dashboard
- **Visual Analytics**: Charts and graphs showing project status and distribution
- **Task Overview**: Comprehensive table of recent issues with filtering options
- **Notification Center**: Real-time updates on task changes and status

## 🛠️ Tech Stack

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express**: Web application framework
- **@slack/bolt**: Official Slack API framework
- **jira-client**: Jira API integration
- **compromise**: Natural language processing for task parsing
- **node-cron**: Scheduled task monitoring

### Frontend
- **React**: UI component library
- **Chart.js**: Data visualization
- **React Query**: Data fetching and state management
- **Tailwind CSS**: Utility-first CSS framework

### Storage
- **JSON Files**: Simple file-based storage for team, task, and state data

## 📋 Prerequisites

- Node.js (v16 or higher)
- A Slack workspace with bot user permissions
- A Jira instance with API access
- Environment variables configured in a `.env` file

## 🚀 Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/automated-project-manager.git
cd automated-project-manager
```

### Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configure Environment Variables

Create a `.env` file in the backend directory with the following:

```
SLACK_BOT_TOKEN=your-slack-bot-token
SLACK_SIGNING_SECRET=your-slack-signing-secret
SLACK_TASK_CHANNEL_ID=your-channel-id
JIRA_URL=your-jira-url (e.g., your-domain.atlassian.net)
JIRA_EMAIL=your-jira-email
JIRA_API_TOKEN=your-jira-api-token
JIRA_PROJECT_KEY=your-project-key (e.g., PM)
PROJECT_MANAGER_SLACK_ID=slack-user-id (e.g., U12345678)
PORT=3000
```

### Configure Team Data

Edit `backend/team.json` to include your team members' Slack and Jira IDs:

```json
[
  { "id": "SLACK_USER_ID_1", "jiraAccountId": "JIRA_ACCOUNT_ID_1" },
  { "id": "SLACK_USER_ID_2", "jiraAccountId": "JIRA_ACCOUNT_ID_2" }
]
```

## 🏃‍♂️ Running the Application

### Start the Backend

```bash
cd backend
npm start
```

### Start the Frontend (Development Mode)

```bash
cd frontend
npm run dev
```



## 📝 Usage

### Creating Tasks

1. Post a message in the designated Slack channel (e.g., `#project-tasks`)
2. Format: `[Task description] by [deadline]` (e.g., "Create a login page by next Friday")
3. The bot will create a Jira issue, assign it to a team member, and confirm in Slack

### Monitoring Tasks

- The system automatically checks for tasks stuck in "To Do" status every 6 hours
- Task updates are monitored every 30 minutes
- Notifications are sent to the project manager's Slack

### Using the Dashboard

- View project status distribution with pie and bar charts
- See recent issues in a sortable and filterable table
- Get real-time notifications about task changes

## 🧪 Testing

### Manual Testing

- Use the test endpoint to trigger monitoring: `curl http://localhost:3000/api/projects/test-changes`
- Update a Jira issue (e.g., change status) to verify notifications

## 📁 Project Structure

```
automated-project-manager/
├── backend/
│   ├── controllers/       # API controllers
│   ├── services/          # Core business logic
│   │   ├── jiraService.js # Jira API integration
│   │   ├── slackService.js # Slack API integration
│   │   └── monitorService.js # Task monitoring
│   ├── utils/             # Utility functions
│   ├── index.js           # Main application entry
│   ├── routes.js          # API routes
│   ├── team.json          # Team member data
│   ├── tasks.json         # Task metadata
│   ├── state.json         # Round-robin state
│   └── last_check.json    # Monitoring timestamp
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx        # Main application component
│   │   └── main.jsx       # Entry point
│   └── public/            # Static assets
└── README.md              # Project documentation
```

## ⚙️ Configuration

### Slack Setup

1. Create a Slack app at [api.slack.com/apps](https://api.slack.com/apps)
2. Add the following scopes:
   - `chat:write`
   - `channels:history`
   - `im:write`
3. Subscribe to `message.channels` events
4. Install the app to your workspace
5. Copy the bot token and signing secret to your `.env` file

### Jira Setup

1. Generate an API token at [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Ensure the Jira user has access to the project specified by `JIRA_PROJECT_KEY`
3. Add the API token and other Jira details to your `.env` file

### Scheduled Monitoring

- Stuck tasks: Every 6 hours (`0 */6 * * *`)
- Task updates: Every 30 minutes (`30 * * * * *`)

## 🔍 Troubleshooting

### JSON Parse Errors

- Check `last_check.json`, `team.json`, `tasks.json`, and `state.json` for valid JSON
- Delete invalid files to trigger reinitialization on restart

### Jira API Errors

- Verify `JIRA_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`, and `JIRA_PROJECT_KEY` in `.env`
- Ensure the Jira status is "To Do" (case-sensitive) or update the script to match your workflow

### Slack Notifications

- Confirm `PROJECT_MANAGER_SLACK_ID` is correct and the bot has `chat:write` scope
- Check Slack API rate limits if notifications fail

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For questions or support, contact Natnael Malike or open an issue on GitHub.

⭐ Star this repo if you find it useful! Contributions and feedback are welcome.
