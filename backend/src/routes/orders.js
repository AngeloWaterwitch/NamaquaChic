const router  = require('express').Router();
const crypto  = require('crypto');
const https   = require('https');
const auth    = require('../middleware/auth');
const Order   = require('../models/Order');

// Flip to false once you're on live PayFast credentials.
const PAYFAST_SANDBOX = true;
const PAYFAST_VALIDATE_HOST = PAYFAST_SANDBOX ? 'sandbox.payfast.co.za' : 'www.payfast.co.za';

// PayFast's signature spec is PHP's urlencode(), which differs from
// encodeURIComponent — notably spaces become '+' not '%20'. Using the wrong
// encoding is the single most common cause of "signature mismatch" bugs when
// porting PayFast integrations from their PHP examples.
function phpUrlEncode(str) {
  return encodeURIComponent(String(str))
    .replace(/%20/g, '+')
    .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function buildParamString(body, passphrase) {
  let str = Object.keys(body)
    .filter(k => k !== 'signature')
    .map(k => `${k}=${phpUrlEncode(body[k])}`)
    .join('&');
  if (passphrase) str += `&passphrase=${phpUrlEncode(passphrase)}`;
  return str;
}

function validSignature(body) {
  const expected = crypto.createHash('md5')
    .update(buildParamString(body, process.env.PAYFAST_PASSPHRASE))
    .digest('hex');
  const received = body.signature || '';
  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received));
}

// The check that actually matters: ask PayFast directly whether it sent this.
// PayFast responds with the literal text "VALID" only for real notifications —
// this is what makes the webhook trustworthy, not the signature check alone.
function confirmWithPayFast(body) {
  return new Promise((resolve) => {
    const data = Object.keys(body).map(k => `${k}=${phpUrlEncode(body[k])}`).join('&');
    const req = https.request({
      hostname: PAYFAST_VALIDATE_HOST,
      path: '/eng/query/validate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => resolve(responseBody.trim() === 'VALID'));
    });
    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

// POST /api/orders — public (customer places order)
router.post('/', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/orders — admin only
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id — admin only
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/status — admin only. Accepts status and/or
// paymentStatus, so this also covers manually marking a COD order as paid.
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const update = {};
    if (status) update.status = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'Nothing to update' });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id, update, { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/payment — called by PayFast's ITN webhook only.
// Public (PayFast can't send your admin JWT), but verified in three layers
// before anything is trusted: signature, server-to-server confirmation with
// PayFast itself, and the paid amount against what the order actually costs.
router.patch('/:id/payment', async (req, res) => {
  console.log(`[payfast] webhook received for order ${req.params.id} — payment_status=${req.body.payment_status}, pf_payment_id=${req.body.pf_payment_id}`);
  try {
    if (!validSignature(req.body)) {
      console.warn('[payfast] signature mismatch for order', req.params.id);
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const confirmed = await confirmWithPayFast(req.body);
    if (!confirmed) {
      console.warn('[payfast] server validation failed for order', req.params.id);
      return res.status(400).json({ message: 'Could not verify with PayFast' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      console.warn('[payfast] order not found:', req.params.id);
      return res.status(404).json({ message: 'Order not found' });
    }

    const paidAmount = parseFloat(req.body.amount_gross);
    if (!isNaN(paidAmount) && Math.abs(paidAmount - order.total) > 0.05) {
      console.warn(`[payfast] amount mismatch for order ${req.params.id}: expected ${order.total}, got ${paidAmount}`);
      return res.status(400).json({ message: 'Amount mismatch' });
    }

    // Idempotent — PayFast retries the ITN until it gets a 200 back.
    if (order.paymentStatus === 'paid') {
      console.log('[payfast] order already marked paid, skipping:', req.params.id);
      return res.status(200).send('OK');
    }

    order.paymentStatus = req.body.payment_status === 'COMPLETE' ? 'paid' : 'failed';
    if (order.paymentStatus === 'paid' && order.status === 'pending') order.status = 'confirmed';
    await order.save();
    console.log(`[payfast] order ${req.params.id} updated — paymentStatus=${order.paymentStatus}`);

    res.status(200).send('OK');
  } catch (err) {
    console.error('[payfast] webhook error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;