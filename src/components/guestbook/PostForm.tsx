'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { DrawingCanvas } from './DrawingCanvas';

type MediaMode = 'upload' | 'drawing';

export interface CreatePostPayload {
  author: string;
  message: string;
  mediaFile: File;
  mediaType: 'image' | 'drawing';
}

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface PostFormProps {
  onSubmit?: (payload: CreatePostPayload) => Promise<boolean> | boolean;
}

export function PostForm({ onSubmit }: PostFormProps) {
  const [mediaMode, setMediaMode] = useState<MediaMode>('upload');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [drawingFile, setDrawingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedMediaFile = useMemo(
    () => (mediaMode === 'upload' ? uploadFile : drawingFile),
    [drawingFile, mediaMode, uploadFile],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const setPreviewFromFile = (file: File | null) => {
    setPreviewUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return file ? URL.createObjectURL(file) : null;
    });
  };

  const validateMediaFile = (file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return '이미지는 JPG, PNG, WebP 형식만 업로드할 수 있습니다.';
    }

    if (file.size > MAX_FILE_SIZE) {
      return '이미지 크기는 5MB 이하만 허용됩니다.';
    }

    return null;
  };

  const handleUploadFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setUploadFile(null);
      setPreviewFromFile(null);
      return;
    }

    const message = validateMediaFile(file);
    if (message) {
      setSubmitError(message);
      event.target.value = '';
      return;
    }

    setSubmitError(null);
    setUploadFile(file);
    if (mediaMode === 'upload') {
      setPreviewFromFile(file);
    }
  };

  const handleDrawingSave = (file: File) => {
    const message = validateMediaFile(file);
    if (message) {
      setSubmitError(message);
      return;
    }

    setSubmitError(null);
    setDrawingFile(file);
    if (mediaMode === 'drawing') {
      setPreviewFromFile(file);
    }
  };

  const handleDrawingClear = () => {
    setDrawingFile(null);
    if (mediaMode === 'drawing') {
      setPreviewFromFile(null);
    }
  };

  const handleModeChange = (nextMode: MediaMode) => {
    setMediaMode(nextMode);
    setSubmitError(null);
    setPreviewFromFile(nextMode === 'upload' ? uploadFile : drawingFile);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const author = String(formData.get('author') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();
    const mediaFile = selectedMediaFile;
    const mediaType = mediaMode === 'upload' ? 'image' : 'drawing';

    if (!author || !message) {
      return;
    }

    if (!mediaFile) {
      setSubmitError('사진 업로드 또는 드로잉 저장 후 등록해 주세요.');
      return;
    }

    try {
      setSubmitError(null);
      setIsSubmitting(true);
      const result = await onSubmit?.({ author, message, mediaFile, mediaType });
      if (result !== false) {
        event.currentTarget.reset();
        setUploadFile(null);
        setDrawingFile(null);
        setPreviewFromFile(null);
      } else {
        setSubmitError('등록에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } catch {
      setSubmitError('등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
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

      <fieldset className="media-mode-picker">
        <legend>첨부 방식</legend>
        <label>
          <input
            type="radio"
            name="mediaMode"
            value="upload"
            checked={mediaMode === 'upload'}
            onChange={() => handleModeChange('upload')}
            disabled={isSubmitting}
          />
          사진 업로드
        </label>
        <label>
          <input
            type="radio"
            name="mediaMode"
            value="drawing"
            checked={mediaMode === 'drawing'}
            onChange={() => handleModeChange('drawing')}
            disabled={isSubmitting}
          />
          캔버스 드로잉
        </label>
      </fieldset>

      {mediaMode === 'upload' ? (
        <label>
          사진 선택
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleUploadFileChange}
            disabled={isSubmitting}
          />
          <span className="helper-text">허용 형식: JPG, PNG, WebP / 최대 5MB</span>
        </label>
      ) : (
        <DrawingCanvas disabled={isSubmitting} onSave={handleDrawingSave} onClear={handleDrawingClear} />
      )}

      {previewUrl ? <img className="post-form-preview" src={previewUrl} alt="첨부 미리보기" /> : null}
      {submitError ? <p className="form-error">{submitError}</p> : null}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '등록 중...' : '등록'}
      </button>
    </form>
  );
}
