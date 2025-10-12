/** @jsxImportSource nativewind */
import React from 'react';
import { View, ViewProps } from 'react-native';

export interface DividerProps extends ViewProps {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export function Divider({
  orientation = 'horizontal',
  spacing = 'md',
  className = '',
  ...props
}: DividerProps) {
  const spacingStyles = {
    none: '',
    sm: orientation === 'horizontal' ? 'my-2' : 'mx-2',
    md: orientation === 'horizontal' ? 'my-4' : 'mx-4',
    lg: orientation === 'horizontal' ? 'my-6' : 'mx-6',
  };

  const orientationStyles = orientation === 'horizontal'
    ? 'h-px w-full'
    : 'w-px h-full';

  return (
    <View
      className={`bg-gray-200 ${orientationStyles} ${spacingStyles[spacing]} ${className}`}
      {...props}
    />
  );
}

export default Divider;

