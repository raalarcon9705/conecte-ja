/** @jsxImportSource nativewind */
import React from 'react';
import { View, TouchableOpacity, ViewProps, TouchableOpacityProps } from 'react-native';

export interface CardProps extends ViewProps {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
  children: React.ReactNode;
}

export function Card({
  variant = 'default',
  padding = 'md',
  onPress,
  className = '',
  children,
  ...props
}: CardProps) {
  const baseStyles = 'rounded-lg bg-white';
  
  const variantStyles = {
    default: '',
    outlined: 'border border-gray-200',
    elevated: 'shadow-md',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`;

  if (onPress) {
    return (
      <TouchableOpacity
        className={`${combinedClassName} active:opacity-70`}
        onPress={onPress}
        {...(props as TouchableOpacityProps)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={combinedClassName} {...props}>
      {children}
    </View>
  );
}

export default Card;

