-- Farm Management System Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Create farms table
CREATE TABLE IF NOT EXISTS farms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT[] NOT NULL,
  location JSONB NOT NULL,
  size DECIMAL(10,2),
  size_unit TEXT CHECK (size_unit IN ('acres', 'hectares')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create farm_records table
CREATE TABLE IF NOT EXISTS farm_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL,
  date DATE NOT NULL,
  quantity DECIMAL(10,2),
  unit TEXT,
  cost DECIMAL(10,2),
  income DECIMAL(10,2),
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create farm_tasks table
CREATE TABLE IF NOT EXISTS farm_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create farm_livestock table
CREATE TABLE IF NOT EXISTS farm_livestock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  breed TEXT,
  count INTEGER NOT NULL DEFAULT 0,
  age_months INTEGER,
  health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'sick', 'quarantine', 'deceased')),
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create farm_crops table
CREATE TABLE IF NOT EXISTS farm_crops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  variety TEXT,
  planting_date DATE,
  expected_harvest_date DATE,
  area DECIMAL(10,2),
  area_unit TEXT CHECK (area_unit IN ('acres', 'hectares', 'sqm')),
  status TEXT DEFAULT 'growing' CHECK (status IN ('planted', 'growing', 'harvested', 'failed')),
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);
CREATE INDEX IF NOT EXISTS idx_farms_status ON farms(status);
CREATE INDEX IF NOT EXISTS idx_farm_records_farm_id ON farm_records(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_records_date ON farm_records(date);
CREATE INDEX IF NOT EXISTS idx_farm_records_type ON farm_records(record_type);
CREATE INDEX IF NOT EXISTS idx_farm_tasks_farm_id ON farm_tasks(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_tasks_status ON farm_tasks(status);
CREATE INDEX IF NOT EXISTS idx_farm_tasks_due_date ON farm_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_farm_livestock_farm_id ON farm_livestock(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_crops_farm_id ON farm_crops(farm_id);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_farms_updated_at ON farms;
CREATE TRIGGER update_farms_updated_at 
  BEFORE UPDATE ON farms 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_farm_records_updated_at ON farm_records;
CREATE TRIGGER update_farm_records_updated_at 
  BEFORE UPDATE ON farm_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_farm_tasks_updated_at ON farm_tasks;
CREATE TRIGGER update_farm_tasks_updated_at 
  BEFORE UPDATE ON farm_tasks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_farm_livestock_updated_at ON farm_livestock;
CREATE TRIGGER update_farm_livestock_updated_at 
  BEFORE UPDATE ON farm_livestock 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_farm_crops_updated_at ON farm_crops;
CREATE TRIGGER update_farm_crops_updated_at 
  BEFORE UPDATE ON farm_crops 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_crops ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Farms table policies
DROP POLICY IF EXISTS "Users can view their own farms" ON farms;
CREATE POLICY "Users can view their own farms" ON farms
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can create their own farms" ON farms;
CREATE POLICY "Users can create their own farms" ON farms
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update their own farms" ON farms;
CREATE POLICY "Users can update their own farms" ON farms
  FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can delete their own farms" ON farms;
CREATE POLICY "Users can delete their own farms" ON farms
  FOR DELETE USING (auth.uid()::text = user_id);

-- Farm records policies
DROP POLICY IF EXISTS "Users can view records of their farms" ON farm_records;
CREATE POLICY "Users can view records of their farms" ON farm_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_records.farm_id 
      AND farms.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can create records for their farms" ON farm_records;
CREATE POLICY "Users can create records for their farms" ON farm_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_records.farm_id 
      AND farms.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can update records of their farms" ON farm_records;
CREATE POLICY "Users can update records of their farms" ON farm_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_records.farm_id 
      AND farms.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can delete records of their farms" ON farm_records;
CREATE POLICY "Users can delete records of their farms" ON farm_records
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_records.farm_id 
      AND farms.user_id = auth.uid()::text
    )
  );

-- Farm tasks policies
DROP POLICY IF EXISTS "Users can view tasks of their farms" ON farm_tasks;
CREATE POLICY "Users can view tasks of their farms" ON farm_tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_tasks.farm_id 
      AND farms.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can create tasks for their farms" ON farm_tasks;
CREATE POLICY "Users can create tasks for their farms" ON farm_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_tasks.farm_id 
      AND farms.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can update tasks of their farms" ON farm_tasks;
CREATE POLICY "Users can update tasks of their farms" ON farm_tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_tasks.farm_id 
      AND farms.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can delete tasks of their farms" ON farm_tasks;
CREATE POLICY "Users can delete tasks of their farms" ON farm_tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_tasks.farm_id 
      AND farms.user_id = auth.uid()::text
    )
  );

-- Farm livestock policies
DROP POLICY IF EXISTS "Users can view livestock of their farms" ON farm_livestock;
CREATE POLICY "Users can view livestock of their farms" ON farm_livestock
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_livestock.farm_id 
      AND farms.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can create livestock for their farms" ON farm_livestock;
CREATE POLICY "Users can create livestock for their farms" ON farm_livestock
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_livestock.farm_id 
      AND farms.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can update livestock of their farms" ON farm_livestock;
CREATE POLICY "Users can update livestock of their farms" ON farm_livestock
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_livestock.farm_id 
      AND farms.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can delete livestock of their farms" ON farm_livestock;
CREATE POLICY "Users can delete livestock of their farms" ON farm_livestock
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_livestock.farm_id 
      AND farms.user_id = auth.uid()::text
    )
  );

-- Farm crops policies
DROP POLICY IF EXISTS "Users can view crops of their farms" ON farm_crops;
CREATE POLICY "Users can view crops of their farms" ON farm_crops
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_crops.farm_id 
      AND farms.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can create crops for their farms" ON farm_crops;
CREATE POLICY "Users can create crops for their farms" ON farm_crops
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_crops.farm_id 
      AND farms.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can update crops of their farms" ON farm_crops;
CREATE POLICY "Users can update crops of their farms" ON farm_crops
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_crops.farm_id 
      AND farms.user_id = auth.uid()::text
    )
  );

DROP POLICY IF EXISTS "Users can delete crops of their farms" ON farm_crops;
CREATE POLICY "Users can delete crops of their farms" ON farm_crops
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM farms 
      WHERE farms.id = farm_crops.farm_id 
      AND farms.user_id = auth.uid()::text
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON farms TO anon, authenticated;
GRANT ALL ON farm_records TO anon, authenticated;
GRANT ALL ON farm_tasks TO anon, authenticated;
GRANT ALL ON farm_livestock TO anon, authenticated;
GRANT ALL ON farm_crops TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
