const { sendSuccess, sendError } = require('../utils/responseHelper');

const getSystemStats = (req, res) => {
    try {
        const stats = {
            status: 'Healthy',
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            nodeVersion: process.version,
            timestamp: new Date().toISOString()
        };
        return sendSuccess(res, 'Admin stats retrieved successfully', stats);
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

module.exports = {
    getSystemStats
};
