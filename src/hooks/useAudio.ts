import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';

interface UseAudioOptions {
  shouldPlay?: boolean;
}

export interface UseAudioResult {
  isLoading: boolean;
  isPlaying: boolean;
  error: Error | null;
  positionMillis: number;
  durationMillis: number;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setRate: (rate: number) => Promise<void>;
}

/**
 * Hook utilitário para abstrair operações com expo-av. Exemplo de uso:
 * ```ts
 * const { play, pause, isPlaying } = useAudio('https://url/audio.mp3');
 * ```
 */
const useAudio = (uri: string, options: UseAudioOptions = {}): UseAudioResult => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const shouldPlay = options.shouldPlay ?? false;

  const handleStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setIsPlaying(status.isPlaying);
    setPositionMillis(status.positionMillis);
    setDurationMillis(status.durationMillis ?? 0);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay }, handleStatusUpdate);
        if (isMounted) {
          soundRef.current = sound;
          setIsLoading(false);
        }
      } catch (loadError: any) {
        if (isMounted) {
          setError(loadError);
          setIsLoading(false);
        }
      }
    };

    loadSound();

    return () => {
      isMounted = false;
      soundRef.current?.unloadAsync().catch(() => undefined);
    };
  }, [uri, shouldPlay, handleStatusUpdate]);

  const play = useCallback(async () => {
    if (!soundRef.current) return;
    await soundRef.current.playAsync();
  }, []);

  const pause = useCallback(async () => {
    if (!soundRef.current) return;
    await soundRef.current.pauseAsync();
  }, []);

  const seekTo = useCallback(async (position: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(position);
  }, []);

  const setRate = useCallback(async (rate: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setRateAsync(rate, true);
  }, []);

  return {
    isLoading,
    isPlaying,
    error,
    positionMillis,
    durationMillis,
    play,
    pause,
    seekTo,
    setRate,
  };
};

export default useAudio;
