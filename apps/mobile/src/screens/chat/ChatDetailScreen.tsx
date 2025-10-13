/** @jsxImportSource nativewind */
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, MoreVertical, Paperclip, Send } from 'lucide-react-native';
import {
  Screen,
  Text,
  Avatar,
  ChatBubble,
  Input,
  Button,
  Container,
} from '@conecteja/ui-mobile';
import { useChats } from '../../contexts/ChatsContext';
import { useAuth } from '../../contexts/AuthContext';

export default function ChatDetailScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const { 
    conversationId, 
    clientId, 
    professionalId,
    professionalName,
    professionalAvatar 
  } = route?.params || {};
  
  const { user, currentMode } = useAuth();
  const {
    currentConversation,
    messages,
    loading,
    fetchConversationById,
    fetchMessages,
    sendMessage,
    setPendingConversation,
  } = useChats();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  // Validate that the conversation matches the current mode
  const isClientConversation = user?.id === currentConversation?.client_profile_id;
  const isValidConversation = currentMode === 'client' 
    ? isClientConversation 
    : !isClientConversation;

  // Check if this is a pending conversation (no conversationId yet)
  const isPendingConversation = !conversationId && clientId && professionalId;

  useEffect(() => {
    if (conversationId) {
      // Existing conversation - fetch it
      fetchConversationById(conversationId);
      fetchMessages(conversationId);
    } else if (isPendingConversation) {
      // Pending conversation - set it up for display
      setPendingConversation(clientId, professionalId, professionalName, professionalAvatar);
    }
  }, [conversationId, isPendingConversation, clientId, professionalId]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      setSending(true);
      
      if (isPendingConversation) {
        // Create conversation with first message
        const newConversationId = await sendMessage(
          null, 
          messageText.trim(),
          'text',
          { clientId, professionalId }
        );
        
        // Update route params with the new conversationId to avoid recreating
        if (newConversationId) {
          navigation.setParams({ 
            conversationId: newConversationId,
            clientId: undefined,
            professionalId: undefined,
            professionalName: undefined,
            professionalAvatar: undefined,
          });
        }
      } else if (conversationId) {
        // Existing conversation
        await sendMessage(conversationId, messageText.trim());
      }
      
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading && !currentConversation) {
    return (
      <Screen className="bg-gray-50" contentContainerClassName="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </Screen>
    );
  }

  if (!currentConversation || (!isValidConversation && !isPendingConversation)) {
    return (
      <Screen className="bg-gray-50" contentContainerClassName="flex-1 items-center justify-center">
        <Text variant="body" color="muted">
          {t('chats.empty.title')}
        </Text>
      </Screen>
    );
  }

  // Determine the other user in the conversation
  const otherProfile = user?.id === currentConversation.client_profile_id
    ? currentConversation.professional_profile
    : currentConversation.client_profile;

  const isOnline = otherProfile?.last_seen_at
    ? new Date().getTime() - new Date(otherProfile.last_seen_at).getTime() < 5 * 60 * 1000 // 5 minutes
    : false;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <ChevronLeft size={28} color="#374151" />
          </TouchableOpacity>
          <Avatar name={otherProfile?.full_name || ''} size="sm" uri={otherProfile?.avatar_url} />
          <View className="flex-1 ml-3">
            <Text variant="body" weight="bold">
              {otherProfile?.full_name || t('professional.defaults.name')}
            </Text>
            <Text variant="caption" color="muted">
              {isOnline ? t('chats.detail.online') : ''}
            </Text>
          </View>
          <TouchableOpacity>
            <MoreVertical size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {isPendingConversation && messages.length === 0 ? (
            <View className="py-20 items-center justify-center">
              <Text variant="body" color="muted" align="center" className="mb-2">
                {t('chats.detail.startConversation')}
              </Text>
              <Text variant="caption" color="muted" align="center">
                {t('chats.detail.firstMessageHint')}
              </Text>
            </View>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_profile_id === user?.id;
              const timestamp = message.created_at 
                ? new Date(message.created_at).toLocaleTimeString('es', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              return (
                <ChatBubble
                  key={message.id}
                  message={message.content || ''}
                  isOwn={isOwn}
                  timestamp={timestamp}
                  isRead={message.is_read || false}
                  imageUri={message.attachment_url || undefined}
                />
              );
            })
          )}
        </ScrollView>

        <View className="bg-white border-t border-gray-200 px-4 py-3">
          <View className="flex-row items-center">
            <Input
              value={messageText}
              onChangeText={setMessageText}
              placeholder={t('chats.detail.placeholder')}
              containerClassName="flex-1 mb-0"
              rightIcon={
                <TouchableOpacity>
                  <Paperclip size={20} color="#6B7280" />
                </TouchableOpacity>
              }
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              className="ml-2 w-12 h-12 bg-blue-500 rounded-full items-center justify-center"
              disabled={!messageText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Send size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

