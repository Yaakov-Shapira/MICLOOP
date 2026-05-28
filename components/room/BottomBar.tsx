import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radii, Spacing } from '../../constants/layout';
import { t } from '../../i18n';

interface Props {
  role: 'host' | 'speaker' | 'listener';
  isMuted: boolean;
  handRaised: boolean;
  onMicToggle: () => void;
  onRaiseHand: () => void;
  onLeave: () => void;
  onOpenChat: () => void;
}

export default function BottomBar({
  role,
  isMuted,
  handRaised,
  onMicToggle,
  onRaiseHand,
  onLeave,
  onOpenChat,
}: Props) {
  return (
    <View style={styles.bar}>
      {/* Chat button — always visible */}
      <TouchableOpacity style={styles.iconBtn} onPress={onOpenChat}>
        <Text style={styles.iconEmoji}>💬</Text>
        <Text style={styles.iconLabel}>{t('room.chat')}</Text>
      </TouchableOpacity>

      {/* Mic / Raise hand — center big button */}
      {role === 'listener' ? (
        <TouchableOpacity
          style={[styles.centerBtn, handRaised && styles.centerBtnActive]}
          onPress={onRaiseHand}
        >
          <Text style={styles.centerEmoji}>{handRaised ? '✋' : '🙋'}</Text>
          <Text style={styles.centerLabel}>
            {handRaised ? t('room.lowerHand') : t('room.raiseHand')}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.centerBtn, isMuted && styles.centerBtnMuted]}
          onPress={onMicToggle}
        >
          <Text style={styles.centerEmoji}>{isMuted ? '🔇' : '🎙️'}</Text>
          <Text style={styles.centerLabel}>
            {isMuted ? t('room.unmute') : t('room.mute')}
          </Text>
        </TouchableOpacity>
      )}

      {/* Leave / End */}
      <TouchableOpacity style={styles.leaveBtn} onPress={onLeave}>
        <Text style={styles.leaveEmoji}>👋</Text>
        <Text style={styles.leaveLabel}>
          {role === 'host' ? t('room.endLoop') : t('room.leaveLoop')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.bgDeep,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  iconBtn: { alignItems: 'center', gap: 2, minWidth: 60 },
  iconEmoji: { fontSize: 24 },
  iconLabel: { fontFamily: Fonts.regular, fontSize: 10, color: Colors.text3 },
  centerBtn: {
    alignItems: 'center',
    backgroundColor: Colors.accent,
    borderRadius: Radii.full,
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 2,
    minWidth: 100,
  },
  centerBtnActive: { backgroundColor: Colors.green },
  centerBtnMuted: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  centerEmoji: { fontSize: 22 },
  centerLabel: { fontFamily: Fonts.semibold, fontSize: 11, color: '#fff' },
  leaveBtn: { alignItems: 'center', gap: 2, minWidth: 60 },
  leaveEmoji: { fontSize: 24 },
  leaveLabel: { fontFamily: Fonts.regular, fontSize: 10, color: Colors.live },
});
