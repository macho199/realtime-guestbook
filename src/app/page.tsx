'use client';

import { useMemo, useState } from 'react';
import { PostForm } from '@/components/guestbook/PostForm';
import { StickyBoard } from '@/components/guestbook/StickyBoard';
import { Post } from '@/types/post';

const initialPosts: Post[] = [
  {
    id: 'seed-1',
    author: '운영팀',
    message: '실시간 방명록 UI 구현을 시작했습니다. 환영 메시지를 남겨주세요!',
    mediaUrl: '',
    mediaType: 'image',
    createdAt: '2026-03-04T09:00:00.000Z',
  },
];

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);

  const orderedPosts = useMemo(
    () => [...posts].sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))),
    [posts],
  );

  return (
    <main className="page-shell">
      <section>
        <h1>Realtime Guestbook</h1>
        <p className="intro">UI 1차: 입력 폼과 포스트잇 보드 레이아웃을 구성했습니다.</p>
      </section>

      <PostForm
        onSubmit={({ author, message }) => {
          setPosts((current) => [
            {
              id: crypto.randomUUID(),
              author,
              message,
              mediaUrl: '',
              mediaType: 'image',
              createdAt: new Date().toISOString(),
            },
            ...current,
          ]);
        }}
      />

      <StickyBoard posts={orderedPosts} />
    </main>
  );
}
