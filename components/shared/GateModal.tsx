import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/appStore';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radii, Spacing } from '../../constants/layout';
import { t } from '../../i18n';

export default function GateModal() {
  const { gateVisible, hideGate } = useAppStore();
  const router = useRouter();

  function goSignIn() {
    hideGate();
    router.push('/(auth)/welcome');
  }

  return (
    <Modal visible={gateVisible} transparent animationType="fade" onRequestClose={hideGate}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.emoji}>🎙️</Text>
          <Text style={styles.title}>{t('gate.title')}</Text>
          <Text style={styles.subtitle}>{t('gate.subtitle')}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={goSignIn}>
            <Text style={styles.primaryText}>{t('gate.signIn')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={hideGate}>
            <Text style={styles.cancelText}>{t('gate.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emoji: { fontSize: 48, marginBottom: Spacing.md },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.text1,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.text2,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radii.full,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  primaryText: { fontFamily: Fonts.bold, fontSize: 16, color: '#fff' },
  cancelBtn: { paddingVertical: 10 },
  cancelText: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.text2 },
});
