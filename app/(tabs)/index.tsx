import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radii, Spacing } from '../../constants/layout';
import { t, isRTL } from '../../i18n';
import { useLiveLoops, usePastLoops } from '../../hooks/useLoops';
import { subscribeLikedLoops } from '../../lib/firestore';
import { createLoop } from '../../lib/livekit';
import { useAppStore } from '../../store/appStore';
import HeroCard from '../../components/feed/HeroCard';
import MiniLoopCard from '../../components/feed/MiniLoopCard';
import PastLoopCard from '../../components/feed/PastLoopCard';
import { useEffect } from 'react';
import type { Loop } from '../../types';

export default function HomeScreen() {
  const router = useRouter();
  const liveLoops = useLiveLoops();
  const pastLoops = usePastLoops();
  const { user, isAuthenticated, showGate, showToast } = useAppStore();

  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [sheetVisible, setSheetVisible] = useState(false);
  const [loopTitle, setLoopTitle] = useState('');
  const [creating, setCreating] = useState(false);

  // Subscribe to liked loop IDs
  useEffect(() => {
    if (!user) return;
    return subscribeLikedLoops(user.uid, setLikedIds);
  }, [user?.uid]);

  function handleStartLoop() {
    if (!isAuthenticated) {
      showGate(() => setSheetVisible(true));
      return;
    }
    setSheetVisible(true);
  }

  async function handleCreate() {
    if (!loopTitle.trim() || creating) return;
    setCreating(true);
    try {
      const { loopId, token } = await createLoop(loopTitle.trim());
      setSheetVisible(false);
      setLoopTitle('');
      router.push({ pathname: `/room/${loopId}`, params: { token, role: 'host' } });
    } catch {
      showToast(t('errors.genericError'), 'error');
    } finally {
      setCreating(false);
    }
  }

  function handleLikeToggle(loopId: string, liked: boolean) {
    setLikedIds((prev) => {
      const next = new Set(prev);
      liked ? next.add(loopId) : next.delete(loopId);
      return next;
    });
  }

  const heroLoop = liveLoops[0] ?? null;
  const secondaryLoops = liveLoops.slice(1);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>🎙️ MicLoop</Text>
        <TouchableOpacity style={styles.startBtn} onPress={handleStartLoop}>
          <Text style={styles.startText}>{t('home.startLoop')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Live Section */}
        {liveLoops.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('home.liveNow')}</Text>
            </View>
            {heroLoop && <HeroCard loop={heroLoop} />}
            {secondaryLoops.map((loop) => (
              <MiniLoopCard key={loop.id} loop={loop} />
            ))}
          </>
        )}

        {/* Past Loops */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.pastLoops')}</Text>
        </View>
        {pastLoops.length === 0 ? (
          <Text style={styles.empty}>{t('home.noLiveLoops')}</Text>
        ) : (
          pastLoops.map((loop) => (
            <PastLoopCard
              key={loop.id}
              loop={loop}
              liked={likedIds.has(loop.id)}
              onLikeToggle={handleLikeToggle}
            />
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* New Loop Sheet */}
      <Modal visible={sheetVisible} transparent animationType="slide" onRequestClose={() => setSheetVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setSheetVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={[styles.sheetTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('newLoop.title')}
            </Text>
            <TextInput
              style={[styles.sheetInput, { textAlign: isRTL ? 'right' : 'left' }]}
              value={loopTitle}
              onChangeText={(v) => setLoopTitle(v.slice(0, 80))}
              placeholder={t('newLoop.placeholder')}
              placeholderTextColor={Colors.text3}
              multiline
              autoFocus
            />
            <Text style={styles.charCount}>{t('newLoop.charLimit', { count: loopTitle.length })}</Text>
            <TouchableOpacity
              style={[styles.createBtn, (!loopTitle.trim() || creating) && styles.createBtnDisabled]}
              onPress={handleCreate}
              disabled={!loopTitle.trim() || creating}
            >
              {creating ? (
                <ActivityIndicator color={Colors.bg} />
              ) : (
                <Text style={styles.createBtnText}>{t('newLoop.start')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
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
  logo: { fontFamily: Fonts.extrabold, fontSize: 20, color: Colors.text1 },
  startBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radii.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  startText: { fontFamily: Fonts.bold, fontSize: 14, color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { gap: Spacing.sm, paddingTop: Spacing.xs },
  sectionHeader: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: 4 },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 17, color: Colors.text1 },
  empty: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.text3,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  // Sheet
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1, backgroundColor: Colors.overlay },
  sheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    padding: Spacing.lg,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.text3,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.text1, marginBottom: Spacing.md },
  sheetInput: {
    backgroundColor: Colors.bgDeep,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text1,
    fontFamily: Fonts.regular,
    fontSize: 16,
    padding: Spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.text3, textAlign: 'right', marginTop: 4 },
  createBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radii.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  createBtnDisabled: { opacity: 0.4 },
  createBtnText: { fontFamily: Fonts.bold, fontSize: 16, color: '#fff' },
});
