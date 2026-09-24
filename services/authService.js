const dbModel = require('../models/dbModel');
const crypto = require('crypto');

class AuthService {
    async generateApiKey() {
        return 'ub_' + crypto.randomBytes(24).toString('hex');
    }

    async validateApiKey(apiKey) {
        try {
            const query = `SELECT * FROM api_keys WHERE key_string = ? AND status = 'active'`;
            const result = await dbModel.query(query, [apiKey]);
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error validating API key:', error.message);
            return null;
        }
    }
}

module.exports = new AuthService();
