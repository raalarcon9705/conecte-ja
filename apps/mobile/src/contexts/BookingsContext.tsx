import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import type { Database } from '@conecteja/types';

// Type aliases from database
type Booking = Database['public']['Tables']['bookings']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfessionalProfile = Database['public']['Tables']['professional_profiles']['Row'];

export interface BookingWithDetails extends Booking {
  client_profile: Profile;
  professional_profile: ProfessionalProfile & {
    profiles: Profile;
  };
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'canceled' | 'no_show';

interface BookingsContextType {
  bookings: BookingWithDetails[];
  currentBooking: BookingWithDetails | null;
  loading: boolean;
  error: string | null;
  fetchBookings: (profileId: string, userType: 'client' | 'professional') => Promise<void>;
  fetchBookingById: (bookingId: string) => Promise<BookingWithDetails | null>;
  createBooking: (bookingData: {
    professionalProfileId: string;
    bookingDate: string;
    startTime: string;
    serviceName: string;
    serviceDescription?: string;
    price?: number;
    locationAddress?: string;
    clientNotes?: string;
    durationMinutes?: number;
  }) => Promise<Booking | null>;
  updateBookingStatus: (bookingId: string, status: BookingStatus, notes?: string) => Promise<void>;
  cancelBooking: (bookingId: string, reason: string) => Promise<void>;
  confirmBooking: (bookingId: string) => Promise<void>;
  completeBooking: (bookingId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

export const BookingsProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [currentBooking, setCurrentBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchParams, setLastFetchParams] = useState<{ profileId: string; userType: 'client' | 'professional' } | null>(null);
  const supabase = useSupabase();

  const fetchBookings = useCallback(async (profileId: string, userType: 'client' | 'professional') => {
    try {
      setLoading(true);
      setError(null);
      setLastFetchParams({ profileId, userType });

      const column = userType === 'client' ? 'client_profile_id' : 'professional_profile_id';

      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          client_profile:client_profile_id (
            id,
            full_name,
            avatar_url,
            phone,
            address,
            city,
            state
          ),
          professional_profile:professional_profile_id (
            id,
            business_name,
            tagline,
            profiles:profile_id (
              id,
              full_name,
              avatar_url,
              phone,
              city,
              state
            )
          )
        `)
        .eq(column, profileId)
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (fetchError) throw fetchError;

      setBookings(data as unknown as BookingWithDetails[] || []);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchBookingById = useCallback(async (bookingId: string): Promise<BookingWithDetails | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          client_profile:client_profile_id (
            id,
            full_name,
            avatar_url,
            phone,
            address,
            city,
            state
          ),
          professional_profile:professional_profile_id (
            id,
            business_name,
            tagline,
            profiles:profile_id (
              id,
              full_name,
              avatar_url,
              phone,
              city,
              state
            )
          )
        `)
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;

      const booking = data as unknown as BookingWithDetails;
      setCurrentBooking(booking);
      return booking;
    } catch (err: any) {
      console.error('Error fetching booking:', err);
      setError(err.message || 'Error al cargar reserva');
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const createBooking = useCallback(async (bookingData: {
    professionalProfileId: string;
    bookingDate: string;
    startTime: string;
    serviceName: string;
    serviceDescription?: string;
    price?: number;
    locationAddress?: string;
    clientNotes?: string;
    durationMinutes?: number;
  }): Promise<Booking | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error: createError } = await supabase
        .from('bookings')
        .insert({
          client_profile_id: user.id,
          professional_profile_id: bookingData.professionalProfileId,
          booking_date: bookingData.bookingDate,
          start_time: bookingData.startTime,
          service_name: bookingData.serviceName,
          service_description: bookingData.serviceDescription,
          price: bookingData.price,
          location_address: bookingData.locationAddress,
          client_notes: bookingData.clientNotes,
          duration_minutes: bookingData.durationMinutes,
          status: 'pending',
        })
        .select()
        .single();

      if (createError) throw createError;

      // Refetch bookings to update list
      if (lastFetchParams) {
        await fetchBookings(lastFetchParams.profileId, lastFetchParams.userType);
      }

      return data as Booking;
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Error al crear reserva');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [supabase, lastFetchParams, fetchBookings]);

  const updateBookingStatus = useCallback(async (bookingId: string, status: BookingStatus, notes?: string) => {
    try {
      setError(null);

      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (status === 'canceled') {
        updateData.canceled_at = new Date().toISOString();
        if (notes) {
          updateData.cancellation_reason = notes;
        }
      }

      const { error: updateError } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status, ...updateData }
            : booking
        )
      );

      if (currentBooking?.id === bookingId) {
        setCurrentBooking((prev) =>
          prev ? { ...prev, status, ...updateData } : null
        );
      }
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      setError(err.message || 'Error al actualizar reserva');
      throw err;
    }
  }, [supabase, currentBooking]);

  const cancelBooking = useCallback(async (bookingId: string, reason: string) => {
    await updateBookingStatus(bookingId, 'canceled', reason);
  }, [updateBookingStatus]);

  const confirmBooking = useCallback(async (bookingId: string) => {
    await updateBookingStatus(bookingId, 'confirmed');
  }, [updateBookingStatus]);

  const completeBooking = useCallback(async (bookingId: string) => {
    await updateBookingStatus(bookingId, 'completed');
  }, [updateBookingStatus]);

  const refetch = useCallback(async () => {
    if (lastFetchParams) {
      await fetchBookings(lastFetchParams.profileId, lastFetchParams.userType);
    }
  }, [lastFetchParams, fetchBookings]);

  return (
    <BookingsContext.Provider
      value={{
        bookings,
        currentBooking,
        loading,
        error,
        fetchBookings,
        fetchBookingById,
        createBooking,
        updateBookingStatus,
        cancelBooking,
        confirmBooking,
        completeBooking,
        refetch,
      }}
    >
      {children}
    </BookingsContext.Provider>
  );
};

export const useBookings = () => {
  const context = useContext(BookingsContext);
  if (context === undefined) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return context;
};

