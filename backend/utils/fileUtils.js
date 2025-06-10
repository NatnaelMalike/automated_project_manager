const fs = require('fs').promises;
const path = require('path');

const LAST_CHECK_FILE = path.join(__dirname, '..', 'last_check.json');

// Initialize last check file
async function initializeLastCheck() {
    try {
        await fs.access(LAST_CHECK_FILE);
    } catch {
        await fs.writeFile(LAST_CHECK_FILE, JSON.stringify({ lastCheck: new Date().toISOString() }, null, 2));
        console.log('Initialized last_check.json');
    }
}

module.exports = {
    initializeLastCheck
};