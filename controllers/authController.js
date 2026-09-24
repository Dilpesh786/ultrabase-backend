const { readDB, writeDB } = require('../config/dbConfig');

// Get all users
exports.getUsers = (req, res) => {
    const db = readDB();
    res.json(db.tables.users || []);
};

// Signup new user
exports.signupUser = (req, res) => {
    const db = readDB();
    if (!db.tables.users) db.tables.users = [];
    
    const newUser = {
        id: Date.now(),
        ...req.body,
        role: req.body.role || 'user',
        createdAt: new Date()
    };
    
    db.tables.users.push(newUser);
    writeDB(db);
    
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: newUser
    });
};
