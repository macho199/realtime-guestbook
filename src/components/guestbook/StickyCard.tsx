import { Post } from '@/types/post';

const tones = ['tone-yellow', 'tone-pink', 'tone-green', 'tone-blue'] as const;

interface StickyCardProps {
  post: Post;
  index: number;
  onSelect?: (post: Post) => void;
}

export function StickyCard({ post, index, onSelect }: StickyCardProps) {
  const toneClass = tones[index % tones.length];
  const rotation = (index % 2 === 0 ? 1 : -1) * ((index % 3) + 1);

  return (
    <button
      type="button"
      className={`sticky-card ${toneClass}`}
      style={{ transform: `rotate(${rotation}deg)` }}
      onClick={() => onSelect?.(post)}
    >
      <header>
        <strong>{post.author}</strong>
        <time>{new Date(post.createdAt).toLocaleString('ko-KR')}</time>
      </header>
      <p>{post.message}</p>
      {post.mediaUrl ? (
        <img className="media-preview" src={post.mediaUrl} alt={`${post.author}의 ${post.mediaType}`} />
      ) : (
        <div className="media-placeholder" aria-label={`${post.mediaType} placeholder`}>
          미디어 없음
        </div>
      )}
    </button>
  );
}
