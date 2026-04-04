@echo off
rem Wrap Gemini(재미나이), Codex, OpenCode, Claude, … — needs Git Bash (bash.exe).
set "PRESET=%~1"
if "%PRESET%"=="" set "PRESET=ai"
where bash >nul 2>nul
if errorlevel 1 (
  echo openbuddy-wrap-preset: Git Bash ^(bash.exe^) PATH에 필요합니다. https://git-scm.com/downloads
  exit /b 1
)
bash "%~dp0openbuddy-wrap" --preset %PRESET%
exit /b %ERRORLEVEL%
