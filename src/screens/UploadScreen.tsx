import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ContributionPayload } from '@/utils/types';
import { enqueue } from '@/services/syncQueue';

export default function UploadScreen() {
  const [payload, setPayload] = useState<ContributionPayload>({
    title: '',
    description: '',
    type: 'PDF',
    topics: [],
    tags: [],
    language: 'ES'
  });
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
    if (res.canceled) return;
    setFile(res.assets[0]);
  };

  const submit = async () => {
    try {
      await enqueue({
        type: 'CONTRIBUTE',
        payload: { ...payload, fileUrl: file?.uri }
      });
      Alert.alert('En cola', 'Tu contenido se enviará cuando haya conexión.');
      setPayload({ title: '', description: '', type: 'PDF', language: 'ES', topics: [], tags: [] });
      setFile(null);
    } catch (e) {
      Alert.alert('Error', String(e));
    }
  };

  const set = (k: keyof ContributionPayload, v: any) => setPayload(p => ({ ...p, [k]: v }));

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontWeight: '700', fontSize: 18, marginBottom: 8 }}>Contribuir contenido</Text>
      <TextInput placeholder="Título" value={payload.title} onChangeText={t => set('title', t)}
        style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 }} />
      <TextInput placeholder="Descripción" value={payload.description} onChangeText={t => set('description', t)}
        style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 }} />
      <TextInput placeholder="Etiquetas (separadas por coma)" onChangeText={t => set('tags', t.split(',').map(s => s.trim()))}
        style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 }} />
      <TouchableOpacity onPress={pickFile} style={{ backgroundColor: '#e5e7eb', padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <Text>{file ? `Archivo: ${file.name}` : 'Seleccionar archivo'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={submit} style={{ backgroundColor: '#16a34a', padding: 12, borderRadius: 8 }}>
        <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center' }}>Enviar</Text>
      </TouchableOpacity>
    </View>
  );
}
