-- Milestones reference table contains standard developmental milestones
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  age_range_start_months INTEGER NOT NULL,
  age_range_end_months INTEGER NOT NULL,
  source TEXT DEFAULT 'CDC',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for milestone queries
CREATE INDEX idx_milestones_category ON milestones(category);
CREATE INDEX idx_milestones_age_range ON milestones(age_range_start_months, age_range_end_months);
