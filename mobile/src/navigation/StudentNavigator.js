import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import StudentDashboardScreen from '../screens/student/StudentDashboardScreen';
import WorkoutScreen from '../screens/student/WorkoutScreen';
import ExerciseCatalogScreen from '../screens/student/ExerciseCatalogScreen';
import EvolutionScreen from '../screens/student/EvolutionScreen';
import PaymentsScreen from '../screens/student/PaymentsScreen';
import GymPassScreen from '../screens/student/GymPassScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function StudentHomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentDashboard" component={StudentDashboardScreen} />
      <Stack.Screen name="GymPass" component={GymPassScreen} />
    </Stack.Navigator>
  );
}

export default function StudentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700'
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Início') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Treino') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'Catálogo') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'Evolução') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Financeiro') {
            iconName = focused ? 'card' : 'card-outline';
          }

          return <Ionicons name={iconName} size={20} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Início" component={StudentHomeStack} />
      <Tab.Screen name="Treino" component={WorkoutScreen} />
      <Tab.Screen name="Catálogo" component={ExerciseCatalogScreen} />
      <Tab.Screen name="Evolução" component={EvolutionScreen} />
      <Tab.Screen name="Financeiro" component={PaymentsScreen} />
    </Tab.Navigator>
  );
}
