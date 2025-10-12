/** @jsxImportSource nativewind */
import React from 'react';
import { View, Text, TouchableOpacity, ViewProps } from 'react-native';

export interface RatingProps extends ViewProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (value: number) => void;
  readonly?: boolean;
  showValue?: boolean;
}

export function Rating({
  value,
  max = 5,
  size = 'md',
  onChange,
  readonly = false,
  showValue = false,
  className = '',
  ...props
}: RatingProps) {
  const sizeStyles = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  const handlePress = (index: number) => {
    if (!readonly && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <View className={`flex-row items-center ${className}`} {...props}>
      {Array.from({ length: max }).map((_, index) => {
        const isFilled = index < Math.floor(value);
        const isHalf = index < value && index >= Math.floor(value);
        
        const Component = readonly ? View : TouchableOpacity;

        return (
          <Component
            key={index}
            onPress={() => handlePress(index)}
            disabled={readonly}
          >
            <Text className={`${sizeStyles[size]} ${isFilled || isHalf ? 'text-yellow-500' : 'text-gray-300'}`}>
              {isFilled ? '★' : isHalf ? '⯨' : '☆'}
            </Text>
          </Component>
        );
      })}
      {showValue && (
        <Text className="ml-2 text-gray-700 font-medium">
          {value.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

export default Rating;

