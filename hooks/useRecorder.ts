import { useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { useAppStore } from '../store/appStore';
import { t } from '../i18n';

type RecordingStatus = 'idle' | 'recording' | 'stopped';

interface UseRecorderReturn {
  status: RecordingStatus;
  elapsed: number;
  uri: string | null;
  metering: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  reset: () => void;
}

export function useRecorder(): UseRecorderReturn {
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [uri, setUri] = useState<string | null>(null);
  const [metering, setMetering] = useState(-160);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { showToast } = useAppStore();

  const startRecording = useCallback(async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.metering !== undefined) setMetering(status.metering);
        },
        100
      );
      recordingRef.current = recording;
      setStatus('recording');
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((s) => s + 1);
      }, 1000);
    } catch {
      showToast(t('errors.micPermission'), 'error');
    }
  }, [showToast]);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return;
    if (timerRef.current) clearInterval(timerRef.current);

    await recordingRef.current.stopAndUnloadAsync();
    const fileUri = recordingRef.current.getURI();
    recordingRef.current = null;
    setStatus('stopped');
    setUri(fileUri ?? null);
    if (fileUri) showToast(t('toasts.recordingSaved'));
  }, [showToast]);

  const reset = useCallback(() => {
    setStatus('idle');
    setElapsed(0);
    setUri(null);
    setMetering(-160);
  }, []);

  return { status, elapsed, uri, metering, startRecording, stopRecording, reset };
}
