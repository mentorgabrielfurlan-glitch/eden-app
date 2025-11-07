import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Button, HelperText, Snackbar, Text, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker'; // eslint-disable-line import/no-unresolved
import { Picker } from '@react-native-picker/picker'; // eslint-disable-line import/no-unresolved
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';

import { auth, db } from '../services/firebase';

const plans = [
  { label: 'Gratuito', value: 'gratuito' },
  { label: 'Premium', value: 'premium' },
  { label: 'Mentorado', value: 'mentorado' },
  { label: 'Master', value: 'master' },
];

const formatDate = (date) =>
  date
    ? date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';

const formatTime = (time) =>
  time
    ? time.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

const SignupScreen = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState(null);
  const [birthTime, setBirthTime] = useState(null);
  const [plan, setPlan] = useState('gratuito');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', isError: false });

  const combinedBirthDateTime = useMemo(() => {
    if (!birthDate || !birthTime) {
      return null;
    }

    const combined = new Date(birthDate);
    combined.setHours(birthTime.getHours());
    combined.setMinutes(birthTime.getMinutes());
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined;
  }, [birthDate, birthTime]);

  const validate = () => {
    const validationErrors = {};

    if (!fullName.trim()) {
      validationErrors.fullName = 'Informe seu nome completo.';
    }

    if (!email.trim()) {
      validationErrors.email = 'Informe um email válido.';
    } else {
      const emailRegex = /.+@.+\..+/i;
      if (!emailRegex.test(email.trim())) {
        validationErrors.email = 'Formato de email inválido.';
      }
    }

    if (!phone.trim()) {
      validationErrors.phone = 'Informe um telefone.';
    }

    if (!password) {
      validationErrors.password = 'Informe uma senha.';
    } else if (password.length < 6) {
      validationErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
    }

    if (!birthDate) {
      validationErrors.birthDate = 'Informe sua data de nascimento.';
    }

    if (!birthTime) {
      validationErrors.birthTime = 'Informe sua hora de nascimento.';
    }

    if (!plan) {
      validationErrors.plan = 'Selecione um plano.';
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);

      await setDoc(doc(db, 'users', user.uid), {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        birthDate: combinedBirthDateTime ? Timestamp.fromDate(combinedBirthDateTime) : null,
        plan,
        createdAt: serverTimestamp(),
      });

      setSnackbar({ visible: true, message: 'Cadastro realizado com sucesso!', isError: false });
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setBirthDate(null);
      setBirthTime(null);
      setPlan('gratuito');
    } catch (error) {
      setSnackbar({
        visible: true,
        message: error?.message ?? 'Não foi possível concluir o cadastro.',
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (_, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const handleTimeChange = (_, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setBirthTime(selectedTime);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Criar conta
      </Text>

      <TextInput
        label="Nome completo"
        mode="outlined"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
        autoCapitalize="words"
      />
      <HelperText type="error" visible={Boolean(errors.fullName)}>
        {errors.fullName}
      </HelperText>

      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <HelperText type="error" visible={Boolean(errors.email)}>
        {errors.email}
      </HelperText>

      <TextInput
        label="Telefone"
        mode="outlined"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
      />
      <HelperText type="error" visible={Boolean(errors.phone)}>
        {errors.phone}
      </HelperText>

      <TextInput
        label="Senha"
        mode="outlined"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <HelperText type="error" visible={Boolean(errors.password)}>
        {errors.password}
      </HelperText>

      <Pressable onPress={() => setShowDatePicker(true)}>
        <View pointerEvents="none">
          <TextInput
            label="Data de nascimento"
            mode="outlined"
            value={formatDate(birthDate)}
            style={styles.input}
            editable={false}
          />
        </View>
      </Pressable>
      <HelperText type="error" visible={Boolean(errors.birthDate)}>
        {errors.birthDate}
      </HelperText>

      <Pressable onPress={() => setShowTimePicker(true)}>
        <View pointerEvents="none">
          <TextInput
            label="Hora de nascimento"
            mode="outlined"
            value={formatTime(birthTime)}
            style={styles.input}
            editable={false}
          />
        </View>
      </Pressable>
      <HelperText type="error" visible={Boolean(errors.birthTime)}>
        {errors.birthTime}
      </HelperText>

      <View style={styles.pickerContainer}>
        <Text variant="labelLarge" style={styles.pickerLabel}>
          Plano
        </Text>
        <Picker
          selectedValue={plan}
          onValueChange={setPlan}
          style={styles.picker}
          dropdownIconColor="#0f172a"
        >
          {plans.map((planOption) => (
            <Picker.Item key={planOption.value} label={planOption.label} value={planOption.value} />
          ))}
        </Picker>
      </View>
      <HelperText type="error" visible={Boolean(errors.plan)}>
        {errors.plan}
      </HelperText>

      <Button mode="contained" onPress={handleSignup} loading={loading} disabled={loading} style={styles.submitButton}>
        Cadastrar
      </Button>

      {(showDatePicker || showTimePicker) && (
        <DateTimePicker
          value={showDatePicker ? birthDate ?? new Date() : birthTime ?? new Date()}
          mode={showDatePicker ? 'date' : 'time'}
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={showDatePicker ? handleDateChange : handleTimeChange}
        />
      )}

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar((prev) => ({ ...prev, visible: false }))}
        duration={4000}
        style={snackbar.isError ? styles.errorSnackbar : styles.successSnackbar}
      >
        {snackbar.message}
      </Snackbar>
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
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 4,
  },
  pickerContainer: {
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#cbd5f5',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  pickerLabel: {
    paddingHorizontal: 12,
    paddingTop: 12,
    color: '#0f172a',
  },
  picker: {
    width: '100%',
  },
  submitButton: {
    marginTop: 12,
  },
  errorSnackbar: {
    backgroundColor: '#ef4444',
  },
  successSnackbar: {
    backgroundColor: '#22c55e',
  },
});

export default SignupScreen;
