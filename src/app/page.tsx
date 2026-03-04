'use client';

import { RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CreatePostPayload, PostForm } from '@/components/guestbook/PostForm';
import { PostDetailModal } from '@/components/guestbook/PostDetailModal';
import { StickyBoard } from '@/components/guestbook/StickyBoard';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Post, PostRecord, toPost } from '@/types/post';

const STORAGE_BUCKET = 'guestbook-media';

const inferFileExtension = (file: File, mediaType: 'image' | 'drawing') => {
  const byName = file.name.split('.').pop()?.toLowerCase();
  if (byName) {
    return byName;
  }

  if (file.type === 'image/png') {
    return 'png';
  }

  if (file.type === 'image/webp') {
    return 'webp';
  }

  if (file.type === 'image/jpeg') {
    return 'jpg';
  }

  return mediaType === 'drawing' ? 'png' : 'jpg';
};

export default function HomePage() {
  const supabase = getSupabaseBrowserClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | number | null>(null);

  const mergePost = useCallback((record: PostRecord) => {
    const mapped = toPost(record);

    setPosts((current) => {
      const index = current.findIndex((post) => post.id === mapped.id);
      if (index === -1) {
        return [mapped, ...current];
      }

      const next = [...current];
      next[index] = mapped;
      return next;
    });
  }, []);

  const removePost = useCallback((id: string | number) => {
    setPosts((current) => current.filter((post) => post.id !== id));
  }, []);

  useEffect(() => {
    let isMounted = true;
    let channel: RealtimeChannel | null = null;

    if (!supabase || !isSupabaseConfigured) {
      setLoading(false);
      setSyncMessage(
        'Supabase 환경변수가 설정되지 않았습니다. URL과 ANON/PUBLISHABLE 키를 README 기준으로 설정 후 새로고침해 주세요.',
      );
      return;
    }

    const loadPosts = async () => {
      const { data, error } = await supabase
        .from('guestbook')
        .select('*')
        .order('created_at', { ascending: false });

      if (!isMounted) {
        return;
      }

      if (error) {
        setSyncMessage(`게시물을 불러오지 못했습니다: ${error.message}`);
      } else {
        setPosts((data ?? []).map((row) => toPost(row as PostRecord)));
        setSyncMessage(null);
      }

      setLoading(false);
    };

    void loadPosts();

    channel = supabase
      .channel('guestbook-entries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guestbook' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const oldRow = payload.old as { id?: string | number };
          if (oldRow.id) {
            removePost(oldRow.id);
          }
          return;
        }

        const row = payload.new as PostRecord;
        if (row?.id !== undefined && row?.id !== null) {
          mergePost(row);
        }
      })
      .subscribe((status) => {
        if (!isMounted) {
          return;
        }

        if (status === 'CHANNEL_ERROR') {
          setSyncMessage('실시간 연결에 실패했습니다. 잠시 후 자동 복구를 시도합니다.');
        }
      });

    return () => {
      isMounted = false;
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [mergePost, removePost, supabase]);

  const handleCreatePost = useCallback(
    async ({ author, message, mediaFile, mediaType }: CreatePostPayload) => {
      if (!supabase || !isSupabaseConfigured) {
        setSyncMessage('Supabase 설정이 없어 게시물을 저장할 수 없습니다.');
        return false;
      }

      setSyncMessage(null);

      const extension = inferFileExtension(mediaFile, mediaType);
      const mediaPath = `guestbook/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;

      const uploadResult = await supabase.storage.from(STORAGE_BUCKET).upload(mediaPath, mediaFile, {
        upsert: false,
        contentType: mediaFile.type,
      });

      if (uploadResult.error) {
        setSyncMessage(`이미지 업로드에 실패했습니다: ${uploadResult.error.message}`);
        return false;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(mediaPath);

      const { data, error } = await supabase
        .from('guestbook')
        .insert({
          author,
          message,
          content: message,
          media_url: publicUrl,
          media_type: mediaType,
        })
        .select('*')
        .single();

      if (error) {
        const legacySchema =
          error.message.includes('message') ||
          error.message.includes('media_url') ||
          error.message.includes('media_type') ||
          error.message.includes('content');

        if (!legacySchema) {
          void supabase.storage.from(STORAGE_BUCKET).remove([mediaPath]);
          setSyncMessage(`게시물 저장에 실패했습니다: ${error.message}`);
          return false;
        }

        const fallback = await supabase
          .from('guestbook')
          .insert({
            author,
            content: message,
          })
          .select('*')
          .single();

        if (fallback.error) {
          void supabase.storage.from(STORAGE_BUCKET).remove([mediaPath]);
          setSyncMessage(`게시물 저장에 실패했습니다: ${fallback.error.message}`);
          return false;
        }

        if (fallback.data) {
          mergePost(fallback.data as PostRecord);
        }

        return true;
      }

      if (data) {
        mergePost(data as PostRecord);
      }

      return true;
    },
    [mergePost, supabase],
  );

  const orderedPosts = useMemo(
    () => [...posts].sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))),
    [posts],
  );

  const selectedPost = useMemo(
    () => posts.find((post) => String(post.id) === String(selectedPostId)) ?? null,
    [posts, selectedPostId],
  );

  useEffect(() => {
    if (selectedPostId === null) {
      return;
    }

    const exists = posts.some((post) => String(post.id) === String(selectedPostId));
    if (!exists) {
      setSelectedPostId(null);
    }
  }, [posts, selectedPostId]);

  return (
    <main className="page-shell">
      <section>
        <h1>Realtime Guestbook</h1>
        <p className="intro">
          Supabase 연동 상태: {isSupabaseConfigured ? '설정됨' : '미설정'} / 게시물 실시간 동기화 활성화
        </p>
      </section>

      <PostForm onSubmit={handleCreatePost} />

      {syncMessage ? <p className="status-message">{syncMessage}</p> : null}
      {loading ? (
        <p className="status-message">게시물을 불러오는 중입니다...</p>
      ) : (
        <StickyBoard posts={orderedPosts} onSelectPost={(post) => setSelectedPostId(post.id)} />
      )}

      {selectedPost ? (
        <PostDetailModal
          post={selectedPost}
          supabase={supabase}
          onClose={() => setSelectedPostId(null)}
          onPostDeleted={(postId) => {
            removePost(postId);
            setSelectedPostId(null);
          }}
          onPostUpdated={(post) => {
            setPosts((current) => {
              const index = current.findIndex((item) => String(item.id) === String(post.id));
              if (index === -1) {
                return [post, ...current];
              }

              const next = [...current];
              next[index] = post;
              return next;
            });
          }}
        />
      ) : null}
    </main>
  );
}
