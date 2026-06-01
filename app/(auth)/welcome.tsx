import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import auth from '@react-native-firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radii, Spacing } from '../../constants/layout';
import { t, isRTL } from '../../i18n';
import { upsertUser } from '../../lib/firestore';
import { useAppStore } from '../../store/appStore';

type Step = 'phone' | 'otp' | 'name';

const AVATARS = ['🎙️', '🎧', '🎵', '🎤', '🔊', '🎶', '🎼', '🎺'];

const DEV_PHONE = '+972546115919';
const DEV_CODE = '123456';

export default function WelcomeScreen() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const confirmRef = useRef<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const router = useRouter();
  const { user, setUser } = useAppStore();

  function formatPhone(raw: string) {
    return raw.startsWith('+') ? raw : `+972${raw.replace(/^0/, '')}`;
  }

  function isDevPhone() {
    return __DEV__ && formatPhone(phone) === DEV_PHONE;
  }

  async function sendCode() {
    if (!phone.trim()) return;
    setLoading(true);
    setError('');
    try {
      if (isDevPhone()) {
        setStep('otp');
        return;
      }
      confirmRef.current = await auth().signInWithPhoneNumber(formatPhone(phone));
      setStep('otp');
    } catch (e: any) {
      setError(e.message ?? t('errors.genericError'));
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    if (otp.length < 6) return;
    setLoading(true);
    setError('');
    try {
      if (isDevPhone()) {
        if (otp !== DEV_CODE) {
          setError('קוד שגוי — הכנס 123456');
          return;
        }
        await auth().signInAnonymously();
        setStep('name');
        return;
      }
      if (!confirmRef.current) return;
      await confirmRef.current.confirm(otp);
      setStep('name');
    } catch (e: any) {
      setError(t('errors.genericError'));
    } finally {
      setLoading(false);
    }
  }

  async function saveName() {
    if (!name.trim() || !user) return;
    setLoading(true);
    const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    try {
      await upsertUser(user.uid, { name: name.trim(), avatar, phone: user.phone });
    } catch {
      // Firestore write failed — update local state so routing doesn't loop
    }
    setUser({ ...user, name: name.trim(), avatar });
    router.replace('/(tabs)');
  }

  const textAlign = isRTL ? 'right' : 'left';

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.logo}>
          <Text style={styles.logoText}>🎙️</Text>
          <Text style={styles.appName}>MicLoop</Text>
        </View>

        <View style={styles.card}>
          {step === 'phone' && (
            <>
              <Text style={[styles.title, { textAlign }]}>{t('auth.welcome')}</Text>
              <Text style={[styles.subtitle, { textAlign }]}>{t('auth.subtitle')}</Text>
              <Text style={[styles.label, { textAlign }]}>{t('auth.phoneLabel')}</Text>
              <TextInput
                style={[styles.input, { textAlign }]}
                value={phone}
                onChangeText={setPhone}
                placeholder={t('auth.phonePlaceholder')}
                placeholderTextColor={Colors.text3}
                keyboardType="phone-pad"
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={sendCode}
                disabled={loading || !phone.trim()}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.bg} />
                ) : (
                  <Text style={styles.btnText}>{t('auth.sendCode')}</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {step === 'otp' && (
            <>
              <Text style={[styles.title, { textAlign }]}>{t('auth.otpLabel')}</Text>
              <Text style={[styles.subtitle, { textAlign }]}>{phone}</Text>
              {isDevPhone() && (
                <Text style={styles.devHint}>⚙️ Dev mode — הכנס 123456</Text>
              )}
              <TextInput
                style={[styles.input, styles.otpInput]}
                value={otp}
                onChangeText={setOtp}
                placeholder={t('auth.otpPlaceholder')}
                placeholderTextColor={Colors.text3}
                keyboardType="number-pad"
                maxLength={6}
                textAlign="center"
                autoFocus
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity
                style={[styles.btn, (loading || otp.length < 6) && styles.btnDisabled]}
                onPress={verifyCode}
                disabled={loading || otp.length < 6}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.bg} />
                ) : (
                  <Text style={styles.btnText}>{t('auth.verify')}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setStep('phone'); setOtp(''); }}>
                <Text style={styles.link}>{t('auth.changePhone')}</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'name' && (
            <>
              <Text style={[styles.title, { textAlign }]}>{t('auth.setName')}</Text>
              <TextInput
                style={[styles.input, { textAlign }]}
                value={name}
                onChangeText={setName}
                placeholder={t('auth.namePlaceholder')}
                placeholderTextColor={Colors.text3}
                autoCapitalize="words"
                autoFocus
              />
              <TouchableOpacity
                style={[styles.btn, (!name.trim() || loading) && styles.btnDisabled]}
                onPress={saveName}
                disabled={!name.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.bg} />
                ) : (
                  <Text style={styles.btnText}>{t('auth.nameNext')}</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.lg },
  logo: { alignItems: 'center', marginBottom: Spacing.xl },
  logoText: { fontSize: 56 },
  appName: {
    fontFamily: Fonts.extrabold,
    fontSize: 32,
    color: Colors.text1,
    letterSpacing: -0.5,
    marginTop: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: Colors.text1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.text2,
    marginBottom: Spacing.lg,
  },
  label: {
    fontFamily: Fonts.semibold,
    fontSize: 13,
    color: Colors.text2,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.bgDeep,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text1,
    fontFamily: Fonts.regular,
    fontSize: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  otpInput: { letterSpacing: 8, fontSize: 22 },
  btn: {
    backgroundColor: Colors.accent,
    borderRadius: Radii.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.bg },
  link: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.accentLight,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  error: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.live,
    marginBottom: Spacing.sm,
  },
  devHint: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.text3,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
});
