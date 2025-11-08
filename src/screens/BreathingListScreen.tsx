import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Text } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { HomeStackParamList } from '../navigation';
import { initializeFirebase } from '../services/firebase';
import ContentCard from '../components/ContentCard';

interface BreathingItem {
  id: string;
  title: string;
  durationSeconds: number;
  pattern: string;
  level: string;
  audioUrl?: string;
  coverUrl?: string;
  tags?: string[];
}

const LEVELS = ['todos', 'iniciante', 'intermediario', 'avancado'];

const BreathingListScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const { firestore } = initializeFirebase();
  const [breathings, setBreathings] = useState<BreathingItem[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('todos');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBreathings = useCallback(
    async (level: string) => {
      try {
        setLoading(true);
        const baseRef = collection(firestore, 'breathings');
        const constraints = level === 'todos' ? [orderBy('title')] : [where('level', '==', level), orderBy('title')];
        const snapshot = await getDocs(query(baseRef, ...constraints));
        const results = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data() as any;
          return {
            id: docSnapshot.id,
            title: data.title,
            durationSeconds: data.durationSeconds ?? data.duration_seconds ?? 0,
            pattern: data.pattern ?? '4-4-4-4',
            level: data.level ?? 'iniciante',
            audioUrl: data.audioUrl ?? data.audio_url,
            coverUrl: data.coverUrl ?? data.cover_url,
            tags: data.tags ?? [],
          } as BreathingItem;
        });
        setBreathings(results);
      } catch (error) {
        console.warn('Erro ao buscar respirações', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [firestore]
  );

  useEffect(() => {
    loadBreathings(selectedLevel);
  }, [selectedLevel, loadBreathings]);

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.heading}>
        Respirações guiadas
      </Text>
      <View style={styles.filterRow}>
        {LEVELS.map((level) => (
          <Chip
            key={level}
            selected={selectedLevel === level}
            onPress={() => setSelectedLevel(level)}
            style={styles.chip}
          >
            {level === 'todos' ? 'Todos os níveis' : level}
          </Chip>
        ))}
      </View>
      <FlatList
        data={breathings}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadBreathings(selectedLevel)} />}
        renderItem={({ item }) => (
          <ContentCard
            id={item.id}
            type="breathing"
            title={item.title}
            duration={item.durationSeconds}
            coverUrl={item.coverUrl}
            tags={item.tags}
            completed={false}
            onPressPlay={() =>
              navigation.navigate('Player', {
                contentId: item.id,
                audioUrl: item.audioUrl ?? '',
                title: item.title,
                duration: item.durationSeconds,
              })
            }
            onPressDetails={() =>
              navigation.navigate('Player', {
                contentId: item.id,
                audioUrl: item.audioUrl ?? '',
                title: item.title,
                duration: item.durationSeconds,
              })
            }
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text>Nenhum exercício encontrado para esse nível.</Text>
              <Button onPress={() => loadBreathings('todos')}>Limpar filtros</Button>
            </View>
          ) : undefined
        }
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heading: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    marginRight: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
});

export default BreathingListScreen;
