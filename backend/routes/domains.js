const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM custom_domains WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json({ domains: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching domains' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { domain, container_id } = req.body;
    if (!domain?.trim()) return res.status(400).json({ message: 'Domain is required' });

    const normalizedDomain = domain.toLowerCase().trim();

    // Check user domain limit
    const userResult = await db.query('SELECT plan_id FROM users WHERE id = $1', [req.user.id]);
    const planResult = await db.query('SELECT domain_limit FROM plans WHERE id = $1', [userResult.rows[0].plan_id]);
    const limit = planResult.rows.length > 0 ? planResult.rows[0].domain_limit : 0;
    
    const countResult = await db.query('SELECT COUNT(*) FROM custom_domains WHERE user_id = $1', [req.user.id]);
    if (parseInt(countResult.rows[0].count) >= limit && limit !== 0) {
      return res.status(403).json({ message: 'Custom domain limit reached for your plan' });
    }

    const result = await db.query(
      `INSERT INTO custom_domains (user_id, container_id, domain, status, verified) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, container_id || null, normalizedDomain, 'pending', false]
    );

    res.status(201).json({ domain: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      return res.status(409).json({ message: 'Domain already registered' });
    }
    console.error(err);
    res.status(500).json({ message: 'Error adding domain' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM custom_domains WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Domain not found' });
    res.json({ message: 'Domain removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting domain' });
  }
});

module.exports = router;
