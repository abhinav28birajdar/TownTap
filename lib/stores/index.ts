import { create } from 'zustand';
import { User } from '../types/database';

interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: any) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  signOut: () => set({ user: null, session: null }),
}));

interface AppState {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'hi';
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'en' | 'hi') => void;
  setCurrentLocation: (location: { latitude: number; longitude: number } | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'system',
  language: 'en',
  currentLocation: null,
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
  setCurrentLocation: (currentLocation) => set({ currentLocation }),
}));