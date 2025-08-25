import { GA4_API_SECRET, GA4_MEASUREMENT_ID } from '@/config';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

let clientId: string | null = null;
async function getClientId(): Promise<string> {
  if (clientId) return clientId;
  clientId = `${Platform.OS}-${Application.androidId || 'anon'}`;
  return clientId;
}

export async function logEvent(name: string, params: Record<string, any> = {}) {
  try {
    if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) return;
    const cid = await getClientId();
    const body = {
      client_id: cid,
      non_personalized_ads: true,
      events: [{ name, params }]
    };
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`;
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } catch {}
}
