import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/theme';

type IconProps = { size?: number; color?: string };

export function WalkInIcon({ size = 64, color = colors.crimson }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Circle cx="13" cy="4" r="2" />
      <Path d="M14 21l-3-7 3-3 2 4 4 1v-2l-3-1-2-4c-.4-.7-1.2-1-2-1l-5 2-1 4 2 1 1-2 2-1-2 7-3 5 2 1 4-5z" />
    </Svg>
  );
}

export function MembershipIcon({ size = 64, color = colors.crimson }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Circle cx="9" cy="8" r="3.2" />
      <Path d="M2 19c0-3 3-5 7-5s7 2 7 5v1H2v-1z" />
      <Circle cx="17" cy="9" r="2.6" />
      <Path d="M14.6 14.4c1.6.5 3.4 1.7 3.4 4.6v1H22v-1c0-2.3-2-4-5-4-.8 0-1.6.1-2.4.4z" />
    </Svg>
  );
}

export function CheckIcon({ size = 64, color = colors.white }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke={color}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CrossIcon({ size = 64, color = colors.white }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 6l12 12M18 6L6 18"
        stroke={color}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}
