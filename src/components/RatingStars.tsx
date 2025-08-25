import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type Props = { value: number; onChange?: (v:number)=>void };

export default function RatingStars({ value, onChange }: Props) {
  const stars = [1,2,3,4,5];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {stars.map(s => (
        <TouchableOpacity key={s} onPress={() => onChange?.(s)} style={{ padding: 4 }}>
          <Text style={{ fontSize: 20 }}>{s <= value ? '★' : '☆'}</Text>
        </TouchableOpacity>
      ))}
      <Text style={{ marginLeft: 8 }}>{value}/5</Text>
    </View>
  );
}
