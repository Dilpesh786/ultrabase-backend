const express = require('express');
const router = express.Router();
const { sendSuccess, sendError } = require('../utils/responseHelper');

router.get('/stats', (req, res) => {
    try {
        const stats = {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            activeConnections: 'N/A',
            timestamp: new Date()
        };
        return sendSuccess(res, 'System stats fetched successfully', stats);
    } catch (error) {
        return sendError(res, error.message, 500);
    }
});

module.exports = router;
