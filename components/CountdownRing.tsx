import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography } from '@/theme';

type Props = {
  durationSec: number;
  onExpire: () => void;
  size?: number;
  active?: boolean;
};

export function CountdownRing({
  durationSec,
  onExpire,
  size = 160,
  active = true,
}: Props) {
  const [remaining, setRemaining] = useState(durationSec);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    setRemaining(durationSec);
    expiredRef.current = false;
    const startedAt = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const next = Math.max(0, durationSec - elapsed);
      setRemaining((prev) => (prev === next ? prev : next));
      if (next <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        clearInterval(id);
        onExpire();
      }
    }, 250);
    return () => clearInterval(id);
  }, [durationSec, onExpire, active]);

  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = remaining / durationSec;
  const dashOffset = c * (1 - progress);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.border}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.crimson}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.label} pointerEvents="none">
        <Text style={styles.num}>{remaining}</Text>
        <Text style={styles.unit}>seconds</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: {
    ...typography.h1,
    color: colors.ink,
  },
  unit: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
