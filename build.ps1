# Build completo: Next.js (export estático) + Flutter Windows + Instalador
# Sem Node.js embutido: o exe Flutter serve o export estático de dentro do
# próprio processo (lib/local_server.dart).
param(
    [switch]$SkipNext,
    [switch]$SkipFlutter,
    [switch]$SkipInstaller
)

$ErrorActionPreference = 'Stop'
$root    = $PSScriptRoot
$release = "$root\flutter_app\build\windows\x64\runner\Release"

Stop-Process -Name "flutter_app" -Force -ErrorAction SilentlyContinue

# ── 1. Build Next.js (export estático → out/) ───────────────────────────────
if (-not $SkipNext) {
    Write-Host "`n==> [1/4] Build Next.js (export estatico)..." -ForegroundColor Cyan
    Set-Location $root
    pnpm build
    if (-not (Test-Path "$root\out\index.html")) {
        throw "Export estatico nao gerado (out\index.html ausente). Verifique output: 'export' no next.config.ts"
    }
}

# ── 2. Build Flutter ────────────────────────────────────────────────────────
if (-not $SkipFlutter) {
    Write-Host "`n==> [2/4] Build Flutter Windows (release)..." -ForegroundColor Cyan
    Set-Location "$root\flutter_app"
    flutter pub get
    flutter build windows --release
}

# ── 3. Copiar webapp estática para Release ──────────────────────────────────
Write-Host "`n==> [3/4] Copiando webapp estatica para Release..." -ForegroundColor Cyan

$webDest = "$release\webapp"
if (Test-Path $webDest) { Remove-Item $webDest -Recurse -Force }
Copy-Item "$root\out" $webDest -Recurse

# ── 4. Gerar instalador com Inno Setup ──────────────────────────────────────
if (-not $SkipInstaller) {
    Write-Host "`n==> [4/4] Gerando instalador (Inno Setup)..." -ForegroundColor Cyan

    $inno = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
    if (-not (Test-Path $inno)) {
        Write-Host "   Inno Setup nao encontrado em '$inno'." -ForegroundColor Yellow
        Write-Host "   Baixe em https://jrsoftware.org/isinfo.php e rode novamente." -ForegroundColor Yellow
    } else {
        if (-not (Test-Path "$root\dist")) { New-Item -ItemType Directory -Path "$root\dist" | Out-Null }
        & $inno "$root\installer.iss"
        Write-Host "`n==> Instalador gerado em: $root\dist\" -ForegroundColor Green
    }
}

Write-Host "`n==> Build concluido!" -ForegroundColor Green
Write-Host "    Executavel:  $release\flutter_app.exe"
Write-Host "    Instalador:  $root\dist\"
