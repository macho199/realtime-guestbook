'use client';

import { FormEvent, useState } from 'react';

interface CommentFormProps {
  onSubmit?: (payload: { author: string; content: string }) => Promise<boolean> | boolean;
}

export function CommentForm({ onSubmit }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const author = String(formData.get('author') ?? '').trim();
    const content = String(formData.get('content') ?? '').trim();

    if (!author || !content) {
      setErrorMessage('작성자와 댓글 내용을 입력해 주세요.');
      return;
    }

    try {
      setErrorMessage(null);
      setIsSubmitting(true);
      const result = await onSubmit?.({ author, content });
      if (result !== false) {
        event.currentTarget.reset();
      } else {
        setErrorMessage('댓글 등록에 실패했습니다.');
      }
    } catch {
      setErrorMessage('댓글 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <label>
        작성자
        <input name="author" type="text" maxLength={30} required placeholder="이름" disabled={isSubmitting} />
      </label>
      <label>
        댓글
        <textarea
          name="content"
          maxLength={500}
          rows={3}
          required
          placeholder="댓글을 입력하세요"
          disabled={isSubmitting}
        />
      </label>
      {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '등록 중...' : '댓글 등록'}
      </button>
    </form>
  );
}
