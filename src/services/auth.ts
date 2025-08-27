import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

/** Redirect que funciona en Expo Go. Si tu versión no conoce "useProxy",
 *  caemos al makeRedirectUri() “pelón”. */
function getRedirectUri(): string {
  try {
    // @ts-ignore – algunas versiones no tipan useProxy pero sí existe
    return AuthSession.makeRedirectUri({ useProxy: true });
  } catch {
    return AuthSession.makeRedirectUri();
  }
}

/** Lee params del callback (?query y #fragment) */
function parseParams(url: string) {
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

/** Completa sesión en Supabase con lo recibido en el callback */
async function finishFromCallback(url: string) {
  const p = parseParams(url);

  // Implicit flow (tokens en el fragment)
  if (p.access_token) {
    const { error } = await supabase.auth.setSession({
      access_token: p.access_token,
      refresh_token: p.refresh_token ?? '',
    });
    if (error) throw error;
    return;
  }

  // Code flow (?code=...)
  if (p.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(p.code);
    if (error) throw error;
    return;
  }

  throw new Error('Callback sin credenciales (no access_token ni code).');
}

/** GOOGLE */
export async function signInWithGoogle() {
  const redirectTo = getRedirectUri();

  // 1) Pide la URL a Supabase (sin redirigir automáticamente)
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('Supabase no devolvió URL de OAuth (Google).');

  // 2) Abre el navegador y espera volver a redirectTo
  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (res.type !== 'success' || !res.url) {
    throw new Error('Login cancelado o no pudo finalizar.');
  }

  // 3) Termina de establecer la sesión en Supabase
  await finishFromCallback(res.url);
  return true;
}

/** FACEBOOK (cuando lo actives) */
export async function signInWithFacebook() {
  const redirectTo = getRedirectUri();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data?.url) throw new Error('Supabase no devolvió URL de OAuth (Facebook).');

  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (res.type !== 'success' || !res.url) {
    throw new Error('Login cancelado o no pudo finalizar.');
  }

  await finishFromCallback(res.url);
  return true;
}

/** Email/Password */
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
