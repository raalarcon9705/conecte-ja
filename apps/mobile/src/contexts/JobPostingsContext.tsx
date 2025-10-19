import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import type { Database } from '@conecteja/types';

// ============================================================================
// Type Definitions
// ============================================================================
export type JobPosting = Database['public']['Tables']['job_postings']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type JobApplication = Database['public']['Tables']['job_applications']['Row'];
export type ProfessionalProfile = Database['public']['Tables']['professional_profiles']['Row'];

export interface JobApplicationWithDetails extends JobApplication {
  professional_profiles: ProfessionalProfile & {
    profiles: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
  };
}

export interface JobPostingWithDetails extends JobPosting {
  profiles: Profile;
  categories: Category;
}

export interface JobReaction {
  job_posting_id: string;
  reaction_type: 'like' | 'dislike';
}

// ============================================================================
// Context Interface
// ============================================================================
interface JobPostingsContextType {
  // Data states
  jobPostings: JobPostingWithDetails[];
  currentJobPosting: JobPostingWithDetails | null;
  featuredJobs: JobPostingWithDetails[];
  myApplications: JobApplication[];
  loading: boolean;
  error: string | null;
  
  // Fetch methods
  fetchJobPostings: (categoryId?: string, limit?: number) => Promise<void>;
  fetchFeaturedJobs: (professionalCategoryId?: string, limit?: number) => Promise<void>;
  fetchJobPostingById: (jobId: string) => Promise<JobPostingWithDetails | null>;
  fetchMyApplications: (professionalProfileId: string) => Promise<void>;
  
  // Action methods
  reactToJob: (jobId: string, reactionType: 'like' | 'dislike') => Promise<void>;
  applyToJob: (jobId: string, professionalProfileId: string, coverLetter: string, proposedPrice?: number) => Promise<void>;
  
  // Utility methods
  checkIfApplied: (jobId: string, professionalProfileId: string) => Promise<boolean>;
  getUserReaction: (jobId: string, professionalProfileId: string) => Promise<'like' | 'dislike' | null>;
  refetch: () => Promise<void>;
}

// ============================================================================
// Create Context
// ============================================================================
const JobPostingsContext = createContext<JobPostingsContextType | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================
export const JobPostingsProvider = ({ children }: { children: ReactNode }) => {
  const [jobPostings, setJobPostings] = useState<JobPostingWithDetails[]>([]);
  const [currentJobPosting, setCurrentJobPosting] = useState<JobPostingWithDetails | null>(null);
  const [featuredJobs, setFeaturedJobs] = useState<JobPostingWithDetails[]>([]);
  const [myApplications, setMyApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchParams, setLastFetchParams] = useState<{ categoryId?: string; limit?: number } | null>(null);
  const supabase = useSupabase();

  // ==========================================================================
  // Fetch Methods
  // ==========================================================================
  
  const fetchJobPostings = useCallback(async (categoryId?: string, limit?: number) => {
    try {
      setLoading(true);
      setError(null);
      setLastFetchParams({ categoryId, limit });

      // Reusing query logic from JobsListScreen.tsx
      let query = supabase
        .from('job_postings')
        .select(`
          *,
          profiles!job_postings_client_profile_id_fkey (
            id,
            full_name,
            avatar_url
          ),
          categories (
            id,
            name
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setJobPostings(data as unknown as JobPostingWithDetails[] || []);
    } catch (err: unknown) {
      console.error('Error fetching job postings:', err);
      const message = err instanceof Error ? err.message : 'Error loading job postings';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchFeaturedJobs = useCallback(async (professionalCategoryId?: string, limit = 5) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('job_postings')
        .select(`
          *,
          profiles!job_postings_client_profile_id_fkey (
            id,
            full_name,
            avatar_url
          ),
          categories (
            id,
            name
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Filter by professional's category if provided
      if (professionalCategoryId) {
        query = query.eq('category_id', professionalCategoryId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // If no jobs found with specific category, fetch all available jobs as fallback
      if (professionalCategoryId && (!data || data.length === 0)) {
        const { data: allJobs, error: allJobsError } = await supabase
          .from('job_postings')
          .select(`
            *,
            profiles!job_postings_client_profile_id_fkey (
              id,
              full_name,
              avatar_url
            ),
            categories (
              id,
              name
            )
          `)
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (allJobsError) throw allJobsError;
        setFeaturedJobs(allJobs as unknown as JobPostingWithDetails[] || []);
      } else {
        setFeaturedJobs(data as unknown as JobPostingWithDetails[] || []);
      }
    } catch (err: unknown) {
      console.error('Error fetching featured jobs:', err);
      const message = err instanceof Error ? err.message : 'Error loading featured jobs';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchJobPostingById = useCallback(async (jobId: string): Promise<JobPostingWithDetails | null> => {
    try {
      setLoading(true);
      setError(null);

      // Reusing query logic from JobDetailScreen.tsx
      const { data, error: fetchError } = await supabase
        .from('job_postings')
        .select(`
          *,
          profiles!job_postings_client_profile_id_fkey (
            id,
            full_name,
            avatar_url,
            phone
          ),
          categories (
            id,
            name
          )
        `)
        .eq('id', jobId)
        .single();

      if (fetchError) throw fetchError;

      const jobPosting = data as unknown as JobPostingWithDetails;
      setCurrentJobPosting(jobPosting);
      return jobPosting;
    } catch (err: unknown) {
      console.error('Error fetching job posting by id:', err);
      const message = err instanceof Error ? err.message : 'Error loading job posting';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchMyApplications = useCallback(async (professionalProfileId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('job_applications')
        .select(`
          *,
          job_postings!job_applications_job_posting_id_fkey (
            id,
            title,
            description,
            status,
            profiles!job_postings_client_profile_id_fkey (
              full_name,
              avatar_url
            )
          )
        `)
        .eq('professional_profile_id', professionalProfileId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setMyApplications(data || []);
    } catch (err: unknown) {
      console.error('Error fetching applications:', err);
      const message = err instanceof Error ? err.message : 'Error loading applications';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // ==========================================================================
  // Action Methods
  // ==========================================================================

  const reactToJob = useCallback(async (jobId: string, reactionType: 'like' | 'dislike') => {
    try {
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get professional profile
      const { data: professionalProfile } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('profile_id', user.id)
        .single();

      if (!professionalProfile) {
        throw new Error('Professional profile required to react');
      }

      // Reusing reaction logic from JobDetailScreen.tsx
      // Check for existing reaction
      const { data: existingReaction } = await supabase
        .from('job_posting_reactions')
        .select('reaction_type')
        .eq('job_posting_id', jobId)
        .eq('professional_profile_id', professionalProfile.id)
        .single();

      if (existingReaction?.reaction_type === reactionType) {
        // Remove reaction (toggle off)
        await supabase
          .from('job_posting_reactions')
          .delete()
          .eq('job_posting_id', jobId)
          .eq('professional_profile_id', professionalProfile.id);
      } else {
        // Add or update reaction
        await supabase
          .from('job_posting_reactions')
          .upsert({
            job_posting_id: jobId,
            professional_profile_id: professionalProfile.id,
            reaction_type: reactionType,
          });
      }

      // Manually refetch using last params to avoid circular dependency
      if (lastFetchParams) {
        await fetchJobPostings(lastFetchParams.categoryId, lastFetchParams.limit);
      }
    } catch (err: unknown) {
      console.error('Error reacting to job:', err);
      const message = err instanceof Error ? err.message : 'Error registering reaction';
      setError(message);
      throw err;
    }
  }, [supabase, lastFetchParams, fetchJobPostings]);

  const applyToJob = useCallback(async (
    jobId: string,
    professionalProfileId: string,
    coverLetter: string,
    proposedPrice?: number
  ) => {
    try {
      setError(null);

      const { error: insertError } = await supabase
        .from('job_applications')
        .insert({
          job_posting_id: jobId,
          professional_profile_id: professionalProfileId,
          cover_letter: coverLetter,
          proposed_price: proposedPrice,
          status: 'pending',
        });

      if (insertError) throw insertError;

      // Refetch applications
      await fetchMyApplications(professionalProfileId);
    } catch (err: unknown) {
      console.error('Error applying to job:', err);
      const message = err instanceof Error ? err.message : 'Error applying to job';
      setError(message);
      throw err;
    }
  }, [supabase, fetchMyApplications]);

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  const checkIfApplied = useCallback(async (
    jobId: string,
    professionalProfileId: string
  ): Promise<boolean> => {
    try {
      // Reusing logic from JobDetailScreen.tsx
      const { data } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_posting_id', jobId)
        .eq('professional_profile_id', professionalProfileId)
        .single();

      return !!data;
    } catch (error) {
      console.error('Error checking if applied:', error);
      return false;
    }
  }, [supabase]);

  const getUserReaction = useCallback(async (
    jobId: string,
    professionalProfileId: string
  ): Promise<'like' | 'dislike' | null> => {
    try {
      // Reusing logic from JobDetailScreen.tsx
      const { data } = await supabase
        .from('job_posting_reactions')
        .select('reaction_type')
        .eq('job_posting_id', jobId)
        .eq('professional_profile_id', professionalProfileId)
        .single();

      return (data?.reaction_type as 'like' | 'dislike') || null;
    } catch (error) {
      console.error('Error getting user reaction:', error);
      return null;
    }
  }, [supabase]);

  const refetch = useCallback(async () => {
    if (lastFetchParams) {
      await fetchJobPostings(lastFetchParams.categoryId, lastFetchParams.limit);
    }
  }, [lastFetchParams, fetchJobPostings]);

  // ==========================================================================
  // Return Provider
  // ==========================================================================
  return (
    <JobPostingsContext.Provider
      value={{
        jobPostings,
        currentJobPosting,
        featuredJobs,
        myApplications,
        loading,
        error,
        fetchJobPostings,
        fetchFeaturedJobs,
        fetchJobPostingById,
        fetchMyApplications,
        reactToJob,
        applyToJob,
        checkIfApplied,
        getUserReaction,
        refetch,
      }}
    >
      {children}
    </JobPostingsContext.Provider>
  );
};

// ============================================================================
// Custom Hook
// ============================================================================
export const useJobPostings = () => {
  const context = useContext(JobPostingsContext);
  if (context === undefined) {
    throw new Error('useJobPostings must be used within a JobPostingsProvider');
  }
  return context;
};

