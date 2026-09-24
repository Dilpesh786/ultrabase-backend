const { readDB, writeDB } = require('../config/dbConfig');

class DBModel {
    static getDatabase() {
        return readDB();
    }

    static saveDatabase(data) {
        writeDB(data);
    }

    static findTable(tableName) {
        const db = readDB();
        return db.tables[tableName] || null;
    }
}

module.exports = DBModel;
