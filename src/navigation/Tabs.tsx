import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';

import HistoryScreen from '@/screens/HistoryScreen';
import FavoritesScreen from '@/screens/FavoritesScreen';
import HomeScreen from '@/screens/HomeScreen';       // ← tu Home existente
import FaqScreen from '@/screens/FaqScreen';
import ResourcesScreen from '@/screens/ResourcesScreen';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator
      initialRouteName="Inicio"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1E4DD8',
        tabBarInactiveTintColor: '#9aa3af',
        tabBarStyle: { height: 64, paddingBottom: 10, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            Historial: 'library-outline',
            Favoritos: 'star-outline',
            Inicio: 'home-outline',
            Preguntas: 'help-circle-outline',
            Recursos: 'book-outline',
          };
          return <Ionicons name={iconMap[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Historial" component={HistoryScreen} />
      <Tab.Screen name="Favoritos" component={FavoritesScreen} />
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Preguntas" component={FaqScreen} />
      <Tab.Screen name="Recursos" component={ResourcesScreen} />
    </Tab.Navigator>
  );
}
