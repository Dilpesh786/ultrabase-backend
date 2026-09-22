const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serving Front-end Dashboard (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API Status Route
app.get('/api/status', (req, res) => {
  res.json({
    platform: "UltraBase Backend Cloud API",
    status: "Online & Operational",
    pricing_tier: "Ultra Starter (Free 2GB Storage + 100k API Requests)",
    features: ["JWT Security", "PostgreSQL Relational DB", "Fast Global Access"],
    timestamp: new Date().toISOString()
  });
});

// Dummy Auth API
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "ઈમેલ અને પાસવર્ડ જરૂરી છે." });
  }
  // Success Mock Response
  res.json({
    message: "Login successful",
    token: "mock-jwt-token-ultrabase-12345",
    user: { email }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
