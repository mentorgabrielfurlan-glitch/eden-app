import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation';

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80' }}
      style={styles.container}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Bem-vindo ao Eden</Text>
        <Text style={styles.subtitle}>
          Sua jornada de bem-estar começa aqui. Conecte corpo, mente e propósito com rotinas guiadas.
        </Text>
        <Button mode="contained" onPress={() => navigation.navigate('Signup')} style={styles.button}>
          Criar conta
        </Button>
        <Button mode="outlined" onPress={() => navigation.navigate('Login')} textColor="#fff">
          Já tenho conta
        </Button>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    marginBottom: 32,
  },
  button: {
    marginBottom: 12,
  },
});

export default WelcomeScreen;
