/** @jsxImportSource nativewind */
import React from 'react';
import { View, ScrollView, SafeAreaView, ViewProps } from 'react-native';

export interface ScreenProps extends ViewProps {
  scrollable?: boolean;
  safe?: boolean;
  children: React.ReactNode;
}

export function Screen({
  scrollable = false,
  safe = true,
  className = '',
  children,
  ...props
}: ScreenProps) {
  const baseClassName = `flex-1 bg-gray-50 ${className}`;

  const content = scrollable ? (
    <ScrollView className={baseClassName} {...props}>
      {children}
    </ScrollView>
  ) : (
    <View className={baseClassName} {...props}>
      {children}
    </View>
  );

  if (safe) {
    return <SafeAreaView className="flex-1">{content}</SafeAreaView>;
  }

  return content;
}

export default Screen;

