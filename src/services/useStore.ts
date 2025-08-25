import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabase';
import { mapSupabaseUser, type UserSession } from '@/services/auth';

type State = {
  user: UserSession | null;
  setUser: (u: UserSession | null) => void;
  initAuthListener: () => void;
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (u) => set({ user: u }),
      initAuthListener: () => {
        // Hidrata user al inicio
        supabase.auth.getUser().then(({ data }) => set({ user: mapSupabaseUser(data.user) }));
        // Suscríbete a cambios (login, logout, refresh)
        supabase.auth.onAuthStateChange((_event, session) => {
          const u = session?.user ? mapSupabaseUser(session.user) : null;
          set({ user: u });
        });
      },
    }),
    { name: 'app-store-v1', storage: createJSONStorage(() => AsyncStorage) }
  )
);
