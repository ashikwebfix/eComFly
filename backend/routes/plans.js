const express = require('express');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

const { v4: uuidv4 } = require('uuid');
const { requireAdmin } = require('../middleware/auth');

let PLANS = [
  { id:'p1', name:'Free', price:0, event_limit:10000, container_limit:1, domain_limit:0, is_active:true, is_featured:false, features:['10K events/month','1 container','Auto subdomain','Basic analytics','Community support'] },
  { id:'p2', name:'Starter', price:2900, event_limit:100000, container_limit:3, domain_limit:1, is_active:true, is_featured:true, features:['100K events/month','3 containers','1 custom domain','Advanced analytics','Email support'] },
  { id:'p3', name:'Pro', price:7900, event_limit:500000, container_limit:10, domain_limit:5, is_active:true, is_featured:false, features:['500K events/month','10 containers','5 custom domains','Priority support','Usage alerts'] },
  { id:'p4', name:'Enterprise', price:0, event_limit:0, container_limit:0, domain_limit:0, is_active:true, is_featured:false, features:['Unlimited everything','SLA guarantee','Dedicated manager','Custom integrations'] },
];

// Public endpoint - get active plans
router.get('/', (req, res) => {
  const activePlans = PLANS.filter(p => p.is_active);
  res.json({ plans: activePlans });
});

// Admin: Get all plans (including inactive)
router.get('/all', authenticate, requireAdmin, (req, res) => {
  res.json({ plans: PLANS });
});

// Public: Get single plan
router.get('/:id', (req, res) => {
  const plan = PLANS.find(p => p.id === req.params.id);
  if (!plan) return res.status(404).json({ message: 'Plan not found' });
  res.json({ plan });
});

// Admin: Create new plan
router.post('/', authenticate, requireAdmin, (req, res) => {
  const newPlan = { id: uuidv4(), ...req.body };
  PLANS.push(newPlan);
  res.status(201).json({ plan: newPlan, message: 'Plan created' });
});

// Admin: Update plan
router.put('/:id', authenticate, requireAdmin, (req, res) => {
  const idx = PLANS.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Plan not found' });
  PLANS[idx] = { ...PLANS[idx], ...req.body };
  res.json({ plan: PLANS[idx], message: 'Plan updated' });
});

// Admin: Delete plan
router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  const idx = PLANS.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Plan not found' });
  PLANS.splice(idx, 1);
  res.json({ message: 'Plan deleted' });
});

module.exports = router;
