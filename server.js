const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Database Tables Setup
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS utr_submissions (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255),
        utr_number VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database tables initialized successfully!");
  } catch (err) {
    console.error("Database connection error:", err);
  }
}
initDB();

// Front-end Dashboard Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API Status Route
app.get('/api/status', (req, res) => {
  res.json({
    platform: "UltraBase Backend Cloud API",
    status: "Online & Operational",
    db_connected: true,
    timestamp: new Date().toISOString()
  });
});

// Admin API: Get All Users
app.get('/api/admin/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users: " + err.message });
  }
});

// Admin API: Get All UTR Submissions
app.get('/api/admin/utrs', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, utr_number, status, created_at FROM utr_submissions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching UTRs: " + err.message });
  }
});

// Login API (Saves user to DB)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "ઈમેલ અને પાસવર્ડ જરૂરી છે." });
  }

  try {
    let userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userQuery.rows.length === 0) {
      userQuery = await pool.query('INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *', [email, password]);
    }
    
    res.json({
      message: "સફળતાપૂર્વક ઓથેન્ટિકેટ થયું!",
      token: "jwt-token-" + Date.now(),
      user: { id: userQuery.rows[0].id, email: userQuery.rows[0].email }
    });
  } catch (err) {
    res.status(500).json({ message: "ડેટાબેઝ એરર: " + err.message });
  }
});

// UTR Submission API (Saves UTR to DB)
app.post('/api/utr/submit', async (req, res) => {
  const { email, utr } = req.body;
  if (!utr) {
    return res.status(400).json({ message: "UTR નંબર જરૂરી છે." });
  }

  try {
    await pool.query('INSERT INTO utr_submissions (email, utr_number) VALUES ($1, $2)', [email || 'guest', utr]);
    res.json({ message: "તમારો UTR નંબર સફળતાપૂર્વક ડેટાબેઝમાં સાચવવામાં આવ્યો છે!" });
  } catch (err) {
    res.status(500).json({ message: "ડેટાબેઝ એરર: " + err.message });
  }
});

// Server Listener
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
