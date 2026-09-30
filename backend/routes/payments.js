const express = require('express');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// User: submit payment
router.post('/', authenticate, async (req, res) => {
  try {
    const { plan_id, plan_name, amount, method, txn_id, note } = req.body;
    if (!method || !txn_id) return res.status(400).json({ message: 'Method and transaction ID required' });

    const result = await db.query(
      `INSERT INTO payments (user_id, plan_id, plan_name, amount, method, txn_id, note, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [req.user.id, plan_id || null, plan_name || '', amount || 0, method, txn_id, note || '', 'pending']
    );

    res.status(201).json({ payment: result.rows[0], message: 'Payment submitted for review' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error submitting payment' });
  }
});

// User: get own payment history
router.get('/my', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json({ payments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

// Admin: get all payments
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, u.name as user_name, u.email as user_email 
      FROM payments p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC
    `);
    res.json({ payments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching all payments' });
  }
});

// Admin: approve payment
router.post('/:id/approve', authenticate, requireAdmin, async (req, res) => {
  try {
    // Start transaction
    await db.query('BEGIN');
    
    const paymentRes = await db.query(
      "UPDATE payments SET status = 'approved', reviewed_by = $1, reviewed_at = NOW() WHERE id = $2 RETURNING *",
      [req.user.id, req.params.id]
    );
    
    if (paymentRes.rows.length === 0) {
      await db.query('ROLLBACK');
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    const payment = paymentRes.rows[0];

    // Update user's plan and event limit based on the approved payment
    if (payment.plan_id) {
      const planRes = await db.query('SELECT * FROM plans WHERE id = $1', [payment.plan_id]);
      if (planRes.rows.length > 0) {
        const plan = planRes.rows[0];
        // Set next billing date to 1 month from now
        const nextBilling = new Date();
        nextBilling.setMonth(nextBilling.getMonth() + 1);
        
        await db.query(
          "UPDATE users SET plan_id = $1, plan_name = $2, plan_price = $3, event_limit = $4, next_billing_date = $5 WHERE id = $6",
          [plan.id, plan.name, plan.price, plan.event_limit, nextBilling.toISOString(), payment.user_id]
        );
      }
    }

    await db.query('COMMIT');
    res.json({ payment, message: 'Payment approved and user plan updated' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Error approving payment' });
  }
});

// Admin: reject payment
router.post('/:id/reject', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await db.query(
      "UPDATE payments SET status = 'rejected', reviewed_by = $1, reviewed_at = NOW() WHERE id = $2 RETURNING *",
      [req.user.id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Payment not found' });
    res.json({ payment: result.rows[0], message: 'Payment rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error rejecting payment' });
  }
});

module.exports = router;
