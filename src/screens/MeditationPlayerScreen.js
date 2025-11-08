import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, ProgressBar, Text } from 'react-native-paper';
import { Audio } from 'expo-av';
import { useFocusEffect, useRoute } from '@react-navigation/native';

const formatTime = (millis) => {
  if (typeof millis !== 'number' || Number.isNaN(millis)) {
    return '00:00';
  }

  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const MeditationPlayerScreen = () => {
  const route = useRoute();
  const { meditation } = route.params ?? {};
  const soundRef = useRef(null);
  const [status, setStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const loadSound = useCallback(async () => {
    if (!meditation?.audioUrl) {
      setError('Áudio não disponível.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await unloadSound();
      const { sound } = await Audio.Sound.createAsync(
        { uri: meditation.audioUrl },
        { shouldPlay: true },
        (playbackStatus) => {
          setStatus(playbackStatus);
        }
      );

      soundRef.current = sound;
      const currentStatus = await sound.getStatusAsync();
      setStatus(currentStatus);
    } catch (err) {
      console.error('Erro ao carregar o áudio:', err);
      setError('Não foi possível carregar o áudio.');
    } finally {
      setIsLoading(false);
    }
  }, [meditation, unloadSound]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
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

  const progress = status?.durationMillis
    ? Math.min(status.positionMillis / status.durationMillis, 1)
    : 0;

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>
            {meditation?.title ?? 'Meditação'}
          </Text>
          {meditation?.description ? (
            <Text variant="bodyMedium" style={styles.description}>
              {meditation.description}
            </Text>
          ) : null}
          <View style={styles.section}>
            <Text variant="bodyLarge">Duração: {meditation?.duration ?? '--'} segundos</Text>
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
              <View style={styles.timingRow}>
                <Text variant="bodySmall">{formatTime(status.positionMillis)}</Text>
                <Text variant="bodySmall">{formatTime(status.durationMillis)}</Text>
              </View>
            </>
          )}
        </Card.Content>
        <Card.Actions>
          <Button
            mode="contained"
            onPress={togglePlayback}
            disabled={isLoading || !!error || !soundRef.current}
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
  timingRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default MeditationPlayerScreen;
