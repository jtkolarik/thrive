-- Child milestones tracks which milestones each child has achieved
CREATE TABLE child_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  achieved_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  notes TEXT,
  entry_id UUID REFERENCES entries(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Ensure each milestone is only achieved once per child
  UNIQUE(child_id, milestone_id)
);

-- Indexes for common queries
CREATE INDEX idx_child_milestones_child_id ON child_milestones(child_id);
CREATE INDEX idx_child_milestones_milestone_id ON child_milestones(milestone_id);
CREATE INDEX idx_child_milestones_achieved_at ON child_milestones(achieved_at);
