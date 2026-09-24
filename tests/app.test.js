const request = require('supertest');
const express = require('express');

const app = express();
app.get('/test', (req, res) => {
    res.status(200).json({ success: true, message: 'Test route working' });
});

describe('App Test Suite', () => {
    it('should test the GET /test endpoint', async () => {
        const res = await request(app).get('/test');
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Test route working');
    });
});
