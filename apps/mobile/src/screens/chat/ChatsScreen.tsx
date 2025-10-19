/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react-native';
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
import { ChatsScreenProps } from '../../types/navigation';

export default function ChatsScreen({ navigation }: ChatsScreenProps) {
  const { t } = useTranslation();
  const { user, currentMode } = useAuth();
  const { conversations, loading, fetchConversations } = useChats();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (user?.id) {
      setRefreshing(true);
      await fetchConversations(user.id);
      setRefreshing(false);
    }
  };

  const filteredConversations = conversations
    .filter((conv) => {
      // Check if user is part of this conversation
      const isParticipant = 
        user?.id === conv.client_profile_id || 
        user?.id === conv.professional_profile_id;
      
      if (!isParticipant) {
        return false;
      }

      // Determine if this is a client or professional conversation for the user
      const isClientConversation = user?.id === conv.client_profile_id;
      
      // Get the other user's profile
      const otherProfile = isClientConversation
        ? conv.professional_profile
        : conv.client_profile;
      
      // Check if profiles are loaded
      if (!otherProfile) {
        return false;
      }
      
      // Search filter
      if (searchQuery && otherProfile?.full_name) {
        return otherProfile.full_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }
      
      return true;
    })
    .filter((conv) => {
      // Unread filter
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
    { id: 'all', label: t('chats.tabs.all'), badge: filteredConversations.length },
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
            icon={<MessageCircle size={80} color="#3B82F6" />}
            title={t('chats.empty.title')}
            description={t('chats.empty.description')}
            action={{
              label: currentMode === 'client' 
                ? t('chats.empty.actionClient', 'Buscar Profesionales')
                : t('chats.empty.actionProfessional', 'Ver Trabajos Disponibles'),
              onPress: () => {
                if (currentMode === 'client') {
                  navigation.navigate('Search');
                } else {
                  navigation.navigate('JobsList');
                }
              },
              variant: 'primary',
            }}
            secondary={{
              label: t('navigation.home'),
              onPress: () => navigation.navigate('Home'),
            }}
          />
        </View>
      ) : (
        <ScrollView 
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#3B82F6"
              colors={['#3B82F6']}
            />
          }
        >
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

            // Format timestamp with time
            const formatTimestamp = (dateString: string | null) => {
              if (!dateString) return '';
              
              const messageDate = new Date(dateString);
              const now = new Date();
              const diffInMs = now.getTime() - messageDate.getTime();
              const diffInMinutes = Math.floor(diffInMs / 60000);
              const diffInHours = Math.floor(diffInMs / 3600000);
              const diffInDays = Math.floor(diffInMs / 86400000);

              // Less than 1 minute ago
              if (diffInMinutes < 1) {
                return 'Ahora';
              }
              
              // Less than 1 hour ago
              if (diffInMinutes < 60) {
                return `Hace ${diffInMinutes} min`;
              }
              
              // Less than 24 hours ago - show time
              if (diffInHours < 24) {
                return messageDate.toLocaleTimeString('es', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
              }
              
              // Yesterday
              const isYesterday = diffInDays === 1;
              if (isYesterday) {
                return 'Ayer';
              }
              
              // Less than 7 days ago - show day of week
              if (diffInDays < 7) {
                return messageDate.toLocaleDateString('es', {
                  weekday: 'short',
                });
              }
              
              // More than 7 days - show date
              return messageDate.toLocaleDateString('es', {
                day: 'numeric',
                month: 'short',
              });
            };

            const timestamp = formatTimestamp(conversation.last_message_at);

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

