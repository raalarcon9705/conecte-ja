/** @jsxImportSource nativewind */
import React from 'react';
import { View, ViewProps } from 'react-native';

export interface SpacerProps extends ViewProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Spacer({ size = 'md', className = '', ...props }: SpacerProps) {
  const sizeStyles = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
    xl: 'h-8',
  };

  return <View className={`${sizeStyles[size]} ${className}`} {...props} />;
}

export default Spacer;

