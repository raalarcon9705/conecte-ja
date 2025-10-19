import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { Professional } from './ProfessionalsContext';

interface FavoritesContextType {
  favorites: string[]; // Array of professional profile IDs
  favoriteProfessionals: Professional[];
  loading: boolean;
  error: string | null;
  fetchFavorites: (clientProfileId: string) => Promise<void>;
  addFavorite: (professionalProfileId: string) => Promise<void>;
  removeFavorite: (professionalProfileId: string) => Promise<void>;
  toggleFavorite: (professionalProfileId: string) => Promise<void>;
  isFavorite: (professionalProfileId: string) => boolean;
  refetch: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteProfessionals, setFavoriteProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);
  const supabase = useSupabase();

  const fetchFavorites = async (clientProfileId: string) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentClientId(clientProfileId);

      const { data, error: fetchError } = await supabase
        .from('favorites')
        .select(`
          professional_profile_id,
          professional_profiles:professional_profile_id (
            *,
            profiles:profile_id (
              id,
              full_name,
              avatar_url,
              city,
              state,
              latitude,
              longitude
            ),
            categories:category_id (
              id,
              name,
              slug
            )
          )
        `)
        .eq('client_profile_id', clientProfileId);

      if (fetchError) throw fetchError;

      const favoriteIds = data.map((fav: { professional_profile_id: string }) => fav.professional_profile_id);
      const professionals = data
        .map((fav: { professional_profiles: Professional }) => fav.professional_profiles)
        .filter(Boolean);

      setFavorites(favoriteIds);
      setFavoriteProfessionals(professionals as Professional[]);
    } catch (err: unknown) {
      console.error('Error fetching favorites:', err);
      const message = err instanceof Error ? err.message : 'Error al cargar favoritos';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (professionalProfileId: string) => {
    try {
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Check if already exists
      const { data: existing } = await supabase
        .from('favorites')
        .select('id')
        .eq('client_profile_id', user.id)
        .eq('professional_profile_id', professionalProfileId)
        .single();

      if (existing) {
        // Already a favorite, nothing to do
        return;
      }

      const { error: insertError } = await supabase
        .from('favorites')
        .insert({
          client_profile_id: user.id,
          professional_profile_id: professionalProfileId,
        });

      if (insertError) throw insertError;

      // Update local state
      setFavorites((prev) => [...prev, professionalProfileId]);

      // Optionally refetch to get professional details
      if (currentClientId) {
        await fetchFavorites(currentClientId);
      }
    } catch (err: unknown) {
      console.error('Error adding favorite:', err);
      const message = err instanceof Error ? err.message : 'Error al agregar favorito';
      setError(message);
      throw err;
    }
  };

  const removeFavorite = async (professionalProfileId: string) => {
    try {
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('client_profile_id', user.id)
        .eq('professional_profile_id', professionalProfileId);

      if (deleteError) throw deleteError;

      // Update local state
      setFavorites((prev) => prev.filter((id) => id !== professionalProfileId));
      setFavoriteProfessionals((prev) => 
        prev.filter((prof) => prof.id !== professionalProfileId)
      );
    } catch (err: unknown) {
      console.error('Error removing favorite:', err);
      const message = err instanceof Error ? err.message : 'Error al eliminar favorito';
      setError(message);
      throw err;
    }
  };

  const toggleFavorite = async (professionalProfileId: string) => {
    if (isFavorite(professionalProfileId)) {
      await removeFavorite(professionalProfileId);
    } else {
      await addFavorite(professionalProfileId);
    }
  };

  const isFavorite = (professionalProfileId: string): boolean => {
    return favorites.includes(professionalProfileId);
  };

  const refetch = async () => {
    if (currentClientId) {
      await fetchFavorites(currentClientId);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteProfessionals,
        loading,
        error,
        fetchFavorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        refetch,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

