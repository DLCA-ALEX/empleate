import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Content } from '@/utils/types';

type Props = { item: Content; onPress: () => void; };

export default function ContentCard({ item, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={{ flexDirection:'row', padding:12, borderBottomWidth:1, borderBottomColor:'#e5e7eb' }}>
      {item.thumbnailUrl ? (
        <Image source={{ uri: item.thumbnailUrl }} style={{ width: 64, height: 64, borderRadius: 8, marginRight: 12 }} />
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '600' }}>{item.title}</Text>
        {!!item.description && <Text numberOfLines={2} style={{ color: '#555', marginTop: 4 }}>{item.description}</Text>}
        <Text style={{ marginTop: 6, fontSize: 12, color: '#777' }}>{item.type} {item.language ? '· ' + item.language : ''}</Text>
      </View>
    </TouchableOpacity>
  );
}
