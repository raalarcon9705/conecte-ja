/** @jsxImportSource nativewind */
import React from 'react';
import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ModalProps as RNModalProps,
} from 'react-native';

export interface ModalProps extends RNModalProps {
  visible: boolean;
  onClose: () => void;
  position?: 'center' | 'bottom';
  closeOnBackdrop?: boolean;
  children: React.ReactNode;
}

export function Modal({
  visible,
  onClose,
  position = 'center',
  closeOnBackdrop = true,
  children,
  ...props
}: ModalProps) {
  const positionStyles = position === 'center'
    ? 'justify-center'
    : 'justify-end';

  return (
    <RNModal
      visible={visible}
      transparent
      animationType={position === 'bottom' ? 'slide' : 'fade'}
      onRequestClose={onClose}
      {...props}
    >
      <TouchableWithoutFeedback onPress={closeOnBackdrop ? onClose : undefined}>
        <View className={`flex-1 bg-black/50 ${positionStyles} px-4`}>
          <TouchableWithoutFeedback>
            <View
              className={`bg-white rounded-2xl p-6 max-h-[90%] ${
                position === 'bottom' ? 'rounded-b-none' : ''
              }`}
            >
              <TouchableOpacity
                onPress={onClose}
                className="absolute top-4 right-4 z-10"
              >
                <View className="w-8 h-8 items-center justify-center">
                  <View className="text-gray-400 text-2xl">✕</View>
                </View>
              </TouchableOpacity>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
}

export default Modal;

