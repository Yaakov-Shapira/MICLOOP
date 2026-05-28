import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  position: number;
  duration: number;
  load: (uri: string) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  unload: () => Promise<void>;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const onPlaybackStatus = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis);
    if (status.durationMillis) setDuration(status.durationMillis);
    if (status.didJustFinish) setIsPlaying(false);
  }, []);

  const load = useCallback(async (uri: string) => {
    if (soundRef.current) await soundRef.current.unloadAsync();
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false },
      onPlaybackStatus
    );
    soundRef.current = sound;
  }, [onPlaybackStatus]);

  const play = useCallback(async () => {
    await soundRef.current?.playAsync();
  }, []);

  const pause = useCallback(async () => {
    await soundRef.current?.pauseAsync();
  }, []);

  const seek = useCallback(async (positionMs: number) => {
    await soundRef.current?.setPositionAsync(positionMs);
  }, []);

  const unload = useCallback(async () => {
    await soundRef.current?.unloadAsync();
    soundRef.current = null;
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);
  }, []);

  useEffect(() => () => { soundRef.current?.unloadAsync(); }, []);

  return { isPlaying, position, duration, load, play, pause, seek, unload };
}
