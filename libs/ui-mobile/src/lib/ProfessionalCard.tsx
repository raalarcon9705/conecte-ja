/** @jsxImportSource nativewind */
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Check, Heart, MapPin } from 'lucide-react-native';
import { Avatar } from './Avatar';
import { Rating } from './Rating';
import { Badge } from './Badge';

export interface ProfessionalCardProps {
  id: string;
  name: string;
  category: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  distance?: number;
  isPremium?: boolean;
  isVerified?: boolean;
  price?: string;
  description?: string;
  onPress?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export function ProfessionalCard({
  name,
  category,
  avatar,
  rating,
  reviewCount,
  distance,
  isPremium = false,
  isVerified = false,
  price,
  description,
  onPress,
  onFavorite,
  isFavorite = false,
}: ProfessionalCardProps) {
  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 active:opacity-70"
      onPress={onPress}
    >
      <View className="flex-row">
        <Avatar
          source={avatar ? { uri: avatar } : undefined}
          name={name}
          size="lg"
          badge={
            isVerified ? (
              <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center border-2 border-white">
                <Check size={12} color="#ffffff" strokeWidth={3} />
              </View>
            ) : undefined
          }
        />
        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-bold text-gray-900 flex-1" numberOfLines={1}>
              {name}
            </Text>
            <TouchableOpacity onPress={onFavorite} className="p-1">
              <Heart 
                size={24} 
                color={isFavorite ? '#ef4444' : '#9ca3af'} 
                fill={isFavorite ? '#ef4444' : 'none'}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row items-center flex-wrap mb-2">
            <Text className="text-sm text-gray-600 mr-2">{category}</Text>
            {isPremium && (
              <Badge variant="warning" size="sm">Premium</Badge>
            )}
          </View>

          <View className="flex-row items-center mb-2">
            <Rating value={rating} size="sm" readonly showValue />
            <Text className="text-xs text-gray-500 ml-1">({reviewCount})</Text>
          </View>

          {description && (
            <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
              {description}
            </Text>
          )}

          <View className="flex-row items-center justify-between">
            {distance !== undefined && (
              <View className="flex-row items-center">
                <MapPin size={14} color="#6b7280" />
                <Text className="text-sm text-gray-500 ml-1">{distance.toFixed(1)} km</Text>
              </View>
            )}
            {price && (
              <Text className="text-base font-bold text-blue-600">{price}</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default ProfessionalCard;

