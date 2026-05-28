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

export default function MiniLoopCard({ loop }: Props) {
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
    <TouchableOpacity style={styles.card} onPress={handleJoin} activeOpacity={0.8}>
      <View style={styles.row}>
        <View style={styles.info}>
          <View style={styles.topRow}>
            <LiveBadge />
            <Text style={styles.listeners}>{loop.listenerCount}</Text>
          </View>
          <Text
            style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}
            numberOfLines={2}
          >
            {loop.title}
          </Text>
          <Text style={styles.host}>{loop.hostName}</Text>
        </View>
        <Avatar emoji={loop.hostAvatar} size={44} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  info: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  listeners: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.text2 },
  title: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.text1, marginBottom: 4 },
  host: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.text3 },
});
