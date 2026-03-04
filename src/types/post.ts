export type MediaType = 'image' | 'drawing';

export interface Post {
  id: string | number;
  author: string;
  message: string;
  mediaUrl: string | null;
  mediaType: MediaType;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PostRecord {
  id: string | number;
  author: string | null;
  message?: string | null;
  content?: string | null;
  media_url?: string | null;
  media_type?: MediaType | null;
  created_at: string;
  updated_at?: string | null;
}

export function toPost(record: PostRecord): Post {
  const mediaType: MediaType = record.media_type === 'drawing' ? 'drawing' : 'image';

  return {
    id: record.id,
    author: record.author ?? '익명',
    message: record.message ?? record.content ?? '',
    mediaUrl: record.media_url ?? null,
    mediaType,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}
