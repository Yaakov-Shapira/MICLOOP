import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '../../constants/colors';
import Avatar from '../shared/Avatar';

interface Props {
  name: string;
  avatar: string;
  isSpeaking: boolean;
  audioLevel: number;
}

export default function HostStage({ name, avatar, isSpeaking, audioLevel }: Props) {
  const rings = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current,
                 useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const animations = rings.map((ring, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 400),
          Animated.timing(ring, {
            toValue: 1,
            duration: 2800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(ring, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.container}>
      {rings.map((ring, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ring,
            {
              opacity: ring.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0.6, 0.3, 0] }),
              transform: [
                { scale: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) },
              ],
              borderColor: isSpeaking ? Colors.accent : Colors.text3,
            },
          ]}
        />
      ))}
      <Avatar emoji={avatar} size={104} speaking={isSpeaking} />
      <Text style={styles.name}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', height: 220 },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
  },
  name: {
    fontFamily: 'Heebo_700Bold',
    fontSize: 16,
    color: 'white',
    marginTop: 12,
    letterSpacing: -0.3,
  },
});
