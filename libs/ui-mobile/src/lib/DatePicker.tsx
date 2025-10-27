/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { Text } from './Text';
import { Input } from './Input';

// Import react-native-modal-datetime-picker for mobile (Expo compatible)
let DateTimePickerModal: any = null;
try {
  if (Platform.OS !== 'web') {
    DateTimePickerModal = require('react-native-modal-datetime-picker').default;
  }
} catch (error) {
  console.warn('react-native-modal-datetime-picker not available:', error);
}

export interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date) => void;
  onCancel?: () => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'date' | 'time' | 'datetime';
  display?: 'default' | 'spinner' | 'clock' | 'compact';
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  onCancel,
  placeholder = 'Select date',
  label,
  error,
  helperText,
  disabled = false,
  minimumDate,
  maximumDate,
  mode = 'date',
  display = 'default',
  className = '',
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (selectedDate: Date) => {
    setShowPicker(false);
    if (onChange) {
      onChange(selectedDate);
    }
  };

  const handleWebDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(event.target.value);
    if (onChange) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    if (mode === 'date') {
      return date.toLocaleDateString('es-AR');
    } else if (mode === 'time') {
      return date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleString('es-AR');
    }
  };

  const formatDateForInput = (date: Date) => {
    if (mode === 'date') {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format for HTML input
    } else if (mode === 'time') {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } else {
      return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format
    }
  };

  const getDisplayValue = () => {
    if (!value) return '';
    return formatDate(value);
  };

  // Web implementation - use HTML input for better web compatibility
  if (Platform.OS === 'web') {
    return (
      <View className={className}>
        {label && (
          <Text variant="body" weight="medium" className="mb-2">
            {label}
          </Text>
        )}

        <View className="relative">
          <input
            type={mode === 'date' ? 'date' : mode === 'time' ? 'time' : 'datetime-local'}
            value={value ? formatDateForInput(value) : ''}
            onChange={handleWebDateChange}
            placeholder={placeholder}
            disabled={disabled}
            min={minimumDate ? formatDateForInput(minimumDate) : undefined}
            max={maximumDate ? formatDateForInput(maximumDate) : undefined}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              disabled ? 'opacity-50 bg-gray-100' : 'bg-white'
            } ${error ? 'border-red-500' : ''}`}
            style={{
              paddingLeft: '40px', // Space for calendar icon
            }}
          />
          <View className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <Calendar size={20} color="#6b7280" />
          </View>
        </View>

        {error && (
          <Text variant="caption" color="error" className="mt-1">
            {error}
          </Text>
        )}
        {helperText && !error && (
          <Text variant="caption" color="muted" className="mt-1">
            {helperText}
          </Text>
        )}
      </View>
    );
  }

  // Native implementation - use react-native-modal-datetime-picker (Expo compatible)
  return (
    <View className={className}>
      {label && (
        <Text variant="body" weight="medium" className="mb-2">
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => !disabled && setShowPicker(true)}
        disabled={disabled}
      >
        <Input
          value={getDisplayValue()}
          placeholder={placeholder}
          leftIcon={<Calendar size={20} color="#6b7280" />}
          editable={false}
          error={error}
          helperText={helperText}
          className={disabled ? 'opacity-50' : ''}
        />
      </TouchableOpacity>

      {DateTimePickerModal && (
        <DateTimePickerModal
          isVisible={showPicker}
          mode={mode}
          date={value || new Date()}
          onConfirm={handleDateChange}
          onCancel={() => {
            setShowPicker(false);
            if (onCancel) {
              onCancel();
            }
          }}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
}

export default DatePicker;
