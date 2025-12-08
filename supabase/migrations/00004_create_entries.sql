-- Entries table stores the core content (notes, photos, milestones, etc.)
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('note', 'photo', 'milestone', 'health', 'school', 'memory')),
  title TEXT,
  content TEXT,
  media_urls TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'mixed')),
  summary TEXT,
  embedding VECTOR(1536),
  occurred_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_starred BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for common queries
CREATE INDEX idx_entries_child_id ON entries(child_id);
CREATE INDEX idx_entries_parent_id ON entries(parent_id);
CREATE INDEX idx_entries_type ON entries(type);
CREATE INDEX idx_entries_occurred_at ON entries(occurred_at DESC);
CREATE INDEX idx_entries_is_starred ON entries(is_starred) WHERE is_starred = TRUE;
CREATE INDEX idx_entries_tags ON entries USING GIN(tags);

-- Vector similarity search index (using ivfflat)
-- Note: Adjust lists parameter based on dataset size (recommended: rows/1000)
CREATE INDEX idx_entries_embedding ON entries
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
