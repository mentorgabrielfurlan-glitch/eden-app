import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, IconButton, ProgressBar, Text } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { auth, db, isFirebaseConfigured } from '../services/firebase';

const formatTime = (millis) => {
  if (typeof millis !== 'number' || Number.isNaN(millis) || millis < 0) {
    return '00:00';
  }

  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const MeditationPlayerScreen = () => {
  const route = useRoute();
  const {
    meditation,
    audioUrl: audioUrlParam,
    title: titleParam,
    duration: durationParam,
    description: descriptionParam,
    meditationId: meditationIdParam,
  } = route.params ?? {};

  const resolvedAudioUrl = audioUrlParam ?? meditation?.audioUrl;
  const resolvedTitle = titleParam ?? meditation?.title ?? 'Meditação';
  const resolvedDurationSeconds = durationParam ?? meditation?.duration;
  const resolvedDescription = descriptionParam ?? meditation?.description ?? '';
  const resolvedMeditationId = (meditationIdParam ?? meditation?.id)
    ?? (resolvedAudioUrl ? resolvedAudioUrl.replace(/[^a-zA-Z0-9]/g, '').slice(-64) : undefined);

  const soundRef = useRef(null);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const hasCompletedRef = useRef(false);

  const unloadSound = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current.setOnPlaybackStatusUpdate(null);
        soundRef.current = null;
      }
    } catch (err) {
      console.warn('Erro ao descarregar áudio:', err);
    }
  }, []);

  const markMeditationAsCompleted = useCallback(
    async (playbackStatus) => {
      if (hasCompletedRef.current || !resolvedMeditationId) {
        return;
      }

      hasCompletedRef.current = true;

      if (!isFirebaseConfigured || !db) {
        return;
      }

      const userId = auth?.currentUser?.uid;
      if (!userId) {
        console.warn('Usuário não autenticado. Progresso não será salvo.');
        return;
      }

      try {
        const progressRef = doc(db, 'userProgress', userId);
        await setDoc(
          progressRef,
          {
            completedMeditations: {
              [resolvedMeditationId]: {
                completedAt: serverTimestamp(),
                audioUrl: resolvedAudioUrl ?? null,
                title: resolvedTitle,
                duration: playbackStatus?.durationMillis
                  ? Math.round(playbackStatus.durationMillis / 1000)
                  : resolvedDurationSeconds ?? null,
              },
            },
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Erro ao registrar progresso da meditação:', err);
      }
    },
    [resolvedMeditationId, resolvedAudioUrl, resolvedTitle, resolvedDurationSeconds]
  );

  const onPlaybackStatusUpdate = useCallback(
    (playbackStatus) => {
      if (!playbackStatus) {
        return;
      }

      if (!playbackStatus.isLoaded) {
        if (playbackStatus.error) {
          console.error('Erro de reprodução:', playbackStatus.error);
          setError('Erro durante a reprodução do áudio.');
        }
        return;
      }

      setError(null);
      setStatus(playbackStatus);
      if (!isSeeking) {
        setSeekPosition(playbackStatus.positionMillis ?? 0);
      }

      if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
        markMeditationAsCompleted(playbackStatus);
      }
    },
    [isSeeking, markMeditationAsCompleted]
  );

  const loadSound = useCallback(async () => {
    if (!resolvedAudioUrl) {
      setError('Áudio não disponível.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    hasCompletedRef.current = false;

    try {
      await unloadSound();
      const { sound, status: initialStatus } = await Audio.Sound.createAsync(
        { uri: resolvedAudioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      setStatus(initialStatus);
      setSeekPosition(initialStatus?.positionMillis ?? 0);
    } catch (err) {
      console.error('Erro ao carregar o áudio:', err);
      setError('Não foi possível carregar o áudio.');
    } finally {
      setIsLoading(false);
    }
  }, [resolvedAudioUrl, onPlaybackStatusUpdate, unloadSound]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
    }).catch((err) => console.warn('Erro ao configurar modo de áudio:', err));
  }, []);

  useEffect(() => {
    loadSound();

    return () => {
      unloadSound();
    };
  }, [loadSound, unloadSound]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        unloadSound();
      };
    }, [unloadSound])
  );

  const togglePlayback = async () => {
    try {
      if (!soundRef.current) {
        return;
      }

      const currentStatus = await soundRef.current.getStatusAsync();
      if (!currentStatus.isLoaded) {
        return;
      }

      if (currentStatus.isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch (err) {
      console.error('Erro ao controlar reprodução:', err);
      setError('Erro ao controlar a reprodução.');
    }
  };

  const handleSeekComplete = async (newPosition) => {
    try {
      if (!soundRef.current) {
        return;
      }

      await soundRef.current.setPositionAsync(newPosition);
      const currentStatus = await soundRef.current.getStatusAsync();
      if (currentStatus.isLoaded && currentStatus.isPlaying) {
        await soundRef.current.playAsync();
      }
    } catch (err) {
      console.error('Erro ao alterar posição de reprodução:', err);
      setError('Não foi possível buscar a nova posição.');
    }
  };

  const progress = status?.isLoaded && status.durationMillis
    ? Math.min((isSeeking ? seekPosition : status.positionMillis) / status.durationMillis, 1)
    : 0;

  const currentPositionMillis = isSeeking ? seekPosition : status?.positionMillis ?? 0;
  const totalDurationMillis = status?.durationMillis
    ?? (typeof resolvedDurationSeconds === 'number' ? resolvedDurationSeconds * 1000 : 0);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            {resolvedTitle}
          </Text>
          {resolvedDescription ? (
            <Text variant="bodyMedium" style={styles.description}>
              {resolvedDescription}
            </Text>
          ) : null}
          <View style={styles.section}>
            <Text variant="bodyLarge">Duração: {formatTime(totalDurationMillis)}</Text>
          </View>
          {isLoading ? (
            <ActivityIndicator animating style={styles.loadingIndicator} />
          ) : error ? (
            <Text variant="bodyLarge" style={styles.errorText}>
              {error}
            </Text>
          ) : (
            <>
              <ProgressBar progress={progress} style={styles.progress} />
              <Slider
                style={styles.slider}
                value={currentPositionMillis}
                minimumValue={0}
                maximumValue={totalDurationMillis || 1}
                onSlidingStart={() => setIsSeeking(true)}
                onValueChange={(value) => setSeekPosition(value)}
                onSlidingComplete={(value) => {
                  setIsSeeking(false);
                  setSeekPosition(value);
                  handleSeekComplete(value);
                }}
                minimumTrackTintColor="#0ea5e9"
                maximumTrackTintColor="#cbd5f5"
                thumbTintColor="#0284c7"
                disabled={!status?.isLoaded}
              />
              <View style={styles.timingRow}>
                <Text variant="bodySmall">{formatTime(currentPositionMillis)}</Text>
                <Text variant="bodySmall">{formatTime(totalDurationMillis)}</Text>
              </View>
            </>
          )}
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <IconButton
            mode="outlined"
            icon={isFavorite ? 'heart' : 'heart-outline'}
            onPress={() => setIsFavorite((prev) => !prev)}
            accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          />
          <Button
            mode="contained"
            onPress={togglePlayback}
            disabled={isLoading || !!error || !status?.isLoaded}
          >
            {status?.isPlaying ? 'Pausar' : 'Tocar'}
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
  },
  title: {
    marginBottom: 12,
  },
  description: {
    color: '#475569',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  loadingIndicator: {
    marginVertical: 16,
  },
  errorText: {
    color: '#ef4444',
    marginTop: 12,
  },
  progress: {
    marginTop: 16,
  },
  slider: {
    marginTop: 12,
  },
  timingRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actions: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
});

export default MeditationPlayerScreen;
