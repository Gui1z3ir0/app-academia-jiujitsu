import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import StudentManagerScreen from '../screens/admin/StudentManagerScreen';
import WorkoutBuilderScreen from '../screens/admin/WorkoutBuilderScreen';
import FinancialScreen from '../screens/admin/FinancialScreen';
import GymConfigScreen from '../screens/admin/GymConfigScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AdminHomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="StudentManager" component={StudentManagerScreen} />
      <Stack.Screen name="WorkoutBuilder" component={WorkoutBuilderScreen} />
      <Stack.Screen name="Financial" component={FinancialScreen} />
      <Stack.Screen name="GymConfig" component={GymConfigScreen} />
    </Stack.Navigator>
  );
}

export default function AdminNavigator() {
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

          if (route.name === 'Painel') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'Alunos') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Treinos') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'Financeiro') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'Ajustes') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={20} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Painel" component={AdminHomeStack} />
      <Tab.Screen name="Alunos" component={StudentManagerScreen} />
      <Tab.Screen name="Treinos" component={WorkoutBuilderScreen} />
      <Tab.Screen name="Financeiro" component={FinancialScreen} />
      <Tab.Screen name="Ajustes" component={GymConfigScreen} />
    </Tab.Navigator>
  );
}
