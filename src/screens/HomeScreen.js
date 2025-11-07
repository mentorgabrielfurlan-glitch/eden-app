import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Home
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Você entrou com sucesso! Explore o aplicativo a partir daqui.
      </Text>
      <Button mode="contained" onPress={() => navigation.navigate('Profile')} style={styles.button}>
        Ir para o perfil
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  title: {
    marginBottom: 12,
  },
  subtitle: {
    textAlign: 'center',
    color: '#475569',
  },
  button: {
    marginTop: 24,
  },
});

export default HomeScreen;
