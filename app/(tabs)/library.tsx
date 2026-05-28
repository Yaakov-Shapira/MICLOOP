import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/layout';
import { t } from '../../i18n';
import { useAppStore } from '../../store/appStore';
import { subscribeLikedLoops, subscribeLoop } from '../../lib/firestore';
import PastLoopCard from '../../components/feed/PastLoopCard';
import type { Loop } from '../../types';

export default function LibraryScreen() {
  const { user } = useAppStore();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likedLoops, setLikedLoops] = useState<Loop[]>([]);

  useEffect(() => {
    if (!user) return;
    return subscribeLikedLoops(user.uid, (ids) => {
      setLikedIds(ids);
    });
  }, [user?.uid]);

  // Load loop details for each liked ID
  useEffect(() => {
    if (likedIds.size === 0) { setLikedLoops([]); return; }
    const unsubs: (() => void)[] = [];
    const map = new Map<string, Loop>();
    likedIds.forEach((id) => {
      const unsub = subscribeLoop(id, (loop) => {
        if (loop) map.set(id, loop);
        setLikedLoops(Array.from(map.values()));
      });
      unsubs.push(unsub);
    });
    return () => unsubs.forEach((u) => u());
  }, [likedIds]);

  function handleLikeToggle(loopId: string, liked: boolean) {
    setLikedIds((prev) => {
      const next = new Set(prev);
      liked ? next.add(loopId) : next.delete(loopId);
      return next;
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('library.title')}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>{t('library.liked')}</Text>
        {likedLoops.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>❤️</Text>
            <Text style={styles.emptyText}>{t('library.empty')}</Text>
          </View>
        ) : (
          likedLoops.map((loop) => (
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  title: { fontFamily: Fonts.extrabold, fontSize: 24, color: Colors.text1 },
  scroll: { flex: 1 },
  content: { paddingTop: Spacing.xs, gap: Spacing.sm },
  sectionLabel: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: Colors.text2,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  emptyContainer: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.text3,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
