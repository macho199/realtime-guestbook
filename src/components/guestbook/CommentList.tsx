import { Comment } from '@/types/comment';

interface CommentListProps {
  comments: Comment[];
  loading?: boolean;
}

export function CommentList({ comments, loading }: CommentListProps) {
  if (loading) {
    return <p className="helper-text">댓글을 불러오는 중입니다...</p>;
  }

  if (comments.length === 0) {
    return <p className="helper-text">첫 댓글을 남겨주세요.</p>;
  }

  return (
    <ul className="comment-list">
      {comments.map((comment) => (
        <li key={comment.id} className="comment-item">
          <div className="comment-meta">
            <strong>{comment.author}</strong>
            <time>{new Date(comment.createdAt).toLocaleString('ko-KR')}</time>
          </div>
          <p>{comment.content}</p>
        </li>
      ))}
    </ul>
  );
}
