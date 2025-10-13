/** @jsxImportSource nativewind */
import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MessageCircle, ArrowLeft } from 'lucide-react-native';
import {
  Screen,
  Text,
  ConversationCard,
  Container,
  SearchBar,
  Spacer,
  Empty,
  Tabs,
} from '@conecteja/ui-mobile';
import { useChats } from '../../contexts/ChatsContext';
import { useAuth } from '../../contexts/AuthContext';

export default function ChatsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user, currentMode } = useAuth();
  const { conversations, loading, fetchConversations } = useChats();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user?.id) {
      fetchConversations(user.id);
    }
  }, [user?.id, currentMode]); // Refetch when mode changes

  const filteredConversations = conversations
    .filter((conv) => {
      // Filter conversations based on current mode
      // In client mode: show conversations where user is the client
      // In professional mode: show conversations where user is the professional
      const isClientConversation = user?.id === conv.client_profile_id;
      
      if (currentMode === 'client' && !isClientConversation) {
        return false; // Hide professional conversations when in client mode
      }
      if (currentMode === 'professional' && isClientConversation) {
        return false; // Hide client conversations when in professional mode
      }
      
      // Get the other user's profile
      const otherProfile = isClientConversation
        ? conv.professional_profile
        : conv.client_profile;
      
      return otherProfile?.full_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    })
    .filter((conv) => {
      if (activeTab === 'unread') {
        const isClientConversation = user?.id === conv.client_profile_id;
        const unreadCount = isClientConversation
          ? conv.unread_count_client
          : conv.unread_count_professional;
        return unreadCount && unreadCount > 0;
      }
      return true;
    });

  const totalUnread = conversations.reduce((acc, conv) => {
    const unread = user?.id === conv.client_profile_id
      ? conv.unread_count_client
      : conv.unread_count_professional;
    return acc + (unread || 0);
  }, 0);

  const tabs = [
    { id: 'all', label: t('chats.tabs.all'), badge: conversations.length },
    { id: 'unread', label: t('chats.tabs.unread'), badge: totalUnread },
  ];

  if (loading && conversations.length === 0) {
    return (
      <Screen safe className="bg-white">
        <Container className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </Container>
      </Screen>
    );
  }

  return (
    <Screen safe className="bg-white">
      <Container>
        <Text variant="h2" weight="bold" className="mb-6">
          {t('chats.title')}
        </Text>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('chats.searchPlaceholder')}
        />

        <Spacer size="md" />

        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="pills"
        />
      </Container>

      {filteredConversations.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Empty
            icon={<MessageCircle size={64} color="#9CA3AF" />}
            title={t('chats.empty.title')}
            description={t('chats.empty.description')}
            action={{
              label: t('navigation.home'),
              onPress: () => navigation.navigate('Home'),
            }}
          />
        </View>
      ) : (
        <ScrollView className="flex-1">
          {filteredConversations.map((conversation) => {
            const otherProfile = user?.id === conversation.client_profile_id
              ? conversation.professional_profile
              : conversation.client_profile;
            
            const unreadCount = user?.id === conversation.client_profile_id
              ? conversation.unread_count_client
              : conversation.unread_count_professional;

            const isOnline = otherProfile?.last_seen_at
              ? new Date().getTime() - new Date(otherProfile.last_seen_at).getTime() < 5 * 60 * 1000
              : false;

            // Format timestamp
            const timestamp = conversation.last_message_at
              ? new Date(conversation.last_message_at).toLocaleDateString('es', {
                  day: 'numeric',
                  month: 'short',
                })
              : '';

            return (
              <ConversationCard
                key={conversation.id}
                id={conversation.id}
                name={otherProfile?.full_name || t('professional.defaults.name')}
                avatar={otherProfile?.avatar_url || undefined}
                lastMessage={conversation.last_message_preview || ''}
                timestamp={timestamp}
                unreadCount={unreadCount || 0}
                isOnline={isOnline}
                onPress={() =>
                  navigation.navigate('ChatDetail', { conversationId: conversation.id })
                }
              />
            );
          })}
        </ScrollView>
      )}
    </Screen>
  );
}

