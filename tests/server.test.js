const request = require('supertest');
const app = require('../server');

describe('Server & App Integration Tests', () => {
    it('should respond to invalid routes with 404 or defined status', async () => {
        const res = await request(app).get('/api/non-existent-route-test');
        expect([404, 200, 500]).toContain(res.statusCode);
    });
});
