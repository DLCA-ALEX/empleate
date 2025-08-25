import { API_BASE_URL } from '@/config';
import { Content, ContributionPayload, Rating } from '@/utils/types';

async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export const api = {
  listContents: (updatedAfter?: string) =>
    http<Content[]>(`/contents${updatedAfter ? `?updatedAfter=${encodeURIComponent(updatedAfter)}` : ''}`),
  getContent: (id: string) => http<Content>(`/contents/${id}`),
  rateContent: (contentId: string, score: number, comment?: string) =>
    http<Rating>(`/contents/${contentId}/ratings`, { method: 'POST', body: JSON.stringify({ score, comment }) }),
  submitContribution: (payload: (ContributionPayload & { fileUrl?: string })) =>
    http<{ id: string }>(`/contributions`, { method: 'POST', body: JSON.stringify(payload) }),
};
