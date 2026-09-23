const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve admin dashboard (index.html)

const JWT_SECRET = process.env.JWT_SECRET || 'ultrabase_super_secret_key_123';

// PostgreSQL Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Initialize Database Tables
async function initDb() {
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
        user_email VARCHAR(255) NOT NULL,
        utr_number VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database tables initialized successfully!');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}

initDb();

// 1. REGISTER USER
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'ઈમેલ અને પાસવર્ડ બંને જરૂરી છે.' });
  }

  try {
    const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'આ ઈમેલ પહેલેથી નોંધાયેલ છે.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, hashedPassword]
    );

    const token = jwt.sign({ id: newUser.rows[0].id, email: newUser.rows[0].email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'યુઝર સફળતાપૂર્વક રજીસ્ટર થયો!',
      token,
      user: newUser.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'સર્વર એરર આવી.' });
  }
});

// 2. LOGIN USER
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'ઈમેલ અને પાસવર્ડ જરૂરી છે.' });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'ઈમેલ અથવા પાસવર્ડ ખોટો છે.' });
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'ઈમેલ અથવા પાસવર્ડ ખોટો છે.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'લોગિન સફળ રહ્યું!',
      token,
      user: { id: user.id, email: user.email, created_at: user.created_at }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'સર્વર એરર આવી.' });
  }
});

// 3. SUBMIT UTR
app.post('/api/submit-utr', async (req, res) => {
  const { email, utr } = req.body;
  if (!email || !utr) {
    return res.status(400).json({ success: false, message: 'ઈમેલ અને UTR નંબર બંને જરૂરી છે.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO utr_submissions (user_email, utr_number) VALUES ($1, $2) RETURNING *',
      [email, utr]
    );
    res.json({ success: true, message: 'UTR સફળતાપૂર્વક સબમિટ થયો!', data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'સર્વર એરર આવી.' });
  }
});

// 4. ADMIN API - GET ALL DATA
app.get('/api/admin/all-data', async (req, res) => {
  try {
    const users = await pool.query('SELECT id, email, created_at FROM users ORDER BY id DESC');
    const utrs = await pool.query('SELECT * FROM utr_submissions ORDER BY id DESC');

    res.json({
      success: true,
      users: users.rows,
      utrs: utrs.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'ડેટા ફેચ કરવામાં એરર આવી.' });
  }
});

// 5. ADMIN CONTROL - UPDATE UTR STATUS (Approve / Reject)
app.post('/api/admin/update-utr-status', async (req, res) => {
  const { id, status } = req.body;
  if (!id || !status) {
    return res.status(400).json({ success: false, message: 'ID અને Status જરૂરી છે.' });
  }

  try {
    await pool.query('UPDATE utr_submissions SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true, message: `UTR સ્ટેટસ બદલાઈને ${status} થઈ ગયું છે.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'સ્ટેટસ અપડેટ કરવામાં એરર આવી.' });
  }
});

// 6. ADMIN CONTROL - DELETE USER
app.delete('/api/admin/delete-user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true, message: 'યુઝર ડિલીટ થઈ ગયો છે.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'યુઝર ડિલીટ કરવામાં એરર આવી.' });
  }
});

// 7. ADMIN CONTROL - DELETE UTR
app.delete('/api/admin/delete-utr/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM utr_submissions WHERE id = $1', [id]);
    res.json({ success: true, message: 'UTR રેકોર્ડ ડિલીટ થઈ ગયો છે.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'UTR ડિલીટ કરવામાં એરર આવી.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
