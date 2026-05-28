import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Radii } from '../../constants/layout';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  radius?: number;
}

export default function GlassCard({ children, style, radius = Radii.lg }: Props) {
  return (
    <View style={[styles.card, { borderRadius: radius }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
});
