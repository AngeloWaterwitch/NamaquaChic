require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { connect } = require('./config/db');
const Admin   = require('./models/Admin');
const Order   = require('./models/Order');

const app = express();

// ── CORS ────────────────────────────────────────────────────────────
// Trim whitespace and strip a trailing slash from both sides before
// comparing — a plain string-equality origin check (the previous setup)
// fails silently on any tiny formatting difference, with no indication
// of why. This also logs the allowed origin at startup and anything it
// actually blocks, so a mismatch is visible in the Railway logs instead
// of being a mystery.
const allowedOrigin = (process.env.FRONTEND_URL || 'http://localhost:4200').trim().replace(/\/$/, '');
console.log('[cors] allowed origin =', JSON.stringify(allowedOrigin));

app.use(cors({
  origin: (origin, callback) => {
    // No Origin header = not a browser request (curl, Postman, the PayFast
    // webhook calling back server-to-server) — always allow these through.
    if (!origin) return callback(null, true);
    const normalized = origin.trim().replace(/\/$/, '');
    if (normalized === allowedOrigin) return callback(null, true);
    console.warn('[cors] blocked origin:', JSON.stringify(origin), '— expected:', JSON.stringify(allowedOrigin));
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ──────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api',          require('./routes/misc'));

// ── Health check ────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── 404 handler ─────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Global error handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// ── Seed admin user if none exists ─────────────────────────────────
const seedAdmin = async () => {
  const count = await Admin.countDocuments();
  if (count === 0) {
    await Admin.create({
      email:    process.env.ADMIN_EMAIL    || 'admin@namakwachic.co.za',
      password: process.env.ADMIN_PASSWORD || 'Admin123!',
    });
    console.log('✓ Admin user created —', process.env.ADMIN_EMAIL);
  }
};

// ── Start ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
connect().then(async () => {
  await seedAdmin();
  await Order.reconcileCounter();
  app.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));
});