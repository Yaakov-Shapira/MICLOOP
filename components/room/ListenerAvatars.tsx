import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/layout';

interface ListenerInfo {
  userId: string;
  name: string;
  avatar: string;
}

interface Props {
  listeners: ListenerInfo[];
  totalCount: number;
}

const EMOJIS = ['😊', '🎧', '👂', '🙂', '😄', '🤩', '🎙️', '🔊'];

export default function ListenerAvatars({ listeners, totalCount }: Props) {
  const visible = listeners.slice(0, 8);
  const extra = totalCount - visible.length;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {visible.map((l, i) => (
          <View
            key={l.userId}
            style={[styles.bubble, { marginStart: i > 0 ? -12 : 0, zIndex: visible.length - i }]}
          >
            <Text style={styles.emoji}>{l.avatar || EMOJIS[i % EMOJIS.length]}</Text>
          </View>
        ))}
        {extra > 0 && (
          <View style={[styles.bubble, styles.extraBubble, { marginStart: -12 }]}>
            <Text style={styles.extraText}>+{extra}</Text>
          </View>
        )}
      </View>
      {totalCount > 0 && (
        <Text style={styles.count}>{totalCount} מאזינים</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  bubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.bgDeep,
    borderWidth: 2,
    borderColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 18 },
  extraBubble: { backgroundColor: Colors.bgCard },
  extraText: { fontFamily: Fonts.semibold, fontSize: 10, color: Colors.text2 },
  count: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.text3, marginTop: 4 },
});
