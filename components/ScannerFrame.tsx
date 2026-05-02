import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme';

type Props = {
  size?: number;
  color?: string;
  thickness?: number;
};

export function ScannerFrame({
  size = 320,
  color = colors.ink,
  thickness = 14,
}: Props) {
  const cornerLen = size * 0.35;
  const corner = (style: object) => (
    <View
      style={[
        {
          position: 'absolute',
          width: cornerLen,
          height: cornerLen,
          borderColor: color,
        },
        style,
      ]}
    />
  );
  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      {corner({
        top: 0,
        left: 0,
        borderTopWidth: thickness,
        borderLeftWidth: thickness,
        borderTopLeftRadius: 24,
      })}
      {corner({
        top: 0,
        right: 0,
        borderTopWidth: thickness,
        borderRightWidth: thickness,
        borderTopRightRadius: 24,
      })}
      {corner({
        bottom: 0,
        left: 0,
        borderBottomWidth: thickness,
        borderLeftWidth: thickness,
        borderBottomLeftRadius: 24,
      })}
      {corner({
        bottom: 0,
        right: 0,
        borderBottomWidth: thickness,
        borderRightWidth: thickness,
        borderBottomRightRadius: 24,
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: 'relative',
  },
});
