# Implementation Plan

## 0) Scope Baseline
- 목표: 실시간 전자 방명록 MVP 완성
- 핵심 기능: 게시물 생성(업로드/드로잉), 포스트잇 보드, 상세 + 댓글 실시간
- 실시간 조건: Polling 금지, WebSocket 구독 사용

## 1) Setup
1. [x] Next.js(TypeScript) 프로젝트 초기화 파일 구성
2. [ ] UI 기본 세팅(Tailwind + 공통 레이아웃)
3. [ ] Supabase SDK 설치 및 환경변수 구성
4. [ ] `.env.local` 템플릿 정의

## 2) Database & Storage
1. SQL 마이그레이션 생성
   - `guestbook`, `comments` 테이블
   - FK, 인덱스, timestamp 기본값
2. RLS 정책 적용
   - 읽기 공개
   - 쓰기/삭제 정책 최소 권한 설정
3. Storage 버킷 생성
   - 파일 타입/크기 제한 전략 문서화

## 3) Core UI & Features
1. 등록 화면
   - [x] 이름/메시지 입력 폼 기본 UI
   - [ ] 파일 업로드 컴포넌트
   - [ ] 드로잉 캔버스(펜/지우개/색상/두께/초기화/저장)
2. 보드 화면
   - [x] 포스트잇 카드 UI(랜덤 회전/색상/그림자)
   - [x] 작성자/메시지/시간 표시
   - [x] 최신순 정렬
3. 상세 모달/페이지
   - [ ] 원본 이미지/그림 표시
   - [ ] 댓글 목록 + 댓글 입력
   - [ ] 게시물 변경/삭제 반영

## 4) Realtime Implementation
1. `guestbook` 구독
   - `INSERT`: 목록 최상단 추가
   - `UPDATE`: 카드/상세 데이터 동기화
   - `DELETE`: 목록/상세에서 제거
2. `comments` 구독
   - 현재 열린 `post_id` 필터링
   - 새 댓글 즉시 append
3. 안정성 처리
   - 컴포넌트 언마운트 시 구독 해제
   - 재연결 시 백필(fetch)로 정합성 보정

## 5) Validation, Error, UX
1. 입력값 검증(길이, 공백, 금지 문자 정책)
2. 파일 검증(MIME/크기)
3. 로딩/성공/실패 상태 표시
4. 실패 시 재시도 또는 사용자 안내 메시지

## 6) Testing Scenarios
1. 게시물 생성 후 같은 브라우저에서 즉시 노출 확인
2. 브라우저 2개 동시 접속
   - A에서 글 작성 -> B에서 실시간 반영 확인
   - A에서 댓글 작성 -> B 상세에서 실시간 반영 확인
   - A에서 게시물 삭제 -> B 보드/상세 동기화 확인
3. 경계값
   - 최대 길이 메시지
   - 허용/비허용 파일 타입
   - 파일 크기 초과 처리

## 7) Deliverables Mapping
- 1) 프로젝트 구조 설명: `memory-bank/architecure.md` + 실제 `src` 구조
- 2) 초기 설정 명령어: README
- 3) 핵심 코드: 페이지/컴포넌트/구독/SQL 마이그레이션(구현 단계에서 작성)
- 4) 실행 방법: README
- 5) 테스트 시나리오: 본 문서 6번 + 체크리스트(추가 예정)

## 8) AuthN/AuthZ Implementation Tasks (Current Structure Baseline)
1. 인증 전략 고정
   - Supabase Auth Provider 확정 (기본: email OTP, 옵션: Google OAuth 추가)
   - 세션 정책 결정: `persistSession=true`, 탭 간 동기화 유지
   - 익명 허용 여부 결정: 운영 단계에서 익명 쓰기 비허용(읽기만 공개)
2. 프론트 인증 레이어 추가
   - `AuthProvider`/`useSession` 훅 추가
   - 로그인/로그아웃 UI(헤더 또는 모달) 추가
   - 미로그인 시 게시물/댓글 작성 버튼 비활성 + 로그인 유도 문구
3. 사용자 프로필 레이어 추가
   - `profiles` 조회/생성 upsert 로직 (최초 로그인 시 display_name 생성)
   - 기존 `author` 입력 UX를 `display_name` 기반 기본값으로 전환
4. 쓰기 경로 인증 결합
   - 게시물 생성 시 `user_id = session.user.id` 저장
   - 댓글 생성 시 `user_id = session.user.id` 저장
   - 서버 에러(`401/403`)를 사용자 메시지로 명확히 변환
5. 스토리지 접근 제어 강화
   - 업로드 경로를 `auth.uid()` 포함 경로로 통일
   - 버킷 insert/update/delete 정책을 소유자 기반으로 변경
6. RLS 정책 전환
   - 공개 쓰기 정책 제거
   - 작성자 본인 수정/삭제만 허용
   - 공개 조회 유지(보드 특성)
7. 실시간/권한 회귀 테스트
   - 로그인 A, 로그인 B, 비로그인 C 시나리오 동시 검증
   - 본인 글 수정/삭제 가능, 타인 글 수정/삭제 불가 확인
   - 댓글 실시간 반영이 권한 전환 후에도 정상 동작하는지 확인

## 9) Migration Plan (Proposed: 0008+)
1. `0008_create_profiles_and_user_columns.sql` (Additive, 안전 단계)
   - `public.profiles` 생성:
     - `id uuid primary key references auth.users(id) on delete cascade`
     - `display_name text not null check (char_length(trim(display_name)) between 1 and 30)`
     - `created_at/updated_at`
   - `guestbook`에 `user_id uuid null references auth.users(id)` 추가
   - `comments`에 `user_id uuid null references auth.users(id)` 추가
   - 인덱스 추가:
     - `idx_guestbook_user_created_at (user_id, created_at desc)`
     - `idx_comments_user_created_at (user_id, created_at desc)`
2. `0009_profiles_rls.sql`
   - `profiles` RLS 활성화
   - `select`: 공개 또는 authenticated only 중 정책 결정 (권장: authenticated)
   - `insert/update`: `auth.uid() = id`만 허용
3. `0010_guestbook_comments_owner_policies.sql` (핵심 전환)
   - 기존 공개 insert/update/delete 정책 드롭
   - `guestbook/comments`:
     - `select`: 공개 유지
     - `insert`: `to authenticated with check (auth.uid() = user_id)`
     - `update/delete`: `to authenticated using (auth.uid() = user_id)`
4. `0011_storage_owner_policies.sql`
   - `storage.objects` 기존 공개 업로드 정책 제거
   - 인증 사용자 업로드 허용:
     - `with check (bucket_id = 'guestbook-media' and (storage.foldername(name))[1] = auth.uid()::text)`
   - 수정/삭제도 동일 owner 조건 적용
5. `0012_enforce_not_null_user_id.sql` (선택, 완전 전환 단계)
   - 전제: 익명 쓰기 완전 중단 + 기존 데이터 백필 완료
   - `guestbook.user_id`, `comments.user_id`를 `set not null`
   - 백필 전략:
     - 익명 legacy row 유지가 필요하면 `NOT NULL` 강제는 보류
     - 또는 운영 정책에 따라 관리 계정으로 이관

## 10) Rollout Strategy
1. Phase A (병행 운영)
   - `0008~0011`까지 적용, `user_id` nullable 유지
   - 앱에서 로그인 사용자는 `user_id` 채워 저장
   - 기존 익명 데이터는 읽기만 유지
2. Phase B (강화)
   - UI에서 미로그인 쓰기 경로 완전 차단
   - 운영 지표(실패율, 권한 에러) 모니터링
3. Phase C (엄격 모드)
   - 필요 시 `0012` 적용, 완전 소유권 모델로 마감
