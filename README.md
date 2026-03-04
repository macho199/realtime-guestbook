# Realtime Guestbook

## Setup

```bash
npm install
cp .env.example .env.local
npm start
```

기본 실행 포트는 `http://localhost:3000` 입니다.

## Supabase 연결

`.env.local`에 아래 값을 넣어주세요.

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# 또는(신규 키 형식)
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
```

### DB 스키마 적용

Supabase SQL Editor에서 아래 파일을 실행하세요.

- `supabase/migrations/0001_init_guestbook.sql`
- 기존에 `posts` 테이블을 이미 만들었다면: `supabase/migrations/0002_rename_posts_to_guestbook.sql`도 실행
- 정책 누락 복구: `supabase/migrations/0003_ensure_guestbook_policies.sql`
- 미디어 컬럼 확장: `supabase/migrations/0004_expand_guestbook_columns.sql`
- 스토리지 버킷/정책: `supabase/migrations/0005_guestbook_media_storage.sql`
- 댓글 테이블/정책/Realtime: `supabase/migrations/0006_create_comments_realtime.sql`
- publication 보강(guestbook/comments): `supabase/migrations/0007_ensure_guestbook_realtime_publication.sql`

### Realtime 활성화 확인

Supabase Dashboard에서 `guestbook` 테이블 Realtime이 켜져 있어야 합니다.

- Database -> Replication -> `guestbook` (필수)
- 댓글 실시간 구현 시 `comments`도 활성화

## 현재 구현 범위

- 게시물 목록 조회: Supabase `guestbook`
- 게시물 등록: Supabase `guestbook` insert
- 게시물 실시간 반영: `guestbook` table change subscription (`INSERT/UPDATE/DELETE`)
- 사진 업로드: `guestbook-media` 버킷 업로드 + `media_url` 저장
- 캔버스 드로잉: 펜/지우개/색상/두께/초기화/저장 후 이미지 업로드
- 상세 모달에서 댓글 조회 + 댓글 작성
- 댓글 실시간 반영: `comments` table change subscription (`INSERT/UPDATE/DELETE`)
