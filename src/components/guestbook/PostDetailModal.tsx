'use client';

import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { Comment, CommentRecord, toComment } from '@/types/comment';
import { Post, PostRecord, toPost } from '@/types/post';

interface PostDetailModalProps {
  post: Post;
  supabase: SupabaseClient | null;
  onClose: () => void;
  onPostDeleted: (postId: string | number) => void;
  onPostUpdated: (post: Post) => void;
}

export function PostDetailModal({
  post,
  supabase,
  onClose,
  onPostDeleted,
  onPostUpdated,
}: PostDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const mergeComment = useCallback((record: CommentRecord) => {
    const mapped = toComment(record);

    setComments((current) => {
      const index = current.findIndex((item) => item.id === mapped.id);
      if (index === -1) {
        return [...current, mapped].sort(
          (a, b) => Number(new Date(a.createdAt)) - Number(new Date(b.createdAt)),
        );
      }

      const next = [...current];
      next[index] = mapped;
      return next;
    });
  }, []);

  const removeComment = useCallback((id: string | number) => {
    setComments((current) => current.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoadingComments(false);
      setStatusMessage('Supabase 연결이 없어 댓글을 불러올 수 없습니다.');
      return;
    }

    let isMounted = true;
    let commentsChannel: RealtimeChannel | null = null;
    let postChannel: RealtimeChannel | null = null;
    const postIdFilter = String(post.id);

    const loadComments = async () => {
      setLoadingComments(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', post.id as string | number)
        .order('created_at', { ascending: true });

      if (!isMounted) {
        return;
      }

      if (error) {
        setStatusMessage(`댓글을 불러오지 못했습니다: ${error.message}`);
      } else {
        setComments((data ?? []).map((row) => toComment(row as CommentRecord)));
        setStatusMessage(null);
      }

      setLoadingComments(false);
    };

    void loadComments();

    commentsChannel = supabase
      .channel(`comments:${postIdFilter}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postIdFilter}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as { id?: string | number };
            if (oldRow.id !== undefined && oldRow.id !== null) {
              removeComment(oldRow.id);
            }
            return;
          }

          const row = payload.new as CommentRecord;
          if (row?.id !== undefined && row?.id !== null) {
            mergeComment(row);
          }
        },
      )
      .subscribe();

    postChannel = supabase
      .channel(`post:${postIdFilter}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guestbook', filter: `id=eq.${postIdFilter}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            onPostDeleted(post.id);
            return;
          }

          const row = payload.new as PostRecord;
          if (row?.id !== undefined && row?.id !== null) {
            onPostUpdated(toPost(row));
          }
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      if (commentsChannel) {
        void supabase.removeChannel(commentsChannel);
      }
      if (postChannel) {
        void supabase.removeChannel(postChannel);
      }
    };
  }, [mergeComment, onPostDeleted, onPostUpdated, post.id, removeComment, supabase]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleCommentSubmit = useCallback(
    async ({ author, content }: { author: string; content: string }) => {
      if (!supabase) {
        setStatusMessage('Supabase 연결이 없어 댓글을 저장할 수 없습니다.');
        return false;
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          author,
          content,
        })
        .select('*')
        .single();

      if (error) {
        setStatusMessage(`댓글 저장에 실패했습니다: ${error.message}`);
        return false;
      }

      if (data) {
        mergeComment(data as CommentRecord);
      }

      return true;
    },
    [mergeComment, post.id, supabase],
  );

  const summary = useMemo(
    () => `${post.author} · ${new Date(post.createdAt).toLocaleString('ko-KR')}`,
    [post.author, post.createdAt],
  );

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <section className="post-detail-modal" onClick={(event) => event.stopPropagation()}>
        <header className="post-detail-header">
          <div>
            <h2>상세 보기</h2>
            <p className="helper-text">{summary}</p>
          </div>
          <button type="button" className="modal-close-button" onClick={onClose} aria-label="닫기">
            닫기
          </button>
        </header>

        <article className="post-detail-content">
          <h3>{post.message}</h3>
          {post.mediaUrl ? (
            <img className="post-detail-image" src={post.mediaUrl} alt={`${post.author}의 ${post.mediaType}`} />
          ) : (
            <div className="media-placeholder">미디어 없음</div>
          )}
        </article>

        <section className="post-detail-comments">
          <h3>댓글</h3>
          {statusMessage ? <p className="status-message">{statusMessage}</p> : null}
          <CommentList comments={comments} loading={loadingComments} />
          <CommentForm onSubmit={handleCommentSubmit} />
        </section>
      </section>
    </div>
  );
}
