import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';

type Props = { label: string; icon: any; onPress?: () => void; bg: string };
export default function CategoryChip({ label, icon, onPress, bg }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={{ width: 88, alignItems:'center' }}>
      <View style={{ backgroundColor: bg, borderRadius: radius.md, width: 88, height: 88, justifyContent:'center', alignItems:'center' }}>
        <Image source={icon} style={{ width: 40, height: 40, resizeMode:'contain' }} />
      </View>
      <Text style={{ textAlign:'center', marginTop: spacing(0.5) }}>{label}</Text>
    </TouchableOpacity>
  );
}
