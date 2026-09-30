const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId:    { type: String },
  name:         { type: String, required: true },
  price:        { type: Number, required: true },
  quantity:     { type: Number, required: true },
  selectedSize: { type: String, default: '' },
  image:        { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber:   { type: String, unique: true },
  firstName:     { type: String, required: true },
  lastName:      { type: String, required: true },
  email:         { type: String, required: true },
  phone:         { type: String },
  address:       { type: String },
  suburb:        { type: String },
  city:          { type: String },
  province:      { type: String },
  postalCode:    { type: String },
  notes:         { type: String },
  items:         [orderItemSchema],
  subtotal:      { type: Number, required: true },
  deliveryFee:   { type: Number, default: 0 },
  discount:      { type: Number, default: 0 },
  total:         { type: Number, required: true },
  promoCode:     { type: String },
  paymentMethod: { type: String, enum: ['payfast','cod'], default: 'payfast' },
  paymentStatus: { type: String, enum: ['pending','paid','failed'], default: 'pending' },
  status:        { type: String, enum: ['pending','confirmed','processing','shipped','delivered','cancelled'], default: 'pending' },
}, { timestamps: true });

// Atomic counter, kept in its own tiny collection. countDocuments()-based
// numbering let two concurrent checkouts read the same count before either
// had saved, producing the same orderNumber and failing one customer's order
// on the unique-index write. findOneAndUpdate + $inc is a single atomic
// operation, so concurrent requests can never collide.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const counter = await Counter.findOneAndUpdate(
      { _id: 'orderNumber' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.orderNumber = `NC-${String(counter.seq).padStart(5, '0')}`;
  }
  next();
});

const OrderModel = mongoose.model('Order', orderSchema);

// Runs once at server startup (see index.js). Syncs the counter to whatever
// the highest existing orderNumber actually is — covers the very first run
// (no counter yet), and any future desync from a data import, restore, or
// manually-set order number landing ahead of where the counter thinks it is.
// Never moves the counter backward, only catches it up.
OrderModel.reconcileCounter = async function () {
  const highest = await OrderModel.findOne({ orderNumber: { $regex: /^NC-\d+$/ } })
    .sort({ orderNumber: -1 })
    .lean();
  const highestSeq = highest ? parseInt(highest.orderNumber.replace('NC-', ''), 10) : 0;

  const counter = await Counter.findById('orderNumber');
  if (!counter || counter.seq < highestSeq) {
    await Counter.findByIdAndUpdate('orderNumber', { seq: highestSeq }, { upsert: true });
  }
};

module.exports = OrderModel;