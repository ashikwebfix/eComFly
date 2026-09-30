const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getAllUsers, getUserById, updateUser } = require('../models/userStore');
const router = express.Router();

// GET /api/admin/stats
router.get('/stats', authenticate, requireAdmin, (req, res) => {
  const users = getAllUsers();
  res.json({
    total_users: users.length,
    active_users: users.filter(u => u.status === 'active').length,
    total_containers: 0,
    total_events_today: Math.floor(Math.random() * 50000 + 10000),
  });
});

// GET /api/admin/users
router.get('/users', authenticate, requireAdmin, (req, res) => {
  const users = getAllUsers().map(u => { const {password:_, ...safe} = u; return safe; });
  res.json({ users, total: users.length });
});

// GET /api/admin/users/:id
router.get('/users/:id', authenticate, requireAdmin, (req, res) => {
  const user = getUserById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password: _, ...safe } = user;
  res.json({ user: safe });
});

// PUT /api/admin/users/:id
router.put('/users/:id', authenticate, requireAdmin, (req, res) => {
  const { status, plan_name, event_limit } = req.body;
  const updates = {};
  if (status) updates.status = status;
  if (plan_name) updates.plan_name = plan_name;
  if (event_limit !== undefined) updates.event_limit = parseInt(event_limit);
  const updated = updateUser(req.params.id, updates);
  if (!updated) return res.status(404).json({ message: 'User not found' });
  const { password: _, ...safe } = updated;
  res.json({ user: safe, message: 'User updated' });
});

module.exports = router;
