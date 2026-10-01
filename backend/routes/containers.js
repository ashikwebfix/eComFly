const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

const generateDomain = (name) => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 20);
  const rand = Math.random().toString(36).substr(2, 6);
  return `${slug}-${rand}.ecomfly.ecomfixr.com`;
};

const util = require('util');
const execPromise = util.promisify(require('child_process').exec);

const getAvailablePort = async () => {
  const result = await db.query('SELECT MAX(container_port) as max_port FROM containers');
  const maxPort = result.rows[0].max_port;
  return maxPort && maxPort >= 8000 ? maxPort + 1 : 8000;
};

// GET /api/containers - List user's containers
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM containers WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json({ containers: result.rows, total: result.rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching containers' });
  }
});

// POST /api/containers - Create container
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, container_config, notes } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Container name is required' });
    if (!container_config?.trim()) return res.status(400).json({ message: 'Container config is required' });

    // Check user container limit
    const userResult = await db.query('SELECT plan_id FROM users WHERE id = $1', [req.user.id]);
    const planResult = await db.query('SELECT container_limit FROM plans WHERE id = $1', [userResult.rows[0].plan_id]);
    const limit = planResult.rows.length > 0 ? planResult.rows[0].container_limit : 1;
    
    const countResult = await db.query('SELECT COUNT(*) FROM containers WHERE user_id = $1', [req.user.id]);
    if (parseInt(countResult.rows[0].count) >= limit && limit !== 0) {
      return res.status(403).json({ message: 'Container limit reached for your plan' });
    }

    const autoDomain = generateDomain(name);
    const port = await getAvailablePort();
    
    const result = await db.query(
      `INSERT INTO containers (user_id, name, status, auto_domain, container_config, notes, container_port) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, name.trim(), 'pending', autoDomain, container_config.trim(), notes || '', port]
    );
    const container = result.rows[0];

    // Run docker deployment in the background so it doesn't block the API response
    (async () => {
      try {
        await execPromise(`/root/deploy_sgtm.sh create ${container.id} ${autoDomain} '${container_config.trim()}' ${port}`);
        await db.query(`UPDATE containers SET status = 'running' WHERE id = $1`, [container.id]);
      } catch (e) {
        console.error('Docker deployment failed:', e);
        await db.query(`UPDATE containers SET status = 'error' WHERE id = $1`, [container.id]);
      }
    })();

    res.status(201).json({ container, message: 'Container creation started. It will be ready in a minute.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating container' });
  }
});

// GET /api/containers/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM containers WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Container not found' });
    res.json({ container: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching container' });
  }
});

// PUT /api/containers/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, container_config, notes } = req.body;
    const result = await db.query(
      `UPDATE containers SET name = COALESCE($1, name), container_config = COALESCE($2, container_config), notes = COALESCE($3, notes), updated_at = NOW() 
       WHERE id = $4 AND user_id = $5 RETURNING *`,
      [name, container_config, notes, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Container not found' });
    res.json({ container: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating container' });
  }
});

// DELETE /api/containers/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const getResult = await db.query('SELECT * FROM containers WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (getResult.rows.length === 0) return res.status(404).json({ message: 'Container not found' });
    const container = getResult.rows[0];

    try {
      await execPromise(`/root/deploy_sgtm.sh delete ${container.id} ${container.auto_domain}`);
    } catch(e) {
      console.error('Docker delete error', e);
    }

    await db.query('DELETE FROM containers WHERE id = $1', [container.id]);
    res.json({ message: 'Container deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting container' });
  }
});

// POST /api/containers/:id/restart
router.post('/:id/restart', authenticate, async (req, res) => {
  try {
    const result = await db.query("UPDATE containers SET status = 'running' WHERE id = $1 AND user_id = $2 RETURNING *", [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Container not found' });
    res.json({ message: 'Container restarted', container: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error restarting container' });
  }
});

module.exports = router;
