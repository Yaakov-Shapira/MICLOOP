import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radii, Spacing } from '../../constants/layout';
import { t, isRTL } from '../../i18n';
import { likeLoop, unlikeLoop } from '../../lib/firestore';
import { useAppStore } from '../../store/appStore';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import Avatar from '../shared/Avatar';
import type { Loop } from '../../types';

interface Props {
  loop: Loop;
  liked: boolean;
  onLikeToggle: (loopId: string, liked: boolean) => void;
}

function formatTime(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function PastLoopCard({ loop, liked, onLikeToggle }: Props) {
  const { user, isAuthenticated, showGate, showToast } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const [liking, setLiking] = useState(false);
  const { isPlaying, position, duration, load, play, pause, seek, unload } = useAudioPlayer();

  async function toggleExpand() {
    if (!expanded && loop.recordingUrl) {
      await load(loop.recordingUrl);
    }
    if (expanded) {
      await unload();
    }
    setExpanded((e) => !e);
  }

  async function togglePlay() {
    if (isPlaying) await pause();
    else await play();
  }

  async function handleLike() {
    if (!isAuthenticated) { showGate(); return; }
    setLiking(true);
    try {
      if (liked) {
        await unlikeLoop(user!.uid, loop.id);
        onLikeToggle(loop.id, false);
      } else {
        await likeLoop(user!.uid, loop.id);
        onLikeToggle(loop.id, true);
      }
    } finally {
      setLiking(false);
    }
  }

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.header} onPress={toggleExpand} activeOpacity={0.8}>
        <Avatar emoji={loop.hostAvatar} size={40} />
        <View style={styles.meta}>
          <Text
            style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}
            numberOfLines={2}
          >
            {loop.title}
          </Text>
          <Text style={styles.hostLine}>
            {loop.hostName} · {loop.listenerCount} {t('home.listeners', { count: loop.listenerCount })}
          </Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.player}>
          {!loop.recordingUrl ? (
            <Text style={styles.noRecording}>אין הקלטה זמינה</Text>
          ) : (
            <>
              <View style={styles.controls}>
                <TouchableOpacity onPress={togglePlay} style={styles.playBtn}>
                  <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                </TouchableOpacity>
                <View style={styles.sliderRow}>
                  <Text style={styles.time}>{formatTime(position)}</Text>
                  <Slider
                    style={{ flex: 1 }}
                    value={duration > 0 ? position / duration : 0}
                    onSlidingComplete={(v) => seek(v * duration)}
                    minimumTrackTintColor={Colors.accent}
                    maximumTrackTintColor={Colors.border}
                    thumbTintColor={Colors.accent}
                  />
                  <Text style={styles.time}>{formatTime(duration)}</Text>
                </View>
              </View>
            </>
          )}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={styles.actionBtn} disabled={liking}>
          {liking ? (
            <ActivityIndicator size="small" color={Colors.live} />
          ) : (
            <Text style={[styles.actionIcon, liked && styles.liked]}>{liked ? '❤️' : '🤍'}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => showToast(t('toasts.linkCopied'), 'info')}
          style={styles.actionBtn}
        >
          <Text style={styles.actionIcon}>🔗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.lg,
    marginHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  meta: { flex: 1 },
  title: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.text1, marginBottom: 2 },
  hostLine: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.text3 },
  chevron: { fontSize: 12, color: Colors.text3 },
  player: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  noRecording: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.text3, textAlign: 'center' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { fontSize: 14, color: '#fff' },
  sliderRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  time: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.text3, width: 36 },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  actionBtn: { padding: 4 },
  actionIcon: { fontSize: 18 },
  liked: {},
});
