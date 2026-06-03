-- SQL Database Schema for RTIH InnovationOS (PostgreSQL & Supabase compatible)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Custom Enums
CREATE TYPE user_role AS ENUM (
  'founder',
  'mentor',
  'manager',
  'admin',
  'investor',
  'university',
  'corporate'
);

CREATE TYPE startup_stage AS ENUM (
  'idea',
  'validation',
  'prototype',
  'mvp',
  'users',
  'revenue',
  'funding',
  'scale'
);

CREATE TYPE funding_stage AS ENUM (
  'pre-seed',
  'seed',
  'pre-series-a',
  'series-a',
  'series-b',
  'grant'
);

CREATE TYPE ap_district AS ENUM (
  'Anantapur',
  'Chittoor',
  'East Godavari',
  'Guntur',
  'Krishna',
  'Kurnool',
  'Prakasam',
  'Srikakulam',
  'Sri Potti Sriramulu Nellore',
  'Visakhapatnam',
  'Vizianagaram',
  'West Godavari',
  'YSR Kadapa',
  'Manyam',
  'Anakapalli',
  'Kakinada',
  'Konaseema',
  'Eluru',
  'NTR',
  'Bapatla',
  'Palnadu',
  'Nandyal',
  'Sri Sathya Sai',
  'Annamayya',
  'Tirupati',
  'Alluri Sitharama Raju'
);

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'founder',
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Universities / Outposts Table
CREATE TABLE universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  district ap_district NOT NULL,
  innovation_cell_name VARCHAR(255) DEFAULT 'Innovation Cell',
  established_year INTEGER,
  student_count INTEGER DEFAULT 0,
  startups_count INTEGER DEFAULT 0,
  founders_count INTEGER DEFAULT 0,
  innovation_score NUMERIC(5,2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Startups Table
CREATE TABLE startups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL,
  tagline VARCHAR(255),
  description TEXT,
  sector VARCHAR(100) NOT NULL,
  stage startup_stage NOT NULL DEFAULT 'idea',
  district ap_district NOT NULL,
  university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
  logo_url TEXT,
  website TEXT,
  jobs_created INTEGER DEFAULT 0,
  monthly_revenue NUMERIC(12,2) DEFAULT 0.00,
  total_funding NUMERIC(15,2) DEFAULT 0.00,
  active_users INTEGER DEFAULT 0,
  health_score INTEGER DEFAULT 0,
  founder_reputation INTEGER DEFAULT 0,
  unicorn_score INTEGER DEFAULT 0,
  soonicorn_score INTEGER DEFAULT 0,
  investment_score INTEGER DEFAULT 0,
  funding_readiness INTEGER DEFAULT 0,
  is_rural BOOLEAN DEFAULT FALSE,
  is_women_led BOOLEAN DEFAULT FALSE,
  risk_level VARCHAR(50) DEFAULT 'Low',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Founders Association Table
CREATE TABLE founders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  startup_id UUID REFERENCES startups(id) ON DELETE SET NULL,
  title VARCHAR(255) DEFAULT 'Founder & CEO',
  bio TEXT,
  is_youth BOOLEAN DEFAULT TRUE,
  family_income_bracket VARCHAR(100),
  first_generation_entrepreneur BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mentors Table
CREATE TABLE mentors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expertise TEXT[],
  bio TEXT,
  linkedin_url TEXT,
  impact_score INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 0,
  sessions_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Investors Table
CREATE TABLE investors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  firm_name VARCHAR(255) NOT NULL,
  stage_focus funding_stage[] NOT NULL,
  sector_focus TEXT[],
  min_ticket_size NUMERIC(12,2) DEFAULT 0.00,
  max_ticket_size NUMERIC(15,2) DEFAULT 0.00,
  investments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Funding Rounds Table
CREATE TABLE funding_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES investors(id) ON DELETE SET NULL,
  amount NUMERIC(15,2) NOT NULL,
  valuation NUMERIC(15,2),
  stage funding_stage NOT NULL,
  announcement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mentor Meetings / Session Tracker
CREATE TABLE mentor_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 45,
  status VARCHAR(50) DEFAULT 'Scheduled',
  notes TEXT,
  ai_summary TEXT,
  action_items TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Milestones / OKR Table
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_date DATE,
  completed_date DATE,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Regional Spoke Outposts Table
CREATE TABLE outposts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) UNIQUE NOT NULL, -- Visakhapatnam, Tirupati, etc.
  district ap_district NOT NULL,
  lead_name VARCHAR(255) NOT NULL,
  lead_email VARCHAR(255) NOT NULL,
  incubated_startups_count INTEGER DEFAULT 0,
  programs_conducted_count INTEGER DEFAULT 0,
  mentor_engagement_score INTEGER DEFAULT 0,
  outpost_rank INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- One Family One Entrepreneur Log
CREATE TABLE family_entrepreneurship (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district ap_district NOT NULL,
  family_uid VARCHAR(100) UNIQUE NOT NULL, -- AP State Family ID
  household_head_name VARCHAR(255) NOT NULL,
  entrepreneur_id UUID REFERENCES founders(id) ON DELETE SET NULL,
  outreach_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scheme_granted VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Identified' -- Identified, Trained, Launched
);

-- Indexing for high queries speed
CREATE INDEX idx_startups_sector ON startups(sector);
CREATE INDEX idx_startups_stage ON startups(stage);
CREATE INDEX idx_startups_district ON startups(district);
CREATE INDEX idx_founders_startup ON founders(startup_id);
CREATE INDEX idx_funding_rounds_startup ON funding_rounds(startup_id);
CREATE INDEX idx_mentor_sessions_mentor ON mentor_sessions(mentor_id);
CREATE INDEX idx_mentor_sessions_startup ON mentor_sessions(startup_id);
CREATE INDEX idx_milestones_startup ON milestones(startup_id);
CREATE INDEX idx_family_district ON family_entrepreneurship(district);
