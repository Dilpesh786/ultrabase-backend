const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Multer setup for file uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Database Helper Functions
const DB_FILE = path.join(__dirname, 'database.json');

function loadDB() {
    if (!fs.existsSync(DB_FILE)) {
        const initialDB = {
            tables: {
                users: [
                    { id: 1, email: 'dilpesh@ultrabase.io', role: 'admin', created_at: new Date() }
                ]
            },
            documents: {},
            files: []
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
    }
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { tables: {}, documents: {}, files: [] };
    }
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ==========================================
// API ENDPOINTS
// ==========================================

// Stats API
app.get('/api/stats', (req, res) => {
    const db = loadDB();
    const totalTables = Object.keys(db.tables).length;
    let totalRecords = 0;
    Object.values(db.tables).forEach(table => {
        totalRecords += table.length;
    });
    res.json({
        totalUsers: db.tables.users ? db.tables.users.length : 1,
        totalTables: totalTables,
        totalRecords: totalRecords,
        totalFiles: db.files.length
    });
});

// Keys API
app.get('/api/keys', (req, res) => {
    res.json([{ id: 1, name: 'Default Mobile Key', key: 'ub_live_786786', createdAt: new Date() }]);
});

app.post('/api/keys/generate', (req, res) => {
    res.json({ success: true, message: 'Key generated successfully', key: 'ub_live_' + Math.random().toString(36.substring(2, 12)) });
});

// Auth Users API
app.get('/api/auth/users', (req, res) => {
    const db = loadDB();
    res.json(db.tables.users || []);
});

app.post('/api/auth/signup', (req, res) => {
    const db = loadDB();
    if (!db.tables.users) db.tables.users = [];
    const newUser = { id: Date.now(), ...req.body, role: req.body.role || 'user', createdAt: new Date() };
    db.tables.users.push(newUser);
    saveDB(db);
    res.status(201).json({ success: true, message: 'User added', user: newUser });
});

// Database Tables API
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
    res.json(Object.keys(db.documents || {}));
});

app.post('/api/db/collection/:name', (req, res) => {
    const db = loadDB();
    const { name } = req.params;
    if (!db.documents) db.documents = {};
    if (!db.documents[name]) db.documents[name] = [];
    const doc = { id: 'doc_' + Date.now(), ...req.body, updatedAt: new Date() };
    db.documents[name].push(doc);
    saveDB(db);
    res.status(201).json(doc);
});

app.get('/api/db/collection/:name', (req, res) => {
    const db = loadDB();
    const { name } = req.params;
    res.json(db.documents && db.documents[name] ? db.documents[name] : []);
});

// Storage Buckets API
app.get('/api/storage/files', (req, res) => {
    const db = loadDB();
    res.json(db.files || []);
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
    if (!db.files) db.files = [];
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
                          
