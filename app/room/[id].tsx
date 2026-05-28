import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/layout';
import { t, isRTL } from '../../i18n';
import { useLoop } from '../../hooks/useLoop';
import { useLiveKit } from '../../hooks/useLiveKit';
import { joinLoop, endLoop } from '../../lib/livekit';
import { raiseHand, lowerHand } from '../../lib/firestore';
import { useAppStore } from '../../store/appStore';
import LiveBadge from '../../components/shared/LiveBadge';
import HostStage from '../../components/room/HostStage';
import GuestBubbles from '../../components/room/GuestBubbles';
import ListenerAvatars from '../../components/room/ListenerAvatars';
import RaiseHandQueue from '../../components/room/RaiseHandQueue';
import BottomBar from '../../components/room/BottomBar';
import ChatPanel from '../../components/room/ChatPanel';
import RatingModal from '../../components/room/RatingModal';
import type { Speaker } from '../../types';

export default function RoomScreen() {
  const { id, token: initialToken, role: initialRole } = useLocalSearchParams<{
    id: string;
    token?: string;
    role?: string;
  }>();
  const router = useRouter();
  const { user, showToast } = useAppStore();

  const { loop, queue } = useLoop(id);
  const { connect, disconnect, toggleMic, isMuted, remoteParticipants, connectionState } =
    useLiveKit();

  const [role, setRole] = useState<'host' | 'speaker' | 'listener'>(
    (initialRole as any) ?? 'listener'
  );
  const [handRaised, setHandRaised] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [ratingVisible, setRatingVisible] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Connect to LiveKit room on mount
  useEffect(() => {
    async function join() {
      try {
        const token = initialToken ?? (await joinLoop(id)).token;
        await connect(token);
      } catch {
        showToast(t('errors.genericError'), 'error');
        router.back();
      }
    }
    join();
    return disconnect;
  }, [id]);

  // Elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Watch if loop ended by host
  useEffect(() => {
    if (loop?.status === 'ended' && role !== 'host') {
      showToast(t('toasts.loopEnded'));
      setRatingVisible(true);
    }
  }, [loop?.status]);

  function formatElapsed(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  async function handleRaiseHand() {
    if (!user) return;
    if (handRaised) {
      await lowerHand(id, user.uid);
      setHandRaised(false);
      showToast(t('toasts.handLowered'), 'info');
    } else {
      await raiseHand(id, { userId: user.uid, name: user.name, avatar: user.avatar });
      setHandRaised(true);
      showToast(t('toasts.handRaised'), 'info');
    }
  }

  async function handleLeave() {
    if (role === 'host') {
      Alert.alert(
        t('room.endLoop'),
        'האם לסיים את הלופ לכולם?',
        [
          { text: t('gate.cancel'), style: 'cancel' },
          {
            text: t('room.endLoop'),
            style: 'destructive',
            onPress: async () => {
              await endLoop(id);
              disconnect();
              router.back();
            },
          },
        ]
      );
    } else {
      disconnect();
      setRatingVisible(true);
    }
  }

  function handleRatingDone() {
    setRatingVisible(false);
    router.back();
  }

  const host = loop?.speakers.find((s) => s.userId === loop.hostId) ?? {
    userId: loop?.hostId ?? '',
    name: loop?.hostName ?? '',
    avatar: loop?.hostAvatar ?? '🎙️',
    muted: false,
  };

  const guests: Speaker[] = (loop?.speakers ?? []).filter((s) => s.userId !== loop?.hostId);

  const isHostSpeaking = remoteParticipants.find(
    (p) => p.identity === loop?.hostId
  )?.isSpeaking ?? false;

  // Fake listener list from remote participants
  const listeners = remoteParticipants
    .filter((p) => !loop?.speakers.find((s) => s.userId === p.identity))
    .map((p) => ({ userId: p.identity, name: p.name, avatar: '🎧' }));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <LiveBadge />
          <Text style={styles.timer}>{formatElapsed(elapsed)}</Text>
        </View>
        <TouchableOpacity onPress={() => setChatVisible(true)}>
          <Text style={styles.chatIcon}>💬</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        {loop?.title && (
          <Text style={[styles.loopTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {loop.title}
          </Text>
        )}

        {/* Host Stage */}
        <HostStage
          name={host.name}
          avatar={host.avatar}
          isSpeaking={role === 'host' ? !isMuted : isHostSpeaking}
          audioLevel={0}
        />

        {/* Guest Speakers */}
        <GuestBubbles
          guests={guests}
          isHost={role === 'host'}
        />

        {/* Raise-hand queue (host only) */}
        {role === 'host' && queue.length > 0 && (
          <RaiseHandQueue loopId={id} queue={queue} />
        )}

        {/* Listeners */}
        <ListenerAvatars
          listeners={listeners}
          totalCount={loop?.listenerCount ?? 0}
        />
      </ScrollView>

      {/* Bottom Action Bar */}
      <BottomBar
        role={role}
        isMuted={isMuted}
        handRaised={handRaised}
        onMicToggle={toggleMic}
        onRaiseHand={handleRaiseHand}
        onLeave={handleLeave}
        onOpenChat={() => setChatVisible(true)}
      />

      {/* Chat Panel */}
      <Modal visible={chatVisible} animationType="slide" onRequestClose={() => setChatVisible(false)}>
        <SafeAreaView style={styles.chatSafe}>
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setChatVisible(false)}>
              <Text style={styles.chatClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ChatPanel loopId={id} />
        </SafeAreaView>
      </Modal>

      {/* Rating Modal */}
      <RatingModal
        loopId={id}
        visible={ratingVisible}
        onDone={handleRatingDone}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 22, color: Colors.text2 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timer: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.text2 },
  chatIcon: { fontSize: 22 },
  scroll: { flex: 1 },
  scrollContent: { paddingVertical: Spacing.lg, gap: Spacing.lg, alignItems: 'center' },
  loopTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.text1,
    paddingHorizontal: Spacing.xl,
    textAlign: 'center',
  },
  chatSafe: { flex: 1, backgroundColor: Colors.bgDeep },
  chatHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'flex-end',
  },
  chatClose: { fontSize: 18, color: Colors.text2 },
});
