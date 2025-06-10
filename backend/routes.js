const express = require('express');
const router = express.Router();
const { getIssuesByProjectKey } = require('./controllers/issueController');

// Store recent changes in memory
let recentTaskChanges = [];

// Add function to update recent changes
const updateRecentChanges = (changes) => {
  recentTaskChanges = [...changes, ...recentTaskChanges].slice(0, 10); // Keep last 10
};

// Expose this function
router.updateRecentChanges = updateRecentChanges;

// Add new endpoint
router.get('/notifications', (req, res) => {
  res.json(recentTaskChanges);
});

router.get('/', getIssuesByProjectKey);

module.exports = router;