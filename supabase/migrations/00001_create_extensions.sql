-- Enable required PostgreSQL extensions
-- uuid-ossp: for UUID generation
-- vector: for pgvector embeddings support

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
