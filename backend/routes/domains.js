const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

const domains = [];

router.get('/', authenticate, (req, res) => {
  const userDomains = domains.filter(d => d.user_id === req.user.id);
  res.json({ domains: userDomains });
});

router.post('/', authenticate, (req, res) => {
  const { domain, container_id } = req.body;
  if (!domain?.trim()) return res.status(400).json({ message: 'Domain is required' });

  const existing = domains.find(d => d.domain === domain.toLowerCase().trim());
  if (existing) return res.status(409).json({ message: 'Domain already registered' });

  const newDomain = {
    id: uuidv4(),
    user_id: req.user.id,
    domain: domain.toLowerCase().trim(),
    container_id: container_id || null,
    status: 'pending',
    verified: false,
    created_at: new Date().toISOString(),
  };

  domains.push(newDomain);
  res.status(201).json({ domain: newDomain });
});

router.delete('/:id', authenticate, (req, res) => {
  const idx = domains.findIndex(d => d.id === req.params.id && d.user_id === req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'Domain not found' });
  domains.splice(idx, 1);
  res.json({ message: 'Domain removed' });
});

module.exports = router;
