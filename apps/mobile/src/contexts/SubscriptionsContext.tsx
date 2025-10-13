import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import type { Database } from '@conecteja/types';

// Type aliases from database
type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row'];

export interface SubscriptionWithPlan extends Subscription {
  subscription_plan: SubscriptionPlan;
}

export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'past_due';

interface SubscriptionsContextType {
  currentSubscription: SubscriptionWithPlan | null;
  availablePlans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  fetchCurrentSubscription: (profileId: string) => Promise<void>;
  fetchAvailablePlans: () => Promise<void>;
  createSubscription: (planId: string) => Promise<Subscription | null>;
  cancelSubscription: (subscriptionId: string, reason?: string, feedback?: string) => Promise<void>;
  updateSubscriptionPlan: (subscriptionId: string, newPlanId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const SubscriptionsContext = createContext<SubscriptionsContextType | undefined>(undefined);

export const SubscriptionsProvider = ({ children }: { children: ReactNode }) => {
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionWithPlan | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const supabase = useSupabase();

  const fetchCurrentSubscription = async (profileId: string) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentProfileId(profileId);

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_plan:plan_id (*)
        `)
        .eq('profile_id', profileId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      setCurrentSubscription(data as unknown as SubscriptionWithPlan | null);
    } catch (err: any) {
      console.error('Error fetching current subscription:', err);
      setError(err.message || 'Error al cargar suscripción');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;

      setAvailablePlans(data || []);
    } catch (err: any) {
      console.error('Error fetching subscription plans:', err);
      setError(err.message || 'Error al cargar planes de suscripción');
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (planId: string): Promise<Subscription | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Cancel any existing active subscriptions first
      const { data: existingSubscriptions } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('profile_id', user.id)
        .eq('status', 'active');

      if (existingSubscriptions && existingSubscriptions.length > 0) {
        for (const sub of existingSubscriptions) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              canceled_at: new Date().toISOString(),
            })
            .eq('id', sub.id);
        }
      }

      // Get plan details to calculate period
      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (!plan) throw new Error('Plan no encontrado');

      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1); // Default to monthly

      const { data, error: createError } = await supabase
        .from('subscriptions')
        .insert({
          profile_id: user.id,
          plan_id: planId,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          auto_renew: true,
        })
        .select()
        .single();

      if (createError) throw createError;

      // Refetch current subscription
      await fetchCurrentSubscription(user.id);

      return data as Subscription;
    } catch (err: any) {
      console.error('Error creating subscription:', err);
      setError(err.message || 'Error al crear suscripción');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (
    subscriptionId: string,
    reason?: string,
    feedback?: string
  ) => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
          cancellation_reason: reason,
          cancellation_feedback: feedback,
          auto_renew: false,
        })
        .eq('id', subscriptionId);

      if (updateError) throw updateError;

      // Update local state
      if (currentSubscription?.id === subscriptionId) {
        setCurrentSubscription(null);
      }

      // Refetch to ensure consistency
      if (currentProfileId) {
        await fetchCurrentSubscription(currentProfileId);
      }
    } catch (err: any) {
      console.error('Error canceling subscription:', err);
      setError(err.message || 'Error al cancelar suscripción');
      throw err;
    }
  };

  const updateSubscriptionPlan = async (subscriptionId: string, newPlanId: string) => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          plan_id: newPlanId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      if (updateError) throw updateError;

      // Refetch to get updated subscription with plan details
      if (currentProfileId) {
        await fetchCurrentSubscription(currentProfileId);
      }
    } catch (err: any) {
      console.error('Error updating subscription plan:', err);
      setError(err.message || 'Error al actualizar plan de suscripción');
      throw err;
    }
  };

  const refetch = async () => {
    if (currentProfileId) {
      await fetchCurrentSubscription(currentProfileId);
    }
    await fetchAvailablePlans();
  };

  // Load available plans on mount
  useEffect(() => {
    fetchAvailablePlans();
  }, []);

  return (
    <SubscriptionsContext.Provider
      value={{
        currentSubscription,
        availablePlans,
        loading,
        error,
        fetchCurrentSubscription,
        fetchAvailablePlans,
        createSubscription,
        cancelSubscription,
        updateSubscriptionPlan,
        refetch,
      }}
    >
      {children}
    </SubscriptionsContext.Provider>
  );
};

export const useSubscriptions = () => {
  const context = useContext(SubscriptionsContext);
  if (context === undefined) {
    throw new Error('useSubscriptions must be used within a SubscriptionsProvider');
  }
  return context;
};

