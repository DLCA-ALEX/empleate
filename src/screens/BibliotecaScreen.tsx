import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { wpApi } from '@/services/wpApi';
import { useNavigation } from '@react-navigation/native';
import { mapLibroToContent } from '@/utils/bookMapper';

export default function BibliotecaScreen() {
  const nav = useNavigation<any>();
  const { data, isLoading, error } = useQuery({
    queryKey: ['wp-libros'],
    queryFn: wpApi.listLibros,
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" /><Text>Cargando libros...</Text></View>;
  }
  if (error) {
    return <View style={styles.center}><Text>Error al obtener los datos</Text></View>;
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ paddingVertical: 8 }}
      renderItem={({ item }) => {
        const content = mapLibroToContent(item);
        return (
          <TouchableOpacity
            onPress={() => nav.navigate('Detail', { content })}
            style={styles.card}
            activeOpacity={0.85}
          >
            {!!content.thumbnailUrl && (
              <Image source={{ uri: content.thumbnailUrl }} style={styles.portada} />
            )}
            <View style={styles.info}>
              <Text style={styles.titulo}>{content.title}</Text>
              {!!content.author && <Text style={styles.autor}>{content.author}</Text>}
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { flexDirection: 'row', padding: 15, marginHorizontal: 10, marginVertical: 5, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
  portada: { width: 60, height: 90, marginRight: 15, borderRadius: 4, backgroundColor: '#eee' },
  info: { flex: 1, justifyContent: 'center' },
  titulo: { fontWeight: 'bold', fontSize: 16 },
  autor: { color: 'gray', marginTop: 4 },
});
