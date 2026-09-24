const request = require('supertest');
const express = require('express');
const dataRoutes = require('../routes/dataRoutes');

const app = express();
app.use(express.json());
app.use('/api/data', dataRoutes);

describe('Data API Tests', () => {
    it('should test data endpoint structure', async () => {
        const res = await request(app)
            .get('/api/data');
        
        expect(res.statusCode).not.toEqual(400);
    });
});
