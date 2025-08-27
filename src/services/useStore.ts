// import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { supabase } from '@/services/supabase';
// import { mapSupabaseUser, type UserSession } from '@/services/auth';

// type State = {
//   user: UserSession | null;
//   setUser: (u: UserSession | null) => void;
//   initAuthListener: () => void;
// };

// export const useStore = create<State>()(
//   persist(
//     (set, get) => ({
//       user: null,
//       setUser: (u) => set({ user: u }),
//       initAuthListener: () => {
//         // Hidrata user al inicio
//         supabase.auth.getUser().then(({ data }) => set({ user: mapSupabaseUser(data.user) }));
//         // Suscríbete a cambios (login, logout, refresh)
//         supabase.auth.onAuthStateChange((_event, session) => {
//           const u = session?.user ? mapSupabaseUser(session.user) : null;
//           set({ user: u });
//         });
//       },
//     }),
//     { name: 'app-store-v1', storage: createJSONStorage(() => AsyncStorage) }
//   )
// );
// src/store/useStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WPUser } from '@/services/auth';
import { getToken, getUserCache, fetchMe } from '@/services/auth';

type State = {
  user: WPUser | null;
  setUser: (u: WPUser | null) => void;

  hydrated: boolean;
  hydrateFromWP: () => Promise<void>;

  policyAccepted: boolean;
  setPolicyAccepted: (v: boolean) => void;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      user: null,
      setUser: (u) => set({ user: u }),

      hydrated: false,
      hydrateFromWP: async () => {
        try {
          const token = await getToken();
          if (!token) {
            const cached = await getUserCache();
            set({ user: cached ?? null, hydrated: true });
            return;
          }
          const me = await fetchMe();
          set({ user: me, hydrated: true });
        } catch {
          set({ user: null, hydrated: true });
        }
      },

      policyAccepted: false,
      setPolicyAccepted: (v) => set({ policyAccepted: v }),
    }),
    {
      name: 'app-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      // si quisieras guardar solo parte:
      // partialize: (s) => ({ user: s.user, policyAccepted: s.policyAccepted })
    }
  )
);
