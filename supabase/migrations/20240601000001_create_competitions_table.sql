CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  competition_url TEXT,
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Expert')),
  prize_value TEXT,
  requirements TEXT,
  rules JSONB,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('active', 'upcoming', 'past', 'archived')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow public read access" ON competitions;
CREATE POLICY "Allow public read access"
  ON competitions
  FOR SELECT
  USING (status != 'archived');

DROP POLICY IF EXISTS "Allow authenticated users full access" ON competitions;
CREATE POLICY "Allow authenticated users full access"
  ON competitions
  USING (auth.role() = 'authenticated');

-- Enable realtime
alter publication supabase_realtime add table competitions;
