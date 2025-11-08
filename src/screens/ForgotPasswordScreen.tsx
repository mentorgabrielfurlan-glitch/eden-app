import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';

const ForgotPasswordScreen: React.FC = () => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Informe seu e-mail.');
      return;
    }

    try {
      setLoading(true);
      await sendPasswordReset(email.trim());
      setError(null);
      Alert.alert('E-mail enviado', 'Confira sua caixa de entrada para redefinir a senha.');
    } catch (resetError: any) {
      const message = resetError?.message ?? 'Não foi possível enviar o e-mail.';
      setError(message);
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar senha</Text>
      <TextInput
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        mode="outlined"
        style={styles.input}
      />
      {error && <HelperText type="error">{error}</HelperText>}
      <Button mode="contained" onPress={handleSubmit} loading={loading} disabled={loading}>
        Enviar link
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
});

export default ForgotPasswordScreen;
