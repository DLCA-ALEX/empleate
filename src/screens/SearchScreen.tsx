import React, { useMemo, useState } from 'react';
import { View, TextInput, FlatList, Text } from 'react-native';
import ContentCard from '@/components/ContentCard';
import { useStore } from '@/store/useStore';
import { useNavigation } from '@react-navigation/native';

export default function SearchScreen() {
  const [q, setQ] = useState('');
  const nav = useNavigation<any>();
  const catalog = useStore(s => s.catalog);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return catalog;
    return catalog.filter(c =>
      c.title.toLowerCase().includes(s) ||
      (c.description || '').toLowerCase().includes(s) ||
      (c.tags||[]).some(t => t.toLowerCase().includes(s)) ||
      (c.topics||[]).some(t => t.toLowerCase().includes(s))
    );
  }, [q, catalog]);

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        placeholder="Buscar por título, etiqueta o tema"
        value={q}
        onChangeText={setQ}
        style={{ margin: 12, padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 }}
      />
      <FlatList
        data={results}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <ContentCard item={item} onPress={() => nav.navigate('Detail', { id: item.id })} />}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>Sin resultados</Text>}
      />
    </View>
  );
}
