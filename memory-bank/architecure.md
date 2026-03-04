# Realtime Guestbook Architecture

## 1) Product Goal
새로고침 없이 실시간으로 반영되는 전자 방명록 웹앱을 구축한다.

- 방문자는 이름/한 줄 메시지와 함께 `사진 업로드` 또는 `캔버스 드로잉`으로 게시물을 생성한다.
- 보드 화면에서 게시물이 포스트잇 카드 형태로 표시된다.
- 상세 화면에서 댓글/게시물 변경 사항이 WebSocket 기반 구독으로 즉시 반영된다.

## 2) Tech Stack (Recommended)
- Frontend: Next.js (App Router), React, TypeScript
- Styling/UI: Tailwind CSS + 컴포넌트 분리
- Backend/Data/Realtime/Storage: Supabase
  - Postgres: `guestbook`, `comments`
  - Realtime: Postgres Changes subscription (polling 금지)
  - Storage: 이미지/드로잉 파일 저장

## 3) High-Level Flow
1. 사용자가 등록 화면에서 글 + 미디어(업로드/드로잉) 입력
2. 미디어를 Supabase Storage에 업로드 후 public/signed URL 획득
3. `guestbook` 테이블에 레코드 삽입
4. 보드 화면은 `guestbook` 최신순 조회 + Realtime `INSERT/UPDATE/DELETE` 구독
5. 상세 화면은 `comments` 조회 + `guestbook/comments` 변경 이벤트 구독
6. 댓글 작성 시 `comments` 삽입, 모든 접속자 화면 즉시 업데이트

## 4) Data Model
### guestbook
- `id` (uuid, pk)
- `author` (text, not null)
- `message` (text, not null)
- `media_url` (text, not null)
- `media_type` (text check: `image` | `drawing`)
- `created_at` (timestamptz default now())
- `updated_at` (timestamptz default now())

### comments
- `id` (uuid, pk)
- `post_id` (uuid, fk -> guestbook.id on delete cascade)
- `author` (text, not null)
- `content` (text, not null)
- `created_at` (timestamptz default now())

## 5) Realtime Strategy
- Board:
  - `guestbook` table change events 구독 (`INSERT`, `UPDATE`, `DELETE`)
  - 새 글, 수정, 삭제를 로컬 상태에 즉시 반영
- Detail:
  - 선택된 `post_id` 기준으로 `comments` change events 구독
  - 댓글 삽입/삭제를 모달 열린 상태에서 즉시 반영
- 연결 복구:
  - 구독 재연결 시 최신 목록 재조회(정합성 보장)

## 6) Security & Validation
- 입력 검증:
  - `author`, `message`, `content` 길이 제한
  - 파일 MIME 타입: JPG/PNG/WebP만 허용
  - 파일 크기 제한(예: 5MB)
- RLS:
  - 읽기: 공개 조회 허용
  - 쓰기: 허용 정책 범위를 명시적으로 제한
- 업로드 파일명 충돌 방지:
  - UUID 기반 경로 사용 (`guestbook/{postId}/{uuid}.webp`)

## 6-1) AuthN/AuthZ Target Architecture (Planned)
- 인증 공급자: Supabase Auth (email OTP 또는 OAuth, 클라이언트 SDK 기반 세션 유지)
- 사용자 식별: `auth.users.id`를 기준으로 `public.profiles(id uuid pk)` 1:1 매핑
- 데이터 소유권:
  - `guestbook.user_id -> auth.users.id`
  - `comments.user_id -> auth.users.id`
  - 기존 익명 데이터 호환을 위해 1차는 `user_id nullable`로 시작
- 권한 모델(목표):
  - `SELECT`: 공개(anon/authenticated)
  - `INSERT`: 인증 사용자만, `with check (auth.uid() = user_id)`
  - `UPDATE/DELETE`: 작성자 본인만, `using (auth.uid() = user_id)`
- 스토리지 권한(목표):
  - 읽기 공개 유지(요구사항상 공개 보드)
  - 업로드/수정/삭제는 인증 사용자 + 본인 경로만 허용
  - 권장 경로: `guestbook-media/{auth.uid()}/{post_id}/{uuid}.{ext}`
- 실시간 권한:
  - Realtime은 테이블 RLS를 따르므로 정책 전환 후에도 기존 `guestbook/comments` 구독 구조는 유지

## 7) Suggested Project Structure
```text
src/
  app/
    page.tsx                    # 등록 + 보드(초기 UI 1차 구현 완료)
    board/page.tsx              # 포스트잇 보드 (예정)
    post/[id]/page.tsx          # 상세 페이지(예정)
  components/
    guestbook/
      PostForm.tsx              # 구현됨
      DrawingCanvas.tsx         # 예정
      StickyBoard.tsx           # 구현됨
      StickyCard.tsx            # 구현됨
      PostDetailModal.tsx       # 예정
      CommentList.tsx           # 예정
      CommentForm.tsx           # 예정
  lib/
    supabase/
      client.ts
      realtime.ts
    validation/
      post.ts
      comment.ts
  types/
    post.ts
    comment.ts
supabase/
  migrations/
    0001_init_guestbook.sql
```

## 8) Non-Functional Requirements
- 모바일/데스크톱 반응형
- 로딩/에러 상태 표시
- 기능 단위 모듈 분리 및 재사용성 유지
- 기본 테스트(폼 검증, 실시간 반영 시나리오) 포함

## 9) Decision Log
- 2026-03-04 08:07 UTC: UI 구현 1차는 서버 연동 이전에 클라이언트 상태 기반으로 폼/보드 컴포넌트 구조를 먼저 고정하기로 결정.
- 2026-03-04 08:18 UTC: 실행성 이슈 해소를 위해 Next.js 런타임 설정 파일과 npm 스크립트를 우선 보강하고 `npm start`를 개발 서버 진입점으로 설정.
