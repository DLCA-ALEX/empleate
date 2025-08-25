import React from 'react';
import { Image, View } from 'react-native';

export default function BrandHeader() {
  return (
    <View style={{ backgroundColor: 'white', paddingVertical: 8, alignItems: 'center' }}>
      <Image
        source={require('../../assets/branding/header-logos.png')}
        style={{ width: '92%', height: 32, resizeMode: 'contain' }}
      />
    </View>
  );
}
