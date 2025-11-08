import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { Button, Card, RadioButton, Text } from 'react-native-paper';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { addDoc, collection, getDocs, Timestamp } from 'firebase/firestore';
import { initializeFirebase } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';

interface Therapist {
  id: string;
  name: string;
  specialization: string;
  nextAvailability?: string;
}

const SessionBookingScreen: React.FC = () => {
  const { firestore } = initializeFirebase();
  const { user } = useAuth();

  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTherapists = async () => {
      try {
        const snapshot = await getDocs(collection(firestore, 'therapists'));
        const results = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data() as any;
          return {
            id: docSnapshot.id,
            name: data.name,
            specialization: data.specialization ?? 'Terapeuta',
            nextAvailability: data.nextAvailability,
          } as Therapist;
        });
        setTherapists(results);
      } catch (error) {
        console.warn('Falha ao buscar terapeutas', error);
      }
    };

    loadTherapists();
  }, [firestore]);

  const handleSelectDateTime = () => {
    DateTimePickerAndroid.open({
      mode: 'datetime',
      value: scheduledAt ?? new Date(),
      onChange: (_, date) => {
        if (date) setScheduledAt(date);
      },
    });
  };

  const handleSubmit = async () => {
    if (!user?.uid || !selectedTherapist || !scheduledAt) {
      Alert.alert('Preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(firestore, 'sessions'), {
        userId: user.uid,
        therapistId: selectedTherapist,
        scheduledAt: Timestamp.fromDate(scheduledAt),
        status: 'pending',
      });
      Alert.alert('Sessão agendada!', 'Você receberá um e-mail com a confirmação.');
      // TODO: chamar cloud function/endpoint que envia e-mail e sincroniza com Google Calendar.
    } catch (error) {
      console.warn(error);
      Alert.alert('Erro', 'Não foi possível criar a sessão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Agendar sessão
      </Text>
      {therapists.map((therapist) => (
        <Card key={therapist.id} style={styles.card}>
          <Card.Title title={therapist.name} subtitle={therapist.specialization} />
          <Card.Content>
            <RadioButton.Group value={selectedTherapist} onValueChange={setSelectedTherapist}>
              <RadioButton.Item
                value={therapist.id}
                label={
                  therapist.nextAvailability
                    ? `Próxima disponibilidade: ${therapist.nextAvailability}`
                    : 'Agenda personalizada'
                }
              />
            </RadioButton.Group>
          </Card.Content>
        </Card>
      ))}
      <Button mode="outlined" onPress={handleSelectDateTime} style={styles.button}>
        {scheduledAt ? `Sessão em ${scheduledAt.toLocaleString()}` : 'Escolher data e hora'}
      </Button>
      <Button mode="contained" onPress={handleSubmit} loading={loading} disabled={loading}>
        Confirmar reserva
      </Button>
      <Text style={styles.helper}>
        Integração futura: chamar endpoint `/sessions/book` no backend para criar reunião no calendário e enviar notificações.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  title: {
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
  },
  button: {
    marginTop: 12,
  },
  helper: {
    color: '#64748B',
    marginTop: 16,
  },
});

export default SessionBookingScreen;
