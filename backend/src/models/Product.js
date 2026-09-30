const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:              { type: String, required: true, trim: true },
  category:          { type: String, required: true },
  price:             { type: Number, required: true, min: 0 },
  originalPrice:     { type: Number },
  description:       { type: String, default: '' },
  image:             { type: String, default: '' },
  images:            [{ type: String }],
  sizes:             [{ type: String }],
  colours:           { type: mongoose.Schema.Types.Mixed, default: [] },
  material:          { type: String, default: '' },
  type:              { type: String, default: '' },
  status:            { type: String, enum: ['instock','outofstock','limited','comingsoon'], default: 'instock' },
  badge:             { type: String, default: '' },
  published:         { type: Boolean, default: true },   // visible in shop grid / product page / related items
  isLive:            { type: Boolean, default: false },  // featured in the home page carousel
  launchDate:        { type: String },
  launchDescription: { type: String },
  quantity:          { type: Number, default: 0 },
  selectedSize:      { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);