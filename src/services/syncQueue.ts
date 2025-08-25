import { storage, KEYS } from './storage';
import { api } from './api';
import { ContributionPayload } from '@/utils/types';

type QueueItem =
  | { type: 'RATE'; contentId: string; score: number; comment?: string }
  | { type: 'CONTRIBUTE'; payload: (ContributionPayload & { fileUrl?: string }) };

export async function enqueue(item: QueueItem) {
  const q = (await storage.get<QueueItem[]>(KEYS.QUEUE)) || [];
  q.push(item);
  await storage.set(KEYS.QUEUE, q);
}

export async function flushQueue() {
  const q = (await storage.get<QueueItem[]>(KEYS.QUEUE)) || [];
  const remaining: QueueItem[] = [];
  for (const item of q) {
    try {
      if (item.type === 'RATE') {
        await api.rateContent(item.contentId, item.score, item.comment);
      } else if (item.type === 'CONTRIBUTE') {
        await api.submitContribution(item.payload);
      }
    } catch {
      remaining.push(item);
    }
  }
  await storage.set(KEYS.QUEUE, remaining);
}
