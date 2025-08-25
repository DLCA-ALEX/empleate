import React, { useState } from 'react';
import { View, ImageBackground, Text, TouchableOpacity } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { useNavigation } from '@react-navigation/native';

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const nav = useNavigation<any>();
  const slides = [
    { img: require('../../assets/onboarding/slide1.jpg'),
      title: 'Bienvenido A Tu Nueva\nBiblioteca Digital',
      desc: 'Descubre libros, videos y recursos gratuitos\npara crecer personal y profesionalmente.' },
    { img: require('../../assets/onboarding/slide2.jpg'),
      title: 'Aprende a tu ritmo', desc: 'Guarda favoritos y continúa donde te quedaste.' },
    { img: require('../../assets/onboarding/slide3.jpg'),
      title: 'Todo sin conexión', desc: 'Descarga contenidos y úsalo offline.' },
  ];

  const s = slides[step];
  const next = () => (step < slides.length - 1 ? setStep(step + 1) : nav.replace('Login'));

  return (
    <ImageBackground source={s.img} style={{ flex: 1, justifyContent: 'flex-end' }}>
      <View style={{ backgroundColor: colors.primary, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing(2) }}>
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 18, textAlign: 'center', marginBottom: spacing(1) }}>
          {s.title}
        </Text>
        <Text style={{ color: 'white', opacity: 0.85, textAlign: 'center', marginBottom: spacing(2) }}>
          {s.desc}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => nav.replace('Login')}>
            <Text style={{ color: 'white' }}>Skip</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row' }}>
            {slides.map((_, i) => (
              <View key={i} style={{
                width: 8, height: 8, borderRadius: 4, marginHorizontal: 4,
                backgroundColor: i === step ? 'white' : 'rgba(255,255,255,0.4)'
              }}/>
            ))}
          </View>
          <TouchableOpacity onPress={next}>
            <Text style={{ color: 'white' }}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}
