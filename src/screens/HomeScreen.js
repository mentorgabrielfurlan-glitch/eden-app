import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

const HomeScreen = () => (
  <View style={styles.container}>
    <Text variant="headlineMedium" style={styles.title}>
      Home
    </Text>
    <Text variant="bodyLarge" style={styles.subtitle}>
      Você entrou com sucesso! Explore o aplicativo a partir daqui.
    </Text>
  </View>
);

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
});

export default HomeScreen;
