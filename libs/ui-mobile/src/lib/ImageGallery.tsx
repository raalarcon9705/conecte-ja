/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View, Image, ScrollView, TouchableOpacity, Dimensions, Modal as RNModal } from 'react-native';

export interface ImageGalleryProps {
  images: Array<{ uri: string; id: string }>;
  height?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function ImageGallery({ images, height = 300 }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        className="rounded-xl overflow-hidden"
      >
        {images.map((image) => (
          <TouchableOpacity
            key={image.id}
            onPress={() => setSelectedImage(image.uri)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: image.uri }}
              style={{ width: SCREEN_WIDTH - 32, height }}
              className="mr-2"
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {images.length > 1 && (
        <View className="flex-row justify-center mt-2">
          {images.map((_, index) => (
            <View
              key={index}
              className="w-2 h-2 rounded-full bg-gray-300 mx-1"
            />
          ))}
        </View>
      )}

      <RNModal
        visible={selectedImage !== null}
        transparent
        onRequestClose={() => setSelectedImage(null)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/90 items-center justify-center"
          activeOpacity={1}
          onPress={() => setSelectedImage(null)}
        >
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </RNModal>
    </>
  );
}

export default ImageGallery;

