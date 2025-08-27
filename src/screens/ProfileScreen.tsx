import React from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '@/store/useStore';
import { signOut } from '@/services/auth';
import { colors, spacing, radius } from '@/theme';

export default function ProfileScreen() {
  const nav = useNavigation<any>();
  const user = useStore(s => s.user);
  const setUser = useStore(s => s.setUser);

  const avatarUri =
    user?.avatar && user.avatar.startsWith('http') ? user.avatar : undefined;

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      nav.replace('Login');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo cerrar sesión');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing(2) }}>
      {/* Avatar */}
      <Image
        source={
          avatarUri
            ? { uri: avatarUri }
            : require('../../assets/profile/avatar-placeholder.png')
        }
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          marginBottom: spacing(2),
          backgroundColor: '#eee', // por si tarda en cargar
        }}
        resizeMode="cover"
        accessible
        accessibilityLabel="Foto de perfil"
        onError={() => console.log('Falló la carga del avatar')}
      />

      <Text style={{ marginBottom: spacing(2) }}>
        Sesión activa como <Text style={{color:"red"}}> {user?.email ?? user?.name ?? '—'}</Text>
      </Text>

      <TouchableOpacity
        onPress={logout}
        style={{
          backgroundColor: colors.accent,
          padding: spacing(1.5),
          borderRadius: radius.xl,
          marginTop: spacing(2),
        }}
      >
        <Text style={{ color: 'white', fontWeight: '700' }}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
