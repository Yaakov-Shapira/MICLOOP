import { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/appStore';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radii } from '../../constants/layout';

export default function Toast() {
  const { toast, clearToast } = useAppStore();
  const translateY = useRef(new Animated.Value(-80)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return;

    Animated.spring(translateY, {
      toValue: insets.top + 12,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: -80,
        duration: 300,
        useNativeDriver: true,
      }).start(clearToast);
    }, 2500);

    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const bg =
    toast.type === 'error' ? Colors.live :
    toast.type === 'info' ? Colors.bgCard :
    Colors.green;

  return (
    <Animated.View
      style={[
        styles.toast,
        { transform: [{ translateY }], backgroundColor: bg },
      ]}
    >
      <Text style={styles.text}>{toast.message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radii.full,
    maxWidth: Dimensions.get('window').width - 40,
    zIndex: 9999,
  },
  text: {
    fontFamily: Fonts.semibold,
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
});
