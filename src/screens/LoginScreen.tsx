import React, { useState } from 'react';
import {
  View, ImageBackground, Image, Text, TextInput,
  TouchableOpacity, ScrollView, Alert, Pressable
} from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import { useStore } from '@/store/useStore';
import { signInWithEmail, signUpWithEmail } from '@/services/auth';

export default function LoginScreen() {
  const nav = useNavigation<any>();
  const setUser = useStore(s => s.setUser);
  const policyAccepted = useStore(s => s.policyAccepted);
  const setPolicyAccepted = useStore(s => s.setPolicyAccepted);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const requirePolicy = () => {
    if (!policyAccepted) {
      Alert.alert('Aviso', 'Debes aceptar la política de tratamiento de la información.');
      return true;
    }
    return false;
  };

  const afterAuth = () => nav.replace('Home');

  const onLogin = async () => {
    if (requirePolicy()) return;
    try {
      setLoading(true);
      await signInWithEmail(email.trim(), password);
      afterAuth();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async () => {
    if (requirePolicy()) return;
    try {
      setLoading(true);
      await signUpWithEmail(email.trim(), password);
      Alert.alert('Cuenta creada', 'Si la confirmación por correo está activa, revisa tu bandeja.');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const continueAsGuest = () => {
    if (requirePolicy()) return;
    setUser({ id: 'guest-' + Date.now(), name: 'Invitado', provider: 'guest' as const });
    afterAuth();
  };

  // Botones sociales deshabilitados (placeholder)
  const onGoogle = () => {
    if (requirePolicy()) return;
    Alert.alert('Próximamente', 'Inicio de sesión con Google se habilitará más tarde.');
  };
  const onFacebook = () => {
    if (requirePolicy()) return;
    Alert.alert('Próximamente', 'Inicio de sesión con Facebook se habilitará más tarde.');
  };

  const disabled = !policyAccepted || loading;
  const disabledStyle = disabled ? { opacity: 0.6 } : undefined;

  return (
    <ImageBackground source={require('../../assets/onboarding/slide1.jpg')} style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: 'rgba(30,77,216,0.84)', padding: spacing(2), justifyContent: 'space-between' }}>
        <ScrollView contentContainerStyle={{ paddingTop: spacing(2) }}>
          <Image
            source={require('../../assets/branding/logo-empleat-white.png')}
            style={{ width: 220, height: 60, resizeMode: 'contain', alignSelf: 'center', marginBottom: spacing(3) }}
          />

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="E-mail"
            placeholderTextColor="rgba(255,255,255,0.9)"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ color: 'white', borderBottomWidth: 1, borderBottomColor: 'white', marginBottom: spacing(2), paddingVertical: 6 }}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña"
            placeholderTextColor="rgba(255,255,255,0.9)"
            secureTextEntry
            style={{ color: 'white', borderBottomWidth: 1, borderBottomColor: 'white', paddingVertical: 6 }}
          />
          <Text style={{ color: 'white', textAlign: 'right', marginTop: 6 }}>¿Olvidaste tu contraseña?</Text>

          {/* Ingresar */}
          <TouchableOpacity
            disabled={disabled}
            onPress={onLogin}
            style={[{ backgroundColor: colors.accent, padding: spacing(1.5), borderRadius: radius.xl, marginTop: spacing(2) }, disabledStyle]}
          >
            <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center' }}>
              {loading ? 'Ingresando…' : 'Ingresar'}
            </Text>
          </TouchableOpacity>

          {/* Crear cuenta */}
          <TouchableOpacity onPress={() => nav.navigate('Register')}>
            <Text style={{ color: 'white', textAlign: 'center', marginTop: spacing(2) }}>
              ¿No tienes cuenta? Crea una aquí
            </Text>
          </TouchableOpacity>
          {/* Invitado */}
          <TouchableOpacity
            disabled={disabled}
            onPress={continueAsGuest}
            style={[{ backgroundColor: 'white', padding: spacing(1.5), borderRadius: radius.xl, marginTop: spacing(1) }, disabledStyle]}
          >
            <Text style={{ color: colors.text, fontWeight: '700', textAlign: 'center' }}>Omitir</Text>
          </TouchableOpacity>

          {/* Google (placeholder) */}
          <TouchableOpacity
            disabled={!policyAccepted}
            onPress={onGoogle}
            style={[{ backgroundColor: 'white', padding: spacing(1.5), borderRadius: radius.xl, marginTop: spacing(2), flexDirection: 'row', justifyContent: 'center' }, !policyAccepted ? { opacity: 0.6 } : undefined]}
          >
            <Text style={{ color: colors.text, fontWeight: '700' }}>Conectar con Google</Text>
          </TouchableOpacity>

          {/* Facebook (placeholder) */}
          <TouchableOpacity
            disabled={!policyAccepted}
            onPress={onFacebook}
            style={[{ backgroundColor: 'white', padding: spacing(1.5), borderRadius: radius.xl, marginTop: spacing(1), flexDirection: 'row', justifyContent: 'center' }, !policyAccepted ? { opacity: 0.6 } : undefined]}
          >
            <Text style={{ color: colors.text, fontWeight: '700' }}>Conectar con Facebook</Text>
          </TouchableOpacity>

          {/* Aceptación de política (checkbox visual) */}
          <Pressable
            onPress={() => setPolicyAccepted(!policyAccepted)}
            hitSlop={10}
            style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing(2) }}
          >
            <View style={{
              width: 22, height: 22, borderWidth: 2, borderColor: 'white', borderRadius: 6,
              marginRight: 10, alignItems: 'center', justifyContent: 'center',
              backgroundColor: policyAccepted ? 'white' : 'transparent'
            }}>
              {policyAccepted && <Text style={{ color: colors.text, fontWeight: '900' }}>✓</Text>}
            </View>
            <Text style={{ color: 'white', flex: 1 }}>
              Autorizo y acepto la política de tratamiento de la información.
            </Text>
          </Pressable>
        </ScrollView>

        <Image
          source={require('../../assets/branding/header-logos.png')}
          style={{ width: '100%', height: 32, resizeMode: 'contain', alignSelf: 'center' }}
        />
      </View>
    </ImageBackground>
  );
}
