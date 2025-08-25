import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, ScrollView
} from 'react-native';
import { colors, spacing, radius, fonts } from '@/theme';
import { signUpWithEmail } from '@/services/auth';
import { useNavigation } from '@react-navigation/native';

export default function RegisterScreen() {
  const nav = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!email || !password) {
      Alert.alert('Datos incompletos', 'Ingresa correo y contraseña.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Contraseñas no coinciden', 'Verifica la confirmación.');
      return;
    }
    try {
      setLoading(true);
      await signUpWithEmail(email.trim(), password);
      Alert.alert('Cuenta creada', 'Revisa tu correo para confirmar la cuenta.');
      nav.replace('Login');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center', padding: spacing(2) }}>
      <Text style={[fonts.h1, { marginBottom: spacing(2) }]}>Crear cuenta</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Correo electrónico"
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderBottomWidth: 1, marginBottom: spacing(2), padding: 8 }}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Contraseña"
        secureTextEntry
        style={{ borderBottomWidth: 1, marginBottom: spacing(2), padding: 8 }}
      />
      <TextInput
        value={confirm}
        onChangeText={setConfirm}
        placeholder="Repite contraseña"
        secureTextEntry
        style={{ borderBottomWidth: 1, marginBottom: spacing(2), padding: 8 }}
      />

      <TouchableOpacity
        onPress={onRegister}
        disabled={loading}
        style={{
          backgroundColor: colors.accent,
          padding: spacing(1.5),
          borderRadius: radius.xl,
          marginTop: spacing(2)
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>
          {loading ? 'Creando…' : 'Registrarme'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => nav.goBack()}
        style={{ marginTop: spacing(2) }}
      >
        <Text style={{ textAlign: 'center', color: colors.text }}>
          ¿Ya tienes cuenta? Inicia sesión
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
