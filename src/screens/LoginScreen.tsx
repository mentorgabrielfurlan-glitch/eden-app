import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation';
import { useAuth } from '../hooks/useAuth';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Informe e-mail e senha.');
      return;
    }

    try {
      setLoading(true);
      await signIn(email.trim(), password);
      setError(null);
    } catch (loginError: any) {
      const message = loginError?.message ?? 'Não foi possível entrar.';
      setError(message);
      Alert.alert('Falha no login', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <View style={styles.content}>
        <Text style={styles.title}>Entre na sua conta</Text>
        <TextInput
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          mode="outlined"
          style={styles.input}
        />
        {error && <HelperText type="error">{error}</HelperText>}
        <Button mode="contained" onPress={handleLogin} loading={loading} disabled={loading}>
          Entrar
        </Button>
        <Button mode="text" onPress={() => navigation.navigate('ForgotPassword')} style={styles.secondaryButton}>
          Esqueci minha senha
        </Button>
        <Button mode="text" onPress={() => navigation.navigate('Signup')}>
          Criar nova conta
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
  },
  content: {
    marginHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 24,
    color: '#0F172A',
  },
  input: {
    marginBottom: 16,
  },
  secondaryButton: {
    marginTop: 12,
  },
});

export default LoginScreen;
