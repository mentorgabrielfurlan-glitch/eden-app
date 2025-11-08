import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, IconButton, Text } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { Audio, AVPlaybackStatus } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  duration?: number;
  resumeKey?: string;
  onComplete?: () => void;
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5];

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, title, duration, resumeKey, onComplete }) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);

  const handleStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        if (status.error) {
          console.warn('Erro no player', status.error);
        }
        return;
      }

      setIsBuffering(status.isBuffering);
      setDurationMillis(status.durationMillis ?? (duration ? duration * 1000 : 0));
      setPositionMillis(status.positionMillis);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        if (resumeKey) {
          AsyncStorage.removeItem(`audio-progress:${resumeKey}`).catch(() => undefined);
        }
        onComplete?.();
        // TODO: Registrar conclusão no Firestore (collection `userProgress`) ou chamar o endpoint backend POST /progress/complete.
      } else if (resumeKey) {
        AsyncStorage.setItem(`audio-progress:${resumeKey}`, String(status.positionMillis)).catch(() => undefined);
      }
    },
    [duration, onComplete, resumeKey]
  );

  useEffect(() => {
    let isMounted = true;
    const setupAudioAsync = async () => {
      try {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.InterruptionModeAndroid.DO_NOT_MIX,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: false, rate: playbackRate },
          (status) => handleStatusUpdate(status)
        );

        soundRef.current = sound;

        if (resumeKey) {
          const savedPosition = await AsyncStorage.getItem(`audio-progress:${resumeKey}`);
          if (savedPosition) {
            await sound.setPositionAsync(Number(savedPosition));
          }
        }

        if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.warn('Falha ao carregar áudio', error);
      }
    };

    setupAudioAsync();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => undefined);
      }
    };
  }, [audioUrl, handleStatusUpdate, playbackRate, resumeKey]);

  const togglePlayback = async () => {
    const sound = soundRef.current;
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const handleSeek = async (value: number) => {
    const sound = soundRef.current;
    if (!sound) return;
    await sound.setPositionAsync(value);
  };

  const changeSpeed = async () => {
    const sound = soundRef.current;
    if (!sound) return;
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackRate);
    const nextRate = PLAYBACK_SPEEDS[(currentIndex + 1) % PLAYBACK_SPEEDS.length];
    await sound.setRateAsync(nextRate, true);
    setPlaybackRate(nextRate);
  };

  const skip = async (amount: number) => {
    const sound = soundRef.current;
    if (!sound) return;
    const totalDurationMillis = durationMillis || (duration ? duration * 1000 : 0);
    const newPosition = Math.max(0, Math.min(totalDurationMillis, positionMillis + amount));
    await sound.setPositionAsync(newPosition);
  };

  const progressSeconds = positionMillis / 1000;
  const totalSeconds = (durationMillis || (duration ? duration * 1000 : 0)) / 1000;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      <Slider
        value={positionMillis}
        minimumValue={0}
        maximumValue={durationMillis || (duration ? duration * 1000 : 1)}
        onSlidingComplete={handleSeek}
        minimumTrackTintColor="#4EAC6D"
        accessibilityLabel="Barra de progresso do áudio"
      />
      <View style={styles.timeRow}>
        <Text>{formatTime(progressSeconds)}</Text>
        <Text>{formatTime(totalSeconds)}</Text>
      </View>
      <View style={styles.controls}>
        <IconButton icon="rewind" onPress={() => skip(-15000)} accessibilityLabel="Voltar 15 segundos" />
        <IconButton
          icon={isPlaying ? 'pause-circle' : 'play-circle'}
          size={48}
          onPress={togglePlayback}
          disabled={isBuffering}
          accessibilityLabel={isPlaying ? 'Pausar áudio' : 'Reproduzir áudio'}
        />
        <IconButton icon="fast-forward" onPress={() => skip(15000)} accessibilityLabel="Avançar 15 segundos" />
      </View>
      <Button mode="text" onPress={changeSpeed}>
        Velocidade: {playbackRate.toFixed(2)}x
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});

export default AudioPlayer;
