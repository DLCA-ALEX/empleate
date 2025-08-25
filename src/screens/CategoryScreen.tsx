import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { colors, spacing, radius, fonts } from '@/theme';
import { useNavigation } from '@react-navigation/native';

const DATA = [
  { label: 'Audio' }, { label: 'Videos' }, { label: 'Libros' },
  { label: 'Manuales' }, { label: 'Guías' }, { label: 'Investigación' }, { label: 'Cursos' }
];

export default function CategoryScreen() {
  const nav = useNavigation<any>();
  return (
    <View style={{ flex:1, backgroundColor:'white' }}>
      <View style={{ padding: spacing(1.5), borderBottomWidth:1, borderBottomColor: colors.border }}>
        <Text style={fonts.h2}>Participación Juvenil</Text>
      </View>
      <FlatList
        data={DATA}
        numColumns={2}
        keyExtractor={(i) => i.label}
        columnWrapperStyle={{ justifyContent:'space-around', paddingHorizontal: spacing(1.5) }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => nav.navigate('Search')} style={{ marginTop: spacing(2) }}>
            <View style={{ width: 150, height: 150, backgroundColor: '#E5F5D5', borderRadius: radius.md, justifyContent:'center', alignItems:'center' }}>
              <Image source={require('../../assets/home/book-placeholder.png')} style={{ width: 64, height: 96, resizeMode:'contain' }} />
            </View>
            <Text style={{ textAlign:'center', marginTop: spacing(1) }}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
