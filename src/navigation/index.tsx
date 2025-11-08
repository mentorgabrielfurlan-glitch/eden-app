import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignupScreen from '../screens/SignupScreen';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import MeditationListScreen from '../screens/MeditationListScreen';
import BreathingListScreen from '../screens/BreathingListScreen';
import CoursePlayerScreen from '../screens/CoursePlayerScreen';
import MandalaScreen from '../screens/MandalaScreen';
import JourneyScreen from '../screens/JourneyScreen';
import SessionBookingScreen from '../screens/SessionBookingScreen';
import SessionHistoryScreen from '../screens/SessionHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import PlayerScreen from '../screens/PlayerScreen';
import AdminUploadScreen from '../screens/AdminUploadScreen';
import { Course } from '../types/models';

export type RootStackParamList = {
  Auth: undefined;
  AppTabs: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Signup: undefined;
  Login: undefined;
  ForgotPassword: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  MeditationList: undefined;
  BreathingList: undefined;
  CoursePlayer: { courseId?: string; course?: Course } | undefined;
  Mandala: undefined;
  Player: { contentId: string; audioUrl: string; title: string; duration?: number };
  AdminUpload: undefined;
};

export type JourneyStackParamList = {
  Journey: undefined;
  Mandala: undefined;
};

export type SessionsStackParamList = {
  SessionBooking: undefined;
  SessionHistory: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  Payments: undefined;
};

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const JourneyStack = createStackNavigator<JourneyStackParamList>();
const SessionsStack = createStackNavigator<SessionsStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const Tabs = createBottomTabNavigator();

const AuthStackNavigator: React.FC = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="Signup" component={SignupScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </AuthStack.Navigator>
);

const HomeStackNavigator: React.FC = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen
      name="Home"
      component={HomeScreen}
      options={{ headerShown: false }}
    />
    <HomeStack.Screen
      name="MeditationList"
      component={MeditationListScreen}
      options={{ title: 'Meditações' }}
    />
    <HomeStack.Screen
      name="BreathingList"
      component={BreathingListScreen}
      options={{ title: 'Respirações' }}
    />
    <HomeStack.Screen
      name="CoursePlayer"
      component={CoursePlayerScreen}
      options={{ headerShown: false }}
    />
    <HomeStack.Screen
      name="Mandala"
      component={MandalaScreen}
      options={{ title: 'Mandala' }}
    />
    <HomeStack.Screen
      name="Player"
      component={PlayerScreen}
      options={{ headerShown: false }}
    />
    <HomeStack.Screen
      name="AdminUpload"
      component={AdminUploadScreen}
      options={{ title: 'Upload (Admin)' }}
    />
  </HomeStack.Navigator>
);

const JourneyStackNavigator: React.FC = () => (
  <JourneyStack.Navigator>
    <JourneyStack.Screen
      name="Journey"
      component={JourneyScreen}
      options={{ title: 'Jornada' }}
    />
    <JourneyStack.Screen name="Mandala" component={MandalaScreen} options={{ title: 'Mandala' }} />
  </JourneyStack.Navigator>
);

const SessionsStackNavigator: React.FC = () => (
  <SessionsStack.Navigator>
    <SessionsStack.Screen
      name="SessionBooking"
      component={SessionBookingScreen}
      options={{ title: 'Agendar Sessão' }}
    />
    <SessionsStack.Screen
      name="SessionHistory"
      component={SessionHistoryScreen}
      options={{ title: 'Histórico' }}
    />
  </SessionsStack.Navigator>
);

const ProfileStackNavigator: React.FC = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    <ProfileStack.Screen name="Payments" component={PaymentsScreen} options={{ title: 'Pagamentos' }} />
  </ProfileStack.Navigator>
);

const AppTabsNavigator: React.FC = () => {
  const theme = useTheme();
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
      }}
    >
      <Tabs.Screen name="HomeStack" component={HomeStackNavigator} options={{ title: 'Início' }} />
      <Tabs.Screen
        name="JourneyStack"
        component={JourneyStackNavigator}
        options={{ title: 'Jornada' }}
      />
      <Tabs.Screen
        name="SessionsStack"
        component={SessionsStackNavigator}
        options={{ title: 'Sessões' }}
      />
      <Tabs.Screen
        name="ProfileStack"
        component={ProfileStackNavigator}
        options={{ title: 'Perfil' }}
      />
    </Tabs.Navigator>
  );
};

const RootNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <RootStack.Screen name="AppTabs" component={AppTabsNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthStackNavigator} />
      )}
    </RootStack.Navigator>
  );
};

export default RootNavigator;
