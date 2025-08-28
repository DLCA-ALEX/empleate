import AsyncStorage from '@react-native-async-storage/async-storage';

const key = (id: string) => `reading.progress:${id}`;

export async function saveProgress(id: string, pct: number) {
  try { await AsyncStorage.setItem(key(id), String(Math.max(0, Math.min(100, pct)))); } catch {}
}
export async function loadProgress(id: string): Promise<number> {
  try {
    const v = await AsyncStorage.getItem(key(id));
    return v ? Math.max(0, Math.min(100, Number(v))) : 0;
  } catch { return 0; }
}
