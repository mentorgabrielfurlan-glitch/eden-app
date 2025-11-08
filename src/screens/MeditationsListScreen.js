import React, { useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { ActivityIndicator, Button, Card, Text } from 'react-native-paper';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

import { db, isFirebaseConfigured } from '../services/firebase';

const formatDuration = (seconds) => {
  if (typeof seconds !== 'number' || Number.isNaN(seconds)) {
    return '—';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const MeditationsListScreen = () => {
  const navigation = useNavigation();
  const [meditations, setMeditations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchMeditations = useCallback(async ({ withSpinner = true } = {}) => {
    if (withSpinner) {
      setLoading(true);
    }
    if (!isFirebaseConfigured || !db) {
      setError('Configuração do Firebase ausente.');
      setMeditations([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const meditationsQuery = query(collection(db, 'meditations'), orderBy('title'));
      const snapshot = await getDocs(meditationsQuery);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMeditations(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar meditações:', err);
      setError('Não foi possível carregar as meditações.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMeditations();
    }, [fetchMeditations])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMeditations({ withSpinner: false });
  }, [fetchMeditations]);

  const renderItem = ({ item }) => (
    <Card style={styles.card} mode="outlined">
      <Card.Title title={item.title} subtitle={`Duração: ${formatDuration(item.duration)}`} />
      <Card.Content>
        {item.description ? (
          <Text variant="bodyMedium" style={styles.description} numberOfLines={3}>
            {item.description}
          </Text>
        ) : null}
      </Card.Content>
      <Card.Actions>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('MeditationPlayer', { meditation: item })}
        >
          Tocar
        </Button>
      </Card.Actions>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyLarge" style={styles.errorText}>
          {error}
        </Text>
        <Button mode="contained" onPress={() => fetchMeditations()} style={styles.retryButton}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={meditations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={meditations.length === 0 ? styles.emptyListContainer : styles.listContainer}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text variant="bodyLarge">Nenhuma meditação encontrada.</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    borderRadius: 12,
  },
  description: {
    color: '#475569',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
  },
});

export default MeditationsListScreen;
