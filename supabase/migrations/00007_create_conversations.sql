-- Conversations table stores AI chat conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for common queries
CREATE INDEX idx_conversations_parent_id ON conversations(parent_id);
CREATE INDEX idx_conversations_child_id ON conversations(child_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
