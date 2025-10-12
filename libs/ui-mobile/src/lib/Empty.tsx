/** @jsxImportSource nativewind */
import React from 'react';
import { View, Text, ViewProps } from 'react-native';
import { Button } from './Button';

export interface EmptyProps extends ViewProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function Empty({
  icon,
  title,
  description,
  action,
  className = '',
  ...props
}: EmptyProps) {
  return (
    <View className={`flex-1 items-center justify-center p-8 ${className}`} {...props}>
      {icon && <View className="mb-4">{icon}</View>}
      <Text className="text-xl font-bold text-gray-900 text-center mb-2">
        {title}
      </Text>
      {description && (
        <Text className="text-base text-gray-600 text-center mb-6">
          {description}
        </Text>
      )}
      {action && (
        <Button onPress={action.onPress}>
          {action.label}
        </Button>
      )}
    </View>
  );
}

export default Empty;

