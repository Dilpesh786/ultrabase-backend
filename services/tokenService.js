const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwtConfig');

const generateToken = (payload) => {
    return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, jwtConfig.secret);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken
};
