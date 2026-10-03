-- eComFly PostgreSQL Schema
-- Run this when setting up with a real database

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Plans (Must be created before users to satisfy foreign key constraints)
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  event_limit INTEGER DEFAULT 10000,
  container_limit INTEGER DEFAULT 1,
  domain_limit INTEGER DEFAULT 0,
  support_level VARCHAR(50) DEFAULT 'Community',
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  features JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  plan_id UUID REFERENCES plans(id),
  plan_name VARCHAR(50) DEFAULT 'Free',
  plan_price INTEGER DEFAULT 0,
  event_limit INTEGER DEFAULT 10000,
  current_events INTEGER DEFAULT 0,
  next_billing_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Containers
CREATE TABLE IF NOT EXISTS containers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'stopped', 'pending', 'error')),
  auto_domain VARCHAR(255) UNIQUE NOT NULL,
  custom_domain VARCHAR(255),
  container_config TEXT,
  notes TEXT,
  events_count INTEGER DEFAULT 0,
  events_today INTEGER DEFAULT 0,
  server_region VARCHAR(50) DEFAULT 'Singapore',
  container_version VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Domains
CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  container_id UUID REFERENCES containers(id) ON DELETE SET NULL,
  domain VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  verified BOOLEAN DEFAULT FALSE,
  dns_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  plan_name VARCHAR(100),
  amount INTEGER NOT NULL,
  method VARCHAR(50) NOT NULL CHECK (method IN ('bKash', 'Nagad', 'Bank Transfer')),
  txn_id VARCHAR(255) NOT NULL,
  note TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Logs (for usage tracking)
CREATE TABLE IF NOT EXISTS event_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  container_id UUID REFERENCES containers(id) ON DELETE CASCADE,
  event_count INTEGER DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_containers_user_id ON containers(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_event_logs_user_date ON event_logs(user_id, date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_logs_container_date ON event_logs(container_id, date);
CREATE INDEX IF NOT EXISTS idx_custom_domains_user_id ON custom_domains(user_id);

-- Seed default plans
INSERT INTO plans (name, price, event_limit, container_limit, domain_limit, support_level, is_active, is_featured, features)
VALUES
  ('Free', 0, 10000, 1, 0, 'Community', TRUE, FALSE, '["10K events/month","1 container","Auto subdomain","Basic analytics","Community support"]'),
  ('Starter', 2900, 100000, 3, 1, 'Email (48h)', TRUE, TRUE, '["100K events/month","3 containers","1 custom domain","Advanced analytics","Email support","Container monitoring"]'),
  ('Pro', 7900, 500000, 10, 5, 'Priority (24h)', TRUE, FALSE, '["500K events/month","10 containers","5 custom domains","Priority support","Usage alerts","Advanced reports"]'),
  ('Enterprise', 0, 0, 0, 0, 'Dedicated', TRUE, FALSE, '["Unlimited events","Unlimited containers","Unlimited domains","SLA guarantee","Dedicated manager","Custom integrations"]')
ON CONFLICT DO NOTHING;

-- Seed admin user (password: admin123)
INSERT INTO users (name, email, password, role, plan_name, event_limit)
VALUES ('Admin User', 'admin@ecomfly.com', '$2a$10$jrhcH61qVbnqNsCY7IuNgOXUNP/CWtJcPItExQYKAwPoeCyYjnv1O', 'admin', 'Enterprise', 0)
ON CONFLICT (email) DO NOTHING;
