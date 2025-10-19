import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { useAuth } from './AuthContext';
import type { Database } from '@conecteja/types';

// Type aliases from database
type Conversation = Database['public']['Tables']['conversations']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export interface ConversationWithProfiles extends Conversation {
  client_profile: Profile;
  professional_profile: Profile;
}

export interface MessageWithSender extends Message {
  sender: Profile;
}

interface ChatsContextType {
  conversations: ConversationWithProfiles[];
  currentConversation: ConversationWithProfiles | null;
  messages: MessageWithSender[];
  loading: boolean;
  error: string | null;
  totalUnreadCount: number;
  fetchConversations: (profileId: string) => Promise<void>;
  fetchConversationById: (conversationId: string) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string | null, content: string, messageType?: string, pendingConversation?: { clientId: string; professionalId: string }) => Promise<string | null>;
  markMessageAsRead: (messageId: string) => Promise<void>;
  markConversationMessagesAsRead: (conversationId: string) => Promise<void>;
  createOrGetConversation: (clientId: string, professionalId: string) => Promise<string | null>;
  setPendingConversation: (clientId: string, professionalId: string, professionalName?: string, professionalAvatar?: string) => void;
}

const ChatsContext = createContext<ChatsContextType | undefined>(undefined);

export const ChatsProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<ConversationWithProfiles[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ConversationWithProfiles | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const [, setPendingConversationData] = useState<{
    clientId: string;
    professionalId: string;
    professionalName?: string;
    professionalAvatar?: string;
  } | null>(null);
  const supabase = useSupabase();
  const { user } = useAuth();

  // Load conversations automatically when user authenticates
  // (Auth is already initialized by the time this runs)
  useEffect(() => {
    if (user?.id) {
      fetchConversations(user.id);
    } else {
      // Clear conversations when user logs out
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Calculate total unread count whenever conversations change
  useEffect(() => {
    if (!user?.id) {
      setTotalUnreadCount(0);
      return;
    }

    const total = conversations.reduce((acc, conv) => {
      const unread = user.id === conv.client_profile_id
        ? conv.unread_count_client
        : conv.unread_count_professional;
      return acc + (unread || 0);
    }, 0);

    setTotalUnreadCount(total);
  }, [conversations, user?.id]);

  const fetchConversations = useCallback(async (profileId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select(`
          *,
          client_profile:client_profile_id (
            id,
            full_name,
            avatar_url,
            last_seen_at
          ),
          professional_profile:professional_profile_id (
            id,
            full_name,
            avatar_url,
            last_seen_at
          )
        `)
        .or(`client_profile_id.eq.${profileId},professional_profile_id.eq.${profileId}`)
        .order('last_message_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching conversations:', fetchError);
        throw fetchError;
      }

      setConversations(data as unknown as ConversationWithProfiles[] || []);
    } catch (err: unknown) {
      console.error('Error fetching conversations:', err);
      const message = err instanceof Error ? err.message : 'Error al cargar conversaciones';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchConversationById = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select(`
          *,
          client_profile:client_profile_id (
            id,
            full_name,
            avatar_url,
            last_seen_at
          ),
          professional_profile:professional_profile_id (
            id,
            full_name,
            avatar_url,
            last_seen_at
          )
        `)
        .eq('id', conversationId)
        .single();

      if (fetchError) {
        console.error('Error fetching conversation:', fetchError);
        throw fetchError;
      }

      setCurrentConversation(data as unknown as ConversationWithProfiles);
    } catch (err: unknown) {
      console.error('Error fetching conversation:', err);
      const message = err instanceof Error ? err.message : 'Error al cargar conversación';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_profile_id,
          message_type,
          content,
          attachment_url,
          attachment_type,
          latitude,
          longitude,
          is_read,
          read_at,
          created_at,
          is_flagged,
          flagged_reason,
          moderated_at,
          sender:sender_profile_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setMessages(data as unknown as MessageWithSender[] || []);

      // Don't auto-mark as read - let the user scroll to bottom first
    } catch (err: unknown) {
      console.error('Error fetching messages:', err);
      const message = err instanceof Error ? err.message : 'Error al cargar mensajes';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const createOrGetConversation = useCallback(async (
    clientId: string,
    professionalId: string
  ): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_profile_id', clientId)
        .eq('professional_profile_id', professionalId)
        .maybeSingle();

      if (existingConversation) {
        return existingConversation.id;
      }

      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          client_profile_id: clientId,
          professional_profile_id: professionalId,
        })
        .select('id')
        .single();

      if (createError) throw createError;

      return newConversation.id;
    } catch (err: unknown) {
      console.error('Error creating conversation:', err);
      const message = err instanceof Error ? err.message : 'Error al crear conversación';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const sendMessage = useCallback(async (
    conversationId: string | null,
    content: string,
    messageType = 'text',
    pendingConversation?: { clientId: string; professionalId: string }
  ): Promise<string | null> => {
    try {
      setError(null);

      if (!user?.id) throw new Error('Usuario no autenticado');

      let actualConversationId = conversationId;

      // If no conversationId, create the conversation first
      if (!actualConversationId && pendingConversation) {
        actualConversationId = await createOrGetConversation(
          pendingConversation.clientId,
          pendingConversation.professionalId
        );

        if (!actualConversationId) {
          throw new Error('No se pudo crear la conversación');
        }

        // Fetch the newly created conversation
        await fetchConversationById(actualConversationId);
      }

      if (!actualConversationId) {
        throw new Error('No se pudo determinar la conversación');
      }

      const { data, error: sendError } = await supabase
        .from('messages')
        .insert({
          conversation_id: actualConversationId,
          sender_profile_id: user.id,
          content,
          message_type: messageType,
        })
        .select(`
          id,
          conversation_id,
          sender_profile_id,
          message_type,
          content,
          attachment_url,
          attachment_type,
          latitude,
          longitude,
          is_read,
          read_at,
          created_at,
          is_flagged,
          flagged_reason,
          moderated_at,
          sender:sender_profile_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (sendError) throw sendError;

      // Add message to local state
      setMessages((prev) => [...prev, data as unknown as MessageWithSender]);

      // Update conversation last_message
      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: content.substring(0, 100),
        })
        .eq('id', actualConversationId);

      // Clear pending conversation data
      setPendingConversationData(null);

      // Refresh conversations list to include the new conversation
      if (user?.id) {
        await fetchConversations(user.id);
      }

      return actualConversationId;
    } catch (err: unknown) {
      console.error('Error sending message:', err);
      const message = err instanceof Error ? err.message : 'Error al enviar mensaje';
      setError(message);
      throw err;
    }
  }, [user, supabase, createOrGetConversation, fetchConversationById, fetchConversations]);

  const markMessageAsRead = useCallback(async (messageId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      if (updateError) throw updateError;

      // Update local state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, is_read: true, read_at: new Date().toISOString() }
            : msg
        )
      );
    } catch (err: unknown) {
      console.error('Error marking message as read:', err);
    }
  }, [supabase]);

  const markConversationMessagesAsRead = useCallback(async (conversationId: string) => {
    if (!user?.id) return;
    
    try {
      await supabase.rpc('mark_conversation_messages_as_read', {
        p_conversation_id: conversationId,
        p_reader_profile_id: user.id
      });

      // Update local state - mark all messages from other users as read
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender_profile_id !== user.id
            ? { ...msg, is_read: true, read_at: new Date().toISOString() }
            : msg
        )
      );

      // Refresh conversations to update unread counts
      await fetchConversations(user.id);
    } catch (err: unknown) {
      console.error('Error marking conversation messages as read:', err);
    }
  }, [supabase, user?.id, fetchConversations]);

  const setPendingConversation = useCallback((
    clientId: string,
    professionalId: string,
    professionalName?: string,
    professionalAvatar?: string
  ) => {
    setPendingConversationData({
      clientId,
      professionalId,
      professionalName,
      professionalAvatar,
    });
    
    // Create a mock conversation for display purposes
    setCurrentConversation({
      id: 'pending',
      client_profile_id: clientId,
      professional_profile_id: professionalId,
      last_message_at: new Date().toISOString(),
      last_message_preview: null,
      unread_count_client: 0,
      unread_count_professional: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      client_profile: null as unknown as Profile,
      professional_profile: {
        id: professionalId,
        full_name: professionalName || 'Profesional',
        avatar_url: professionalAvatar || null,
        last_seen_at: null,
      } as unknown as Profile,
    } as ConversationWithProfiles);
    
    setMessages([]);
  }, []);

  // Subscribe to conversations updates and new messages for the current user
  useEffect(() => {
    if (!user?.id) return;

    const globalChannel = supabase
      .channel('user-global-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'conversations',
          filter: `client_profile_id=eq.${user.id}`,
        },
        async (payload) => {
          // Refresh conversations list
          if (user?.id) {
            await fetchConversations(user.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `professional_profile_id=eq.${user.id}`,
        },
        async (payload) => {
          // Refresh conversations list
          if (user?.id) {
            await fetchConversations(user.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          // Check if this message is for a conversation the user is part of
          const messageConversationId = payload.new.conversation_id;
          const isForUser = conversations.some(conv => conv.id === messageConversationId);
          
          if (isForUser && payload.new.sender_profile_id !== user.id) {            
            // Refresh conversations to update counters and preview
            await fetchConversations(user.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [user?.id, supabase, fetchConversations, conversations]);

  // Subscribe to new messages in current conversation
  useEffect(() => {
    if (!currentConversation || currentConversation.id === 'pending') return;

    const messagesChannel = supabase
      .channel(`messages:${currentConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${currentConversation.id}`,
        },
        async (payload) => {
          // Don't add if it's from the current user (already added optimistically)
          const isOwnMessage = payload.new.sender_profile_id === user?.id;
          
          // Fetch the new message with sender info
          const { data } = await supabase
            .from('messages')
            .select(`
              id,
              conversation_id,
              sender_profile_id,
              message_type,
              content,
              attachment_url,
              attachment_type,
              latitude,
              longitude,
              is_read,
              read_at,
              created_at,
              is_flagged,
              flagged_reason,
              moderated_at,
              sender:sender_profile_id (
                id,
                full_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data && !isOwnMessage) {
            // Check if message already exists (avoid duplicates)
            setMessages((prev) => {
              const exists = prev.some((msg) => msg.id === data.id);
              if (exists) return prev;
              return [...prev, data as unknown as MessageWithSender];
            });

            // Don't auto-mark as read - let ChatDetailScreen handle it based on scroll position
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${currentConversation.id}`,
        },
        async (payload) => {
          // Update the message in local state
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id
                ? { ...msg, ...payload.new }
                : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [currentConversation, user?.id, supabase, markMessageAsRead]);

  return (
    <ChatsContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        loading,
        error,
        totalUnreadCount,
        fetchConversations,
        fetchConversationById,
        fetchMessages,
        sendMessage,
        markMessageAsRead,
        markConversationMessagesAsRead,
        createOrGetConversation,
        setPendingConversation,
      }}
    >
      {children}
    </ChatsContext.Provider>
  );
};

export const useChats = () => {
  const context = useContext(ChatsContext);
  if (context === undefined) {
    throw new Error('useChats must be used within a ChatsProvider');
  }
  return context;
};

