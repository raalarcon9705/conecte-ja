/** @jsxImportSource nativewind */
import React from 'react';
import { View, Text, TouchableOpacity, ViewProps } from 'react-native';

/* eslint-disable-next-line */
export interface UiMobileProps extends ViewProps {
  title?: string;
  onPress?: () => void;
  className?: string;
}

export function UiMobile({ title = 'Welcome to ui-mobile!', onPress, className, ...props }: UiMobileProps) {
  return (
    <View className="bg-primary-500 p-6 rounded-lg m-4 shadow-lg" {...props}>
      <Text className="text-white text-2xl font-bold mb-4">{title}</Text>
      <TouchableOpacity
        className="bg-primary-100 p-4 rounded-md active:bg-primary-200 border-2 border-primary-600"
        onPress={onPress}
      >
        <Text className="text-primary-900 text-center font-semibold">
          Press Me
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default UiMobile;
