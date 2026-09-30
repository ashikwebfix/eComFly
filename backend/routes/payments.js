const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireAdmin } = require('../middleware/auth');
const router = express.Router();

const payments = [];

// User: submit payment
router.post('/', authenticate, (req, res) => {
  const { plan_id, plan_name, amount, method, txn_id, note } = req.body;
  if (!method || !txn_id) return res.status(400).json({ message: 'Method and transaction ID required' });

  const payment = {
    id: uuidv4(),
    user_id: req.user.id,
    user_name: req.user.name,
    user_email: req.user.email,
    plan_id, plan_name, amount, method, txn_id,
    note: note || '',
    status: 'pending',
    created_at: new Date().toISOString(),
    reviewed_at: null,
  };
  payments.push(payment);
  res.status(201).json({ payment, message: 'Payment submitted for review' });
});

// User: get own payment history
router.get('/my', authenticate, (req, res) => {
  const userPayments = payments.filter(p => p.user_id === req.user.id);
  res.json({ payments: userPayments });
});

// Admin: get all payments
router.get('/', authenticate, requireAdmin, (req, res) => {
  res.json({ payments });
});

// Admin: approve payment
router.post('/:id/approve', authenticate, requireAdmin, (req, res) => {
  const idx = payments.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Payment not found' });
  payments[idx].status = 'approved';
  payments[idx].reviewed_at = new Date().toISOString();
  res.json({ payment: payments[idx], message: 'Payment approved' });
});

// Admin: reject payment
router.post('/:id/reject', authenticate, requireAdmin, (req, res) => {
  const idx = payments.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Payment not found' });
  payments[idx].status = 'rejected';
  payments[idx].reviewed_at = new Date().toISOString();
  res.json({ payment: payments[idx], message: 'Payment rejected' });
});

module.exports = router;
