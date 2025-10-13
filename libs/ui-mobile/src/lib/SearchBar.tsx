/** @jsxImportSource nativewind */
import React from 'react';
import { View, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Search, X, SlidersHorizontal } from 'lucide-react-native';

export interface SearchBarProps extends TextInputProps {
  onSearch?: (text: string) => void;
  onClear?: () => void;
  showFilter?: boolean;
  onFilterPress?: () => void;
}

export function SearchBar({
  onSearch,
  onClear,
  showFilter = false,
  onFilterPress,
  value,
  className = '',
  ...props
}: SearchBarProps) {
  const handleClear = () => {
    onClear?.();
  };

  return (
    <View className={`flex-row items-center bg-white rounded-full px-4 py-2 border border-gray-200 ${className}`}>
      <View className="mr-2">
        <Search size={20} color="#9ca3af" />
      </View>
      <TextInput
        className="flex-1 text-base text-gray-900"
        placeholderTextColor="#9ca3af"
        value={value}
        onSubmitEditing={(e) => onSearch?.(e.nativeEvent.text)}
        returnKeyType="search"
        {...props}
      />
      {value && (
        <TouchableOpacity onPress={handleClear} className="mr-2">
          <View className="w-6 h-6 bg-gray-300 rounded-full items-center justify-center">
            <X size={14} color="#ffffff" />
          </View>
        </TouchableOpacity>
      )}
      {showFilter && (
        <TouchableOpacity onPress={onFilterPress}>
          <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
            <SlidersHorizontal size={16} color="#ffffff" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default SearchBar;

