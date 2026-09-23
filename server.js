const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const { readDB, writeDB } = require('./config/dbConfig');
const verifyToken = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');

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

// ==========================================
// API ENDPOINTS
// ==========================================

// Modular Routes Integration
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

// Stats API
app.get('/api/stats', (req, res) => {
    const db = readDB();
    const totalTables = Object.keys(db.tables || {}).length;
    let totalRecords = 0;
    Object.values(db.tables || {}).forEach(table => {
        totalRecords += table.length;
    });
    res.json({
        totalUsers: db.tables && db.tables.users ? db.tables.users.length : 1,
        totalTables: totalTables,
        totalRecords: totalRecords,
        totalFiles: (db.files || []).length
    });
});

// Keys API
app.get('/api/keys', (req, res) => {
    res.json([{ id: 1, name: 'Default Mobile Key', key: 'ub_live_786786', createdAt: new Date() }]);
});

app.post('/api/keys/generate', (req, res) => {
    res.json({ success: true, message: 'Key generated successfully', key: 'ub_live_' + Math.random().toString(36).substring(2, 12) });
});

// Storage Buckets API
app.get('/api/storage/files', (req, res) => {
    const db = readDB();
    res.json(db.files || []);
});

app.post('/api/storage/upload', upload.single('file'), (req, res) => {
    const db = readDB();
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
    writeDB(db);
    res.status(201).json(fileRecord);
});

// Frontend UI Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 UltraBase Modular Backend Server running on port ${PORT}`);
});
