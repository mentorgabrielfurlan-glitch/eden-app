import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Text } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore';
import { HomeStackParamList } from '../navigation';
import { initializeFirebase } from '../services/firebase';
import { Meditation } from '../types/models';
import ContentCard from '../components/ContentCard';

const LEVELS: (Meditation['level'] | 'todos')[] = ['todos', 'iniciante', 'intermediario', 'avancado'];
const TAGS = ['foco', 'sono', 'ansiedade', 'produtividade'];

const PAGE_SIZE = 10;

const MeditationListScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const { firestore } = initializeFirebase();

  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Meditation['level'] | 'todos'>('todos');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [fetchingMore, setFetchingMore] = useState(false);

  const buildQuery = useCallback(
    (reset = false) => {
      const baseRef = collection(firestore, 'meditations');
      const constraints = [orderBy('title'), limit(PAGE_SIZE)];

      if (selectedLevel !== 'todos') {
        constraints.unshift(where('level', '==', selectedLevel));
      }
      if (selectedTag) {
        constraints.unshift(where('tags', 'array-contains', selectedTag));
      }
      if (!reset && lastVisible) {
        constraints.push(startAfter(lastVisible));
      }
      return query(baseRef, ...constraints);
    },
    [firestore, selectedLevel, selectedTag, lastVisible]
  );

  const loadMeditations = useCallback(
    async (reset = false) => {
      if (reset) {
        setLastVisible(null);
      }
      if (reset) {
        setLoading(true);
      }
      try {
        const snapshot = await getDocs(buildQuery(reset));
        const results = snapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data() as any;
          return {
            id: docSnapshot.id,
            title: data.title,
            description: data.description,
            durationSeconds: data.durationSeconds ?? data.duration_seconds ?? 0,
            level: data.level ?? 'iniciante',
            audioUrl: data.audioUrl ?? data.audio_url ?? '',
            coverUrl: data.coverUrl ?? data.cover_url,
            tags: data.tags ?? [],
            language: data.language ?? 'pt-BR',
          } as Meditation;
        });
        setMeditations((prev) => (reset ? results : [...prev, ...results]));
        setLastVisible(snapshot.docs[snapshot.docs.length - 1] ?? null);
      } catch (error) {
        console.warn('Erro ao buscar meditações', error);
      } finally {
        setLoading(false);
        setFetchingMore(false);
        setRefreshing(false);
      }
    },
    [buildQuery]
  );

  useEffect(() => {
    loadMeditations(true);
  }, [selectedLevel, selectedTag, loadMeditations]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadMeditations(true);
  };

  const handleLoadMore = () => {
    if (!fetchingMore && lastVisible) {
      setFetchingMore(true);
      loadMeditations();
    }
  };

  const renderFooter = () => {
    if (!fetchingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.heading}>
        Meditações
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
      <View style={styles.filterRow}>
        <Chip selected={!selectedTag} onPress={() => setSelectedTag(null)} style={styles.chip}>
          Todas as tags
        </Chip>
        {TAGS.map((tag) => (
          <Chip
            key={tag}
            selected={selectedTag === tag}
            onPress={() => setSelectedTag(tag)}
            style={styles.chip}
          >
            #{tag}
          </Chip>
        ))}
      </View>
      <FlatList
        data={meditations}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        renderItem={({ item }) => (
          <ContentCard
            id={item.id}
            type="meditation"
            title={item.title}
            duration={item.durationSeconds}
            coverUrl={item.coverUrl}
            tags={item.tags}
            completed={false}
            onPressPlay={() =>
              navigation.navigate('Player', {
                contentId: item.id,
                audioUrl: item.audioUrl,
                title: item.title,
                duration: item.durationSeconds,
              })
            }
            onPressDetails={() =>
              navigation.navigate('Player', {
                contentId: item.id,
                audioUrl: item.audioUrl,
                title: item.title,
                duration: item.durationSeconds,
              })
            }
          />
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text>Nenhuma meditação encontrada com os filtros atuais.</Text>
              <Button onPress={() => loadMeditations(true)}>Tentar novamente</Button>
            </View>
          ) : undefined
        }
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
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
  footer: {
    paddingVertical: 16,
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
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
});

export default MeditationListScreen;
