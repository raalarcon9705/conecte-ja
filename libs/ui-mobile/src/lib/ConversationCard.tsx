/** @jsxImportSource nativewind */
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Avatar } from './Avatar';

export interface ConversationCardProps {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline?: boolean;
  onPress?: () => void;
}

export function ConversationCard({
  name,
  avatar,
  lastMessage,
  timestamp,
  unreadCount = 0,
  isOnline = false,
  onPress,
}: ConversationCardProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center bg-white p-4 border-b border-gray-100 active:bg-gray-50"
      onPress={onPress}
    >
      <Avatar
        source={avatar ? { uri: avatar } : undefined}
        name={name}
        size="md"
        badge={
          isOnline ? (
            <View className="w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          ) : undefined
        }
      />
      
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="font-semibold text-gray-900 flex-1" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-xs text-gray-500">{timestamp}</Text>
        </View>
        
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-sm flex-1 ${
              unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
            }`}
            numberOfLines={1}
          >
            {lastMessage}
          </Text>
          {unreadCount > 0 && (
            <View className="w-5 h-5 bg-blue-500 rounded-full items-center justify-center ml-2">
              <Text className="text-white text-xs font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default ConversationCard;

