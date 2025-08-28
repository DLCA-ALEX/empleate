// src/screens/HistoryScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import BrandHeader from '@/components/BrandHeader';
import { colors, fonts, spacing } from '@/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// Opcional: si tienes un resolver id->contenido, puedes importarlo
// aquí solo mostramos id y %.
type Item = { id: string; pct: number };

export default function HistoryScreen() {
  const nav = useNavigation<any>();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const progKeys = keys.filter(k => k.startsWith('reading.progress:'));
        const kvs = await AsyncStorage.multiGet(progKeys);
        const rows = kvs.map(([k, v]) => ({
          id: k.replace('reading.progress:', ''),
          pct: Math.max(0, Math.min(100, Number(v || 0))),
        }))
        // muestra solo los que tengan avance > 0
        .filter(r => r.pct > 0)
        // ordena descendente por avance
        .sort((a, b) => b.pct - a.pct);

        setItems(rows);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BrandHeader />

      <View style={{ backgroundColor: colors.primary, paddingHorizontal: spacing(1.5), paddingVertical: spacing(1.25) }}>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Historial</Text>
      </View>

      {loading ? (
        <Text style={{ padding: spacing(1.5) }}>Cargando…</Text>
      ) : items.length === 0 ? (
        <View style={{ padding: spacing(1.5) }}>
          <Text style={fonts.h2}>Sin lecturas aún</Text>
          <Text style={{ color: '#6b7280', marginTop: 6 }}>
            Cuando avances en un libro, aparecerá aquí con su porcentaje.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ padding: spacing(1.5) }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => nav.navigate('Search', { q: item.id })} // o navega a tu detalle si puedes resolver el id->content
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                padding: spacing(1.25),
                marginBottom: spacing(1),
                shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
              }}
            >
              <Text style={[fonts.p, { fontWeight: '700', marginBottom: 4 }]}>
                {item.id}
              </Text>
              <Text style={{ color: colors.primary }}>{item.pct}% leído</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
