import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Room,
  RoomEvent,
  Track,
  LocalParticipant,
  RemoteParticipant,
  Participant,
  ConnectionState,
} from '@livekit/react-native';

const LIVEKIT_URL = process.env.EXPO_PUBLIC_LIVEKIT_URL!;

interface ParticipantInfo {
  identity: string;
  name: string;
  isSpeaking: boolean;
  audioLevel: number;
  isMuted: boolean;
  isLocal: boolean;
}

interface UseLiveKitReturn {
  room: Room | null;
  connectionState: ConnectionState;
  localParticipant: LocalParticipant | null;
  remoteParticipants: ParticipantInfo[];
  isMuted: boolean;
  connect: (token: string) => Promise<void>;
  disconnect: () => void;
  toggleMic: () => Promise<void>;
}

export function useLiveKit(): UseLiveKitReturn {
  const roomRef = useRef<Room | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.Disconnected
  );
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
  const [remoteParticipants, setRemoteParticipants] = useState<ParticipantInfo[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  const updateParticipants = useCallback((room: Room) => {
    const infos: ParticipantInfo[] = [];
    room.remoteParticipants.forEach((p) => {
      infos.push(buildInfo(p, false));
    });
    setRemoteParticipants(infos);
  }, []);

  const connect = useCallback(async (token: string) => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
    }
    const room = new Room();
    roomRef.current = room;

    room.on(RoomEvent.ConnectionStateChanged, (state) => setConnectionState(state));
    room.on(RoomEvent.ParticipantConnected, () => updateParticipants(room));
    room.on(RoomEvent.ParticipantDisconnected, () => updateParticipants(room));
    room.on(RoomEvent.TrackPublished, () => updateParticipants(room));
    room.on(RoomEvent.TrackUnpublished, () => updateParticipants(room));
    room.on(RoomEvent.ActiveSpeakersChanged, () => updateParticipants(room));
    room.on(RoomEvent.LocalTrackPublished, () => {
      setLocalParticipant(room.localParticipant);
      setIsMuted(!room.localParticipant.isMicrophoneEnabled);
    });

    await room.connect(LIVEKIT_URL, token);
    setLocalParticipant(room.localParticipant);
    updateParticipants(room);
  }, [updateParticipants]);

  const disconnect = useCallback(() => {
    roomRef.current?.disconnect();
    roomRef.current = null;
    setConnectionState(ConnectionState.Disconnected);
    setLocalParticipant(null);
    setRemoteParticipants([]);
  }, []);

  const toggleMic = useCallback(async () => {
    const local = roomRef.current?.localParticipant;
    if (!local) return;
    const enabled = local.isMicrophoneEnabled;
    await local.setMicrophoneEnabled(!enabled);
    setIsMuted(enabled);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { roomRef.current?.disconnect(); }, []);

  return {
    room: roomRef.current,
    connectionState,
    localParticipant,
    remoteParticipants,
    isMuted,
    connect,
    disconnect,
    toggleMic,
  };
}

function buildInfo(p: Participant, isLocal: boolean): ParticipantInfo {
  const audioTrack = p.getTrackPublication(Track.Source.Microphone);
  return {
    identity: p.identity,
    name: p.name ?? p.identity,
    isSpeaking: p.isSpeaking,
    audioLevel: p.audioLevel,
    isMuted: audioTrack?.isMuted ?? true,
    isLocal,
  };
}
