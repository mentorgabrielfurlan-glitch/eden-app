import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { requestPasswordReset } from '../services/authService';

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const getFriendlyErrorMessage = (code) => {
    const messages = {
      'auth/invalid-email': 'O endereço de e-mail não é válido.',
      'auth/user-not-found': 'Não encontramos uma conta com esse e-mail.',
      'auth/too-many-requests':
        'Detectamos muitas tentativas. Tente novamente mais tarde.',
      'local/user-not-found': 'Não encontramos uma conta com esse e-mail.',
    };

    return messages[code] || 'Não foi possível enviar o e-mail. Tente novamente.';
  };

  const handlePasswordReset = async () => {
    if (loading) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const response = await requestPasswordReset(email);
      if (response.origin === 'local') {
        setSuccessMessage(
          `Modo offline: definimos uma senha temporária (${response.temporaryPassword}) para que você possa entrar novamente.`
        );
      } else {
        setSuccessMessage('Enviamos um link para redefinição de senha para o seu e-mail.');
      }
    } catch (error) {
      setErrorMessage(getFriendlyErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Recuperar senha
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
      <HelperText type="error" visible={Boolean(errorMessage)}>
        {errorMessage}
      </HelperText>
      <HelperText type="info" visible={Boolean(successMessage)}>
        {successMessage}
      </HelperText>
      <Button
        mode="contained"
        onPress={handlePasswordReset}
        loading={loading}
        disabled={loading}
      >
        Enviar e-mail
      </Button>
      <Button onPress={() => navigation.navigate('Login')} style={styles.link}>
        Voltar ao login
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

export default ForgotPasswordScreen;
