const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticate } = require('../middleware/auth');
const { updateUser, getUserById } = require('../models/userStore');
const router = express.Router();

// GET /api/user/profile
router.get('/profile', authenticate, (req, res) => {
  const { password: _, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// PUT /api/user/profile
router.put('/profile', authenticate, (req, res) => {
  const { name, email } = req.body;
  const updates = {};
  if (name?.trim()) updates.name = name.trim();
  if (email?.trim()) updates.email = email.toLowerCase().trim();
  const updated = updateUser(req.user.id, updates);
  const { password: _, ...safeUser } = updated;
  res.json({ user: safeUser, message: 'Profile updated' });
});

// PUT /api/user/password
router.put('/password', authenticate, async (req, res) => {
  const { current, newPassword } = req.body;
  if (!current || !newPassword) return res.status(400).json({ message: 'Current and new password required' });
  if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

  const user = getUserById(req.user.id);
  const valid = await bcrypt.compare(current, user.password);
  if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });

  const hashed = await bcrypt.hash(newPassword, 10);
  updateUser(req.user.id, { password: hashed });
  res.json({ message: 'Password updated successfully' });
});

// GET /api/user/usage
router.get('/usage', authenticate, (req, res) => {
  res.json({
    current_events: req.user.current_events || 0,
    event_limit: req.user.event_limit || 10000,
    percentage: Math.round((req.user.current_events || 0) / (req.user.event_limit || 10000) * 100),
  });
});

module.exports = router;
