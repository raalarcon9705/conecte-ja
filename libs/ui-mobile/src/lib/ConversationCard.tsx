/** @jsxImportSource nativewind */
import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
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
  // Job posting props
  jobTitle?: string;
  jobImage?: string;
  jobPrice?: string;
  jobStatus?: 'open' | 'in_progress' | 'completed' | 'canceled' | 'expired' | null;
  onJobPress?: () => void;
}

export function ConversationCard({
  name,
  avatar,
  lastMessage,
  timestamp,
  unreadCount = 0,
  isOnline = false,
  onPress,
  jobTitle,
  jobImage,
  jobPrice,
  jobStatus,
  onJobPress,
}: ConversationCardProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center bg-white p-4 border-b border-gray-100 active:bg-gray-50"
      onPress={onPress}
    >
      {/* Job Image (left side) */}
      <View className="relative mr-3">
        {onJobPress ? (
          <TouchableOpacity
            onPress={onJobPress}
            className="w-16 h-16 bg-gray-200 rounded-lg items-center justify-center overflow-hidden active:bg-gray-300"
          >
            {jobImage ? (
              <Image
                source={{ uri: jobImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-gray-500 text-lg font-semibold">
                {jobTitle ? jobTitle.charAt(0).toUpperCase() : '?'}
              </Text>
            )}
          </TouchableOpacity>
        ) : (
          <View className="w-16 h-16 bg-gray-200 rounded-lg items-center justify-center overflow-hidden">
            {jobImage ? (
              <Image
                source={{ uri: jobImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-gray-500 text-lg font-semibold">
                {jobTitle ? jobTitle.charAt(0).toUpperCase() : '?'}
              </Text>
            )}
          </View>
        )}

        {/* User avatar overlay on bottom right */}
        <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-white items-center justify-center">
          <Avatar
            source={avatar ? { uri: avatar } : undefined}
            name={name}
            size="xs"
          />
        </View>
      </View>

      {/* Conversation details (right side) */}
      <View className="flex-1">
        {/* Job title and timestamp */}
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-sm text-gray-500 flex-1" numberOfLines={1}>
            {jobTitle || 'Trabajo'}
          </Text>
          <Text className="text-xs text-gray-500">{timestamp}</Text>
        </View>

        {/* User name */}
        <Text className="font-semibold text-gray-900 text-base mb-1" numberOfLines={1}>
          {name}
        </Text>

        {/* Last message and unread count */}
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

        {/* Online indicator */}
        {isOnline && (
          <View className="flex-row items-center mt-1">
            <View className="w-2 h-2 bg-green-500 rounded-full mr-1" />
            <Text className="text-xs text-gray-500">En línea</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default ConversationCard;

