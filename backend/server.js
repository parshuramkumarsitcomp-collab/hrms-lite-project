const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.get('/api/healthz', (_req, res) => res.json({ status: 'ok' }));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in your .env file.');
  console.error('   Copy .env.example to .env and fill in your MongoDB Atlas connection string.');
  process.exit(1);
}

const isAtlas = MONGODB_URI.includes('mongodb+srv');
console.log(`Connecting to MongoDB ${isAtlas ? '(Atlas Cloud)' : '(Local)'}...`);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(`✅ Connected to MongoDB ${isAtlas ? 'Atlas' : 'Local'} successfully`);
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`   API ready at http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection FAILED:', err.message);
    if (isAtlas) {
      console.error('');
      console.error('👉 Atlas troubleshooting:');
      console.error('   1. Check your username and password in the connection string');
      console.error('   2. Whitelist your IP in Atlas: Network Access → Add IP Address → Allow from Anywhere (0.0.0.0/0)');
      console.error('   3. Make sure your cluster is running (not paused)');
      console.error('   4. Connection string format: mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/hrms-lite');
    } else {
      console.error('');
      console.error('👉 Local MongoDB troubleshooting:');
      console.error('   Run: net start MongoDB  (Windows)');
      console.error('   Or install from: https://www.mongodb.com/try/download/community');
    }
    process.exit(1);
  });
