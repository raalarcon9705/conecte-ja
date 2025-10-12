/** @jsxImportSource nativewind */
import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'white' | 'error' | 'success';
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

export function Text({
  variant = 'body',
  weight = 'normal',
  color = 'primary',
  align = 'left',
  className = '',
  children,
  ...props
}: TextProps) {
  const variantStyles = {
    h1: 'text-4xl',
    h2: 'text-3xl',
    h3: 'text-2xl',
    h4: 'text-xl',
    body: 'text-base',
    caption: 'text-sm',
    label: 'text-xs',
  };

  const weightStyles = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const colorStyles = {
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    muted: 'text-gray-500',
    white: 'text-white',
    error: 'text-red-600',
    success: 'text-green-600',
  };

  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <RNText
      className={`${variantStyles[variant]} ${weightStyles[weight]} ${colorStyles[color]} ${alignStyles[align]} ${className}`}
      {...props}
    >
      {children}
    </RNText>
  );
}

export default Text;

