/** @jsxImportSource nativewind */
import React from 'react';
import { View, Image, Text, ViewProps } from 'react-native';

export interface AvatarProps extends ViewProps {
  source?: { uri: string } | number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  name?: string;
  badge?: React.ReactNode;
}

export function Avatar({
  source,
  size = 'md',
  name,
  badge,
  className = '',
  ...props
}: AvatarProps) {
  const sizeStyles = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizeStyles = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl',
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <View className="relative" {...props}>
      <View className={`${sizeStyles[size]} rounded-full overflow-hidden bg-blue-500 items-center justify-center ${className}`}>
        {source ? (
          <Image source={source} className="w-full h-full" resizeMode="cover" />
        ) : name ? (
          <Text className={`${textSizeStyles[size]} font-bold text-white`}>
            {getInitials(name)}
          </Text>
        ) : (
          <Text className={`${textSizeStyles[size]} font-bold text-white`}>?</Text>
        )}
      </View>
      {badge && (
        <View className="absolute -bottom-1 -right-1">
          {badge}
        </View>
      )}
    </View>
  );
}

export default Avatar;

