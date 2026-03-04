'use client';

import { FormEvent } from 'react';

interface PostFormProps {
  onSubmit?: (payload: { author: string; message: string }) => void;
}

export function PostForm({ onSubmit }: PostFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const author = String(formData.get('author') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();

    if (!author || !message) {
      return;
    }

    onSubmit?.({ author, message });
    event.currentTarget.reset();
  };

  return (
    <form onSubmit={handleSubmit} className="panel post-form">
      <h2>방명록 남기기</h2>
      <label>
        이름
        <input name="author" type="text" maxLength={30} placeholder="이름을 입력하세요" required />
      </label>
      <label>
        메시지
        <textarea
          name="message"
          maxLength={160}
          rows={3}
          placeholder="한 줄 메시지를 입력하세요"
          required
        />
      </label>
      <p className="helper-text">* 사진 업로드/드로잉 기능은 다음 단계에서 연결됩니다.</p>
      <button type="submit">등록</button>
    </form>
  );
}
