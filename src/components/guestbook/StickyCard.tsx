import { Post } from '@/types/post';

const tones = ['tone-yellow', 'tone-pink', 'tone-green', 'tone-blue'] as const;

interface StickyCardProps {
  post: Post;
  index: number;
}

export function StickyCard({ post, index }: StickyCardProps) {
  const toneClass = tones[index % tones.length];
  const rotation = (index % 2 === 0 ? 1 : -1) * ((index % 3) + 1);

  return (
    <article className={`sticky-card ${toneClass}`} style={{ transform: `rotate(${rotation}deg)` }}>
      <header>
        <strong>{post.author}</strong>
        <time>{new Date(post.createdAt).toLocaleString('ko-KR')}</time>
      </header>
      <p>{post.message}</p>
      <div className="media-placeholder" aria-label={`${post.mediaType} placeholder`}>
        미디어 영역
      </div>
    </article>
  );
}
