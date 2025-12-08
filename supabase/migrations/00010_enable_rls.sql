-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE digests ENABLE ROW LEVEL SECURITY;

-- Profiles policies: users can only access their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Children policies: parents can CRUD their own children
CREATE POLICY "Parents can view own children"
  ON children FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert own children"
  ON children FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update own children"
  ON children FOR UPDATE
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete own children"
  ON children FOR DELETE
  USING (auth.uid() = parent_id);

-- Entries policies: parents can CRUD entries for their children
CREATE POLICY "Parents can view entries for their children"
  ON entries FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert entries for their children"
  ON entries FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update entries for their children"
  ON entries FOR UPDATE
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete entries for their children"
  ON entries FOR DELETE
  USING (auth.uid() = parent_id);

-- Child milestones policies: parents can access their children's milestones
CREATE POLICY "Parents can view child milestones"
  ON child_milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_milestones.child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert child milestones"
  ON child_milestones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_milestones.child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update child milestones"
  ON child_milestones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_milestones.child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can delete child milestones"
  ON child_milestones FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_milestones.child_id
      AND children.parent_id = auth.uid()
    )
  );

-- Conversations policies: users can CRUD their own conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = parent_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = parent_id);

-- Messages policies: users can access messages in their conversations
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.parent_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.parent_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their conversations"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.parent_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages in their conversations"
  ON messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.parent_id = auth.uid()
    )
  );

-- Digests policies: users can view their own digests
CREATE POLICY "Users can view own digests"
  ON digests FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Users can insert own digests"
  ON digests FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

-- Milestones table is read-only for all authenticated users
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view milestones"
  ON milestones FOR SELECT
  TO authenticated
  USING (true);
