import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { spacing, colors } from '@/theme';

type Props = {
  title: string;
  author?: string;
  thumbnail?: string;
  onPress?: () => void;
};

export default function BookCardWide({ title, author, thumbnail, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={{ width: 260, marginRight: spacing(1), backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', elevation: 2 }}>
      {!!thumbnail ? (
        <Image source={{ uri: thumbnail }} style={{ width: '100%', height: 120, backgroundColor: '#eee' }} />
      ) : (
        <View style={{ width: '100%', height: 120, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#94a3b8' }}>Sin portada</Text>
        </View>
      )}
      <View style={{ padding: spacing(1) }}>
        <Text numberOfLines={2} style={{ fontWeight: '700', color: colors.text }}>{title}</Text>
        {!!author && <Text numberOfLines={1} style={{ marginTop: 4, color: '#64748b' }}>{author}</Text>}
      </View>
    </TouchableOpacity>
  );
}
