// src/screens/HomeScreen.tsx
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
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const nav = useNavigation<any>();

  const cats = [
    { label: 'Empleo y\nEmpleabilidad', icon: require('../../assets/home/cat-empleo.png'), bg: '#DFF5F0' },
    { label: 'Emprendimiento', icon: require('../../assets/home/cat-emprendimiento.png'), bg: '#FFE8D5' },
    { label: 'Participación\nJuvenil', icon: require('../../assets/home/cat-participacion.png'), bg: '#F1E4FF' },
    { label: 'Desarrollo\nPersonal', icon: require('../../assets/home/cat-desarrollo.png'), bg: '#E8F0FF' },
  ];

  // WP
  const { data: libros = [], isLoading } = useQuery({
    queryKey: ['wp-libros-home'],
    queryFn: wpApi.listLibros,
  });

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

      {/* barra superior azul */}
      <View style={{ backgroundColor: colors.primary, paddingHorizontal: spacing(1.5), paddingVertical: spacing(1.25), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: '700' }}>Biblioteca EmpleaT</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => nav.navigate('Favorites')} style={{ marginRight: spacing(1.5) }}>
            <Ionicons name="star-outline" size={25} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => nav.navigate('Profile')} style={{ marginRight: spacing(1.5) }}>
            <Ionicons name="person-circle-outline" size={28} color="white" />
          </TouchableOpacity>

          {/* 
  <TouchableOpacity onPress={() => nav.navigate('Biblioteca')}>
    <Ionicons name="library-outline" size={22} color="white" />
  </TouchableOpacity> 
  */}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: spacing(10) /* espacio para que no tape el footer */ }}>
        {/* categorías */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: spacing(1.5) }}>
          {cats.map(c => (
            <CategoryChip key={c.label} label={c.label} icon={c.icon} bg={c.bg} onPress={() => nav.navigate('Search')} />
          ))}
        </ScrollView>

        {/* continuar leyendo */}
        <Section title="Continuar leyendo">
          {/* <FlatList
            data={continuar}
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
          /> */}
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
          {/* <FlatList
            data={recomendados}
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
          /> */}
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

      {/* FOOTER tipo tab, solo en Home */}
      <BottomNav
        onPressInicio={() => { }}
        onPressBiblioteca={() => nav.navigate('Favorites')}
        onPressHistorial={() => nav.navigate('History')}
        onPressFaq={() => nav.navigate('FAQ')}
        onPressRecursos={() => nav.navigate('Resources')}
        active="inicio"
      />
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

/* ---------- Footer simple tipo tabs ---------- */
function BottomNav({
  onPressInicio,
  onPressBiblioteca,
  onPressHistorial,
  onPressFaq,
  onPressRecursos,
  active = 'inicio',
}) {
  const Item = ({
    label,
    iconName,
    onPress,
    isActive,
  }: {
    label: string;
    iconName: string; // nombre del icono Ionicons
    onPress: () => void;
    isActive: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{ flex: 1, alignItems: 'center', paddingVertical: 6 }}
      activeOpacity={0.8}
    >
      <Ionicons
        name={iconName as any}
        size={22}
        color={isActive ? colors.primary : '#6b7280'}
      />
      <Text
        style={{
          fontSize: 11,
          marginTop: 2,
          color: isActive ? colors.primary : '#6b7280',
          fontWeight: isActive ? '700' : '500',
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        height: 60,
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
      }}
    >
      <Item label="Historial" iconName="time-outline" onPress={onPressHistorial} isActive={active === 'historial'} />
      <Item label="Favoritos" iconName="bookmarks-outline" onPress={onPressBiblioteca} isActive={active === 'Favorites'} />
      <Item label="Inicio" iconName="home-outline" onPress={onPressInicio} isActive={active === 'inicio'} />
      <Item label="FAQ" iconName="help-circle-outline" onPress={onPressFaq} isActive={active === 'faq'} />
      <Item label="Recursos" iconName="link-outline" onPress={onPressRecursos} isActive={active === 'recursos'} />
    </View>
  );
}
