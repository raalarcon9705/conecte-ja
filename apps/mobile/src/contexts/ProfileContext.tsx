import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import type { Database } from '@conecteja/types';

// Type aliases from database
type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfessionalProfile = Database['public']['Tables']['professional_profiles']['Row'];

export interface ProfileWithProfessional extends Profile {
  professional_profile?: ProfessionalProfile;
}

interface ProfileContextType {
  profile: ProfileWithProfessional | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updateProfessionalProfile: (updates: Partial<ProfessionalProfile>) => Promise<void>;
  uploadAvatar: (file: File | Blob, userId: string) => Promise<string | null>;
  updateLocation: (latitude: number, longitude: number, address?: string, city?: string, state?: string) => Promise<void>;
  updateLastSeen: () => Promise<void>;
  refetch: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<ProfileWithProfessional | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = useSupabase();

  const fetchProfile = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentUserId(userId);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      // If profile doesn't exist, create it (fallback in case trigger failed)
      if (!profileData) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuario no autenticado');

        const newProfile = {
          id: userId,
          user_type: user.user_metadata?.user_type || 'client',
          full_name: user.user_metadata?.full_name || 'Usuario',
          email_notifications: true,
          notifications_enabled: true,
          is_active: true,
          default_mode: user.user_metadata?.user_type || 'client',
          language: 'pt-BR',
          country: 'BR',
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) throw createError;

        setProfile(createdProfile as ProfileWithProfessional);
        return;
      }

      // Try to fetch professional profile if exists
      const { data: professionalData } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('profile_id', userId)
        .maybeSingle();

      const fullProfile: ProfileWithProfessional = {
        ...profileData,
        professional_profile: professionalData || undefined,
      };

      setProfile(fullProfile);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Error al actualizar perfil');
      throw err;
    }
  };

  const updateProfessionalProfile = async (updates: Partial<ProfessionalProfile>) => {
    try {
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      if (!profile?.professional_profile) {
        throw new Error('No professional profile found');
      }

      const { data, error: updateError } = await supabase
        .from('professional_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('profile_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              professional_profile: data as ProfessionalProfile,
            }
          : null
      );
    } catch (err: any) {
      console.error('Error updating professional profile:', err);
      setError(err.message || 'Error al actualizar perfil profesional');
      throw err;
    }
  };

  const uploadAvatar = async (file: File | Blob, userId: string): Promise<string | null> => {
    try {
      setError(null);

      // Generate unique file name
      const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: publicUrl });

      return publicUrl;
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setError(err.message || 'Error al subir avatar');
      throw err;
    }
  };

  const updateLocation = async (
    latitude: number,
    longitude: number,
    address?: string,
    city?: string,
    state?: string
  ) => {
    try {
      setError(null);

      const updates: Partial<Profile> = {
        latitude,
        longitude,
      };

      if (address) updates.address = address;
      if (city) updates.city = city;
      if (state) updates.state = state;

      await updateProfile(updates);
    } catch (err: any) {
      console.error('Error updating location:', err);
      setError(err.message || 'Error al actualizar ubicación');
      throw err;
    }
  };

  const updateLastSeen = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update last seen without triggering full profile refetch
      await supabase
        .from('profiles')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', user.id);

      // Update local state
      setProfile((prev) =>
        prev
          ? { ...prev, last_seen_at: new Date().toISOString() }
          : null
      );
    } catch (err: any) {
      // Silently fail for last seen updates
      console.error('Error updating last seen:', err);
    }
  };

  const refetch = async () => {
    if (currentUserId) {
      await fetchProfile(currentUserId);
    }
  };

  // Update last seen periodically
  useEffect(() => {
    if (!profile) return;

    updateLastSeen();

    const interval = setInterval(() => {
      updateLastSeen();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [profile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        fetchProfile,
        updateProfile,
        updateProfessionalProfile,
        uploadAvatar,
        updateLocation,
        updateLastSeen,
        refetch,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

