import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useAppInit from './src/hooks/useAppInit';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import DetailScreen from './src/screens/DetailScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import UploadScreen from './src/screens/UploadScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import BibliotecaScreen from './src/screens/BibliotecaScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import FaqScreen from './src/screens/FaqScreen';
import ResourcesScreen from './src/screens/ResourcesScreen';
export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Home: undefined;
  Biblioteca: undefined;  // 👈
  Search: undefined;
  Detail: { id: string };
  Favorites: undefined;
  Upload: undefined;
  Profile: undefined;
  Category: undefined;
  Register: undefined;           // 👈 agrega esto

};

const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient();

export default function App() {
  useAppInit();

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer theme={DefaultTheme}>
          <StatusBar barStyle="dark-content" />
          {/* SIN espacios extra */}
          <Stack.Navigator initialRouteName="Onboarding">
            {/* CADA nombre, UNA sola vez */}
            <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Buscar' }} />
            <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Detalle' }} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoritos' }} />
            <Stack.Screen name="Upload" component={UploadScreen} options={{ title: 'Contribuir' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
            <Stack.Screen name="Category" component={CategoryScreen} options={{ title: 'Categoría' }} />
            <Stack.Screen name="Biblioteca" component={BibliotecaScreen} options={{ title: 'Biblioteca (WP)' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registro' }} />
            <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historial' }} />
            <Stack.Screen name="FAQ" component={FaqScreen} options={{ title: 'FAQ' }} />
            <Stack.Screen name="Resources" component={ResourcesScreen} options={{ title: 'Recursos' }} />


          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
