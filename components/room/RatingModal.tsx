import { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radii, Spacing } from '../../constants/layout';
import { t } from '../../i18n';
import { rateLoop } from '../../lib/firestore';
import { useAppStore } from '../../store/appStore';

interface Props {
  loopId: string;
  visible: boolean;
  onDone: () => void;
}

export default function RatingModal({ loopId, visible, onDone }: Props) {
  const [stars, setStars] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const { user, showToast } = useAppStore();

  async function handleSubmit() {
    if (!user || stars === 0) return;
    setSubmitted(true);
    await rateLoop(loopId, user.uid, stars);
    showToast(t('toasts.ratingSubmitted'));
    onDone();
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('room.rateLoop')}</Text>
          <Text style={styles.subtitle}>{t('room.rateSubtitle')}</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setStars(s)}>
                <Text style={[styles.star, s <= stars && styles.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.submitBtn, (stars === 0 || submitted) && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={stars === 0 || submitted}
          >
            <Text style={styles.submitText}>{t('room.submit')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDone}>
            <Text style={styles.skip}>{t('room.skip')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.text1, marginBottom: Spacing.xs },
  subtitle: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.text2, marginBottom: Spacing.lg },
  stars: { flexDirection: 'row', gap: 12, marginBottom: Spacing.xl },
  star: { fontSize: 40, color: Colors.text3 },
  starActive: { color: '#FFD700' },
  submitBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radii.full,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginBottom: Spacing.sm,
  },
  submitDisabled: { opacity: 0.4 },
  submitText: { fontFamily: Fonts.bold, fontSize: 16, color: '#fff' },
  skip: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.text3 },
});
