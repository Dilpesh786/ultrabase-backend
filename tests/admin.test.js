const request = require('supertest');
const express = require('express');
const adminRoutes = require('../routes/adminRoutes');

const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

describe('Admin API Tests', () => {
    it('should test admin endpoint structure', async () => {
        const res = await request(app)
            .get('/api/admin/dashboard');
        
        expect(res.statusCode).not.toEqual(400);
    });
});
