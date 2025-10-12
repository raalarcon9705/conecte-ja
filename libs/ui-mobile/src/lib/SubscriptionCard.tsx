/** @jsxImportSource nativewind */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Button } from './Button';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
}

export interface SubscriptionCardProps extends SubscriptionPlan {
  onPress?: () => void;
}

export function SubscriptionCard({
  name,
  price,
  period,
  features,
  isPopular = false,
  isCurrent = false,
  onPress,
}: SubscriptionCardProps) {
  return (
    <View
      className={`bg-white rounded-2xl p-6 mb-4 border-2 ${
        isPopular ? 'border-blue-500' : isCurrent ? 'border-green-500' : 'border-gray-200'
      }`}
    >
      {isPopular && (
        <View className="absolute -top-3 self-center bg-blue-500 px-4 py-1 rounded-full">
          <Text className="text-white text-xs font-bold">MÁS POPULAR</Text>
        </View>
      )}
      
      {isCurrent && (
        <View className="absolute -top-3 self-center bg-green-500 px-4 py-1 rounded-full">
          <Text className="text-white text-xs font-bold">PLAN ACTUAL</Text>
        </View>
      )}

      <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
        {name}
      </Text>
      
      <View className="flex-row items-end justify-center mb-1">
        <Text className="text-4xl font-bold text-blue-600">{price}</Text>
        <Text className="text-gray-500 ml-1 mb-1">/{period}</Text>
      </View>
      
      <View className="my-6">
        {features.map((feature, index) => (
          <View key={index} className="flex-row items-start mb-3">
            <Text className="text-green-500 mr-2">✓</Text>
            <Text className="text-gray-700 flex-1">{feature}</Text>
          </View>
        ))}
      </View>

      <Button
        variant={isPopular ? 'primary' : isCurrent ? 'outline' : 'outline'}
        onPress={onPress}
        fullWidth
        disabled={isCurrent}
      >
        {isCurrent ? 'Plan Actual' : 'Seleccionar Plan'}
      </Button>
    </View>
  );
}

export default SubscriptionCard;

