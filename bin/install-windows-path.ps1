# Copy openbuddy into %USERPROFILE%\.local\bin and add to user PATH (Windows).
$ErrorActionPreference = "Stop"
$repoBin = $PSScriptRoot
$targetBin = Join-Path $env:USERPROFILE ".local\bin"

New-Item -ItemType Directory -Force -Path $targetBin | Out-Null

foreach ($f in @("openbuddy", "openbuddy.cmd", "openbuddy-wrap", "openbuddy-wrap-preset.cmd")) {
    $src = Join-Path $repoBin $f
    if (-not (Test-Path $src)) { Write-Error "Missing: $src"; exit 1 }
    Copy-Item $src $targetBin -Force
    Write-Host "  copied $f"
}

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$targetBin*") {
    $newPath = if ($userPath) { "$userPath;$targetBin" } else { $targetBin }
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    Write-Host "  added to user PATH: $targetBin"
} else {
    Write-Host "  PATH already contains: $targetBin"
}

Write-Host ""
Write-Host "Done. Open a NEW terminal, then: openbuddy show"
