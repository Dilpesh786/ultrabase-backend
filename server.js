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

// Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// In-Memory Database Store (For Demo & Fast Operations)
const db = {
    apiKeys: [{ id: 1, name: 'Default Admin Key', key: 'ub_live_secret_key_786', createdAt: new Date() }],
    users: [{ id: 1, email: 'admin@ultrabase.io', role: 'admin', password: 'adminpassword', createdAt: new Date() }],
    tables: {
        'products': [{ id: 1, name: 'Sample Item', price: 100 }],
        'utr_payments': []
    },
    files: []
};

// ==========================================
// 1. SYSTEM STATS & HEALTH API
// ==========================================
app.get('/api/v1/ping', (req, res) => {
    res.json({ status: 'online', message: 'UltraBase Backend Server Running Smoothly!' });
});

app.get('/api/stats', (req, res) => {
    let totalRecords = 0;
    Object.values(db.tables).forEach(arr => totalRecords += arr.length);
    
    res.json({
        totalUsers: db.users.length,
        totalTables: Object.keys(db.tables).length,
        totalRecords: totalRecords,
        totalFiles: db.files.length,
        totalApiKeys: db.apiKeys.length
    });
});

// ==========================================
// 2. API KEYS MANAGEMENT
// ==========================================
app.get('/api/keys', (req, res) => res.json(db.apiKeys));

app.post('/api/keys/generate', (req, res) => {
    const { name } = req.body;
    const newKey = {
        id: Date.now(),
        name: name || 'API Key',
        key: 'ub_key_' + Math.random().toString(36).substring(2, 12),
        createdAt: new Date()
    };
    db.apiKeys.push(newKey);
    res.status(201).json(newKey);
});

app.delete('/api/keys/:id', (req, res) => {
    const id = parseInt(req.params.id);
    db.apiKeys = db.apiKeys.filter(k => k.id !== id);
    res.json({ message: 'API Key Revoked' });
});

// ==========================================
// 3. AUTHENTICATION & USER MANAGEMENT
// ==========================================
app.get('/api/auth/users', (req, res) => res.json(db.users));

// Register User (Simple Role Based)
app.post('/api/auth/register', (req, res) => {
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    
    const newUser = { id: Date.now(), email, role: role || 'user', createdAt: new Date() };
    db.users.push(newUser);
    res.status(201).json(newUser);
});

// Sign Up with Email & Password
app.post('/api/auth/signup', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const existingUser = db.users.find(u => u.email === email);
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const newUser = { id: Date.now(), email, password, role: 'user', createdAt: new Date() };
    db.users.push(newUser);
    res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, email: newUser.email } });
});

// Log In with Email & Password
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);

    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    res.json({ message: 'Login successful', user: { id: user.id, email: user.email, role: user.role } });
});

app.delete('/api/auth/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    db.users = db.users.filter(u => u.id !== id);
    res.json({ message: 'User deleted' });
});

// ==========================================
// 4. DYNAMIC DATABASE EXPLORER
// ==========================================
app.get('/api/db/tables', (req, res) => res.json(Object.keys(db.tables)));

app.post('/api/db/create-table', (req, res) => {
    const { tableName } = req.body;
    if (!tableName) return res.status(400).json({ error: 'Table name is required' });
    if (!db.tables[tableName]) db.tables[tableName] = [];
    res.status(201).json({ message: `Table '${tableName}' created successfully` });
});

app.get('/api/db/data/:tableName', (req, res) => {
    const { tableName } = req.params;
    res.json(db.tables[tableName] || []);
});

app.post('/api/db/data/:tableName', (req, res) => {
    const { tableName } = req.params;
    if (!db.tables[tableName]) db.tables[tableName] = [];
    
    const record = { id: Date.now(), ...req.body };
    db.tables[tableName].push(record);
    res.status(201).json(record);
});

app.delete('/api/db/data/:tableName/:id', (req, res) => {
    const { tableName, id } = req.params;
    if (db.tables[tableName]) {
        db.tables[tableName] = db.tables[tableName].filter(item => item.id !== parseInt(id));
    }
    res.json({ message: 'Record deleted' });
});

// ==========================================
// 5. STORAGE BUCKET API
// ==========================================
app.get('/api/storage/files', (req, res) => res.json(db.files));

app.post('/api/storage/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
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
    res.json({ message: 'File record deleted' });
});

// Dynamic Dashboard UI Serve
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 UltraBase Server Running on Port ${PORT}`);
});
  
