import { useState, useEffect } from 'react';
import { useSupabase } from './useSupabase';
import { useProfessionals } from '../contexts/ProfessionalsContext';
import { Database } from '@conecteja/types';

type Review = Database['public']['Tables']['reviews']['Row'];
type PortfolioItem = Database['public']['Tables']['portfolio_items']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfessionalProfile = Database['public']['Tables']['professional_profiles']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row'];

type ProfessionalProfileWithDetails = ProfessionalProfile & {
  profiles: Profile;
  categories: Category;
  subscription_plan: SubscriptionPlan;
};

type ReviewWithClientProfile = Review & {
  client_profile: Profile;
};

export const useProfessionalDetails = (professionalId: string) => {
  const supabase = useSupabase();
  const { fetchProfessionalById, loading: loadingProfessional } = useProfessionals();
  
  const [professional, setProfessional] = useState<ProfessionalProfileWithDetails | null>(null);
  const [reviews, setReviews] = useState<ReviewWithClientProfile[]>([]);
  const [galleryImages, setGalleryImages] = useState<PortfolioItem[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [activeTab, setActiveTab] = useState('services');
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Fetch reviews for the professional
  const fetchReviews = async (professionalProfileId: string) => {
    try {
      setLoadingReviews(true);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          client_profile:client_profile_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('professional_profile_id', professionalProfileId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;


      setReviews(data as unknown as ReviewWithClientProfile[]);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Fetch portfolio/gallery images
  const fetchGallery = async (professionalProfileId: string) => {
    try {
      setLoadingGallery(true);
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('professional_profile_id', professionalProfileId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setGalleryImages(data || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setGalleryImages([]);
    } finally {
      setLoadingGallery(false);
    }
  };

  // Load professional data and related content
  useEffect(() => {
    const loadProfessional = async () => {
      const data = await fetchProfessionalById(professionalId);
      setProfessional(data as unknown as ProfessionalProfileWithDetails);
      
      if (data?.id) {
        // Fetch reviews and gallery when professional is loaded
        fetchReviews(data.id);
        fetchGallery(data.id);
      }
    };
    
    if (professionalId) {
      loadProfessional();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [professionalId]);

  // Parse services from JSONB
  const services = professional && Array.isArray((professional as { services?: unknown[] }).services) 
    ? (professional as { services: unknown[] }).services 
    : [];

  return {
    // Data
    professional,
    reviews,
    galleryImages,
    services,
    
    // Loading states
    loading: loadingProfessional,
    loadingReviews,
    loadingGallery,
    
    // Tab state
    activeTab,
    setActiveTab,
    
    // Service selection
    selectedService,
    setSelectedService,
    
    // Refetch functions
    refetchReviews: () => {
      const prof = professional as { id?: string } | null;
      return prof?.id && fetchReviews(prof.id);
    },
    refetchGallery: () => {
      const prof = professional as { id?: string } | null;
      return prof?.id && fetchGallery(prof.id);
    },
  };
};

