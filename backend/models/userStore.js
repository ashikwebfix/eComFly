const jwt = require('jsonwebtoken');

// In-memory store for demo (replace with DB queries in production)
const users = [
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@ecomfly.com',
    password: 'admin123', // demo: plain text for development only - use hashed in production
    role: 'admin',
    plan_name: 'Enterprise',
    plan_price: 0,
    event_limit: 0,
    current_events: 0,
    status: 'active',
    created_at: new Date().toISOString(),
  }
];

function getUserByEmail(email) {
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

function getUserById(id) {
  return users.find(u => u.id === id);
}

function addUser(user) {
  users.push(user);
  return user;
}

function updateUser(id, updates) {
  const idx = users.findIndex(u => u.id === id);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updates };
    return users[idx];
  }
  return null;
}

function getAllUsers() {
  return users.filter(u => u.role !== 'admin');
}

module.exports = { getUserByEmail, getUserById, addUser, updateUser, getAllUsers };
