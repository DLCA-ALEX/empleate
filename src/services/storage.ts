import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = '@empleat:';

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(KEY_PREFIX + key);
    return raw ? JSON.parse(raw) as T : null;
  },
  async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(KEY_PREFIX + key, JSON.stringify(value));
  },
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(KEY_PREFIX + key);
  }
};

export const KEYS = {
  CATALOG: 'catalog',
  FAVORITES: 'favorites',
  QUEUE: 'queue',
  AUTH: 'auth',
  LAST_SYNC: 'lastSync'
}
