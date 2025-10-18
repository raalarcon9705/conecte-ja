import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useSupabase } from '../hooks/useSupabase';
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
  fetchConversations: (profileId: string) => Promise<void>;
  fetchConversationById: (conversationId: string) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string | null, content: string, messageType?: string, pendingConversation?: { clientId: string; professionalId: string }) => Promise<string | null>;
  markMessageAsRead: (messageId: string) => Promise<void>;
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
  const [, setPendingConversationData] = useState<{
    clientId: string;
    professionalId: string;
    professionalName?: string;
    professionalAvatar?: string;
  } | null>(null);
  const supabase = useSupabase();

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
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError(err.message || 'Error al cargar conversaciones');
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
    } catch (err: any) {
      console.error('Error fetching conversation:', err);
      setError(err.message || 'Error al cargar conversación');
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
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message || 'Error al cargar mensajes');
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
    } catch (err: any) {
      console.error('Error creating conversation:', err);
      setError(err.message || 'Error al crear conversación');
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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

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
      if (user) {
        await fetchConversations(user.id);
      }

      return actualConversationId;
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Error al enviar mensaje');
      throw err;
    }
  }, [supabase, createOrGetConversation, fetchConversationById, fetchConversations]);

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
    } catch (err: any) {
      console.error('Error marking message as read:', err);
    }
  }, [supabase]);

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
      client_profile: null as any,
      professional_profile: {
        id: professionalId,
        full_name: professionalName || 'Profesional',
        avatar_url: professionalAvatar || null,
        last_seen_at: null,
      } as any,
    } as ConversationWithProfiles);
    
    setMessages([]);
  }, []);

  // Subscribe to new messages in current conversation
  useEffect(() => {
    if (!currentConversation || currentConversation.id === 'pending') return;

    const channel = supabase
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

          if (data) {
            setMessages((prev) => [...prev, data as unknown as MessageWithSender]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentConversation, supabase]);

  return (
    <ChatsContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        loading,
        error,
        fetchConversations,
        fetchConversationById,
        fetchMessages,
        sendMessage,
        markMessageAsRead,
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

