/** @jsxImportSource nativewind */
import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Avatar } from './Avatar';
import { Rating } from './Rating';

export interface ReviewCardProps {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  response?: {
    text: string;
    date: string;
  };
}

export function ReviewCard({
  userName,
  userAvatar,
  rating,
  comment,
  date,
  response,
}: ReviewCardProps) {
  const { t } = useTranslation();
  
  return (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100">
      <View className="flex-row items-start mb-3">
        <Avatar
          source={userAvatar ? { uri: userAvatar } : undefined}
          name={userName}
          size="sm"
        />
        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="font-semibold text-gray-900">{userName}</Text>
            <Text className="text-xs text-gray-500">{date}</Text>
          </View>
          <Rating value={rating} size="sm" readonly />
        </View>
      </View>
      
      <Text className="text-sm text-gray-700 leading-5">{comment}</Text>
      
      {response && (
        <View className="mt-3 ml-4 pl-4 border-l-2 border-gray-200">
          <Text className="text-xs font-semibold text-blue-600 mb-1">
            {t('professional.reviewResponse')}
          </Text>
          <Text className="text-sm text-gray-700">{response.text}</Text>
          <Text className="text-xs text-gray-500 mt-1">{response.date}</Text>
        </View>
      )}
    </View>
  );
}

export default ReviewCard;

