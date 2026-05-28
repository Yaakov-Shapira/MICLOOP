import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  emoji?: string;
  uri?: string;
  size?: number;
  speaking?: boolean;
  muted?: boolean;
}

export default function Avatar({ emoji = '🎙️', uri, size = 48, speaking = false, muted = false }: Props) {
  const ringSize = size + 8;

  return (
    <View style={{ width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center' }}>
      {speaking && (
        <View
          style={[
            styles.speakingRing,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              borderColor: Colors.accent,
            },
          ]}
        />
      )}
      <View
        style={[
          styles.bubble,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        {uri ? (
          <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
        ) : (
          <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
        )}
      </View>
      {muted && (
        <View style={[styles.mutedBadge, { bottom: -2, end: -2 }]}>
          <Text style={{ fontSize: 9 }}>🔇</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: Colors.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  speakingRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  mutedBadge: {
    position: 'absolute',
    backgroundColor: Colors.bg,
    borderRadius: 99,
    padding: 1,
  },
});
