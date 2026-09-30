const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// In-memory container store
const containers = [];

const generateDomain = (name) => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 20);
  const rand = Math.random().toString(36).substr(2, 6);
  return `${slug}-${rand}.ecomfly.ecomfixr.com`;
};

// GET /api/containers - List user's containers
router.get('/', authenticate, (req, res) => {
  const userContainers = containers.filter(c => c.user_id === req.user.id);
  res.json({ containers: userContainers, total: userContainers.length });
});

// POST /api/containers - Create container
router.post('/', authenticate, (req, res) => {
  const { name, container_config, notes } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ message: 'Container name is required' });
  }
  if (!container_config?.trim()) {
    return res.status(400).json({ message: 'Container config is required' });
  }

  const container = {
    id: uuidv4(),
    user_id: req.user.id,
    name: name.trim(),
    status: 'running',
    auto_domain: generateDomain(name),
    custom_domain: null,
    container_config: container_config.trim(),
    notes: notes || '',
    events_count: 0,
    events_today: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  containers.push(container);
  res.status(201).json({ container, message: 'Container created successfully' });
});

// GET /api/containers/:id
router.get('/:id', authenticate, (req, res) => {
  const container = containers.find(c => c.id === req.params.id && c.user_id === req.user.id);
  if (!container) return res.status(404).json({ message: 'Container not found' });
  res.json({ container });
});

// PUT /api/containers/:id
router.put('/:id', authenticate, (req, res) => {
  const idx = containers.findIndex(c => c.id === req.params.id && c.user_id === req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'Container not found' });
  containers[idx] = { ...containers[idx], ...req.body, updated_at: new Date().toISOString() };
  res.json({ container: containers[idx] });
});

// DELETE /api/containers/:id
router.delete('/:id', authenticate, (req, res) => {
  const idx = containers.findIndex(c => c.id === req.params.id && c.user_id === req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'Container not found' });
  containers.splice(idx, 1);
  res.json({ message: 'Container deleted' });
});

// POST /api/containers/:id/restart
router.post('/:id/restart', authenticate, (req, res) => {
  const container = containers.find(c => c.id === req.params.id && c.user_id === req.user.id);
  if (!container) return res.status(404).json({ message: 'Container not found' });
  container.status = 'running';
  res.json({ message: 'Container restarted', container });
});

module.exports = router;
