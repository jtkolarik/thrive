-- Digests table stores periodic summaries sent to parents
CREATE TABLE digests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::JSONB,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for digest queries
CREATE INDEX idx_digests_parent_id ON digests(parent_id);
CREATE INDEX idx_digests_child_id ON digests(child_id);
CREATE INDEX idx_digests_period ON digests(period_start, period_end);
CREATE INDEX idx_digests_sent_at ON digests(sent_at);
