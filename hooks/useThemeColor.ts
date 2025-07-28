/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    const themeColors = Colors[theme];
    const color = themeColors[colorName];
    if (color === undefined) {
      console.warn(`Color '${colorName}' not found in theme '${theme}'. Using fallback.`);
      return theme === 'light' ? '#000000' : '#FFFFFF'; // Fallback colors
    }
    return color;
  }
}
