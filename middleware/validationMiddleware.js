const { sendError } = require('../utils/responseHelper');

const validateTableInput = (req, res, next) => {
    const { tableName } = req.body;
    
    if (!tableName) {
        return sendError(res, 'Table name is required!', 400);
    }
    
    next();
};

const validateDataInput = (req, res, next) => {
    const data = req.body;
    
    if (!data || Object.keys(data).length === 0) {
        return sendError(res, 'Request body cannot be empty!', 400);
    }
    
    next();
};

module.exports = {
    validateTableInput,
    validateDataInput
};
