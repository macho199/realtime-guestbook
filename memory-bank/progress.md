# Progress Log

## Project
- Name: Realtime Guestbook
- Last updated: 2026-03-04

## Current Status
- 상태: UI Bootstrapping in progress
- 전체 진행률: 25%

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

## In Progress
- [ ] 프로젝트 초기 스캐폴딩 보완 (Next.js 설정 파일, 실행 스크립트)
- [ ] 등록 화면 기능 고도화 (업로드/드로잉 연결)

## Next Up
- [ ] Supabase 프로젝트 연결 및 환경변수 구성
- [ ] DB 스키마/마이그레이션 작성 (`posts`, `comments`)
- [ ] Storage 버킷/정책 설정
- [ ] 보드 화면 실시간 구독 연결
- [ ] 상세 모달(댓글 실시간) 구현
- [ ] 테스트 시나리오 점검

## Risks / Notes
- 실시간 이벤트 중복 처리 및 구독 해제 타이밍 관리 필요
- 대용량 이미지 업로드 시 UX 저하 가능성(압축/리사이즈 고려)
- 익명 쓰기 정책 범위가 넓으면 스팸 위험이 있으므로 정책 세분화 필요
