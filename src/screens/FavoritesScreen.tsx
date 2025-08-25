import React, { useMemo } from 'react';
import { View, FlatList, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '@/store/useStore';
import ContentCard from '@/components/ContentCard';
import { spacing, colors, fonts } from '@/theme';

export default function FavoritesScreen() {
  const nav = useNavigation<any>();
  const catalog = useStore(s => s.catalog);
  const favorites = useStore(s => s.favorites);

  const favItems = useMemo(
    () => catalog.filter(c => favorites.includes(c.id)),
    [catalog, favorites]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Encabezado de filtros */}
      <View style={{ paddingHorizontal: spacing(1.5), paddingTop: spacing(1.5) }}>
        <Text style={fonts.h2}>Secciones</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: spacing(1) }}
          contentContainerStyle={{ paddingRight: spacing(1.5) }}
        >
          {['Empleo','Emprendimiento','Participación','Desarrollo'].map((t, i) => (
            <View
              key={t}
              style={{
                backgroundColor: i === 1 ? colors.accent : colors.chip,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                marginRight: 8,
              }}
            >
              <Text style={{ color: i === 1 ? 'white' : colors.text }}>{t}</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={{ ...fonts.h2, marginTop: spacing(2) }}>Categoría</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing(1) }}>
          {['Audio','Video','Libros','Manuales','Guías','Cursos','Investigación'].map((t, i) => (
            <View
              key={t}
              style={{
                borderWidth: 1,
                borderColor: colors.accent,
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 6,
                marginRight: 8,
                marginBottom: 8,
                backgroundColor: i === 2 ? colors.accent : 'transparent',
              }}
            >
              <Text style={{ color: i === 2 ? 'white' : colors.accent }}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Lista de favoritos */}
      <FlatList
        data={favItems}
        keyExtractor={(it) => String(it.id)}
        contentContainerStyle={{
          paddingHorizontal: spacing(1.5),
          paddingTop: spacing(1),
          paddingBottom: spacing(2),
        }}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing(1) }}
        ItemSeparatorComponent={() => <View style={{ height: spacing(1) }} />}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <ContentCard
              item={item}
              onPress={() => nav.navigate('Detail', { id: String(item.id), content: item })}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={{ padding: spacing(2) }}>
            <Text style={fonts.small}>No tienes favoritos aún.</Text>
          </View>
        }
      />
    </View>
  );
}
