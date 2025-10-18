-- =====================================================
-- PREVENT SELF-APPLICATION TO JOBS
-- =====================================================
-- This migration adds a database-level validation to prevent
-- users from applying to their own job postings
-- =====================================================

-- Create function to prevent self-application
CREATE OR REPLACE FUNCTION prevent_self_job_application()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the professional applying is the same user who created the job
  IF EXISTS (
    SELECT 1
    FROM job_postings jp
    INNER JOIN professional_profiles pp ON pp.id = NEW.professional_profile_id
    WHERE jp.id = NEW.job_posting_id
      AND jp.client_profile_id = pp.profile_id
  ) THEN
    RAISE EXCEPTION 'Cannot apply to your own job posting'
      USING ERRCODE = 'check_violation',
            HINT = 'A user cannot apply as a professional to a job they created as a client.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce the validation
CREATE TRIGGER trigger_prevent_self_application
  BEFORE INSERT OR UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION prevent_self_job_application();

-- Add a comment explaining the trigger
COMMENT ON FUNCTION prevent_self_job_application() IS 
  'Prevents users from applying to their own job postings. '
  'A professional cannot apply to a job they created as a client.';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

