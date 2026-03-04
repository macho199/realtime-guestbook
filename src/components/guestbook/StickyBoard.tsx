import { Post } from '@/types/post';
import { StickyCard } from './StickyCard';

interface StickyBoardProps {
  posts: Post[];
}

export function StickyBoard({ posts }: StickyBoardProps) {
  if (posts.length === 0) {
    return <p className="empty">첫 방명록을 남겨주세요!</p>;
  }

  return (
    <section className="board-grid" aria-label="guestbook posts board">
      {posts.map((post, index) => (
        <StickyCard key={post.id} post={post} index={index} />
      ))}
    </section>
  );
}
