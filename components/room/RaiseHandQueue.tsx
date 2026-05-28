import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radii, Spacing } from '../../constants/layout';
import { t } from '../../i18n';
import { lowerHand } from '../../lib/firestore';
import { promoteToSpeaker } from '../../lib/livekit';
import { useAppStore } from '../../store/appStore';

interface QueueItem {
  userId: string;
  name: string;
  avatar: string;
}

interface Props {
  loopId: string;
  queue: QueueItem[];
}

export default function RaiseHandQueue({ loopId, queue }: Props) {
  const { showToast } = useAppStore();

  async function handleApprove(item: QueueItem) {
    try {
      await promoteToSpeaker(loopId, item.userId);
      await lowerHand(loopId, item.userId);
      showToast(`${item.name} הצטרף לשיחה`);
    } catch {
      showToast(t('errors.genericError'), 'error');
    }
  }

  async function handleDeny(item: QueueItem) {
    await lowerHand(loopId, item.userId);
  }

  if (queue.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>
        {t('room.queue')} ({queue.length})
      </Text>
      <ScrollView>
        {queue.map((item) => (
          <View key={item.userId} style={styles.row}>
            <Text style={styles.emoji}>{item.avatar}</Text>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <View style={styles.btns}>
              <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item)}>
                <Text style={styles.approveTxt}>{t('room.approve')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.denyBtn} onPress={() => handleDeny(item)}>
                <Text style={styles.denyTxt}>{t('room.deny')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 200,
  },
  heading: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.text2, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8 },
  emoji: { fontSize: 22 },
  name: { flex: 1, fontFamily: Fonts.regular, fontSize: 14, color: Colors.text1 },
  btns: { flexDirection: 'row', gap: 8 },
  approveBtn: {
    backgroundColor: Colors.green,
    borderRadius: Radii.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  approveTxt: { fontFamily: Fonts.bold, fontSize: 12, color: '#fff' },
  denyBtn: {
    backgroundColor: Colors.bgDeep,
    borderRadius: Radii.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  denyTxt: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.text2 },
});
