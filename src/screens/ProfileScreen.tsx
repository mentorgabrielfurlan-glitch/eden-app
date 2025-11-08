import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, HelperText, Text, TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { initializeFirebase } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { UserProfile } from '../types/models';

const buildDateValue = (date?: string) => {
  if (!date) return new Date();
  const [year, month, day] = date.split('-').map(Number);
  const value = new Date();
  value.setFullYear(year ?? value.getFullYear(), (month ?? 1) - 1, day ?? value.getDate());
  value.setHours(0, 0, 0, 0);
  return value;
};

const buildTimeValue = (time?: string) => {
  const value = new Date();
  if (time) {
    const [hours, minutes] = time.split(':').map(Number);
    value.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  }
  return value;
};

const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const { firestore } = initializeFirebase();
  const [profile, setProfile] = useState<UserProfile | null>(user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        const snapshot = await getDoc(doc(firestore, 'users', user.uid));
        if (snapshot.exists()) {
          const data = snapshot.data() as UserProfile;
          if (isMounted) {
            setProfile({ ...user, ...data });
          }
        } else if (isMounted) {
          setProfile(user);
        }
      } catch (fetchError) {
        console.warn(fetchError);
        setError('Não foi possível carregar seu perfil.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [firestore, user]);

  const openDatePicker = (mode: 'date' | 'time') => {
    if (!profile) return;
    DateTimePickerAndroid.open({
      mode,
      value: mode === 'date' ? buildDateValue(profile.birthDate) : buildTimeValue(profile.birthTime),
      onChange: (_, selected) => {
        if (!selected) return;
        setProfile((prev) => {
          if (!prev) return prev;
          if (mode === 'date') {
            return { ...prev, birthDate: selected.toISOString().split('T')[0] };
          }
          return { ...prev, birthTime: selected.toISOString().split('T')[1]?.slice(0, 5) };
        });
      },
    });
  };

  const handleSave = async () => {
    if (!profile?.uid) return;
    try {
      setSaving(true);
      await updateDoc(doc(firestore, 'users', profile.uid), {
        phone: profile.phone ?? '',
        birthDate: profile.birthDate ?? '',
        birthTime: profile.birthTime ?? '',
        plan: profile.plan ?? 'gratuito',
        updatedAt: new Date().toISOString(),
      });
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso.');
    } catch (updateError: any) {
      const message = updateError?.message ?? 'Erro ao salvar perfil.';
      Alert.alert('Falha', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Nenhum perfil encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>
      <TextInput label="Nome completo" value={profile.fullName} mode="outlined" disabled style={styles.input} />
      <TextInput label="E-mail" value={profile.email} mode="outlined" disabled style={styles.input} />
      <TextInput
        label="Telefone"
        value={profile.phone ?? ''}
        onChangeText={(value) => setProfile({ ...profile, phone: value })}
        mode="outlined"
        style={styles.input}
      />
      <Button mode="outlined" onPress={() => openDatePicker('date')} style={styles.input}>
        {profile.birthDate ? `Data de nascimento: ${profile.birthDate}` : 'Selecionar data de nascimento'}
      </Button>
      <Button mode="outlined" onPress={() => openDatePicker('time')} style={styles.input}>
        {profile.birthTime ? `Hora de nascimento: ${profile.birthTime}` : 'Selecionar hora de nascimento'}
      </Button>
      <View style={styles.pickerWrapper}>
        <Text style={styles.pickerLabel}>Plano</Text>
        <Picker
          selectedValue={profile.plan ?? 'gratuito'}
          onValueChange={(value) => setProfile({ ...profile, plan: value })}
        >
          <Picker.Item label="Gratuito" value="gratuito" />
          <Picker.Item label="Premium" value="premium" />
          <Picker.Item label="Mentorado" value="mentorado" />
          <Picker.Item label="Master" value="master" />
        </Picker>
      </View>
      {error && <HelperText type="error">{error}</HelperText>}
      <Button mode="contained" onPress={handleSave} loading={saving} disabled={saving}>
        Salvar alterações
      </Button>
      <Button mode="outlined" onPress={() => signOut()} style={styles.logoutButton}>
        Sair
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
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
  logoutButton: {
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;
