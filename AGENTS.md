# AGENTS

## Operating Rule (Always-On)
- Start every task by reading this `AGENTS.md`.
- Treat this file as the primary project memory index and keep it current.
- Update this file whenever requirements, architecture, plan, or progress changes.
- Query this file first before creating or changing implementation details.

## Memory Bank
- Architecture: `memory-bank/architecure.md`
- Progress: `memory-bank/progress.md`
- Implementation plan: `memory-bank/implementation-plan.md`

## Collaboration Convention
- Keep decisions concise and timestamped when meaningful.
- Prefer small, verifiable milestones.
- Reflect completed milestones in `memory-bank/progress.md` immediately.

## Current Focus (2026-03-04 09:55 UTC)
- Supabase 연동 1차 완료: `@supabase/supabase-js` 설치 및 브라우저 클라이언트 추가.
- `guestbook` 기준 실시간 연결: 조회/등록/`INSERT|UPDATE|DELETE` 구독을 `src/app/page.tsx`에 반영.
- 마이그레이션 정리: 신규 스키마(`0001`) + 기존 `posts` -> `guestbook` rename(`0002`) + 정책 보강(`0003`) + 미디어 확장(`0004`, `0005`).
- 레거시 `content` 컬럼 스키마 호환 fallback 추가(기존 프로젝트 데이터 보호).
- 운영 이슈 수정: `guestbook` RLS 정책 누락으로 인한 INSERT 실패 해결 완료.
- 업로드/드로잉 기능 구현 완료: 스토리지 업로드 + 캔버스 드로잉 + 파일 검증.
- 댓글 실시간 구현 완료: 상세 모달 + `comments` 구독 + 정책/테이블/Realtime publication 구성(`0006`, `0007`).
- 다음 우선순위: 인증/인가(AuthN/AuthZ) 도입을 위한 스키마/RLS/클라이언트 마이그레이션 계획 수립 및 단계적 적용.

## Skills
A skill is a set of local instructions to follow that is stored in a `SKILL.md` file. Below is the list of skills that can be used. Each entry includes a name, description, and file path so you can open the source for full instructions when using a specific skill.
### Available skills
- skill-creator: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Codex's capabilities with specialized knowledge, workflows, or tool integrations. (file: /opt/codex/skills/.system/skill-creator/SKILL.md)
- skill-installer: Install Codex skills into $CODEX_HOME/skills from a curated list or a GitHub repo path. Use when a user asks to list installable skills, install a curated skill, or install a skill from another repo (including private repos). (file: /opt/codex/skills/.system/skill-installer/SKILL.md)
### How to use skills
- Discovery: The list above is the skills available in this session (name + description + file path). Skill bodies live on disk at the listed paths.
- Trigger rules: If the user names a skill (with `$SkillName` or plain text) OR the task clearly matches a skill's description shown above, you must use that skill for that turn. Multiple mentions mean use them all. Do not carry skills across turns unless re-mentioned.
- Missing/blocked: If a named skill isn't in the list or the path can't be read, say so briefly and continue with the best fallback.
- How to use a skill (progressive disclosure):
  1) After deciding to use a skill, open its `SKILL.md`. Read only enough to follow the workflow.
  2) If `SKILL.md` points to extra folders such as `references/`, load only the specific files needed for the request; don't bulk-load everything.
  3) If `scripts/` exist, prefer running or patching them instead of retyping large code blocks.
  4) If `assets/` or templates exist, reuse them instead of recreating from scratch.
- Coordination and sequencing:
  - If multiple skills apply, choose the minimal set that covers the request and state the order you'll use them.
  - Announce which skill(s) you're using and why (one short line). If you skip an obvious skill, say why.
- Context hygiene:
  - Keep context small: summarize long sections instead of pasting them; only load extra files when needed.
  - Avoid deep reference-chasing: prefer opening only files directly linked from `SKILL.md` unless you're blocked.
  - When variants exist (frameworks, providers, domains), pick only the relevant reference file(s) and note that choice.
- Safety and fallback: If a skill can't be applied cleanly (missing files, unclear instructions), state the issue, pick the next-best approach, and continue.
