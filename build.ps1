# Build completo: Next.js + Node.js embutido + Flutter Windows + Instalador
param(
    [switch]$SkipNext,
    [switch]$SkipNode,
    [switch]$SkipFlutter,
    [switch]$SkipInstaller
)

$ErrorActionPreference = 'Stop'
$root    = $PSScriptRoot
$release = "$root\flutter_app\build\windows\x64\runner\Release"

Stop-Process -Name "flutter_app" -Force -ErrorAction SilentlyContinue

# ── 1. Build Next.js ────────────────────────────────────────────────────────
if (-not $SkipNext) {
    Write-Host "`n==> [1/5] Build Next.js..." -ForegroundColor Cyan
    Set-Location $root
    pnpm build
}

# ── 2. Node.js standalone ───────────────────────────────────────────────────
$nodeDir = "$root\.node-standalone"
$nodeExe = "$nodeDir\node.exe"
$nodeVer = "22.5.1"
$nodeUrl = "https://nodejs.org/dist/v$nodeVer/win-x64/node.exe"

if (-not $SkipNode) {
    Write-Host "`n==> [2/5] Baixando Node.js $nodeVer standalone..." -ForegroundColor Cyan
    if (-not (Test-Path $nodeDir)) { New-Item -ItemType Directory -Path $nodeDir | Out-Null }
    if (-not (Test-Path $nodeExe)) {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeExe
        Write-Host "   Baixado: $nodeExe"
    } else {
        Write-Host "   Ja existe: $nodeExe (pulando download)"
    }
}

# ── 3. Build Flutter ────────────────────────────────────────────────────────
if (-not $SkipFlutter) {
    Write-Host "`n==> [3/5] Build Flutter Windows (release)..." -ForegroundColor Cyan
    Set-Location "$root\flutter_app"
    flutter pub get
    flutter build windows --release
}

# ── 4. Copiar webapp + node.exe para Release ────────────────────────────────
Write-Host "`n==> [4/5] Montando pasta Release..." -ForegroundColor Cyan

# webapp
$webDest = "$release\webapp"
if (Test-Path $webDest) { Remove-Item $webDest -Recurse -Force }
New-Item -ItemType Directory -Path $webDest | Out-Null

Copy-Item "$root\.next"        "$webDest\.next"        -Recurse
Copy-Item "$root\public"       "$webDest\public"       -Recurse
Copy-Item "$root\package.json" "$webDest\package.json"
Copy-Item "$root\server.js"    "$webDest\server.js"

Write-Host "   Copiando node_modules (pode demorar)..."
Copy-Item "$root\node_modules" "$webDest\node_modules" -Recurse

# node.exe
Copy-Item $nodeExe "$release\node.exe" -Force
Write-Host "   node.exe copiado para Release"

# ── 5. Gerar instalador com Inno Setup ──────────────────────────────────────
if (-not $SkipInstaller) {
    Write-Host "`n==> [5/5] Gerando instalador (Inno Setup)..." -ForegroundColor Cyan

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
Write-Host "    Instalador:  $root\dist\ToDoTimer-Setup-1.0.0.exe"
