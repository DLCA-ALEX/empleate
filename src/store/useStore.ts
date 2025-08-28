import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabase';

// Tipo mínimo de sesión que usamos en la app
export type UserSession = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  provider: 'google' | 'facebook' | 'password' | 'guest';
};

type State = {
  // --- auth ---
  user: UserSession | null;
  setUser: (u: UserSession | null) => void;
  /** Inicia el listener de sesión de Supabase (login/logout/refresh) */
  initAuthListener: () => void;

  // --- consentimiento ---
  policyAccepted: boolean;
  setPolicyAccepted: (v: boolean) => void;

  // --- catálogo / favoritos (lo que ya tenías) ---
  catalog: any[];
  favorites: string[];
  setCatalog: (c: any[]) => void;
  toggleFavorite: (id: string) => void;
};

function mapSupabaseUser(u: any): UserSession | null {
  if (!u) return null;
  return {
    id: u.id,
    name:
      u.user_metadata?.full_name ||
      u.user_metadata?.name ||
      u.email?.split('@')[0] ||
      'Usuario',
    email: u.email || undefined||u.user_email,
    avatar: u.user_metadata?.avatar_url || undefined,
    provider: (u.app_metadata?.provider as UserSession['provider']) || 'password',
  };
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      // --- auth ---
      user: null,
      setUser: (u) => set({ user: u }),
      initAuthListener: () => {
        // 1) Hidrata usuario actual al arrancar
        supabase.auth.getUser().then(({ data }) => {
          set({ user: mapSupabaseUser(data.user) });
        });
        // 2) Suscripción a cambios de sesión
        supabase.auth.onAuthStateChange((_event, session) => {
          const u = session?.user ? mapSupabaseUser(session.user) : null;
          set({ user: u });
        });
      },

      // --- consentimiento (persistente) ---
      policyAccepted: false,
      setPolicyAccepted: (v: boolean) => set({ policyAccepted: v }),

      // --- catálogo / favoritos ---
      catalog: [],
      favorites: [],
      setCatalog: (c) => set({ catalog: c }),
      toggleFavorite: (id) => {
        const favs = get().favorites;
        set({
          favorites: favs.includes(id)
            ? favs.filter((x) => x !== id)
            : [...favs, id],
        });
      },
    }),
    {
      name: 'app-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      // Si quieres persistir solo parte del estado:
      // partialize: (s) => ({ user: s.user, policyAccepted: s.policyAccepted, favorites: s.favorites }),
    }
  )
);
