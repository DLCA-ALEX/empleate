// FavoritesScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { spacing, colors, fonts } from '@/theme';
import ContentCard from '@/components/ContentCard';
import { wpApi, PUBLIC_ORIGIN } from '@/services/wpApi';
import { getToken } from '@/services/auth';

// --- helpers de URL ---
function isNgrokHost(u: string) {
  try { return /\.ngrok-.*\.app$/i.test(new URL(u).hostname); } catch { return false; }
}
function addNgrokBypass(u?: string) {
  if (!u) return u;
  try {
    const url = new URL(u);
    if (isNgrokHost(u) && !url.searchParams.has('ngrok-skip-browser-warning')) {
      url.searchParams.set('ngrok-skip-browser-warning', 'true');
    }
    return url.toString();
  } catch { return u; }
}
/** Corrige URLs absolutas con host `localhost` para que usen el host real del WP público */
function fixHost(u?: string): string | undefined {
  if (!u) return undefined;
  try {
    const real = new URL(PUBLIC_ORIGIN);      // p.ej. https://ef0e....ngrok-free.app/biblioteca-plan
    const inUrl = new URL(u);
    if (inUrl.hostname === 'localhost') {
      inUrl.protocol = real.protocol;
      inUrl.host = real.host;                 // host + port
      // mantenemos pathname y query del recurso
      return inUrl.toString();
    }
    return u;
  } catch {
    // si era relativa, la hacemos absoluta contra PUBLIC_ORIGIN
    try { return new URL(u, PUBLIC_ORIGIN).toString(); } catch { return u; }
  }
}

// --- tipos "display" para tu Card ---
type CardItem = {
  id: string;
  title?: string;
  author?: string;
  thumbnailUrl?: string;
  fileUrl?: string;
  externalUrl?: string;
  type?: string;
};

// Normaliza item de favoritos (WP raw) o de biblioteca (plano)
function normalizeToCard(it: any): CardItem {
  const titulo = it?.titulo ?? it?.title?.rendered ?? '';
  const autor  = it?.autor ?? it?.acf?.autor;
  const portada = it?.portada ?? it?.acf?.portada;
  const archivo = it?.archivo_pdf ?? it?.acf?.archivo_pdf; // puede venir false

  return {
    id: String(it?.id ?? ''),
    title: titulo || undefined,
    author: autor || undefined,
    thumbnailUrl: addNgrokBypass(fixHost(portada)),
    fileUrl: archivo && archivo !== false ? addNgrokBypass(fixHost(String(archivo))) : undefined,
    externalUrl: undefined,
    type: undefined,
  };
}

export default function FavoritesScreen() {
  const nav = useNavigation<any>();
  const [items, setItems] = useState<CardItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const token = await getToken();
        if (!token) {
          setErr('Necesitas iniciar sesión para ver tus favoritos.');
          setItems([]);
          return;
        }

        // 1) favoritos (WP raw)
        const favs = await wpApi.getFavorites(token);   // devuelve posts con title.rendered y acf.*
        const favCards = (favs || []).map(normalizeToCard);

        // (opcional) Si quieres mezclar con el catálogo plano:
        // const catalog = await wpApi.listLibros();
        // const catCards = (catalog || []).map(normalizeToCard);
        // setItems([...favCards, ...catCards]);

        setItems(favCards);
        console.log('👉 favoritos normalizados =', favCards);
      } catch (e: any) {
        console.warn('[favorites] error', e);
        setErr(e?.message ?? 'No se pudieron cargar tus favoritos');
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const data = useMemo(() => items ?? [], [items]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingHorizontal: spacing(1.5), paddingTop: spacing(1.5) }}>
        <Text style={fonts.h2}>Secciones</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing(1) }} contentContainerStyle={{ paddingRight: spacing(1.5) }}>
          {['Empleo','Emprendimiento','Participación','Desarrollo'].map((t, i) => (
            <View key={t}
              style={{ backgroundColor: i === 1 ? colors.accent : colors.chip,
                       paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginRight: 8 }}>
              <Text style={{ color: i === 1 ? 'white' : colors.text }}>{t}</Text>
            </View>
          ))}
        </ScrollView>
        <Text style={{ ...fonts.h2, marginTop: spacing(2) }}>Categoría</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing(1) }}>
          {['Audio','Video','Libros','Manuales','Guías','Cursos','Investigación'].map((t, i) => (
            <View key={t}
              style={{ borderWidth: 1, borderColor: colors.accent, borderRadius: 999,
                       paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8,
                       backgroundColor: i === 2 ? colors.accent : 'transparent' }}>
              <Text style={{ color: i === 2 ? 'white' : colors.accent }}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent:'center', alignItems:'center' }}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 8 }}>Cargando favoritos…</Text>
        </View>
      ) : err ? (
        <View style={{ padding: spacing(2) }}>
          <Text style={{ color: '#B91C1C' }}>⚠️ {err}</Text>
          <TouchableOpacity onPress={() => nav.navigate('Login')}>
            <Text style={{ color: colors.accent, marginTop: 8 }}>Ir a iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ paddingHorizontal: spacing(1.5), paddingTop: spacing(1), paddingBottom: spacing(2) }}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing(1) }}
          ItemSeparatorComponent={() => <View style={{ height: spacing(1) }} />}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <ContentCard
                item={item}
                onPress={() => nav.navigate('Detail', { id: item.id, content: item })}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={{ padding: spacing(2) }}>
              <Text style={fonts.small}>No tienes favoritos aún.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
