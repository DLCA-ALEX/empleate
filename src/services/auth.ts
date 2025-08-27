// // src/services/auth.ts
// import * as WebBrowser from 'expo-web-browser';
// import * as AuthSession from 'expo-auth-session';
// import Constants from 'expo-constants';
// import { supabase } from './supabase';

// try { WebBrowser.maybeCompleteAuthSession(); } catch {}

// const isExpoGo = Constants.appOwnership === 'expo';

// // Expo Go -> usa auth.expo.io (proxy)
// // Dev Client / build nativo -> usa scheme empleat://
// const EXPO_REDIRECT = 'https://auth.expo.io/@dlca-alex/biblioteca-digital-empleat';
// const returnUrl = isExpoGo
//   // @ts-ignore (algunas versiones no tipan useProxy)
//   ? AuthSession.makeRedirectUri({ useProxy: true })
//   : AuthSession.makeRedirectUri({ scheme: 'empleat' });

// function parse(url: string) {
//   const out: Record<string, string> = {};
//   try {
//     const u = new URL(url);
//     u.searchParams.forEach((v,k)=>out[k]=v);
//     if (u.hash) new URLSearchParams(u.hash.replace(/^#/, '')).forEach((v,k)=>out[k]=v);
//   } catch {}
//   return out;
// }

// async function finishFromCallback(url: string) {
//   const p = parse(url);
//   if (p.access_token) {
//     const { error } = await supabase.auth.setSession({
//       access_token: p.access_token,
//       refresh_token: p.refresh_token ?? '',
//     });
//     if (error) throw error;
//     return;
//   }
//   if (p.code) {
//     const { error } = await supabase.auth.exchangeCodeForSession(p.code);
//     if (error) throw error;
//     return;
//   }
//   throw new Error('Callback sin credenciales.');
// }

// export async function signInWithGoogle() {
//   // En Expo Go: Supabase debe redirigir a auth.expo.io
//   // En Dev Client: Supabase debe redirigir a empleat://...
//   const redirectTo = isExpoGo ? EXPO_REDIRECT : returnUrl;

//   console.log('[auth] mode =', isExpoGo ? 'ExpoGo' : 'DevClient');
//   console.log('[auth] returnUrl =', returnUrl);
//   console.log('[auth] redirectTo(Supabase) =', redirectTo);

//   const { data, error } = await supabase.auth.signInWithOAuth({
//     provider: 'google',
//     options: { redirectTo, skipBrowserRedirect: true },
//   });
//   if (error) throw error;
//   if (!data?.url) throw new Error('Supabase no devolvió URL de OAuth');

//   console.log('[auth] authUrl =', data.url);

//   const res = await WebBrowser.openAuthSessionAsync(
//     data.url,
//     returnUrl,
//     { preferEphemeralSession: true, showInRecents: true }
//   );
//   console.log('[auth] WebBrowser result =', res);

//   // @ts-ignore: Android a veces no tipa `url`
//   const cbUrl = (res && (res as any).url) || null;
//   if (res.type !== 'success' || !cbUrl) {
//     throw new Error('No se recibió el callback de OAuth (timeout).');
//   }

//   await finishFromCallback(cbUrl);
//   return true;
// }

// // Email/Password (como ya lo tienes)
// export async function signUpWithEmail(email: string, password: string) {
//   const { data, error } = await supabase.auth.signUp({ email, password });
//   if (error) throw error;
//   return data.user;
// }
// export async function signInWithEmail(email: string, password: string) {
//   const { data, error } = await supabase.auth.signInWithPassword({ email, password });
//   if (error) throw error;
//   return data.session;
// }
// export async function signOut() {
//   await supabase.auth.signOut();
// }
// src/services/auth.ts
// src/services/auth.ts
// src/services/auth.ts
// src/services/auth.ts
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { wpApi, PUBLIC_ORIGIN } from '@/services/wpApi';

export type WPUser = { id: number | string; email?: string; name?: string; avatar?: string };

const TOKEN_KEY = 'wp.jwt';
export async function setToken(t: string){ await SecureStore.setItemAsync(TOKEN_KEY, t); }
export async function getToken(){ return SecureStore.getItemAsync(TOKEN_KEY); }
export async function clearToken(){ await SecureStore.deleteItemAsync(TOKEN_KEY); }

const USER_CACHE_KEY = 'wp.user';
async function setUserCache(u: WPUser | null){
  if (u) await SecureStore.setItemAsync(USER_CACHE_KEY, JSON.stringify(u));
  else await SecureStore.deleteItemAsync(USER_CACHE_KEY);
}
export async function getUserCache(): Promise<WPUser|null>{
  const raw = await SecureStore.getItemAsync(USER_CACHE_KEY);
  return raw ? JSON.parse(raw) as WPUser : null;
}

export async function fetchMe(): Promise<WPUser>{
  const token = await getToken();
  if (!token) throw new Error('No hay JWT de WordPress');
  const res = await fetch(`${PUBLIC_ORIGIN}/wp-json/wp/v2/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} al cargar /users/me`);
  const j = await res.json();
  const u: WPUser = {
    id: j.id,
    name: j.name || j.username,
    email: j.email,
    avatar: j?.avatar_urls?.['96'],
  };
  await setUserCache(u);
  return u;
}

// -------- password
export async function signInWithEmail(username: string, password: string): Promise<WPUser>{
  const r = await wpApi.loginPassword(username, password);
  await setToken(r.token);
  const me = await fetchMe();
  return me;
}

// -------- Google → WP
try { WebBrowser.maybeCompleteAuthSession(); } catch {}
const GOOGLE_CLIENT_ID = Constants.expoConfig?.extra?.GOOGLE_EXPO_CLIENT_ID as string | undefined;
function makeReturn(){ /* @ts-ignore */ return AuthSession.makeRedirectUri({ useProxy: true }); }
function parseParams(url: string){ const o:Record<string,string>={}; try{const u=new URL(url); u.searchParams.forEach((v,k)=>o[k]=v); if(u.hash) new URLSearchParams(u.hash.slice(1)).forEach((v,k)=>o[k]=v);}catch{} return o; }

export async function signInWithGoogleWP(): Promise<WPUser>{
  if (!GOOGLE_CLIENT_ID) throw new Error('Falta GOOGLE_EXPO_CLIENT_ID en app.json -> extra');
  const redirectUri = makeReturn();
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'id_token');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('prompt', 'select_account');
  url.searchParams.set('nonce', String(Date.now()));

  const res = await WebBrowser.openAuthSessionAsync(url.toString(), redirectUri, { preferEphemeralSession: true });
  // @ts-ignore
  const cb = res?.url as string|undefined;
  if (res.type !== 'success' || !cb) throw new Error('Login cancelado o sin callback');

  const id_token = parseParams(cb)['id_token'];
  if (!id_token) throw new Error('Google no devolvió id_token');

  const r = await wpApi.loginGoogle(id_token);
  if (!r?.token) throw new Error('WP no devolvió token');
  await setToken(r.token);

  const me = await fetchMe();
  return me;
}

// -------- sign out
export async function signOut(){ await clearToken(); await setUserCache(null); return true; }
