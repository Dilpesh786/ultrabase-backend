const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../config/dbConfig');
const verifyToken = require('../middleware/authMiddleware');

// Get all tables or data
router.get('/tables', verifyToken, (req, res) => {
    const db = readDB();
    res.json(db.tables || {});
});

// Create or update a table
router.post('/tables', verifyToken, (req, res) => {
    const { tableName, data } = req.body;
    if (!tableName) {
        return res.status(400).json({ error: 'Table name is required' });
    }

    const db = readDB();
    if (!db.tables) {
        db.tables = {};
    }

    db.tables[tableName] = data;
    writeDB(db);

    res.json({ message: 'Table data saved successfully', tableName });
});

module.exports = router;
  
