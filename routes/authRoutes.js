const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Sample User Database simulation
const users = [];

// Register Route
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Please provide username and password' });
    }
    
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }

    users.push({ username, password });
    res.status(201).json({ message: 'User registered successfully' });
});

// Login Route
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    const secret = process.env.JWT_SECRET || 'ultrabase_secret_key';
    const token = jwt.sign({ username: user.username }, secret, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
});

module.exports = router;
  
