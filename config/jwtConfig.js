module.exports = {
    secret: process.env.JWT_SECRET || 'ultrabase_super_secret_key',
    expiresIn: process.env.JWT_EXPIRE || '1d'
};
