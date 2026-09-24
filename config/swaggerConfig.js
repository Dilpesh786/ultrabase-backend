const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Ultrabase Backend API',
            version: '1.0.0',
            description: 'API documentation for Ultrabase backend system',
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
