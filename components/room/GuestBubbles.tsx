import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/layout';
import Avatar from '../shared/Avatar';
import type { Speaker } from '../../types';

interface Props {
  guests: Speaker[];
  isHost: boolean;
  onMuteGuest?: (userId: string, muted: boolean) => void;
}

export default function GuestBubbles({ guests, isHost, onMuteGuest }: Props) {
  if (guests.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {guests.map((g) => (
        <View key={g.userId} style={styles.item}>
          <Avatar emoji={g.avatar} size={56} speaking={!g.muted} muted={g.muted} />
          <Text style={styles.name} numberOfLines={1}>{g.name}</Text>
          {isHost && (
            <TouchableOpacity
              style={styles.muteBtn}
              onPress={() => onMuteGuest?.(g.userId, !g.muted)}
            >
              <Text style={styles.muteIcon}>{g.muted ? '🔇' : '🔊'}</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: Spacing.lg, gap: 16, alignItems: 'flex-start' },
  item: { alignItems: 'center', width: 72 },
  name: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.text2,
    marginTop: 4,
    textAlign: 'center',
  },
  muteBtn: { marginTop: 2 },
  muteIcon: { fontSize: 12 },
});
