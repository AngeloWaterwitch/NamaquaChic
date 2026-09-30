const router = require('express').Router();
const auth   = require('../middleware/auth');
const { SiteContent, Subscriber, BlogPost } = require('../models/Other');
const { upload } = require('../config/cloudinary');

// ── SITE CONTENT ──────────────────────────────────────────────────────

// GET /api/content/:page — public
router.get('/content/:page', async (req, res) => {
  try {
    const doc = await SiteContent.findOne({ page: req.params.page });
    res.json(doc ? doc.data : {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/content/:page — admin only (merge update)
router.put('/content/:page', auth, async (req, res) => {
  try {
    const doc = await SiteContent.findOneAndUpdate(
      { page: req.params.page },
      { $set: { data: { ...req.body } } },
      { upsert: true, new: true }
    );
    res.json(doc.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── SUBSCRIBERS ───────────────────────────────────────────────────────

// POST /api/subscribers — public
router.post('/subscribers', async (req, res) => {
  try {
    const sub = new Subscriber(req.body);
    await sub.save();
    res.status(201).json(sub);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/subscribers — admin only
router.get('/subscribers', auth, async (req, res) => {
  try {
    const subs = await Subscriber.find().sort({ createdAt: -1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/subscribers/:id — admin only
router.delete('/subscribers/:id', auth, async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subscriber removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── BLOG POSTS ────────────────────────────────────────────────────────

// GET /api/blog — public (only published unless admin)
router.get('/blog', async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { published: true };
    const posts = await BlogPost.find(filter).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/blog/:id — public
router.get('/blog/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/blog — admin only
router.post('/blog', auth, async (req, res) => {
  try {
    const post = new BlogPost(req.body);
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/blog/:id — admin only
router.put('/blog/:id', auth, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/blog/:id — admin only
router.delete('/blog/:id', auth, async (req, res) => {
  try {
    await BlogPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── IMAGE UPLOAD (general — pages, blog covers, etc.) ─────────────────

// POST /api/upload/:folder — admin only
router.post('/upload/:folder', auth, (req, res, next) => {
  upload(req.params.folder).single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    res.json({ url: req.file.path });
  });
});

module.exports = router;
