const express = require('express');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/admin/stats
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const userCountRes = await db.query('SELECT COUNT(*) FROM users');
    const activeCountRes = await db.query("SELECT COUNT(*) FROM users WHERE status = 'active'");
    const containerCountRes = await db.query('SELECT COUNT(*) FROM containers');
    const eventsCountRes = await db.query('SELECT SUM(events_today) as total_events FROM containers');
    
    res.json({
      total_users: parseInt(userCountRes.rows[0].count),
      active_users: parseInt(activeCountRes.rows[0].count),
      total_containers: parseInt(containerCountRes.rows[0].count),
      total_events_today: eventsCountRes.rows[0].total_events ? parseInt(eventsCountRes.rows[0].total_events) : 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// GET /api/admin/users
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role, status, plan_name, plan_price, event_limit, current_events, created_at FROM users ORDER BY created_at DESC');
    res.json({ users: result.rows, total: result.rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// GET /api/admin/users/:id
router.get('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, role, status, plan_name, plan_price, event_limit, current_events, created_at FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, plan_name, event_limit } = req.body;
    
    // If the plan is changed, link the real plan so name/price/limits stay in sync
    let planId = null, planPrice = null, limit = event_limit !== undefined ? parseInt(event_limit) : null;
    if (plan_name) {
      const p = await db.query('SELECT id, price, event_limit FROM plans WHERE name = $1', [plan_name]);
      if (p.rows.length > 0) {
        planId = p.rows[0].id;
        planPrice = p.rows[0].price;
        if (event_limit === undefined) limit = p.rows[0].event_limit;
      }
    }

    const result = await db.query(
      `UPDATE users SET status = COALESCE($1, status), plan_name = COALESCE($2, plan_name), event_limit = COALESCE($3, event_limit),
              plan_id = COALESCE($5, plan_id), plan_price = COALESCE($6, plan_price)
        WHERE id = $4 RETURNING id, name, email, role, status, plan_name, plan_price, event_limit, current_events, created_at`,
      [status, plan_name, limit, req.params.id, planId, planPrice]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ user: result.rows[0], message: 'User updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating user' });
  }
});

module.exports = router;
