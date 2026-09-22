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

// 3. CREATE POST API (નવી પોસ્ટ ઉમેરવા)
app.post('/api/posts', async (req, res) => {
  const { user_id, title, content } = req.body;
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

// 4. GET ALL POSTS API (બધી પોસ્ટ્સ જોવા)
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

// 5. DELETE POST API (પોસ્ટ ડીલીટ કરવા)
app.delete('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(port, () => {
  console.log(`UltraBase Server running on port ${port}`);
});
