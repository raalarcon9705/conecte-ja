-- =====================================================
-- ALLOW VIEWING CLIENT PROFILES WHO POST JOBS
-- =====================================================
-- This migration allows anyone to view basic profile information
-- of clients who have published job postings.
-- This is necessary so professionals can see who posted the jobs.
-- =====================================================

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Anyone can view client profiles with job postings" ON profiles;

-- Create policy to allow viewing client profiles who have posted jobs
CREATE POLICY "Anyone can view client profiles with job postings"
  ON profiles FOR SELECT
  USING (
    -- Allow viewing profiles of clients who have published open or in-progress jobs
    id IN (
      SELECT DISTINCT client_profile_id 
      FROM job_postings 
      WHERE status IN ('open', 'in_progress')
    )
  );

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON POLICY "Anyone can view client profiles with job postings" ON profiles
  IS 'Allows viewing basic profile information (name, avatar) of clients who have posted jobs';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

