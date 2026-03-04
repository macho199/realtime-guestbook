# Progress Log

## Project
- Name: Realtime Guestbook
- Last updated: 2026-03-04

## Current Status
- 상태: 댓글 실시간 포함 MVP 핵심 흐름 구현
- 전체 진행률: 88%

## Completed
- [x] 요구사항 초안 수집 및 목표 정의
- [x] 아키텍처 방향 확정 (Next.js + Supabase + Realtime)
- [x] Memory Bank 문서 초기화
  - `memory-bank/architecure.md`
  - `memory-bank/implementation-plan.md`
  - `memory-bank/progress.md`
- [x] 루트 `AGENTS.md` 생성 및 상시 조회/수정 규칙 반영
- [x] UI 1차 구성 시작
  - `src/app/page.tsx`에 기본 화면/상태 흐름 추가
  - `PostForm`, `StickyBoard`, `StickyCard` 컴포넌트 분리
  - 포스트잇 테마/레이아웃 CSS 추가
- [x] Next.js 실행 스캐폴딩 구성
  - `package.json` 스크립트 추가 (`npm start` -> `next dev`)
  - `tsconfig.json`, `next.config.mjs`, `next-env.d.ts`, `.gitignore`, `README.md` 추가
- [x] Supabase SDK 연동
  - `@supabase/supabase-js` 설치
  - `src/lib/supabase/client.ts` 추가
  - `.env.example` 추가
- [x] 게시물 데이터 흐름 Supabase 전환
  - `guestbook` 조회/등록 API 연결
  - `guestbook` Realtime (`INSERT/UPDATE/DELETE`) 구독 연결
  - 에러/로딩 상태 메시지 반영
- [x] Supabase SQL 마이그레이션 초안 추가
  - `supabase/migrations/0001_init_guestbook.sql`
  - `guestbook/comments` 테이블, 인덱스, RLS 정책
- [x] 테이블명 변경 반영
  - 런타임 쿼리/실시간 구독 테이블 `posts` -> `guestbook`
  - 기존 DB 호환용 rename 마이그레이션 `0002_rename_posts_to_guestbook.sql` 추가
- [x] 레거시 스키마 호환 처리
  - `guestbook(author, content)` 형태에서도 게시물 등록/조회 동작하도록 fallback 로직 추가
- [x] RLS 등록 실패 이슈 수정
  - 원격 Supabase `guestbook` 정책 부재 확인 후 INSERT/SELECT/UPDATE/DELETE 정책 생성
  - 재현 방지용 `supabase/migrations/0003_ensure_guestbook_policies.sql` 추가
- [x] 업로드 + 드로잉 기능 추가
  - `DrawingCanvas` 컴포넌트 구현(펜/지우개/색상/두께/초기화/저장)
  - `PostForm`에 업로드/드로잉 모드 및 파일 검증(타입/5MB 제한) 추가
  - `guestbook-media` 스토리지 업로드 후 `media_url/media_type` 저장 연결
- [x] DB/Storage 확장 마이그레이션 추가 및 원격 적용
  - `0004_expand_guestbook_columns.sql` (message/media 컬럼 확장)
  - `0005_guestbook_media_storage.sql` (버킷 및 storage.objects 정책)
- [x] 상세 모달 + 댓글 실시간 구현
  - 카드 클릭 상세 모달 오픈
  - `comments` 조회/작성 연결
  - `comments` Realtime 구독(`INSERT/UPDATE/DELETE`)
  - 상세 열린 상태에서 게시물 변경/삭제 이벤트 반영
- [x] 댓글 테이블/정책/realtime publication 구성
  - `0006_create_comments_realtime.sql` 원격 적용
  - `0007_ensure_guestbook_realtime_publication.sql` 원격 적용
- [x] 인증/인가 도입 계획 수립
  - 현재 구조 기준 AuthN/AuthZ 작업 항목 정의
  - 단계적 DB 마이그레이션 로드맵(`0008`~`0012`) 문서화

## In Progress
- [ ] Auth UI/세션 레이어 도입 설계 구체화
- [ ] 게시물 변경/삭제 UI 고도화
- [ ] 댓글 UX 개선(정렬/페이징/알림)

## Next Up
- [ ] `0008_create_profiles_and_user_columns.sql` 초안 작성 및 검증
- [ ] 공개 쓰기 정책 제거 전 회귀 테스트 시나리오 작성
- [ ] 테스트 시나리오 점검
- [ ] 댓글 입력 검증 및 스팸 방어 강화

## Risks / Notes
- 실시간 이벤트 중복 처리 및 구독 해제 타이밍 관리 필요
- 대용량 이미지 업로드 시 UX 저하 가능성(압축/리사이즈 고려)
- 익명 쓰기 정책 범위가 넓으면 스팸 위험이 있으므로 정책 세분화 필요
- 현재 마이그레이션 정책은 MVP 편의상 공개 쓰기를 허용하므로, 운영 전에는 rate limit/캡차/인증 정책 강화 필요
- 인증 강제 전환 시 기존 익명 데이터(`user_id is null`) 처리 방안(유지/이관/아카이브) 합의 필요
