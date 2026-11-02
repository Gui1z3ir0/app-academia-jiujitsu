import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterStudentScreen from '../screens/auth/RegisterStudentScreen';
import RegisterOwnerScreen from '../screens/auth/RegisterOwnerScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RegisterStudent" component={RegisterStudentScreen} />
      <Stack.Screen name="RegisterOwner" component={RegisterOwnerScreen} />
    </Stack.Navigator>
  );
}
