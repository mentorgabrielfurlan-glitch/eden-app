import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { auth } from '../services/firebase';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getFriendlyErrorMessage = (code) => {
    const messages = {
      'auth/invalid-email': 'O endereço de e-mail não é válido.',
      'auth/user-not-found': 'Não encontramos uma conta com esse e-mail.',
      'auth/wrong-password': 'A senha informada está incorreta.',
      'auth/too-many-requests':
        'Detectamos muitas tentativas de login. Tente novamente mais tarde.',
    };

    return messages[code] || 'Não foi possível entrar. Verifique os dados e tente novamente.';
  };

  const handleLogin = async () => {
    if (loading) {
      return;
    }

    setErrorMessage('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome Back
      </Text>
      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        style={styles.input}
      />
      <TextInput
        label="Password"
        mode="outlined"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        style={styles.input}
      />
      <HelperText type="error" visible={Boolean(errorMessage)}>
        {errorMessage}
      </HelperText>
      <Button mode="contained" onPress={handleLogin} loading={loading} disabled={loading}>
        Login
      </Button>
      <Button onPress={() => navigation.navigate('Signup')} style={styles.link}>
        Create an account
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  link: {
    marginTop: 12,
  },
});

export default LoginScreen;
