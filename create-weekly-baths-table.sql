-- Create weekly_baths table for storing curated bath photos
CREATE TABLE weekly_baths (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  pet_name TEXT NOT NULL,
  pet_id UUID REFERENCES pets_pet(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  bath_date DATE NOT NULL,
  week_start DATE NOT NULL, -- Monday of the week
  approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES profiles_pet(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  display_order INTEGER DEFAULT 0,
  curator_notes TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_weekly_baths_week_start ON weekly_baths(week_start);
CREATE INDEX idx_weekly_baths_approved ON weekly_baths(approved);
CREATE INDEX idx_weekly_baths_display_order ON weekly_baths(display_order);
CREATE INDEX idx_weekly_baths_bath_date ON weekly_baths(bath_date);

-- Create RLS policies for weekly_baths table
ALTER TABLE weekly_baths ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to approved baths
CREATE POLICY "Public can view approved weekly baths" ON weekly_baths
  FOR SELECT
  USING (approved = true);

-- Policy for authenticated users to insert new baths (for staff)
CREATE POLICY "Authenticated users can insert weekly baths" ON weekly_baths
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for admins to manage all weekly baths
CREATE POLICY "Admins can manage weekly baths" ON weekly_baths
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles_pet
      WHERE profiles_pet.id = auth.uid()
      AND profiles_pet.email IN (
        SELECT email FROM admin_users_pet
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles_pet
      WHERE profiles_pet.id = auth.uid()
      AND profiles_pet.email IN (
        SELECT email FROM admin_users_pet
      )
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_weekly_baths_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_weekly_baths_updated_at_trigger
  BEFORE UPDATE ON weekly_baths
  FOR EACH ROW
  EXECUTE FUNCTION update_weekly_baths_updated_at();

-- Create function to get current week's approved baths
CREATE OR REPLACE FUNCTION get_current_week_baths()
RETURNS TABLE (
  id UUID,
  pet_name TEXT,
  image_url TEXT,
  bath_date DATE,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  current_week_start DATE;
BEGIN
  -- Calculate current week start (Monday)
  current_week_start := DATE_TRUNC('week', CURRENT_DATE)::DATE + INTERVAL '1 day';
  
  RETURN QUERY
  SELECT 
    wb.id,
    wb.pet_name,
    wb.image_url,
    wb.bath_date,
    wb.display_order,
    wb.created_at
  FROM weekly_baths wb
  WHERE wb.week_start = current_week_start
    AND wb.approved = true
  ORDER BY wb.display_order ASC, wb.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to archive old weekly baths (keep only last 8 weeks)
CREATE OR REPLACE FUNCTION archive_old_weekly_baths()
RETURNS INTEGER AS $$
DECLARE
  cutoff_date DATE;
  deleted_count INTEGER;
BEGIN
  -- Calculate cutoff date (8 weeks ago from current Monday)
  cutoff_date := (DATE_TRUNC('week', CURRENT_DATE)::DATE + INTERVAL '1 day') - INTERVAL '8 weeks';
  
  -- Delete old records
  DELETE FROM weekly_baths
  WHERE week_start < cutoff_date;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get week start date for any given date
CREATE OR REPLACE FUNCTION get_week_start(input_date DATE)
RETURNS DATE AS $$
BEGIN
  -- Return Monday of the week for the given date
  RETURN (DATE_TRUNC('week', input_date)::DATE + INTERVAL '1 day')::DATE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Insert some sample data for testing (optional)
-- This can be removed in production
INSERT INTO weekly_baths (pet_name, image_url, bath_date, week_start, approved, display_order) VALUES
('Luna', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop', CURRENT_DATE - INTERVAL '3 days', get_week_start(CURRENT_DATE), true, 1),
('Max', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop', CURRENT_DATE - INTERVAL '2 days', get_week_start(CURRENT_DATE), true, 2),
('Bella', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop', CURRENT_DATE - INTERVAL '1 day', get_week_start(CURRENT_DATE), true, 3),
('Charlie', 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop', CURRENT_DATE, get_week_start(CURRENT_DATE), true, 4),
('Milo', 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&h=400&fit=crop', CURRENT_DATE, get_week_start(CURRENT_DATE), true, 5);

-- Grant necessary permissions
GRANT SELECT ON weekly_baths TO anon;
GRANT ALL ON weekly_baths TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_week_baths() TO anon;
GRANT EXECUTE ON FUNCTION get_current_week_baths() TO authenticated;
GRANT EXECUTE ON FUNCTION archive_old_weekly_baths() TO authenticated;
GRANT EXECUTE ON FUNCTION get_week_start(DATE) TO anon;
GRANT EXECUTE ON FUNCTION get_week_start(DATE) TO authenticated;

-- Create a scheduled job to run archive function weekly (if pg_cron is available)
-- This would typically be set up in the Supabase dashboard or via cron job
-- SELECT cron.schedule('archive-weekly-baths', '0 2 * * 1', 'SELECT archive_old_weekly_baths();');