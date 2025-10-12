/** @jsxImportSource nativewind */
import React from 'react';
import { View, ViewProps } from 'react-native';

export interface ContainerProps extends ViewProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Container({
  padding = 'md',
  className = '',
  children,
  ...props
}: ContainerProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <View className={`${paddingStyles[padding]} ${className}`} {...props}>
      {children}
    </View>
  );
}

export default Container;

