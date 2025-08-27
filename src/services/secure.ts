// src/services/secure.ts
import * as SecureStore from 'expo-secure-store';

const JWT_TOKEN_KEY = 'wp_jwt_token';
const USER_CACHE_KEY = 'wp_user_cache';

export async function setToken(token: string) {
  await SecureStore.setItemAsync(JWT_TOKEN_KEY, token);
}
export async function getToken() {
  return SecureStore.getItemAsync(JWT_TOKEN_KEY);
}
export async function clearToken() {
  await SecureStore.deleteItemAsync(JWT_TOKEN_KEY);
}

export async function saveUserCache(user: any) {
  await SecureStore.setItemAsync(USER_CACHE_KEY, JSON.stringify(user));
}
export async function getUserCache<T = any>(): Promise<T | null> {
  const raw = await SecureStore.getItemAsync(USER_CACHE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}
export async function clearUserCache() {
  await SecureStore.deleteItemAsync(USER_CACHE_KEY);
}
