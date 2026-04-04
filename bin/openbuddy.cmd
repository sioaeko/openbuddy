@echo off
set "OB_SCRIPT=%~dp0openbuddy"
chcp 65001 >nul 2>nul
set PYTHONIOENCODING=utf-8
if not exist "%OB_SCRIPT%" (
  echo openbuddy: missing "%OB_SCRIPT%" >&2
  exit /b 1
)
where py >nul 2>nul && (
  py -3 "%OB_SCRIPT%" %*
  exit /b %ERRORLEVEL%
)
where python >nul 2>nul && (
  python "%OB_SCRIPT%" %*
  exit /b %ERRORLEVEL%
)
where python3 >nul 2>nul && (
  python3 "%OB_SCRIPT%" %*
  exit /b %ERRORLEVEL%
)
echo openbuddy: Python 3 ^(py / python^) not found in PATH. >&2
exit /b 9009
