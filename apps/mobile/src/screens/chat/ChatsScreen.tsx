/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
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

const conversations = [
  {
    id: '1',
    name: 'Juan Pérez',
    lastMessage: 'Perfecto, nos vemos mañana a las 10am',
    timestamp: 'Hace 5 min',
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: '2',
    name: 'María García',
    lastMessage: '¿Cuál es el costo del servicio?',
    timestamp: 'Hace 1 hora',
    unreadCount: 2,
    isOnline: false,
  },
  {
    id: '3',
    name: 'Carlos López',
    lastMessage: 'Gracias por tu ayuda',
    timestamp: 'Ayer',
    unreadCount: 0,
    isOnline: false,
  },
];

export default function ChatsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: t('chats.tabs.all'), badge: 3 },
    { id: 'unread', label: t('chats.tabs.unread'), badge: 2 },
  ];

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Empty
          icon={<Text className="text-6xl">💬</Text>}
          title={t('chats.empty.title')}
          description={t('chats.empty.description')}
        />
      ) : (
        <ScrollView className="flex-1">
          {filteredConversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              {...conversation}
              onPress={() =>
                navigation.navigate('ChatDetail', { id: conversation.id })
              }
            />
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

