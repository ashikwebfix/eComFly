const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { generateToken, authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existCheck = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existCheck.rows.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    // Get default "Free" plan details to assign
    const planCheck = await db.query("SELECT * FROM plans WHERE name = 'Free'");
    const defaultPlan = planCheck.rows[0];
    const plan_id = defaultPlan ? defaultPlan.id : null;
    const plan_name = defaultPlan ? defaultPlan.name : 'Free';
    const plan_price = defaultPlan ? defaultPlan.price : 0;
    const event_limit = defaultPlan ? defaultPlan.event_limit : 10000;

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const insertResult = await db.query(
      `INSERT INTO users (name, email, password, role, plan_id, plan_name, plan_price, event_limit) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name.trim(), email.toLowerCase().trim(), hashedPassword, 'user', plan_id, plan_name, plan_price, event_limit]
    );

    const user = insertResult.rows[0];
    const token = generateToken(user);
    const { password: _, ...safeUser } = user;

    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Admin demo password or hashed password check
    let validPassword = false;
    // Check if it's the seed admin which might have a hardcoded hash or plaintext depending on how it was inserted
    if (user.role === 'admin' && user.password === 'admin123' && password === 'admin123') {
      validPassword = true;
    } else {
      validPassword = await bcrypt.compare(password, user.password);
    }

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Account suspended. Contact support.' });
    }

    const token = generateToken(user);
    const { password: _, ...safeUser } = user;

    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// GET /api/auth/me - fresh user row plus the live limits of the assigned plan
router.get('/me', authenticate, async (req, res) => {
  try {
    const { password: _, ...safeUser } = req.user;
    if (req.user.plan_id) {
      const p = await db.query('SELECT name, price, event_limit, container_limit, domain_limit FROM plans WHERE id = $1', [req.user.plan_id]);
      if (p.rows.length > 0) {
        const plan = p.rows[0];
        // The plan is the source of truth for name, price and limits
        safeUser.plan_name = plan.name;
        safeUser.plan_price = plan.price;
        safeUser.event_limit = plan.event_limit;
        safeUser.container_limit = plan.container_limit;
        safeUser.domain_limit = plan.domain_limit;
      }
    }
    res.json({ user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

module.exports = router;
