const dbModel = require('../models/dbModel');

class DBService {
    async executeQuery(query, params = []) {
        try {
            const result = await dbModel.query(query, params);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getTableRows(tableName) {
        try {
            const query = `SELECT * FROM ${tableName}`;
            const result = await dbModel.query(query);
            return { success: true, data: result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

module.exports = new DBService();
