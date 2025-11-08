import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { DateTimePickerAndroid, AndroidNativeProps } from '@react-native-community/datetimepicker';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../navigation';
import { useAuth } from '../hooks/useAuth';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [birthTime, setBirthTime] = useState<Date | null>(null);
  const [plan, setPlan] = useState<'gratuito' | 'premium' | 'mentorado' | 'master'>('gratuito');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showDatePicker = (mode: AndroidNativeProps['mode']) => {
    DateTimePickerAndroid.open({
      mode,
      value: mode === 'time' ? birthTime ?? new Date() : birthDate ?? new Date(),
      onChange: (_, selectedDate) => {
        if (!selectedDate) return;
        if (mode === 'date') {
          setBirthDate(selectedDate);
        } else {
          setBirthTime(selectedDate);
        }
      },
    });
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      setError('Informe seu nome completo.');
      return false;
    }
    if (!emailRegex.test(email)) {
      setError('Informe um e-mail válido.');
      return false;
    }
    if (password.length < 8) {
      setError('A senha deve conter ao menos 8 caracteres.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim(),
        birthDate: birthDate ? birthDate.toISOString().split('T')[0] : undefined,
        birthTime: birthTime ? birthTime.toISOString().split('T')[1]?.slice(0, 5) : undefined,
        plan,
      });
      Alert.alert('Conta criada!', 'Bem-vinda(o)!');
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (signupError: any) {
      const message = signupError?.message ?? 'Não foi possível criar a conta.';
      setError(message);
      Alert.alert('Erro ao cadastrar', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Crie sua conta</Text>
        <TextInput
          label="Nome completo"
          value={fullName}
          onChangeText={setFullName}
          mode="outlined"
          style={styles.input}
        />
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
          label="Telefone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
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
        <View style={styles.row}>
          <Button mode="outlined" onPress={() => showDatePicker('date')} style={styles.rowButton}>
            {birthDate ? `Data: ${birthDate.toLocaleDateString()}` : 'Selecionar data de nascimento'}
          </Button>
          <Button mode="outlined" onPress={() => showDatePicker('time')} style={styles.rowButton}>
            {birthTime ? `Hora: ${birthTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Selecionar hora'}
          </Button>
        </View>
        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>Plano</Text>
          <Picker selectedValue={plan} onValueChange={(value) => setPlan(value)}>
            <Picker.Item label="Gratuito" value="gratuito" />
            <Picker.Item label="Premium" value="premium" />
            <Picker.Item label="Mentorado" value="mentorado" />
            <Picker.Item label="Master" value="master" />
          </Picker>
        </View>
        {error && <HelperText type="error">{error}</HelperText>}
        <Button mode="contained" onPress={handleSubmit} loading={loading} disabled={loading}>
          Criar conta
        </Button>
        <Button mode="text" onPress={() => navigation.navigate('Login')} style={styles.secondaryButton}>
          Já tenho uma conta
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 16,
    color: '#0F172A',
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rowButton: {
    flex: 1,
    marginRight: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: 8,
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingTop: 8,
    color: '#334155',
  },
  secondaryButton: {
    marginTop: 12,
  },
});

export default SignupScreen;
