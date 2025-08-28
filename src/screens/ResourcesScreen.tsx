// src/screens/ResourcesScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import BrandHeader from '@/components/BrandHeader';
import { colors, fonts, spacing } from '@/theme';

const RESOURCES = [
  { title: 'Guía de Empleo', desc: 'Consejos prácticos para buscar trabajo.', url: 'https://example.com/empleo' },
  { title: 'Emprendimiento', desc: 'Recursos para iniciar tu proyecto.', url: 'https://example.com/emprender' },
  { title: 'Habilidades Blandas', desc: 'Comunicación, trabajo en equipo y más.', url: 'https://example.com/habilidades' },
];

export default function ResourcesScreen() {
  const open = async (url: string) => {
    try { await Linking.openURL(url); } catch {}
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BrandHeader />

      <View style={{ backgroundColor: colors.primary, paddingHorizontal: spacing(1.5), paddingVertical: spacing(1.25) }}>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Recursos</Text>
      </View>

      <View style={{ padding: spacing(1.5) }}>
        {RESOURCES.map(r => (
          <TouchableOpacity
            key={r.title}
            onPress={() => open(r.url)}
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: spacing(1.25),
              marginBottom: spacing(1),
              shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
            }}
          >
            <Text style={[fonts.p, { fontWeight: '700', marginBottom: 4 }]}>{r.title}</Text>
            <Text style={{ color: '#475569' }}>{r.desc}</Text>
            <Text style={{ color: colors.primary, marginTop: 6 }}>Abrir</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
