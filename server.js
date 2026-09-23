const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure Uploads Directory Exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Storage Configuration for Files/Buckets
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Hybrid In-Memory Database Store (Zero Initialized Clean Data)
const db = {
    apiKeys: [],
    users: [],
    tables: {},       // Relational / Table Data
    documents: {},    // Firebase style NoSQL JSON Collections
    files: []
};

// Rate Limiting Mock Middleware
const requestCounts = {};
app.use('/api/', (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    if (!requestCounts[ip]) requestCounts[ip] = { count: 0, startTime: now };
    
    if (now - requestCounts[ip].startTime > 60000) {
        requestCounts[ip] = { count: 1, startTime: now };
    } else {
        requestCounts[ip].count++;
        if (requestCounts[ip].count > 120) {
            return res.status(429).json({ error: 'Rate limit exceeded. Too many requests.' });
        }
    }
    next();
});

// ==========================================
// SYSTEM STATS & HEALTH API
// ==========================================
app.get('/api/v1/ping', (req, res) => {
    res.json({ status: 'online', message: 'UltraBase Hybrid Backend Running Successfully!' });
});

app.get('/api/stats', (req, res) => {
    let totalRecords = 0;
    Object.values(db.tables).forEach(arr => totalRecords += arr.length);
    Object.values(db.documents).forEach(arr => totalRecords += arr.length);
    
    res.json({
        totalUsers: db.users.length,
        totalTables: Object.keys(db.tables).length,
        totalCollections: Object.keys(db.documents).length,
        totalRecords: totalRecords,
        totalFiles: db.files.length,
        totalApiKeys: db.apiKeys.length
    });
});

// ==========================================
// API KEYS MANAGEMENT
// ==========================================
app.get('/api/keys', (req, res) => res.json(db.apiKeys));

app.post('/api/keys/generate', (req, res) => {
    const { name } = req.body;
    const newKey = {
        id: Date.now(),
        name: name || 'App API Key',
        key: 'ub_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        createdAt: new Date()
    };
    db.apiKeys.push(newKey);
    res.status(201).json(newKey);
});

app.delete('/api/keys/:id', (req, res) => {
    const id = parseInt(req.params.id);
    db.apiKeys = db.apiKeys.filter(k => k.id !== id);
    res.json({ message: 'API Key Revoked Successfully' });
});

// ==========================================
// AUTHENTICATION & USERS API
// ==========================================
app.get('/api/auth/users', (req, res) => res.json(db.users));

app.post('/api/auth/signup', (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const existing = db.users.find(u => u.email === email);
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const newUser = { 
        id: Date.now(), 
        email, 
        password, 
        role: role || 'user', 
        token: 'ub_jwt_' + Math.random().toString(36).substring(2, 15),
        createdAt: new Date() 
    };
    db.users.push(newUser);
    res.status(201).json({ message: 'User registered', user: { id: newUser.id, email: newUser.email, role: newUser.role, token: newUser.token } });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ message: 'Login successful', token: user.token, user: { id: user.id, email: user.email, role: user.role } });
});

app.delete('/api/auth/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    db.users = db.users.filter(u => u.id !== id);
    res.json({ message: 'User deleted' });
});

// ==========================================
// HYBRID DATABASE (TABLES & NOSQL DOCUMENTS)
// ==========================================
app.get('/api/db/tables', (req, res) => res.json(Object.keys(db.tables)));

app.post('/api/db/create-table', (req, res) => {
    const { tableName } = req.body;
    if (!tableName) return res.status(400).json({ error: 'Table name required' });
    if (!db.tables[tableName]) db.tables[tableName] = [];
    res.status(201).json({ message: `Table '${tableName}' created` });
});

app.get('/api/db/data/:tableName', (req, res) => {
    const { tableName } = req.params;
    res.json(db.tables[tableName] || []);
});

app.post('/api/db/data/:tableName', (req, res) => {
    const { tableName } = req.params;
    if (!db.tables[tableName]) db.tables[tableName] = [];
    const record = { id: Date.now(), ...req.body, createdAt: new Date() };
    db.tables[tableName].push(record);
    res.status(201).json(record);
});

// Firebase style NoSQL Document Collections API
app.get('/api/db/collections', (req, res) => res.json(Object.keys(db.documents)));

app.post('/api/db/collection/:name', (req, res) => {
    const { name } = req.params;
    if (!db.documents[name]) db.documents[name] = [];
    const doc = { id: 'doc_' + Date.now(), ...req.body, updatedAt: new Date() };
    db.documents[name].push(doc);
    res.status(201).json(doc);
});

app.get('/api/db/collection/:name', (req, res) => {
    const { name } = req.params;
    res.json(db.documents[name] || []);
});

// ==========================================
// STORAGE BUCKETS API
// ==========================================
app.get('/api/storage/files', (req, res) => res.json(db.files));

app.post('/api/storage/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const fileRecord = {
        id: Date.now(),
        originalname: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
        uploadedAt: new Date()
    };
    db.files.push(fileRecord);
    res.status(201).json(fileRecord);
});

app.delete('/api/storage/files/:id', (req, res) => {
    const id = parseInt(req.params.id);
    db.files = db.files.filter(f => f.id !== id);
    res.json({ message: 'File deleted' });
});

// Frontend UI Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 UltraBase Hybrid Server running on port ${PORT}`);
});
