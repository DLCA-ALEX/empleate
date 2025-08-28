// src/screens/CategoryScreen.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { listByArea, mapWpV2LibroToLibroWP } from '@/services/wpApi';
import { spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { mapLibroToContent } from '@/utils/bookMapper';

type Params = { area: string; title?: string };

export default function CategoryScreen() {
  const nav = useNavigation<any>();
  const route = useRoute();
  const { area, title } = (route.params as Params) || {};

  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['wp-v2-area', area],
    queryFn: () => listByArea(area),
    enabled: !!area,
  });
  console.log("Es la ddata de la categoria",data)

  const onPressItem = (raw: any) => {
    const libro = mapWpV2LibroToLibroWP(raw);     // -> LibroWP
    const content = mapLibroToContent(libro);     // -> tu Content para Detail
    nav.navigate('Detail', { content });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#7AC943', paddingHorizontal: spacing(1.5), paddingVertical: spacing(1.25), flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => nav.goBack()} style={{ marginRight: spacing(1) }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{title || 'Categoría'}</Text>
      </View>

      {isLoading && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 8 }}>Cargando…</Text>
        </View>
      )}

      {isError && !isLoading && (
        <View style={{ padding: spacing(1.5) }}>
          <Text>Hubo un problema cargando esta categoría.</Text>
        </View>
      )}

      {!isLoading && !isError && (
        <FlatList
          data={data}
          keyExtractor={(it: any) => String(it?.id)}
          numColumns={2}
          contentContainerStyle={{ padding: spacing(1.5), paddingBottom: spacing(2) }}
          columnWrapperStyle={{ gap: spacing(1) }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onPressItem(item)}
              style={{
                flex: 1,
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: spacing(1),
                marginBottom: spacing(1),
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
              activeOpacity={0.9}
            >
              <View style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: '#EAF7E2' }}>
                <Image
                  source={{ uri: item?.acf?.portada }}
                  style={{ width: '100%', aspectRatio: 1 }}
                  resizeMode="cover"
                />
              </View>
              <Text style={{ marginTop: 8, fontWeight: '700' }} numberOfLines={2}>
                {item?.title?.rendered || 'Sin título'}
              </Text>
              {!!item?.acf?.autor && (
                <Text style={{ color: '#6b7280', marginTop: 2 }} numberOfLines={1}>
                  {item.acf.autor}
                </Text>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{ padding: spacing(1.5) }}>No hay elementos.</Text>}
        />
      )}
    </View>
  );
}

