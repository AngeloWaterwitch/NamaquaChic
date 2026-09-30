require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { connect } = require('./config/db');
const Admin   = require('./models/Admin');
const Order   = require('./models/Order');

const app = express();

// ── Middleware ──────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
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