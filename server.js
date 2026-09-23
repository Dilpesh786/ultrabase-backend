const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// UltraBase Mock API Key Database & In-Memory Storage
const validApiKeys = new Set([
  "ub_live_998877665544332211",
  "ub_demo_1234567890abcdef"
]);

const db = {
  users: [
    { id: 1, email: 'admin@ultrabase.in', role: 'admin', createdAt: new Date().toISOString() }
  ],
  tables: {
    'usr_payments': [
      { id: 1, email: 'user@example.com', utr: 'UTR123456789', status: 'approved', timestamp: new Date().toISOString() }
    ]
  },
  files: []
};

// Middleware: Verify UltraBase API Key (Optional Check)
function verifyApiKey(req, res, next) {
  const apiKey = req.headers['x-ultrabase-api-key'] || req.query.apiKey;
  if (!apiKey || !validApiKeys.has(apiKey)) {
    return res.status(401).json({ success: false, error: "અમાન્ય અથવા ખૂટતી UltraBase API Key!" });
  }
  next();
}

// Serving Frontend UI
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- API ENDPOINTS ---

// 1. Stats Overview
app.get('/api/stats', (req, res) => {
  let totalRecords = 0;
  Object.keys(db.tables).forEach(t => totalRecords += db.tables[t].length);
  res.json({
    totalUsers: db.users.length,
    totalTables: Object.keys(db.tables).length,
    totalRecords: totalRecords,
    totalFiles: db.files.length,
    systemStatus: 'Active & Operational'
  });
});

// API Key Endpoints (NEW FEATURE)
app.post('/api/v1/keys/generate', (req, res) => {
  const newKey = "ub_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  validApiKeys.add(newKey);
  res.json({ success: true, apiKey: newKey, message: "નવી API Key સફળતાપૂર્વક જનરેટ થઈ!" });
});

// 2. Auth Endpoints
app.get('/api/auth/users', (req, res) => res.json(db.users));

app.post('/api/auth/register', (req, res) => {
  const { email, role } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  
  const newUser = {
    id: db.users.length + 1,
    email,
    role: role || 'user',
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  res.status(201).json({ message: 'User created successfully', user: newUser });
});

app.delete('/api/auth/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.users = db.users.filter(u => u.id !== id);
  res.json({ message: 'User deleted successfully' });
});

// 3. Dynamic Database / Collection Endpoints
app.get('/api/db/tables', (req, res) => {
  res.json(Object.keys(db.tables));
});

app.post('/api/db/create-table', (req, res) => {
  const { tableName } = req.body;
  if (!tableName) return res.status(400).json({ error: 'Table name is required' });
  const formattedName = tableName.toLowerCase().replace(/\s+/g, '_');
  if (!db.tables[formattedName]) {
    db.tables[formattedName] = [];
  }
  res.json({ message: `Table '${formattedName}' created`, tables: Object.keys(db.tables) });
});

app.get('/api/db/data/:tableName', (req, res) => {
  const tableName = req.params.tableName;
  if (!db.tables[tableName]) return res.status(404).json({ error: 'Table not found' });
  res.json(db.tables[tableName]);
});

app.post('/api/db/data/:tableName', (req, res) => {
  const tableName = req.params.tableName;
  if (!db.tables[tableName]) db.tables[tableName] = [];

  const newRecord = {
    id: db.tables[tableName].length + 1,
    ...req.body,
    timestamp: new Date().toISOString()
  };

  db.tables[tableName].push(newRecord);
  res.status(201).json({ message: 'Record inserted', record: newRecord });
});

app.delete('/api/db/data/:tableName/:id', (req, res) => {
  const { tableName, id } = req.params;
  if (!db.tables[tableName]) return res.status(404).json({ error: 'Table not found' });
  db.tables[tableName] = db.tables[tableName].filter(item => item.id !== parseInt(id));
  res.json({ message: 'Record deleted' });
});

// 4. Storage Bucket Endpoints
app.get('/api/storage/files', (req, res) => res.json(db.files));

app.post('/api/storage/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const fileData = {
    id: db.files.length + 1,
    originalname: req.file.originalname,
    filename: req.file.filename,
    size: (req.file.size / 1024).toFixed(2) + ' KB',
    url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`,
    uploadedAt: new Date().toISOString()
  };

  db.files.push(fileData);
  res.json({ message: 'File uploaded successfully', file: fileData });
});

app.delete('/api/storage/files/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const file = db.files.find(f => f.id === id);
  if (file) {
    const filePath = path.join(__dirname, 'uploads', file.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    db.files = db.files.filter(f => f.id !== id);
  }
  res.json({ message: 'File deleted' });
});

app.listen(PORT, () => {
  console.log(`UltraBase Server active on port ${PORT}`);
});
             
