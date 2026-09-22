const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'ultrabase_super_secret_key_786';

app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Middleware to verify JWT Token (Security Verification)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Token Required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or Expired Token' });
    req.user = user;
    next();
  });
};

// Root API Endpoint - UltraBase Branding & Features Info
app.get('/', (req, res) => {
  res.json({
    platform: 'UltraBase Backend Cloud API',
    status: 'Online & Operational',
    pricing_tier: 'Ultra Starter (Free 2GB Storage + 100k API Requests)',
    features: ['JWT Security', 'PostgreSQL Relational DB', 'Fast Global Access'],
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
    res.status(201).json({ 
      message: 'User account created successfully on UltraBase!', 
      user: newUser.rows[0] 
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 2. USER LOGIN API (Generates Security JWT Token)
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

    // Generate JWT Token valid for 30 days
    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token: token,
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

// 3. SECURE CREATE POST API (Protected by Token)
app.post('/api/posts', authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  const user_id = req.user.id;
  try {
    const newPost = await pool.query(
      'INSERT INTO posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [user_id, title, content]
    );
    res.status(201).json({ message: 'Post created successfully', post: newPost.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 4. GET ALL POSTS API
app.get('/api/posts', async (req, res) => {
  try {
    const allPosts = await pool.query(
      'SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id ORDER BY created_at DESC'
    );
    res.json({ posts: allPosts.rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 5. SECURE DELETE POST API (Protected by Token)
app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM posts WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(port, () => {
  console.log(`UltraBase Production Server running on port ${port}`);
});
