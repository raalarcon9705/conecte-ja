-- =====================================================
-- JOB POSTINGS SYSTEM
-- =====================================================
-- This migration adds support for clients to post jobs
-- that professionals can apply to or react with likes/dislikes
-- =====================================================

-- =====================================================
-- TABLE: job_postings
-- Jobs posted by clients looking for professionals
-- =====================================================
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Job information
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),

  -- Dates and schedule
  start_date DATE,
  end_date DATE,
  is_recurring BOOLEAN DEFAULT false,
  schedule JSONB,  -- Example: {days: ['monday', 'friday'], time: '8:00-12:00'}

  -- Location
  location_address TEXT,
  location_city VARCHAR(100),
  location_state VARCHAR(100),
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),

  -- Budget
  budget_min DECIMAL(10, 2),
  budget_max DECIMAL(10, 2),
  budget_type VARCHAR(20) CHECK (budget_type IN ('hourly', 'daily', 'fixed', 'negotiable')),

  -- Status
  status VARCHAR(20) DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'completed', 'canceled', 'expired')),

  -- Metadata
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  dislikes_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,

  -- Selected professional (when job is assigned)
  selected_professional_id UUID REFERENCES professional_profiles(id) ON DELETE SET NULL,
  selected_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for job_postings
CREATE INDEX idx_job_postings_client ON job_postings(client_profile_id, created_at DESC);
CREATE INDEX idx_job_postings_category ON job_postings(category_id);
CREATE INDEX idx_job_postings_status ON job_postings(status, created_at DESC);
CREATE INDEX idx_job_postings_location ON job_postings(location_city, location_state);
CREATE INDEX idx_job_postings_dates ON job_postings(start_date, end_date);
CREATE INDEX idx_job_postings_expires ON job_postings(expires_at) WHERE status = 'open';

-- =====================================================
-- TABLE: job_applications
-- Applications from professionals to job postings
-- =====================================================
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  professional_profile_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,

  -- Professional's proposal
  cover_letter TEXT,
  proposed_price DECIMAL(10, 2),
  estimated_duration_minutes INTEGER,
  availability_notes TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),

  -- Important dates
  viewed_by_client_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  withdrawn_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(job_posting_id, professional_profile_id)
);

-- Indexes for job_applications
CREATE INDEX idx_job_applications_job ON job_applications(job_posting_id, created_at DESC);
CREATE INDEX idx_job_applications_professional ON job_applications(professional_profile_id, created_at DESC);
CREATE INDEX idx_job_applications_status ON job_applications(status);

-- =====================================================
-- TABLE: job_posting_reactions
-- Likes/dislikes from professionals on job postings
-- =====================================================
CREATE TABLE job_posting_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  professional_profile_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,

  -- Reaction type
  reaction_type VARCHAR(10) NOT NULL CHECK (reaction_type IN ('like', 'dislike')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(job_posting_id, professional_profile_id)
);

-- Indexes for job_posting_reactions
CREATE INDEX idx_job_reactions_job ON job_posting_reactions(job_posting_id, reaction_type);
CREATE INDEX idx_job_reactions_professional ON job_posting_reactions(professional_profile_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update job_postings updated_at
CREATE OR REPLACE FUNCTION update_job_postings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_job_postings_updated_at
BEFORE UPDATE ON job_postings
FOR EACH ROW
EXECUTE FUNCTION update_job_postings_updated_at();

-- Update job_applications updated_at
CREATE OR REPLACE FUNCTION update_job_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_job_applications_updated_at
BEFORE UPDATE ON job_applications
FOR EACH ROW
EXECUTE FUNCTION update_job_applications_updated_at();

-- Update applications_count on job_postings
CREATE OR REPLACE FUNCTION update_job_applications_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE job_postings
    SET applications_count = applications_count + 1
    WHERE id = NEW.job_posting_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE job_postings
    SET applications_count = applications_count - 1
    WHERE id = OLD.job_posting_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_applications_count
AFTER INSERT OR DELETE ON job_applications
FOR EACH ROW
EXECUTE FUNCTION update_job_applications_count();

-- Update likes/dislikes count on job_postings
CREATE OR REPLACE FUNCTION update_job_reactions_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction_type = 'like' THEN
      UPDATE job_postings
      SET likes_count = likes_count + 1
      WHERE id = NEW.job_posting_id;
    ELSE
      UPDATE job_postings
      SET dislikes_count = dislikes_count + 1
      WHERE id = NEW.job_posting_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If reaction type changed
    IF OLD.reaction_type != NEW.reaction_type THEN
      IF OLD.reaction_type = 'like' THEN
        UPDATE job_postings
        SET likes_count = likes_count - 1, dislikes_count = dislikes_count + 1
        WHERE id = NEW.job_posting_id;
      ELSE
        UPDATE job_postings
        SET likes_count = likes_count + 1, dislikes_count = dislikes_count - 1
        WHERE id = NEW.job_posting_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction_type = 'like' THEN
      UPDATE job_postings
      SET likes_count = likes_count - 1
      WHERE id = OLD.job_posting_id;
    ELSE
      UPDATE job_postings
      SET dislikes_count = dislikes_count - 1
      WHERE id = OLD.job_posting_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reactions_count
AFTER INSERT OR UPDATE OR DELETE ON job_posting_reactions
FOR EACH ROW
EXECUTE FUNCTION update_job_reactions_count();

-- Auto-expire job postings
CREATE OR REPLACE FUNCTION auto_expire_job_postings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at IS NOT NULL AND NEW.expires_at <= NOW() AND NEW.status = 'open' THEN
    NEW.status = 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_expire_jobs
BEFORE UPDATE ON job_postings
FOR EACH ROW
EXECUTE FUNCTION auto_expire_job_postings();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_posting_reactions ENABLE ROW LEVEL SECURITY;

-- Job Postings Policies
CREATE POLICY "Anyone can view open job postings"
  ON job_postings FOR SELECT
  USING (status IN ('open', 'in_progress'));

CREATE POLICY "Clients can view their own job postings"
  ON job_postings FOR SELECT
  USING (client_profile_id = auth.uid());

CREATE POLICY "Clients can create job postings"
  ON job_postings FOR INSERT
  WITH CHECK (client_profile_id = auth.uid());

CREATE POLICY "Clients can update their own job postings"
  ON job_postings FOR UPDATE
  USING (client_profile_id = auth.uid());

CREATE POLICY "Clients can delete their own job postings"
  ON job_postings FOR DELETE
  USING (client_profile_id = auth.uid());

-- Job Applications Policies
CREATE POLICY "Clients can view applications for their jobs"
  ON job_applications FOR SELECT
  USING (
    job_posting_id IN (
      SELECT id FROM job_postings WHERE client_profile_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can view their own applications"
  ON job_applications FOR SELECT
  USING (
    professional_profile_id IN (
      SELECT id FROM professional_profiles WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can create applications"
  ON job_applications FOR INSERT
  WITH CHECK (
    professional_profile_id IN (
      SELECT id FROM professional_profiles WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can update their own applications"
  ON job_applications FOR UPDATE
  USING (
    professional_profile_id IN (
      SELECT id FROM professional_profiles WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Clients can update applications for their jobs"
  ON job_applications FOR UPDATE
  USING (
    job_posting_id IN (
      SELECT id FROM job_postings WHERE client_profile_id = auth.uid()
    )
  );

-- Job Reactions Policies
CREATE POLICY "Professionals can view all reactions"
  ON job_posting_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM professional_profiles WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can create reactions"
  ON job_posting_reactions FOR INSERT
  WITH CHECK (
    professional_profile_id IN (
      SELECT id FROM professional_profiles WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can update their own reactions"
  ON job_posting_reactions FOR UPDATE
  USING (
    professional_profile_id IN (
      SELECT id FROM professional_profiles WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can delete their own reactions"
  ON job_posting_reactions FOR DELETE
  USING (
    professional_profile_id IN (
      SELECT id FROM professional_profiles WHERE profile_id = auth.uid()
    )
  );

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE job_postings IS 'Jobs posted by clients looking for professionals (maids, nannies, etc.)';
COMMENT ON TABLE job_applications IS 'Applications from professionals to job postings';
COMMENT ON TABLE job_posting_reactions IS 'Likes and dislikes from professionals on job postings';

COMMENT ON COLUMN job_postings.schedule IS 'JSONB with schedule details: {days: [''monday'', ''friday''], time: ''8:00-12:00''}';
COMMENT ON COLUMN job_postings.budget_type IS 'Type of budget: hourly, daily, fixed, or negotiable';
COMMENT ON COLUMN job_postings.expires_at IS 'When the job posting expires and becomes unavailable';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
