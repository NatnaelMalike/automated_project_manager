const nlp = require('compromise');
const nlpDates = require('compromise-dates');

// Extend compromise with dates plugin
nlp.extend(nlpDates);

// Parse task details using Compromise
function parseTask(messageText) {
    const doc = nlp(messageText);
    const byIndex = messageText.toLowerCase().indexOf(' by ');
    const description = byIndex !== -1 ? messageText.slice(0, byIndex).trim() : messageText.trim();
    const dates = doc.dates().json();
    let deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    if (dates.length > 0 && dates[0].dates && dates[0].dates.start) {
        const parsedDate = new Date(dates[0].dates.start);
        if (!isNaN(parsedDate)) {
            deadline = parsedDate.toISOString().split('T')[0];
        }
    }
    console.log(`Parsed task - Description: "${description}", Deadline: ${deadline}`);
    return { description: description || 'Untitled Task', deadline };
}

module.exports = {
    parseTask
};