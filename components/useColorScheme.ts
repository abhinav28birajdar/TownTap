import { useColorScheme as _useColorScheme } from 'react-native';

export type ColorScheme = 'light' | 'dark';

export function useColorScheme(): ColorScheme {
  return _useColorScheme() as ColorScheme;
}
