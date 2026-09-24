const { readDB, writeDB } = require('../config/dbConfig');

// Get all table names
exports.getTables = (req, res) => {
    const db = readDB();
    res.json(Object.keys(db.tables || {}));
};

// Create a new table
exports.createTable = (req, res) => {
    const db = readDB();
    const { tableName } = req.body;
    
    if (!tableName) {
        return res.status(400).json({ error: 'Table name is required' });
    }
    
    if (!db.tables[tableName]) {
        db.tables[tableName] = [];
        writeDB(db);
    }
    
    res.status(201).json({ success: true, message: `Table '${tableName}' created successfully` });
};

// Get records from a specific table
exports.getTableData = (req, res) => {
    const db = readDB();
    const { tableName } = req.params;
    
    res.json(db.tables[tableName] || []);
};

// Insert record into a table
exports.insertTableData = (req, res) => {
    const db = readDB();
    const { tableName } = req.params;
    
    if (!db.tables[tableName]) {
        db.tables[tableName] = [];
    }
    
    const record = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date()
    };
    
    db.tables[tableName].push(record);
    writeDB(db);
    
    res.status(201).json(record);
};
