/** @jsxImportSource nativewind */
import React from 'react';
import { View, Text, Image } from 'react-native';

export interface ChatBubbleProps {
  message: string;
  isOwn: boolean;
  timestamp: string;
  isRead?: boolean;
  imageUri?: string;
  status?: 'sending' | 'sent' | 'error';
}

export function ChatBubble({
  message,
  isOwn,
  timestamp,
  isRead = false,
  imageUri,
  status = 'sent',
}: ChatBubbleProps) {
  return (
    <View className={`flex-row mb-3 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <View
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isOwn ? 'bg-blue-500 rounded-br-sm' : 'bg-gray-200 rounded-bl-sm'
        }`}
      >
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            className="w-48 h-48 rounded-lg mb-2"
            resizeMode="cover"
          />
        )}
        <Text className={`text-base ${isOwn ? 'text-white' : 'text-gray-900'}`}>
          {message}
        </Text>
        <View className="flex-row items-center justify-end mt-1">
          <Text
            className={`text-xs ${
              isOwn ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {timestamp}
          </Text>
          {isOwn && (
            <Text className="text-xs text-blue-100 ml-1">
              {status === 'sending' ? '🕐' : status === 'error' ? '⚠️' : isRead ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

export default ChatBubble;

