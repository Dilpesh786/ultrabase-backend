const { sendError } = require('../utils/responseHelper');

const requestCounts = new Map();

const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const currentTime = Date.now();

        if (!requestCounts.has(ip)) {
            requestCounts.set(ip, { count: 1, startTime: currentTime });
            return next();
        }

        const clientData = requestCounts.get(ip);

        if (currentTime - clientData.startTime < windowMs) {
            clientData.count++;
            if (clientData.count > maxRequests) {
                return sendError(res, 'Too many requests, please try again later.', 429);
            }
        } else {
            clientData.count = 1;
            clientData.startTime = currentTime;
        }

        next();
    };
};

module.exports = rateLimiter;
