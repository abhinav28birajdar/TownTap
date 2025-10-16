// Type declarations for modules without TypeScript support
declare module 'react-native-url-polyfill/auto';

declare module '@expo/vector-icons' {
  export * from '@expo/vector-icons/build/Icons';
}

declare module 'moti' {
  import { ComponentType } from 'react';
  import { ViewProps, TextProps } from 'react-native';
  
  export const View: ComponentType<ViewProps & { from?: any; animate?: any; transition?: any; }>;
  export const Text: ComponentType<TextProps & { from?: any; animate?: any; transition?: any; }>;
}

declare module 'native-base' {
  export * from 'native-base/lib/typescript/theme/base';
  export const NativeBaseProvider: any;
  export const Box: any;
  export const Text: any;
  export const Button: any;
  export const Input: any;
  export const VStack: any;
  export const HStack: any;
  export const Center: any;
  export const Spinner: any;
  export const useTheme: any;
  export const theme: any;
}