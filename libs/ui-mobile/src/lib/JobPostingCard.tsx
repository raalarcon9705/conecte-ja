/** @jsxImportSource nativewind */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapPin, Calendar, DollarSign, ThumbsUp, ThumbsDown, Clock } from 'lucide-react-native';
import { Avatar } from './Avatar';
import { Badge } from './Badge';

export interface JobPostingCardProps {
  id: string;
  title: string;
  description: string;
  clientName: string;
  clientAvatar?: string;
  category: string;
  location?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetType?: 'hourly' | 'daily' | 'fixed' | 'negotiable';
  startDate?: string;
  isRecurring?: boolean;
  likesCount: number;
  dislikesCount: number;
  applicationsCount: number;
  hasUserLiked?: boolean;
  hasUserDisliked?: boolean;
  hasUserApplied?: boolean;
  createdAt: string;
  onPress?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onApply?: () => void;
  showActions?: boolean;
}

export function JobPostingCard({
  title,
  description,
  clientName,
  clientAvatar,
  category,
  location,
  budgetMin,
  budgetMax,
  budgetType = 'negotiable',
  startDate,
  isRecurring = false,
  likesCount,
  dislikesCount,
  applicationsCount,
  hasUserLiked = false,
  hasUserDisliked = false,
  hasUserApplied = false,
  createdAt,
  onPress,
  onLike,
  onDislike,
  showActions = true,
}: JobPostingCardProps) {
  const getBudgetText = () => {
    if (budgetType === 'negotiable') return 'A negociar';
    if (!budgetMin && !budgetMax) return 'A negociar';

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
      }).format(price);
    };

    if (budgetMin && budgetMax) {
      return `${formatPrice(budgetMin)} - ${formatPrice(budgetMax)}`;
    }
    return formatPrice(budgetMin || budgetMax || 0);
  };

  const getBudgetTypeLabel = () => {
    const labels = {
      hourly: '/hora',
      daily: '/día',
      fixed: 'fijo',
      negotiable: ''
    };
    return labels[budgetType];
  };

  const getTimeAgo = () => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `hace ${diffMins}m`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    return `hace ${diffDays}d`;
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 active:opacity-70"
      onPress={onPress}
    >
      {/* Header */}
      <View className="flex-row items-start mb-3">
        <Avatar
          source={clientAvatar ? { uri: clientAvatar } : undefined}
          name={clientName}
          size="md"
        />
        <View className="flex-1 ml-3">
          <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
            {clientName}
          </Text>
          <View className="flex-row items-center mt-1">
            <Clock size={12} color="#6b7280" />
            <Text className="text-xs text-gray-500 ml-1">{getTimeAgo()}</Text>
          </View>
        </View>
        <Badge variant="info" size="sm">{category}</Badge>
      </View>

      {/* Title */}
      <Text className="text-lg font-bold text-gray-900 mb-2">
        {title}
      </Text>

      {/* Description */}
      <Text className="text-sm text-gray-600 mb-3" numberOfLines={3}>
        {description}
      </Text>

      {/* Job Details */}
      <View className="space-y-2 mb-3">
        {location && (
          <View className="flex-row items-center">
            <MapPin size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-2">{location}</Text>
          </View>
        )}

        {startDate && (
          <View className="flex-row items-center">
            <Calendar size={16} color="#6b7280" />
            <Text className="text-sm text-gray-600 ml-2">
              {new Date(startDate).toLocaleDateString('es-AR')}
              {isRecurring && ' (recurrente)'}
            </Text>
          </View>
        )}

        <View className="flex-row items-center">
          <DollarSign size={16} color="#10b981" />
          <Text className="text-sm font-semibold text-green-600 ml-2">
            {getBudgetText()} {getBudgetTypeLabel()}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <View className="flex-row items-center space-x-4">
          <View className="flex-row items-center">
            <ThumbsUp size={16} color="#10b981" />
            <Text className="text-sm text-gray-600 ml-1">{likesCount}</Text>
          </View>
          <View className="flex-row items-center">
            <ThumbsDown size={16} color="#ef4444" />
            <Text className="text-sm text-gray-600 ml-1">{dislikesCount}</Text>
          </View>
        </View>

        <Text className="text-sm text-gray-600">
          {applicationsCount} {applicationsCount === 1 ? 'postulación' : 'postulaciones'}
        </Text>
      </View>

      {/* Action Buttons (for professionals) */}
      {showActions && (
        <View className="flex-row items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center py-2 px-4 rounded-lg border ${
              hasUserLiked
                ? 'bg-green-50 border-green-500'
                : 'bg-gray-50 border-gray-200'
            }`}
            onPress={onLike}
          >
            <ThumbsUp
              size={18}
              color={hasUserLiked ? '#10b981' : '#6b7280'}
              fill={hasUserLiked ? '#10b981' : 'none'}
            />
            <Text className={`ml-2 font-medium ${
              hasUserLiked ? 'text-green-600' : 'text-gray-600'
            }`}>
              Me interesa
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center py-2 px-4 rounded-lg ${
              hasUserApplied
                ? 'bg-blue-500'
                : 'bg-blue-600'
            }`}
            onPress={onApply}
            disabled={hasUserApplied}
          >
            <Text className="text-white font-bold">
              {hasUserApplied ? 'Postulado' : 'Postular'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}
