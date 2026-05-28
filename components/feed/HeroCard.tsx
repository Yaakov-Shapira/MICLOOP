import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radii, Spacing } from '../../constants/layout';
import { t, isRTL } from '../../i18n';
import { useAppStore } from '../../store/appStore';
import LiveBadge from '../shared/LiveBadge';
import Avatar from '../shared/Avatar';
import type { Loop } from '../../types';

interface Props {
  loop: Loop;
}

export default function HeroCard({ loop }: Props) {
  const router = useRouter();
  const { isAuthenticated, showGate } = useAppStore();

  function handleJoin() {
    if (!isAuthenticated) {
      showGate(() => router.push(`/room/${loop.id}`));
      return;
    }
    router.push(`/room/${loop.id}`);
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <LiveBadge />
        <Text style={styles.listeners}>
          {t('home.listeners', { count: loop.listenerCount })}
        </Text>
      </View>

      <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
        {loop.title}
      </Text>

      <View style={styles.speakers}>
        {loop.speakers.slice(0, 5).map((s) => (
          <Avatar key={s.userId} emoji={s.avatar} size={36} />
        ))}
        {loop.speakers.length > 5 && (
          <View style={styles.moreBubble}>
            <Text style={styles.moreText}>+{loop.speakers.length - 5}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.hostRow}>
          <Avatar emoji={loop.hostAvatar} size={24} />
          <Text style={styles.hostName}>{loop.hostName}</Text>
        </View>
        <TouchableOpacity style={styles.joinBtn} onPress={handleJoin}>
          <Text style={styles.joinText}>{t('home.joinLoop')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.live + '44',
    marginHorizontal: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  listeners: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.text2,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.text1,
    lineHeight: 28,
    marginBottom: Spacing.md,
  },
  speakers: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  moreBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  moreText: { fontFamily: Fonts.semibold, fontSize: 11, color: Colors.text2 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hostName: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.text2 },
  joinBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radii.full,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  joinText: { fontFamily: Fonts.bold, fontSize: 14, color: '#fff' },
});
