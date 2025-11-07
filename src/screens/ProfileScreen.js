import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, HelperText, Text, TextInput } from 'react-native-paper';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { auth, db } from '../services/firebase';

const initialState = {
  phone: '',
  birthTime: '',
  plan: '',
};

const ProfileScreen = () => {
  const [profile, setProfile] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setErrorMessage('Nenhum usuário logado.');
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          setProfile({
            phone: data.phone || '',
            birthTime: data.birthTime || '',
            plan: data.plan || '',
          });
        }
      } catch (_error) {
        setErrorMessage('Não foi possível carregar os dados do perfil.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field) => (value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSave = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setErrorMessage('Não há usuário autenticado.');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, profile, { merge: true });
      setSuccessMessage('Perfil atualizado com sucesso!');
    } catch (_error) {
      setErrorMessage('Não foi possível salvar as alterações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Meu Perfil
      </Text>
      <TextInput
        label="Telefone"
        mode="outlined"
        value={profile.phone}
        onChangeText={handleChange('phone')}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput
        label="Hora de nascimento"
        mode="outlined"
        placeholder="Ex.: 14:30"
        value={profile.birthTime}
        onChangeText={handleChange('birthTime')}
        style={styles.input}
      />
      <TextInput
        label="Plano"
        mode="outlined"
        value={profile.plan}
        onChangeText={handleChange('plan')}
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
        onPress={handleSave}
        loading={saving}
        disabled={saving}
        style={styles.saveButton}
      >
        Salvar
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
  },
});

export default ProfileScreen;
