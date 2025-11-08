import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MeditationsListScreen from '../screens/MeditationsListScreen';
import MeditationPlayerScreen from '../screens/MeditationPlayerScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
    <Stack.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
    <Stack.Screen
      name="Meditations"
      component={MeditationsListScreen}
      options={{ title: 'Meditações' }}
    />
    <Stack.Screen
      name="MeditationPlayer"
      component={MeditationPlayerScreen}
      options={({ route }) => ({
        title:
          route?.params?.title ??
          route?.params?.meditation?.title ??
          'Player de Meditação',
      })}
    />
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
  </Stack.Navigator>
);

export default AuthNavigator;
