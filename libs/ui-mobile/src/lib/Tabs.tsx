/** @jsxImportSource nativewind */
import React from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';

export interface Tab {
  id: string;
  label: string;
  badge?: number;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills';
}

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
}: TabsProps) {
  if (variant === 'pills') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        <View className="flex-row px-4">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <TouchableOpacity
                key={tab.id}
                className={`px-4 py-2 rounded-full mr-2 ${
                  isActive ? 'bg-blue-500' : 'bg-gray-100'
                }`}
                onPress={() => onTabChange(tab.id)}
              >
                <View className="flex-row items-center">
                  <Text
                    className={`font-medium ${
                      isActive ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </Text>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <View
                      className={`ml-2 px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isActive ? 'text-white' : 'text-gray-700'
                        }`}
                      >
                        {tab.badge}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  return (
    <View className="border-b border-gray-200 mb-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4"
      >
        <View className="flex-row">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <TouchableOpacity
                key={tab.id}
                className={`px-4 py-3 border-b-2 mr-4 ${
                  isActive ? 'border-blue-500' : 'border-transparent'
                }`}
                onPress={() => onTabChange(tab.id)}
              >
                <View className="flex-row items-center">
                  <Text
                    className={`font-medium ${
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {tab.label}
                  </Text>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <View className="ml-2 px-2 py-0.5 rounded-full bg-red-500">
                      <Text className="text-xs font-semibold text-white">
                        {tab.badge}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

export default Tabs;

