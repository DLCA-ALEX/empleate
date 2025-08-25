import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '@/store/useStore';
import { signOut } from '@/services/auth';
import { colors, spacing, radius } from '@/theme';

export default function ProfileScreen() {
  const nav = useNavigation<any>();
  const user = useStore(s => s.user);
  const setUser = useStore(s => s.setUser);

  const logout = async () => {
    try {
      await signOut();
      setUser(null);               // limpia el store
      nav.replace('Login');        // vuelve al login
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo cerrar sesión');
    }
  };

  return (
    <View style={{ flex:1, justifyContent:'center', alignItems:'center', padding: spacing(2) }}>
      <Text style={{ marginBottom: spacing(2) }}>
        Sesión activa como {user?.email ?? user?.name}
      </Text>

      <TouchableOpacity
        onPress={logout}
        style={{
          backgroundColor: colors.accent,
          padding: spacing(1.5),
          borderRadius: radius.xl,
          marginTop: spacing(2)
        }}
      >
        <Text style={{ color:'white', fontWeight:'700' }}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
