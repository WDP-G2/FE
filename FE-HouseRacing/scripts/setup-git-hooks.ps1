# Chạy một lần mỗi máy: .\scripts\setup-git-hooks.ps1
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root
git config core.hooksPath .githooks
Write-Host "OK: core.hooksPath = .githooks (chan Co-authored-by Cursor)"
