import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import type { Database } from '@conecteja/types';

// Type aliases from database
type Notification = Database['public']['Tables']['notifications']['Row'];

export type NotificationType = 'booking' | 'message' | 'review' | 'payment' | 'system';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: (profileId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (profileId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const supabase = useSupabase();

  const fetchNotifications = async (profileId: string) => {
    try {
      setLoading(true);
      setError(null);
      setCurrentProfileId(profileId);

      const { data, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      setNotifications(data || []);
      
      // Calculate unread count
      const unread = data?.filter((notif) => !notif.is_read).length || 0;
      setUnreadCount(unread);
    } catch (err: unknown) {
      console.error('Error fetching notifications:', err);
      const message = err instanceof Error ? err.message : 'Error al cargar notificaciones';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      if (updateError) throw updateError;

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: unknown) {
      console.error('Error marking notification as read:', err);
      const message = err instanceof Error ? err.message : 'Error al marcar notificación como leída';
      setError(message);
      throw err;
    }
  };

  const markAllAsRead = async (profileId: string) => {
    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('profile_id', profileId)
        .eq('is_read', false);

      if (updateError) throw updateError;

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          is_read: true,
          read_at: new Date().toISOString(),
        }))
      );

      setUnreadCount(0);
    } catch (err: unknown) {
      console.error('Error marking all notifications as read:', err);
      const message = err instanceof Error ? err.message : 'Error al marcar todas las notificaciones como leídas';
      setError(message);
      throw err;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      setError(null);

      const notificationToDelete = notifications.find((n) => n.id === notificationId);

      const { error: deleteError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (deleteError) throw deleteError;

      // Update local state
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));

      // Update unread count if the deleted notification was unread
      if (notificationToDelete && !notificationToDelete.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err: unknown) {
      console.error('Error deleting notification:', err);
      const message = err instanceof Error ? err.message : 'Error al eliminar notificación';
      setError(message);
      throw err;
    }
  };

  const refetch = async () => {
    if (currentProfileId) {
      await fetchNotifications(currentProfileId);
    }
  };

  // Subscribe to new notifications
  useEffect(() => {
    if (!currentProfileId) return;

    const channel = supabase
      .channel(`notifications:${currentProfileId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `profile_id=eq.${currentProfileId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications((prev) => [newNotification, ...prev]);
          if (!newNotification.is_read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `profile_id=eq.${currentProfileId}`,
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === updatedNotification.id ? updatedNotification : notif
            )
          );
          
          // Recalculate unread count
          const unread = notifications.filter((n) => 
            n.id === updatedNotification.id ? !updatedNotification.is_read : !n.is_read
          ).length;
          setUnreadCount(unread);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `profile_id=eq.${currentProfileId}`,
        },
        (payload) => {
          const deletedId = payload.old.id;
          setNotifications((prev) => prev.filter((notif) => notif.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfileId, supabase]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refetch,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

