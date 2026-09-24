// Success Response Helper
const sendSuccess = (res, message, data = {}, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message: message,
        data: data,
        timestamp: new Date()
    });
};

// Error Response Helper
const sendError = (res, message, statusCode = 500, error = null) => {
    return res.status(statusCode).json({
        success: false,
        message: message,
        error: error ? error.message : null,
        timestamp: new Date()
    });
};

module.exports = {
    sendSuccess,
    sendError
};
