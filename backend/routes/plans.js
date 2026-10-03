const express = require('express');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Public endpoint - get active plans
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM plans WHERE is_active = true ORDER BY price ASC');
    res.json({ plans: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching plans' });
  }
});

// Admin: Get all plans (including inactive)
router.get('/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM plans ORDER BY price ASC');
    res.json({ plans: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching all plans' });
  }
});

// Public: Get single plan
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM plans WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Plan not found' });
    res.json({ plan: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching plan' });
  }
});

// Admin: Create new plan
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, price, event_limit, container_limit, domain_limit, support_level, is_active, is_featured, features } = req.body;
    const result = await db.query(
      `INSERT INTO plans (name, price, event_limit, container_limit, domain_limit, support_level, is_active, is_featured, features)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, price || 0, event_limit || 0, container_limit || 0, domain_limit || 0, support_level || 'Community', is_active ?? true, is_featured ?? false, JSON.stringify(features || [])]
    );
    res.status(201).json({ plan: result.rows[0], message: 'Plan created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating plan' });
  }
});

// Admin: Update plan
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, price, event_limit, container_limit, domain_limit, support_level, is_active, is_featured, features } = req.body;
    const result = await db.query(
      `UPDATE plans SET 
        name = COALESCE($1, name), 
        price = COALESCE($2, price), 
        event_limit = COALESCE($3, event_limit), 
        container_limit = COALESCE($4, container_limit), 
        domain_limit = COALESCE($5, domain_limit), 
        support_level = COALESCE($6, support_level), 
        is_active = COALESCE($7, is_active), 
        is_featured = COALESCE($8, is_featured), 
        features = COALESCE($9, features),
        updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [name, price, event_limit, container_limit, domain_limit, support_level, is_active, is_featured, features ? JSON.stringify(features) : null, req.params.id]
    );
    
    if (result.rows.length === 0) return res.status(404).json({ message: 'Plan not found' });

    // Keep every subscriber in sync with the edited plan (name, price, event limit)
    const plan = result.rows[0];
    await db.query(
      'UPDATE users SET plan_name = $1, plan_price = $2, event_limit = $3 WHERE plan_id = $4',
      [plan.name, plan.price, plan.event_limit, plan.id]
    );
    res.json({ plan, message: 'Plan updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating plan' });
  }
});

// Admin: Delete plan
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM plans WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting plan' });
  }
});

module.exports = router;
