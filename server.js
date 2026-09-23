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

// Multer Storage for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Real Persistent JSON Database File Path
const DB_FILE = path.join(__dirname, 'database.json');

// Load Database from Disk
function loadDB() {
    if (fs.existsSync(DB_FILE)) {
        try {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            console.error("Error reading database file", e);
        }
    }
    return {
        apiKeys: [],
        users: [],
        tables: {},
        documents: {},
        files: []
    };
}

// Save Database to Disk
function saveDB(dbData) {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf8');
}

// Rate Limiting Middleware
const requestCounts = {};
app.use('/api/', (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    if (!requestCounts[ip]) requestCounts[ip] = { count: 0, startTime: now };
    
    if (now - requestCounts[ip].startTime > 60000) {
        requestCounts[ip] = { count: 1, startTime: now };
    } else {
        requestCounts[ip].count++;
        if (requestCounts[ip].count > 150) {
            return res.status(429).json({ error: 'Rate limit exceeded. Too many requests.' });
        }
    }
    next();
});

// ==========================================
// SYSTEM STATS & HEALTH API
// ==========================================
app.get('/api/v1/ping', (req, res) => {
    res.json({ status: 'online', message: 'UltraBase Real Database Backend Running Successfully!' });
});

app.get('/api/stats', (req, res) => {
    const db = loadDB();
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
app.get('/api/keys', (req, res) => {
    const db = loadDB();
    res.json(db.apiKeys);
});

app.post('/api/keys/generate', (req, res) => {
    const db = loadDB();
    const { name } = req.body;
    const newKey = {
        id: Date.now(),
        name: name || 'App API Key',
        key: 'ub_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        createdAt: new Date()
    };
    db.apiKeys.push(newKey);
    saveDB(db);
    res.status(201).json(newKey);
});

// ==========================================
// AUTHENTICATION & USERS API
// ==========================================
app.get('/api/auth/users', (req, res) => {
    const db = loadDB();
    res.json(db.users);
});

app.post('/api/auth/signup', (req, res) => {
    const db = loadDB();
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

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
    saveDB(db);
    res.status(201).json({ message: 'User registered', user: { id: newUser.id, email: newUser.email, role: newUser.role, token: newUser.token } });
});

app.post('/api/auth/login', (req, res) => {
    const db = loadDB();
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json({ message: 'Login successful', token: user.token, user: { id: user.id, email: user.email, role: user.role } });
});

// ==========================================
// REAL RELATIONAL TABLES & NOSQL DATABASE
// ==========================================
app.get('/api/db/tables', (req, res) => {
    const db = loadDB();
    res.json(Object.keys(db.tables));
});

app.post('/api/db/create-table', (req, res) => {
    const db = loadDB();
    const { tableName } = req.body;
    if (!tableName) return res.status(400).json({ error: 'Table name required' });
    if (!db.tables[tableName]) db.tables[tableName] = [];
    saveDB(db);
    res.status(201).json({ message: `Table '${tableName}' created` });
});

app.get('/api/db/data/:tableName', (req, res) => {
    const db = loadDB();
    const { tableName } = req.params;
    res.json(db.tables[tableName] || []);
});

app.post('/api/db/data/:tableName', (req, res) => {
    const db = loadDB();
    const { tableName } = req.params;
    if (!db.tables[tableName]) db.tables[tableName] = [];
    const record = { id: Date.now(), ...req.body, createdAt: new Date() };
    db.tables[tableName].push(record);
    saveDB(db);
    res.status(201).json(record);
});

// NoSQL Collections API
app.get('/api/db/collections', (req, res) => {
    const db = loadDB();
    res.json(Object.keys(db.documents));
});

app.post('/api/db/collection/:name', (req, res) => {
    const db = loadDB();
    const { name } = req.params;
    if (!db.documents[name]) db.documents[name] = [];
    const doc = { id: 'doc_' + Date.now(), ...req.body, updatedAt: new Date() };
    db.documents[name].push(doc);
    saveDB(db);
    res.status(201).json(doc);
});

app.get('/api/db/collection/:name', (req, res) => {
    const db = loadDB();
    const { name } = req.params;
    res.json(db.documents[name] || []);
});

// ==========================================
// STORAGE BUCKETS API
// ==========================================
app.get('/api/storage/files', (req, res) => {
    const db = loadDB();
    res.json(db.files);
});

app.post('/api/storage/upload', upload.single('file'), (req, res) => {
    const db = loadDB();
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
    saveDB(db);
    res.status(201).json(fileRecord);
});

// Frontend UI Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 UltraBase Real Database Server running on port ${PORT}`);
});
        
