const fs = require('fs');
const path = require('path');

const dbFilePath = path.join(__dirname, '../database.json');

// ડેટાબેઝ ફાઇલ ચેક કરીને ન હોય તો બનાવી દેવા માટેનું ફંક્શન
function initDatabase() {
    if (!fs.existsSync(dbFilePath)) {
        const initialData = {
            users: [],
            tables: {},
            files: [],
            apiKeys: []
        };
        fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2));
    }
}

// ડેટા રીડ કરવા માટે
function readDB() {
    initDatabase();
    const data = fs.readFileSync(dbFilePath, 'utf8');
    return JSON.parse(data);
}

// ડેટા રાઇટ કરવા માટે
function writeDB(data) {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
}

module.exports = { initDatabase, readDB, writeDB };
      
