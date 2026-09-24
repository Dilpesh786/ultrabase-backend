const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logMessage = (message, type = 'INFO') => {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] [${type}]: ${message}\n`;
    
    console.log(logLine.trim());
    
    fs.appendFile(path.join(logDir, 'app.log'), logLine, (err) => {
        if (err) {
            console.error('Failed to write to log file:', err);
        }
    });
};

module.exports = {
    logMessage
};
