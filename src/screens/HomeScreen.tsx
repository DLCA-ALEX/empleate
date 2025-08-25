import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import BrandHeader from '@/components/BrandHeader';
import CategoryChip from '@/components/CategoryChip';
import BookCardWide from '@/components/BookCardWide';
import { colors, fonts, spacing } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { wpApi } from '@/services/wpApi';
import { mapLibroToContent } from '@/utils/bookMapper';

export default function HomeScreen() {
  const nav = useNavigation<any>();

  const cats = [
    { label: 'Empleo y\nEmpleabilidad', icon: require('../../assets/home/cat-empleo.png'), bg: '#DFF5F0' },
    { label: 'Emprendimiento', icon: require('../../assets/home/cat-emprendimiento.png'), bg: '#FFE8D5' },
    { label: 'Participación\nJuvenil', icon: require('../../assets/home/cat-participacion.png'), bg: '#F1E4FF' },
    { label: 'Desarrollo\nPersonal', icon: require('../../assets/home/cat-desarrollo.png'), bg: '#E8F0FF' },
  ];

  // Trae libros desde WP
  const { data: libros = [], isLoading } = useQuery({
    queryKey: ['wp-libros-home'],
    queryFn: wpApi.listLibros,
  });

  // Divide en secciones “fake” por ahora (puedes cambiarlas por filtros reales)
  const recientes = useMemo(() => libros.slice(0, 10), [libros]);
  const recomendados = useMemo(() => libros.slice(10, 20), [libros]);
  const continuar = useMemo(() => libros.slice(20, 30), [libros]);

  const goDetail = (libro: any) => {
    const content = mapLibroToContent(libro);
    nav.navigate('Detail', { content });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BrandHeader />

      {/* barra superior azul con logo/botones */}
      <View style={{ backgroundColor: colors.primary, paddingHorizontal: spacing(1.5), paddingVertical: spacing(1.25), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Biblioteca EmpleaT</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => nav.navigate('Favorites')} style={{ marginRight: spacing(1.5) }}>
            <Text style={{ color: 'white' }}>⭐ Favoritos</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => nav.navigate('Profile')} style={{ marginRight: spacing(1.5) }}>
            <Text style={{ color: 'white' }}>👤</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => nav.navigate('Biblioteca')}>
            <Text style={{ color: 'white' }}>WP</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing(4) }}>
        {/* categorías */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: spacing(1.5) }}>
          {cats.map(c => (
            <CategoryChip key={c.label} label={c.label} icon={c.icon} bg={c.bg} onPress={() => nav.navigate('Search')} />
          ))}
        </ScrollView>

        {/* continuar leyendo (de momento: subset de WP) */}
        <Section title="Continuar leyendo">
    <FlatList
            data={recientes}
            keyExtractor={(it: any) => String(it.id)}
            renderItem={({ item }) => (
              <BookCardWide
                title={item.titulo}
                author={item.autor}
                thumbnail={item.portada}
                onPress={() => goDetail(item)}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing(1.5) }}
            ListEmptyComponent={!isLoading ? <Text style={{ paddingHorizontal: spacing(1.5) }}>Sin datos</Text> : null}
          />
        </Section>

        {/* agregados recientemente */}
        <Section title="Agregados Recientemente" action={() => nav.navigate('Search')}>
          <FlatList
            data={recientes}
            keyExtractor={(it: any) => String(it.id)}
            renderItem={({ item }) => (
              <BookCardWide
                title={item.titulo}
                author={item.autor}
                thumbnail={item.portada}
                onPress={() => goDetail(item)}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing(1.5) }}
            ListEmptyComponent={!isLoading ? <Text style={{ paddingHorizontal: spacing(1.5) }}>Sin datos</Text> : null}
          />
        </Section>

        {/* recomendados */}
        <Section title="Recomendados">
          <FlatList
            data={recientes}
            keyExtractor={(it: any) => String(it.id)}
            renderItem={({ item }) => (
              <BookCardWide
                title={item.titulo}
                author={item.autor}
                thumbnail={item.portada}
                onPress={() => goDetail(item)}
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing(1.5) }}
            ListEmptyComponent={!isLoading ? <Text style={{ paddingHorizontal: spacing(1.5) }}>Sin datos</Text> : null}
          />
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: () => void }) {
  return (
    <View style={{ marginTop: spacing(1) }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing(1.5), marginBottom: spacing(1) }}>
        <Text style={fonts.h2}>{title}</Text>
        {action && <TouchableOpacity onPress={action}><Text style={{ color: colors.primary }}>Ver todos</Text></TouchableOpacity>}
      </View>
      {children}
    </View>
  );
}
