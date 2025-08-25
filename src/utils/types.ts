export type ContentType = 'PDF' | 'DOC' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'LINK' | 'APK';

export interface Content {
  id: string;
  title: string;
  description?: string;
  type: ContentType;
  topics?: string[];
  tags?: string[];
  language?: string;
  author?: string;
  source?: string;
  fileUrl?: string;
  externalUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  ratingsAvg?: number;
  ratingsCount?: number;
}

export interface Rating {
  userId: string;
  contentId: string;
  score: number;
  comment?: string;
  createdAt: string;
}

export interface ContributionPayload {
  title: string;
  description?: string;
  type: ContentType;
  fileUri?: string;
  externalUrl?: string;
  topics?: string[];
  tags?: string[];
  language?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  provider: 'google' | 'facebook' | 'password' | 'anonymous';
  avatarUrl?: string;
}
