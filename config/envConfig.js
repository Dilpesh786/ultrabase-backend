require('dotenv').config();

const envConfig = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME || 'ultrabase_db',
    JWT_SECRET: process.env.JWT_SECRET || 'ultrabase_super_secret_key'
};

module.exports = envConfig;
