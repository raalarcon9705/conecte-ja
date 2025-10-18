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
    variant?: 'primary' | 'secondary' | 'outline';
  };
  secondary?: {
    label: string;
    onPress: () => void;
  };
}

export function Empty({
  icon,
  title,
  description,
  action,
  secondary,
  className = '',
  ...props
}: EmptyProps) {
  return (
    <View className={`flex-1 items-center justify-center p-8 ${className}`} {...props}>
      {/* Icon Container with Background */}
      {icon && (
        <View className="mb-6 items-center justify-center w-32 h-32 rounded-full bg-gray-100">
          {icon}
        </View>
      )}
      
      {/* Title */}
      <Text className="text-2xl font-bold text-gray-900 text-center mb-3 px-4">
        {title}
      </Text>
      
      {/* Description */}
      {description && (
        <Text className="text-base text-gray-500 text-center mb-8 px-6 leading-6">
          {description}
        </Text>
      )}
      
      {/* Actions */}
      {action && (
        <View className="w-full px-8">
          <Button 
            variant={action.variant || 'primary'} 
            size="lg"
            onPress={action.onPress}
            className="mb-3"
          >
            {action.label}
          </Button>
          
          {secondary && (
            <Button 
              variant="outline" 
              size="lg"
              onPress={secondary.onPress}
            >
              {secondary.label}
            </Button>
          )}
        </View>
      )}
    </View>
  );
}

export default Empty;

