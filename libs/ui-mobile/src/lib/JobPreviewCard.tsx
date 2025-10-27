/** @jsxImportSource nativewind */
import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from './Text';
import { ChevronRight, MapPin, DollarSign } from 'lucide-react-native';
import type { Database } from '@conecteja/types';

type JobPosting = Database['public']['Tables']['job_postings']['Row'];

export interface JobPreviewCardProps {
  jobId: string;
  title: string;
  description?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetType?: JobPosting['budget_type'];
  location?: string;
  status?: JobPosting['status'];
  imageUrl?: string;
  onPress?: () => void;
  compact?: boolean;
}

export const JobPreviewCard: React.FC<JobPreviewCardProps> = ({
  jobId,
  title,
  description,
  budgetMin,
  budgetMax,
  budgetType,
  location,
  status,
  imageUrl,
  onPress,
  compact = false,
}) => {
  const { t } = useTranslation();

  const formatBudget = () => {
    if (budgetType === 'negotiable') {
      return t('chats.jobPreview.negotiablePrice');
    }

    if (budgetMin && budgetMax) {
      return t('chats.jobPreview.priceRange', { min: budgetMin, max: budgetMax });
    }

    if (budgetMin) {
      return t('chats.jobPreview.fromPrice', { price: budgetMin });
    }

    if (budgetMax) {
      return t('chats.jobPreview.upToPrice', { price: budgetMax });
    }

    return t('chats.jobPreview.consultPrice');
  };

  const getStatusColor = () => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'open':
        return t('chats.jobPreview.status.open');
      case 'in_progress':
        return t('chats.jobPreview.status.inProgress');
      case 'completed':
        return t('chats.jobPreview.status.completed');
      case 'canceled':
        return t('chats.jobPreview.status.canceled');
      case 'expired':
        return t('chats.jobPreview.status.expired');
      default:
        return t('chats.jobPreview.status.unknown');
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        className="bg-white rounded-lg border border-gray-200 p-3 mb-2"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          {/* Image placeholder or actual image */}
          <View className="w-12 h-12 bg-gray-200 rounded-lg mr-3 items-center justify-center">
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} className="w-full h-full rounded-lg" />
            ) : (
              <DollarSign size={20} color="#6B7280" />
            )}
          </View>

          {/* Content */}
          <View className="flex-1">
            <Text variant="caption" weight="medium" className="text-gray-900 mb-1" numberOfLines={1}>
              {title}
            </Text>
            <Text variant="caption" color="muted" numberOfLines={1}>
              {formatBudget()}
            </Text>
          </View>

          {/* Status badge */}
          <View className={`px-2 py-1 rounded-full ${getStatusColor()}`}>
            <Text variant="caption" weight="medium">
              {getStatusText()}
            </Text>
          </View>

          <ChevronRight size={16} color="#6B7280" className="ml-2" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-lg border border-gray-200 p-4 mb-3"
      activeOpacity={0.7}
    >
      <View className="flex-row">
        {/* Image placeholder or actual image */}
        <View className="w-16 h-16 bg-gray-200 rounded-lg mr-3 items-center justify-center">
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} className="w-full h-full rounded-lg" />
          ) : (
            <DollarSign size={24} color="#6B7280" />
          )}
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-start justify-between mb-1">
            <Text variant="body" weight="semibold" className="text-gray-900 flex-1 mr-2" numberOfLines={2}>
              {title}
            </Text>
            <View className={`px-2 py-1 rounded-full ${getStatusColor()}`}>
              <Text variant="caption" weight="medium">
                {getStatusText()}
              </Text>
            </View>
          </View>

          {description && (
            <Text variant="caption" color="muted" className="mb-2" numberOfLines={2}>
              {description}
            </Text>
          )}

          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <DollarSign size={14} color="#6B7280" />
              <Text variant="caption" color="muted" className="ml-1">
                {formatBudget()}
              </Text>
            </View>

            {location && (
              <View className="flex-row items-center">
                <MapPin size={14} color="#6B7280" />
                <Text variant="caption" color="muted" className="ml-1" numberOfLines={1}>
                  {location}
                </Text>
              </View>
            )}
          </View>
        </View>

        <ChevronRight size={16} color="#6B7280" className="ml-2" />
      </View>
    </TouchableOpacity>
  );
};
