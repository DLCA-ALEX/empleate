// src/services/auth.ts
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

// ⚠️ PON aquí tu owner y slug EXACTOS de app.json
const EXPO_REDIRECT = 'https://auth.expo.io/@dlca-alex/biblioteca-digital-empleat';
const getReturnUrl = () => EXPO_REDIRECT;

type Provider = 'google' | 'facebook' | 'password' | 'guest';

export type UserSession = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  provider: Provider;
};

// --- helpers ---
function parseUrlParams(url: string): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const u = new URL(url);
    u.searchParams.forEach((v, k) => (out[k] = v));
    if (u.hash) {
      const h = new URLSearchParams(u.hash.replace(/^#/, ''));
      h.forEach((v, k) => (out[k] = v));
    }
  } catch {}
  return out;
}

async function finishSupabaseSessionFromCallback(url: string) {
  const p = parseUrlParams(url);
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
  throw new Error('Callback sin credenciales (no access_token ni code)');
}

// =============== GOOGLE ===============
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: getReturnUrl(), skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('No se obtuvo URL de OAuth (Google)');

  const res = await WebBrowser.openAuthSessionAsync(data.url, getReturnUrl());
  if (res.type !== 'success' || !res.url) throw new Error('Login cancelado o fallido en Google');

  await finishSupabaseSessionFromCallback(res.url);
  return true;
}

// =============== FACEBOOK =============
export async function signInWithFacebook() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: { redirectTo: getReturnUrl(), skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('No se obtuvo URL de OAuth (Facebook)');

  const res = await WebBrowser.openAuthSessionAsync(data.url, getReturnUrl());
  if (res.type !== 'success' || !res.url) throw new Error('Login cancelado o fallido en Facebook');

  await finishSupabaseSessionFromCallback(res.url);
  return true;
}

// =============== EMAIL/PASSWORD (opcional) ===============
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
