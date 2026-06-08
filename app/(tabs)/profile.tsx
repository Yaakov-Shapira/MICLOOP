import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radii, Spacing } from '../../constants/layout';
import { t, isRTL } from '../../i18n';
import { useAppStore } from '../../store/appStore';
import { upsertUser, submitHostRequest, subscribeHostRequests, updateHostRequestStatus } from '../../lib/firestore';
import GlassCard from '../../components/shared/GlassCard';
import type { HostRequest } from '../../types';

export default function ProfileScreen() {
  const { user, setUser, showToast, isAuthenticated, showGate } = useAppStore();
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [hostSheetVisible, setHostSheetVisible] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user?.name]);

  async function handleSave() {
    if (!user || !name.trim()) return;
    setSaving(true);
    await upsertUser(user.uid, { name: name.trim() });
    setUser({ ...user, name: name.trim() });
    showToast('פרופיל עודכן');
    setSaving(false);
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.notLoggedIn}>
          <Text style={styles.nlEmoji}>👤</Text>
          <Text style={styles.nlText}>כניסה נדרשת</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => showGate()}>
            <Text style={styles.signInText}>{t('gate.signIn')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isAdmin = user?.isAdmin === true;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('profile.title')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarBig}>
            <Text style={styles.avatarEmoji}>{user?.avatar ?? '🎙️'}</Text>
          </View>
          {user?.verifyStatus === 'verified' && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>{t('profile.hostBadge')}</Text>
            </View>
          )}
        </View>

        {/* Name */}
        <GlassCard style={styles.card}>
          <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('profile.name')}
          </Text>
          <TextInput
            style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
            value={name}
            onChangeText={setName}
            placeholder={t('auth.namePlaceholder')}
            placeholderTextColor={Colors.text3}
          />
          <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('profile.phone')}
          </Text>
          <Text style={[styles.phoneText, { textAlign: isRTL ? 'right' : 'left' }]}>
            {user?.phone}
          </Text>
          <TouchableOpacity
            style={[styles.saveBtn, (name === user?.name || saving) && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={name === user?.name || saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors.bg} />
            ) : (
              <Text style={styles.saveBtnText}>{t('profile.save')}</Text>
            )}
          </TouchableOpacity>
        </GlassCard>

        {/* Become Host */}
        {user?.verifyStatus !== 'verified' && (
          <GlassCard style={styles.card}>
            <Text style={styles.sectionTitle}>{t('profile.becomeHost')}</Text>
            <Text style={styles.sectionDesc}>
              {user?.verifyStatus === 'pending'
                ? '✅ ' + t('profile.requestSent')
                : 'רוצה לארח לופים? שלח בקשה'}
            </Text>
            {user?.verifyStatus !== 'pending' && (
              <TouchableOpacity
                style={styles.hostBtn}
                onPress={() => setHostSheetVisible(true)}
              >
                <Text style={styles.hostBtnText}>{t('profile.requestHost')}</Text>
              </TouchableOpacity>
            )}
          </GlassCard>
        )}

        {/* Admin Panel */}
        {isAdmin && <AdminPanel />}

        <View style={{ height: 32 }} />
      </ScrollView>

      {hostSheetVisible && (
        <HostRequestSheet
          onClose={() => setHostSheetVisible(false)}
          onSubmit={() => {
            setHostSheetVisible(false);
            if (user) setUser({ ...user, verifyStatus: 'pending' });
            showToast(t('profile.requestSent'));
          }}
        />
      )}
    </SafeAreaView>
  );
}

function HostRequestSheet({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  const { user } = useAppStore();
  const [topic, setTopic] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!user || !topic.trim()) return;
    setLoading(true);
    await submitHostRequest({
      userId: user.uid,
      name: user.name || '',
      phone: user.phone || '',
      topic: topic.trim(),
      preferredTime: time.trim(),
    });
    await upsertUser(user.uid, { verifyStatus: 'pending' });
    onSubmit();
  }

  return (
    <View style={styles.hostSheet}>
      <Text style={styles.sheetTitle}>{t('profile.requestHost')}</Text>
      <TextInput
        style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
        value={topic}
        onChangeText={setTopic}
        placeholder={t('profile.topic')}
        placeholderTextColor={Colors.text3}
      />
      <TextInput
        style={[styles.input, { textAlign: isRTL ? 'right' : 'left' }]}
        value={time}
        onChangeText={setTime}
        placeholder={t('profile.preferredTime')}
        placeholderTextColor={Colors.text3}
      />
      <TouchableOpacity
        style={[styles.saveBtn, (!topic.trim() || loading) && styles.saveBtnDisabled]}
        onPress={handleSend}
        disabled={!topic.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.bg} />
        ) : (
          <Text style={styles.saveBtnText}>{t('profile.sendRequest')}</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={onClose} style={{ marginTop: Spacing.sm, alignItems: 'center' }}>
        <Text style={styles.cancelText}>{t('gate.cancel')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function AdminPanel() {
  const [requests, setRequests] = useState<HostRequest[]>([]);
  const { showToast } = useAppStore();

  useEffect(() => subscribeHostRequests(setRequests), []);

  async function handleDecision(id: string, status: 'approved' | 'rejected') {
    await updateHostRequestStatus(id, status);
    showToast(status === 'approved' ? 'אושר!' : 'נדחה');
  }

  return (
    <GlassCard style={styles.card}>
      <Text style={styles.sectionTitle}>{t('profile.admin')} ({requests.length})</Text>
      {requests.map((r) => (
        <View key={r.id} style={styles.adminRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.adminName}>{r.name}</Text>
            <Text style={styles.adminTopic}>{r.topic}</Text>
          </View>
          <TouchableOpacity
            style={styles.approveBtn}
            onPress={() => handleDecision(r.id, 'approved')}
          >
            <Text style={styles.approveTxt}>✓</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => handleDecision(r.id, 'rejected')}
          >
            <Text style={styles.rejectTxt}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      {requests.length === 0 && (
        <Text style={styles.adminEmpty}>אין בקשות ממתינות</Text>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  title: { fontFamily: Fonts.extrabold, fontSize: 24, color: Colors.text1 },
  content: { paddingHorizontal: Spacing.md, paddingTop: Spacing.xs, gap: Spacing.md },
  avatarSection: { alignItems: 'center', paddingVertical: Spacing.md, gap: Spacing.sm },
  avatarBig: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.bgCard,
    borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 44 },
  verifiedBadge: {
    backgroundColor: Colors.accent + '22',
    borderRadius: Radii.full,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.accent + '66',
  },
  verifiedText: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.accentLight },
  card: { padding: Spacing.md, gap: Spacing.xs },
  label: { fontFamily: Fonts.semibold, fontSize: 13, color: Colors.text2, marginBottom: 2 },
  input: {
    backgroundColor: Colors.bgDeep, borderRadius: Radii.md,
    borderWidth: 1, borderColor: Colors.border,
    color: Colors.text1, fontFamily: Fonts.regular, fontSize: 15,
    padding: Spacing.sm, marginBottom: Spacing.sm,
  },
  phoneText: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.text3, marginBottom: Spacing.sm },
  saveBtn: {
    backgroundColor: Colors.accent, borderRadius: Radii.full,
    paddingVertical: 12, alignItems: 'center', marginTop: Spacing.xs,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontFamily: Fonts.bold, fontSize: 15, color: '#fff' },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.text1, marginBottom: 4 },
  sectionDesc: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.text2, marginBottom: Spacing.sm },
  hostBtn: {
    backgroundColor: Colors.bgDeep, borderRadius: Radii.full,
    paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.accent,
  },
  hostBtnText: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.accentLight },
  hostSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: Radii.xl, borderTopRightRadius: Radii.xl,
    padding: Spacing.lg, paddingBottom: 40,
    borderWidth: 1, borderColor: Colors.border,
  },
  sheetTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.text1, marginBottom: Spacing.md },
  cancelText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.text3 },
  adminRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  adminName: { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.text1 },
  adminTopic: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.text3 },
  approveBtn: {
    backgroundColor: Colors.green, borderRadius: 99,
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
  },
  approveTxt: { color: '#fff', fontFamily: Fonts.bold, fontSize: 16 },
  rejectBtn: {
    backgroundColor: Colors.live, borderRadius: 99,
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
  },
  rejectTxt: { color: '#fff', fontFamily: Fonts.bold, fontSize: 14 },
  adminEmpty: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.text3, textAlign: 'center', paddingVertical: Spacing.sm },
  notLoggedIn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  nlEmoji: { fontSize: 56 },
  nlText: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.text1 },
  signInBtn: {
    backgroundColor: Colors.accent, borderRadius: Radii.full,
    paddingHorizontal: 32, paddingVertical: 12,
  },
  signInText: { fontFamily: Fonts.bold, fontSize: 15, color: '#fff' },
});
