export type MediaType = 'image' | 'drawing';

export interface Post {
  id: string;
  author: string;
  message: string;
  mediaUrl: string;
  mediaType: MediaType;
  createdAt: string;
}
