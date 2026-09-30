const mongoose = require('mongoose');

// Site content — one document per page (home, about, theme, etc.)
const siteContentSchema = new mongoose.Schema({
  page: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

// Subscriber
const subscriberSchema = new mongoose.Schema({
  email:       { type: String, required: true },
  type:        { type: String, default: 'newsletter' },
  productName: { type: String },
}, { timestamps: true });

// Blog post
const blogPostSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  excerpt:     { type: String, default: '' },
  content:     { type: String, default: '' },
  image:       { type: String, default: '' },
  category:    { type: String, default: 'Trends' },
  author:      { type: String, default: 'NamakwaChic' },
  published:   { type: Boolean, default: false },
  trending:    { type: Boolean, default: false },
  tags:        { type: mongoose.Schema.Types.Mixed, default: [] },
  publishedAt: { type: Date },
}, { timestamps: true });

module.exports = {
  SiteContent: mongoose.model('SiteContent', siteContentSchema),
  Subscriber:  mongoose.model('Subscriber',  subscriberSchema),
  BlogPost:    mongoose.model('BlogPost',     blogPostSchema),
};
