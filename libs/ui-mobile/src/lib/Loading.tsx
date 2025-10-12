/** @jsxImportSource nativewind */
import React from 'react';
import { View, ActivityIndicator, Text, ViewProps } from 'react-native';

export interface LoadingProps extends ViewProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

export function Loading({
  size = 'large',
  color = '#3b82f6',
  text,
  fullScreen = false,
  className = '',
  ...props
}: LoadingProps) {
  const content = (
    <View className={`items-center justify-center ${className}`} {...props}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text className="text-gray-600 mt-4 text-center">{text}</Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        {content}
      </View>
    );
  }

  return content;
}

export default Loading;

