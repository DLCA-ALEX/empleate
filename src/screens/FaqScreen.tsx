// src/screens/FaqScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager, TextInput } from 'react-native';
import BrandHeader from '@/components/BrandHeader';
import { colors, fonts, spacing } from '@/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DATA = [
  { q: '¿Quiénes somos?', a: 'Somos EmpleaT. Aquí puedes aprender, explorar recursos y guardar tus favoritos.' },
  { q: '¿Qué hacemos?', a: 'Facilitamos el acceso a contenido formativo y de desarrollo personal.' },
  { q: '¿Por qué es gratis?', a: 'Porque creemos en ampliar oportunidades de aprendizaje.' },
  { q: '¿Qué es el proyecto EmpleaT?', a: 'Una plataforma con recursos y libros para impulsar el crecimiento.' },
  { q: '¿Qué es plan internacional?', a: 'Iniciativas y alianzas para llegar a más personas.' },
];

export default function FaqScreen() {
  const [open, setOpen] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  const toggle = (i: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(open === i ? null : i);
  };

  const filtered = DATA.filter(x =>
    x.q.toLowerCase().includes(query.toLowerCase()) ||
    x.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <BrandHeader />

      <View style={{ backgroundColor: colors.primary, paddingHorizontal: spacing(1.5), paddingVertical: spacing(1.25) }}>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Preguntas Frecuentes</Text>
      </View>

      <View style={{ padding: spacing(1.5) }}>
        <View style={{ backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: spacing(1) }}>
          <TextInput
            placeholder="Consulta cualquier duda…"
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            style={{ paddingVertical: 8 }}
          />
        </View>

        {filtered.map((item, i) => {
          const isOpen = open === i;
          return (
            <View key={item.q} style={{ backgroundColor: 'white', borderRadius: 12, marginBottom: spacing(1) }}>
              <TouchableOpacity
                onPress={() => toggle(i)}
                style={{ paddingHorizontal: 14, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text style={[fonts.p, { fontWeight: '700' }]}>{item.q}</Text>
                <Text style={{ color: colors.primary }}>{isOpen ? '▴' : '▾'}</Text>
              </TouchableOpacity>
              {isOpen && (
                <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
                  <Text style={{ color: '#475569' }}>{item.a}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
