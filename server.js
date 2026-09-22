const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Root API Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to UltraBase Backend API!',
    status: 'Online',
    timestamp: new Date()
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'connected', db_time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 1. USER SIGNUP API
app.post('/api/auth/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, password]
    );
    res.status(201).json({ message: 'User created successfully', user: newUser.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 2. USER LOGIN API
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.rows[0].password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        email: user.rows[0].email
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(port, () => {
  console.log(`UltraBase Server running on port ${port}`);
});
