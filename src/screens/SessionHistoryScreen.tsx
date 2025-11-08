import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { initializeFirebase } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';

interface SessionItem {
  id: string;
  therapistId: string;
  scheduledAt: string;
  status: string;
  publicSummary?: string;
}

const SessionHistoryScreen: React.FC = () => {
  const { firestore } = initializeFirebase();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionItem[]>([]);

  useEffect(() => {
    const loadSessions = async () => {
      if (!user?.uid) return;
      const sessionsRef = collection(firestore, 'sessions');
      const snapshot = await getDocs(query(sessionsRef, where('userId', '==', user.uid), orderBy('scheduledAt', 'desc')));
      const results = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data() as any;
        return {
          id: docSnapshot.id,
          therapistId: data.therapistId,
          scheduledAt: data.scheduledAt?.toDate?.().toISOString?.() ?? data.scheduledAt,
          status: data.status,
          publicSummary: data.publicSummary,
        } as SessionItem;
      });
      setSessions(results);
    };

    loadSessions();
  }, [firestore, user?.uid]);

  const handleExport = (session: SessionItem) => {
    Alert.alert('Exportar sessão', `Gerar PDF da sessão ${session.id} (placeholder).`);
    // TODO: invocar endpoint `/sessions/${session.id}/export` para gerar PDF.
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Histórico de sessões
      </Text>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title title={`Terapeuta: ${item.therapistId}`} subtitle={`Status: ${item.status}`} />
            <Card.Content>
              <Text>Agendada para: {new Date(item.scheduledAt).toLocaleString()}</Text>
              {item.publicSummary && <Text>Resumo: {item.publicSummary}</Text>}
            </Card.Content>
            <Card.Actions>
              <Button onPress={() => handleExport(item)}>Exportar sessão</Button>
            </Card.Actions>
          </Card>
        )}
        ListEmptyComponent={<Text>Você ainda não possui sessões registradas.</Text>}
      />
      <Text style={styles.helper}>
        Testar regras do Firestore: tente criar/editar sessões de outro usuário via emulador para garantir segurança.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  title: {
    marginBottom: 12,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },
  helper: {
    marginTop: 16,
    color: '#64748B',
  },
});

export default SessionHistoryScreen;
