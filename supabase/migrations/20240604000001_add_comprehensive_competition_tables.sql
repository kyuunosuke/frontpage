-- Create competition_eligibility table
CREATE TABLE IF NOT EXISTS competition_eligibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  criteria TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create competition_requirements table
CREATE TABLE IF NOT EXISTS competition_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  requirement TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_competitions table
CREATE TABLE IF NOT EXISTS saved_competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, competition_id)
);

-- Update competitions table to match the schema in the screenshot
ALTER TABLE competitions
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS prize_value NUMERIC,
  ADD COLUMN IF NOT EXISTS entry_difficulty TEXT,
  ADD COLUMN IF NOT EXISTS sponsor TEXT,
  ADD COLUMN IF NOT EXISTS entry_url TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- Enable realtime for all tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'competition_eligibility') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE competition_eligibility;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'competition_requirements') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE competition_requirements;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'users') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE users;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'saved_competitions') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE saved_competitions;
  END IF;
END
$$;