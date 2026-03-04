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
   - `posts`, `comments` 테이블
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
1. `posts` 구독
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
