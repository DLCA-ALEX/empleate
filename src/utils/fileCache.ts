// src/services/fileCache.ts
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

export async function getCachedPath(url: string) {
  // Nombre único por hash SHA-256 de la URL
  const name = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, url);
  const dir = `${FileSystem.cacheDirectory}files`;
  const path = `${dir}/${name}`;

  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) return path;

  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  const res = await FileSystem.downloadAsync(url, path);
  return res.uri;
}

export async function clearCache() {
  try { await FileSystem.deleteAsync(`${FileSystem.cacheDirectory}files`, { idempotent: true }); } catch {}
}
