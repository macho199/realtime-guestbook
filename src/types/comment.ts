export interface Comment {
  id: string | number;
  postId: string | number;
  author: string;
  content: string;
  createdAt: string;
}

export interface CommentRecord {
  id: string | number;
  post_id: string | number;
  author?: string | null;
  content?: string | null;
  created_at: string;
}

export function toComment(record: CommentRecord): Comment {
  return {
    id: record.id,
    postId: record.post_id,
    author: record.author ?? '익명',
    content: record.content ?? '',
    createdAt: record.created_at,
  };
}
