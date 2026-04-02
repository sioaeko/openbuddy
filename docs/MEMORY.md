---
name: openbuddy project
description: openbuddy — CLI 코딩 툴용 다마고치 버디 시스템, 현재 상태 및 미해결 문제
type: project
---

# openbuddy 프로젝트

Tamagotchi 스타일 ASCII 버디를 CLI 코딩 툴(Codex, Gemini, opencode 등)에 주입하는 시스템.

## 완성된 파일들

| 파일 | 역할 |
|------|------|
| `~/.local/bin/openbuddy` | 메인 Python 앱 (show/session/watch/reset/info/list) |
| `~/.local/bin/openbuddy-wrap` | 래퍼 생성기 (wrap/--list/--remove) |
| `~/.local/share/openbuddy/BuddyPanel.js` | Gemini CLI용 Ink 컴포넌트 |
| `~/.local/share/openbuddy/DefaultAppLayout.patched.js` | Gemini CLI 레이아웃 패치 |
| `~/.local/share/openbuddy/gemini-patch.sh` | Gemini 패치 sudo 스크립트 |
| `~/.local/share/openbuddy/gemini-unpatch.sh` | Gemini 패치 롤백 스크립트 |

## 생성된 래퍼들

- `~/.local/bin/codex` → 래핑됨
- `~/.local/bin/gemini` → 래핑됨
- `~/.local/bin/opencode` → `/usr/bin/opencode` (v1.3.8) 래핑됨

## 상태 파일

- `~/.config/openbuddy/state.json` — 세션 수, 크리처 종류, 부화 여부
- 6종 크리처: debugrix/velocode/refactoron/nullbyte/wizardex/compilox
- 스테이지: egg(0) → baby(3) → adult(12) → elder(30세션)

## Gemini 통합 방식

BuddyPanel.js가 `useEffect()`로 매 Ink 렌더 후 ANSI cursor-address로 우측 패널 직접 그림.
`getBuddyWidth(terminalWidth)` exported → DefaultAppLayout이 mainW 축소해 공간 예약.
Gemini 업그레이드 시 `sudo bash gemini-patch.sh` 재실행 필요.

## 미해결 문제 (2026-04-01 기준)

**opencode 래퍼에서 opencode가 죽는 문제:**
- 증상: `opencode` 실행 시 tmux 세션 생성되지만 opencode 패인이 바로 종료, openbuddy watch 패인만 남음
- opencode 자체는 정상 동작 (`/usr/bin/opencode` v1.3.8, tmux 안에서도 정상)
- 50컬럼 분할 패인에서 opencode가 바로 종료되는지 확인 중 (세션 중단됨)
- 가능한 원인: 패인 너비 너무 좁음(~50col), TERM 환경변수, 첫 실행 시 설정 부재
- `_sess="openbuddy-$$"` PID 고정 버그는 수정 완료 (2026-04-01)

**Task #6:** cursor 스크립트에 openbuddy 주입 (미시작)

## 주요 기술적 결정 및 함정

- `openbuddy-wrap --list`가 자기 자신을 표시하던 버그: heredoc 안에 마커 문자열이 있어 `grep`에 걸림 → `head -3` 로 해결
- Ink의 `position: absolute` + `overflow: hidden` 클리핑 → ANSI stdout 직접 쓰기로 해결
- `gemini-patch.sh`에서 `$HOME`이 sudo로 `/root`로 바뀌는 문제 → `npm root -g` 자동 감지로 해결
- Windows cp949 인코딩에서 유니코드 심볼(✦ 등) 크래시 → `sys.stdout.reconfigure(encoding="utf-8")` 추가
- Windows에서 bash 래퍼(확장자 없음)는 PowerShell/cmd에서 안 잡힘 → `.cmd` 래퍼 동시 생성으로 해결
- Windows mintty에서 python PATH 누락으로 즉시 종료 → PowerShell `Start-Process`로 전환
- Codex hooks는 Windows에서 아직 미지원 (바이너리가 자동 비활성화)

**Why:** 이 메모는 다음 대화에서 opencode 문제를 계속 디버깅하거나 cursor 통합을 시작할 때 컨텍스트를 복원하기 위함.
**How to apply:** opencode 이슈 재개 시 "50컬럼 패인에서 opencode 즉시 종료" 가설부터 확인. cursor 통합은 Task #6.
