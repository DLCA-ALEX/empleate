// src/services/auth.ts
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import { supabase } from './supabase';

try { WebBrowser.maybeCompleteAuthSession(); } catch {}

const isExpoGo = Constants.appOwnership === 'expo';

// Expo Go -> usa auth.expo.io (proxy)
// Dev Client / build nativo -> usa scheme empleat://
const EXPO_REDIRECT = 'https://auth.expo.io/@dlca-alex/biblioteca-digital-empleat';
const returnUrl = isExpoGo
  // @ts-ignore (algunas versiones no tipan useProxy)
  ? AuthSession.makeRedirectUri({ useProxy: true })
  : AuthSession.makeRedirectUri({ scheme: 'empleat' });

function parse(url: string) {
  const out: Record<string, string> = {};
  try {
    const u = new URL(url);
    u.searchParams.forEach((v,k)=>out[k]=v);
    if (u.hash) new URLSearchParams(u.hash.replace(/^#/, '')).forEach((v,k)=>out[k]=v);
  } catch {}
  return out;
}

async function finishFromCallback(url: string) {
  const p = parse(url);
  if (p.access_token) {
    const { error } = await supabase.auth.setSession({
      access_token: p.access_token,
      refresh_token: p.refresh_token ?? '',
    });
    if (error) throw error;
    return;
  }
  if (p.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(p.code);
    if (error) throw error;
    return;
  }
  throw new Error('Callback sin credenciales.');
}

export async function signInWithGoogle() {
  // En Expo Go: Supabase debe redirigir a auth.expo.io
  // En Dev Client: Supabase debe redirigir a empleat://...
  const redirectTo = isExpoGo ? EXPO_REDIRECT : returnUrl;

  console.log('[auth] mode =', isExpoGo ? 'ExpoGo' : 'DevClient');
  console.log('[auth] returnUrl =', returnUrl);
  console.log('[auth] redirectTo(Supabase) =', redirectTo);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('Supabase no devolvió URL de OAuth');

  console.log('[auth] authUrl =', data.url);

  const res = await WebBrowser.openAuthSessionAsync(
    data.url,
    returnUrl,
    { preferEphemeralSession: true, showInRecents: true }
  );
  console.log('[auth] WebBrowser result =', res);

  // @ts-ignore: Android a veces no tipa `url`
  const cbUrl = (res && (res as any).url) || null;
  if (res.type !== 'success' || !cbUrl) {
    throw new Error('No se recibió el callback de OAuth (timeout).');
  }

  await finishFromCallback(cbUrl);
  return true;
}

// Email/Password (como ya lo tienes)
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.user;
}
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}
export async function signOut() {
  await supabase.auth.signOut();
}
