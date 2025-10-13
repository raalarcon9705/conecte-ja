/** @jsxImportSource nativewind */
import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react-native';

export interface VerificationBadgeProps extends ViewProps {
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function VerificationBadge({
  isVerified,
  size = 'md',
  showText = false,
  className = '',
  ...props
}: VerificationBadgeProps) {
  const { t } = useTranslation();
  
  if (!isVerified) return null;

  const sizeStyles = {
    sm: { badge: 'w-4 h-4', icon: 'text-[8px]', text: 'text-xs' },
    md: { badge: 'w-5 h-5', icon: 'text-[10px]', text: 'text-sm' },
    lg: { badge: 'w-6 h-6', icon: 'text-xs', text: 'text-base' },
  };

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  if (showText) {
    return (
      <View className={`flex-row items-center bg-blue-50 px-2 py-1 rounded-full ${className}`} {...props}>
        <View className={`${sizeStyles[size].badge} bg-blue-500 rounded-full items-center justify-center mr-1`}>
          <Check size={iconSizes[size]} color="#ffffff" strokeWidth={3} />
        </View>
        <Text className={`${sizeStyles[size].text} text-blue-700 font-medium`}>
          {t('professional.verified')}
        </Text>
      </View>
    );
  }

  return (
    <View
      className={`${sizeStyles[size].badge} bg-blue-500 rounded-full items-center justify-center ${className}`}
      {...props}
    >
      <Check size={iconSizes[size]} color="#ffffff" strokeWidth={3} />
    </View>
  );
}

export default VerificationBadge;

