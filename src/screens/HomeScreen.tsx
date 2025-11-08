import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, Modal, Portal, Text } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { HomeStackParamList } from '../navigation';
import { initializeFirebase } from '../services/firebase';
import { Meditation } from '../types/models';
import AudioPlayer from '../components/AudioPlayer';
import GardenMini from '../components/GardenMini';
import ContentCard from '../components/ContentCard';
import SOSButton from '../components/SOSButton';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const { firestore } = initializeFirebase();
  const [recommended, setRecommended] = useState<Meditation | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickPlayVisible, setQuickPlayVisible] = useState(false);

  useEffect(() => {
    const loadRecommended = async () => {
      try {
        const meditationsRef = collection(firestore, 'meditations');
        const recommendedQuery = query(meditationsRef, where('recommended', '==', true), limit(1));
        const snapshot = await getDocs(recommendedQuery);
        if (!snapshot.empty) {
          const docSnapshot = snapshot.docs[0];
          const data = docSnapshot.data() as any;
          setRecommended({
            id: docSnapshot.id,
            title: data.title,
            description: data.description,
            durationSeconds: data.durationSeconds ?? data.duration_seconds ?? 0,
            level: data.level ?? 'iniciante',
            audioUrl: data.audioUrl ?? data.audio_url ?? '',
            coverUrl: data.coverUrl ?? data.cover_url,
            tags: data.tags ?? [],
            language: data.language ?? 'pt-BR',
          });
        }
      } catch (error) {
        console.warn('Falha ao buscar meditação recomendada', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommended();
  }, [firestore]);

  const dailyRoutines = [
    {
      id: 'routine-1',
      title: 'Respiração consciente',
      description: '5 minutos para recentrar a mente antes do dia começar.',
    },
  ];

  return (
    <View style={styles.container}>
      {loading && !recommended ? (
        <View style={styles.loader}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={dailyRoutines}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View>
              <Text variant="headlineSmall" style={styles.heading}>
                Olá 👋
              </Text>
              <Text variant="bodyLarge" style={styles.subtitle}>
                Escolhemos uma meditação especial para hoje. Aproveite!
              </Text>
              {recommended && (
                <Card style={styles.featuredCard}>
                  <Card.Cover
                    source={{
                      uri:
                        recommended.coverUrl ??
                        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
                    }}
                  />
                  <Card.Title title={recommended.title} subtitle={`~${Math.round(recommended.durationSeconds / 60)} min`} />
                  <Card.Content>
                    <Text>{recommended.description}</Text>
                  </Card.Content>
                  <Card.Actions>
                    <Button onPress={() => setQuickPlayVisible(true)}>Quick Play</Button>
                    <Button onPress={() =>
                      navigation.navigate('Player', {
                        contentId: recommended.id,
                        audioUrl: recommended.audioUrl,
                        title: recommended.title,
                        duration: recommended.durationSeconds,
                      })
                    }
                    >
                      Ver detalhes
                    </Button>
                  </Card.Actions>
                </Card>
              )}
              <View style={styles.sectionHeader}>
                <Text variant="titleMedium">Rotina do dia</Text>
                <Button onPress={() => navigation.navigate('MeditationList')}>Ver tudo</Button>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <Card style={styles.routineCard}>
              <Card.Title title={item.title} subtitle={item.description} />
              <Card.Actions>
                <Button onPress={() => navigation.navigate('BreathingList')}>Praticar</Button>
              </Card.Actions>
            </Card>
          )}
          ListFooterComponent={
            <View style={styles.footer}>
              <Text variant="titleMedium" style={styles.footerHeading}>
                GardenMini
              </Text>
              <GardenMini auraScore={68} flowers={5} water={4} light={3} shadows={2} />
              <Text style={styles.helperText}>
                Integrações futuras: puxar dados da API `/garden/state` para refletir o estado real do jardim.
              </Text>
              <Text variant="titleMedium" style={styles.footerHeading}>
                Conteúdos sugeridos
              </Text>
              {recommended && (
                <ContentCard
                  id={recommended.id}
                  type="meditation"
                  title={recommended.title}
                  duration={recommended.durationSeconds}
                  coverUrl={recommended.coverUrl}
                  tags={recommended.tags}
                  completed={false}
                  onPressPlay={() => setQuickPlayVisible(true)}
                  onPressDetails={() => navigation.navigate('Player', {
                    contentId: recommended.id,
                    audioUrl: recommended.audioUrl,
                    title: recommended.title,
                    duration: recommended.durationSeconds,
                  })}
                />
              )}
              <Button
                mode="outlined"
                style={styles.mandalaButton}
                onPress={() => navigation.navigate('Mandala')}
              >
                Abrir Mandala
              </Button>
            </View>
          }
        />
      )}
      <SOSButton />
      <Portal>
        <Modal visible={quickPlayVisible} onDismiss={() => setQuickPlayVisible(false)} contentContainerStyle={styles.modal}>
          {recommended ? (
            <AudioPlayer
              audioUrl={recommended.audioUrl}
              title={recommended.title}
              duration={recommended.durationSeconds}
              resumeKey={`quick-play-${recommended.id}`}
              onComplete={() => {
                setQuickPlayVisible(false);
                // TODO: Integrar com endpoint POST /userProgress para marcar como concluído.
              }}
            />
          ) : (
            <Text>Nenhum conteúdo selecionado.</Text>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  subtitle: {
    marginHorizontal: 16,
    marginBottom: 16,
    color: '#475569',
  },
  featuredCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sectionHeader: {
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routineCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 16,
  },
  footerHeading: {
    marginTop: 24,
  },
  helperText: {
    textAlign: 'center',
    color: '#64748B',
  },
  mandalaButton: {
    alignSelf: 'center',
    marginTop: 16,
  },
  modal: {
    backgroundColor: '#fff',
    margin: 24,
    padding: 16,
    borderRadius: 16,
  },
});

export default HomeScreen;
