/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Screen,
  Text,
  Avatar,
  ChatBubble,
  Input,
  Button,
  Container,
} from '@conecteja/ui-mobile';

const messages = [
  {
    id: '1',
    message: 'Hola, necesito un presupuesto para reparar una tubería',
    isOwn: true,
    timestamp: '10:30',
    isRead: true,
  },
  {
    id: '2',
    message: 'Hola! Con gusto te ayudo. ¿Podrías enviarme fotos del problema?',
    isOwn: false,
    timestamp: '10:32',
  },
  {
    id: '3',
    message: 'Claro, te envío las fotos',
    isOwn: true,
    timestamp: '10:33',
    isRead: true,
  },
  {
    id: '4',
    message: 'Perfecto, con eso puedo darte un presupuesto. El costo estimado sería de $150',
    isOwn: false,
    timestamp: '10:35',
  },
];

export default function ChatDetailScreen({ navigation, route }: any) {
  const { t } = useTranslation();
  const [messageText, setMessageText] = useState('');
  const professionalName = 'Juan Pérez';

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // TODO: Send message logic
      setMessageText('');
    }
  };

  return (
    <Screen safe className="bg-gray-50">
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-2xl mr-3">←</Text>
          </TouchableOpacity>
          <Avatar name={professionalName} size="sm" />
          <View className="flex-1 ml-3">
            <Text variant="body" weight="bold">
              {professionalName}
            </Text>
            <Text variant="caption" color="muted">
              {t('chats.detail.online')}
            </Text>
          </View>
          <TouchableOpacity>
            <Text className="text-2xl">⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={90}
      >
        <ScrollView className="flex-1 px-4 py-4">
          {messages.map((message) => (
            <ChatBubble key={message.id} {...message} />
          ))}
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
                  <Text className="text-2xl">📎</Text>
                </TouchableOpacity>
              }
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              className="ml-2 w-12 h-12 bg-blue-500 rounded-full items-center justify-center"
              disabled={!messageText.trim()}
            >
              <Text className="text-2xl">➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

