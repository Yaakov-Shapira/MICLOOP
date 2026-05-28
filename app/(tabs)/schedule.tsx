import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radii, Spacing } from '../../constants/layout';
import { t, isRTL } from '../../i18n';
import { useScheduledLoops } from '../../hooks/useLoops';
import { useAppStore } from '../../store/appStore';
import GlassCard from '../../components/shared/GlassCard';
import type { Loop } from '../../types';

function formatScheduled(loop: Loop): string {
  if (!loop.scheduledFor) return '';
  const d = loop.scheduledFor.toDate();
  return d.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function ScheduleScreen() {
  const loops = useScheduledLoops();
  const { isAuthenticated, showGate, showToast } = useAppStore();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [reminded, setReminded] = useState<Set<string>>(new Set());

  function toggleReminder(id: string) {
    if (!isAuthenticated) { showGate(); return; }
    setReminded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      showToast(next.has(id) ? t('schedule.reminded') : t('schedule.remind'), 'info');
      return next;
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('schedule.title')}</Text>
        {isAuthenticated && (
          <TouchableOpacity style={styles.addBtn} onPress={() => setSheetVisible(true)}>
            <Text style={styles.addText}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loops.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyText}>{t('schedule.noScheduled')}</Text>
          </View>
        ) : (
          loops.map((loop) => (
            <GlassCard key={loop.id} style={styles.card}>
              <View style={styles.cardInner}>
                <View style={styles.dot} />
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {loop.title}
                  </Text>
                  <Text style={styles.cardTime}>{formatScheduled(loop)}</Text>
                  <Text style={styles.cardHost}>{loop.hostName}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.remindBtn, reminded.has(loop.id) && styles.remindBtnActive]}
                  onPress={() => toggleReminder(loop.id)}
                >
                  <Text style={styles.remindIcon}>{reminded.has(loop.id) ? '🔔' : '🔕'}</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      <ScheduleSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
    </SafeAreaView>
  );
}

function ScheduleSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const { showToast } = useAppStore();

  function handleCreate() {
    if (!title.trim()) return;
    // TODO: Wire to Firestore createScheduledLoop
    showToast('לופ תוזמן! (בקרוב)', 'info');
    setTitle('');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={[styles.sheetTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('schedule.scheduleLoop')}
          </Text>
          <TextInput
            style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
            value={title}
            onChangeText={(v) => setTitle(v.slice(0, 80))}
            placeholder={t('schedule.titleField')}
            placeholderTextColor={Colors.text3}
            autoFocus
          />
          <TouchableOpacity
            style={[styles.createBtn, !title.trim() && styles.createDisabled]}
            onPress={handleCreate}
            disabled={!title.trim()}
          >
            <Text style={styles.createText}>{t('schedule.create')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  title: { fontFamily: Fonts.extrabold, fontSize: 24, color: Colors.text1 },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  addText: { color: '#fff', fontSize: 24, lineHeight: 28 },
  content: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, gap: Spacing.sm },
  card: { padding: Spacing.md },
  cardInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.accent, marginTop: 2 },
  cardInfo: { flex: 1 },
  cardTitle: { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.text1 },
  cardTime: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.accentLight, marginTop: 2 },
  cardHost: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.text3 },
  remindBtn: {
    padding: 6, borderRadius: 99,
    backgroundColor: Colors.bgDeep,
    borderWidth: 1, borderColor: Colors.border,
  },
  remindBtnActive: { borderColor: Colors.accent },
  remindIcon: { fontSize: 18 },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.text3 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBg: { flex: 1, backgroundColor: Colors.overlay },
  sheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: Radii.xl, borderTopRightRadius: Radii.xl,
    padding: Spacing.lg, paddingBottom: 40,
    borderWidth: 1, borderColor: Colors.border,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.text3, alignSelf: 'center', marginBottom: Spacing.md,
  },
  sheetTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.text1, marginBottom: Spacing.md },
  input: {
    backgroundColor: Colors.bgDeep, borderRadius: Radii.md,
    borderWidth: 1, borderColor: Colors.border,
    color: Colors.text1, fontFamily: Fonts.regular, fontSize: 16,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  createBtn: {
    backgroundColor: Colors.accent, borderRadius: Radii.full,
    paddingVertical: 14, alignItems: 'center',
  },
  createDisabled: { opacity: 0.4 },
  createText: { fontFamily: Fonts.bold, fontSize: 16, color: '#fff' },
});
