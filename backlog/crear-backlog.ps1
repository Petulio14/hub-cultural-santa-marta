
<#
  crear-backlog.ps1
  Carga en GitHub las 40 historias de usuario del Anexo A: etiquetas, hitos e issues.

  Requisitos:
    1. GitHub CLI instalado      ->  winget install --id GitHub.cli
    2. Sesion iniciada           ->  gh auth login
    3. Ejecutar desde la raiz del repositorio clonado.

  Uso:
    .\backlog\crear-backlog.ps1              # crea todo
    .\backlog\crear-backlog.ps1 -DryRun      # solo muestra lo que haria
#>

param(
  [string]$Repo = "",
  [switch]$DryRun
)

$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ---------------------------------------------------------------- comprobaciones
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Host "No se encontro GitHub CLI. Instalalo con: winget install --id GitHub.cli" -ForegroundColor Red
  exit 1
}
gh auth status *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "No hay sesion iniciada. Ejecuta: gh auth login" -ForegroundColor Red
  exit 1
}

$json = Join-Path $PSScriptRoot "backlog.json"
if (-not (Test-Path $json)) {
  Write-Host "Falta backlog.json junto al script." -ForegroundColor Red; exit 1
}
$data = Get-Content -Raw -Encoding UTF8 $json | ConvertFrom-Json
if ($Repo -eq "") { $Repo = $data.repo }

Write-Host "Repositorio: $Repo" -ForegroundColor Cyan
Write-Host ("Se crearan {0} etiquetas, {1} hitos y {2} issues." -f `
  $data.labels.Count, $data.milestones.Count, $data.issues.Count) -ForegroundColor Cyan
if ($DryRun) { Write-Host "MODO SIMULACION: no se enviara nada." -ForegroundColor Yellow }
Write-Host ""

$utf8 = New-Object System.Text.UTF8Encoding($false)
function Escribir-Utf8($ruta, $texto) {
  [System.IO.File]::WriteAllText($ruta, $texto, $utf8)
}

# ---------------------------------------------------------------- 1. etiquetas
Write-Host "== Etiquetas ==" -ForegroundColor Green
foreach ($l in $data.labels) {
  if ($DryRun) { Write-Host "  [sim] $($l.name)"; continue }
  $r = gh label create $l.name --repo $Repo --color $l.color --description $l.description --force 2>&1
  if ($LASTEXITCODE -eq 0) { Write-Host "  ok  $($l.name)" }
  else { Write-Host "  !!  $($l.name) -> $r" -ForegroundColor Yellow }
}

# ---------------------------------------------------------------- 2. hitos
Write-Host ""
Write-Host "== Hitos (sprints) ==" -ForegroundColor Green
$hitos = @{}
$existentes = gh api "repos/$Repo/milestones?state=all&per_page=100" | ConvertFrom-Json
foreach ($m in $data.milestones) {
  $ya = $existentes | Where-Object { $_.title -eq $m.titulo }
  if ($ya) { $hitos[$m.titulo] = $ya.number; Write-Host "  ya existe  $($m.titulo)"; continue }
  if ($DryRun) { Write-Host "  [sim] $($m.titulo) vence $($m.vence)"; continue }

  $payload = @{ title = $m.titulo; description = $m.descripcion; due_on = "$($m.vence)T23:59:59Z" }
  $tmpM = Join-Path $env:TEMP "hito.json"
  Escribir-Utf8 $tmpM ($payload | ConvertTo-Json -Compress)
  $resp = gh api "repos/$Repo/milestones" -X POST --input $tmpM 2>&1
  if ($LASTEXITCODE -eq 0) {
    $hitos[$m.titulo] = ($resp | ConvertFrom-Json).number
    Write-Host "  ok  $($m.titulo) (vence $($m.vence))"
  } else {
    Write-Host "  !!  $($m.titulo) -> $resp" -ForegroundColor Yellow
  }
  Remove-Item $tmpM -Force -ErrorAction SilentlyContinue
}

# ---------------------------------------------------------------- 3. issues
Write-Host ""
Write-Host "== Historias de usuario ==" -ForegroundColor Green
$tmp = Join-Path $env:TEMP "hu-issue.json"
$creados = 0
foreach ($i in $data.issues) {
  $hito = "Sprint $($i.sprint)"
  if ($DryRun) { Write-Host "  [sim] $($i.id)  $($i.titulo)  [$hito]"; continue }
  if (-not $hitos.ContainsKey($hito)) {
    Write-Host "  !!  $($i.id): no existe el hito $hito" -ForegroundColor Yellow; continue
  }

  # el payload va en un archivo UTF-8: evita cualquier problema de acentos en la consola
  $payload = @{
    title     = $i.titulo
    body      = $i.cuerpo
    labels    = @($i.labels)
    milestone = $hitos[$hito]
  }
  Escribir-Utf8 $tmp ($payload | ConvertTo-Json -Depth 5 -Compress)

  $resp = gh api "repos/$Repo/issues" -X POST --input $tmp 2>&1
  if ($LASTEXITCODE -eq 0) {
    $creados++
    Write-Host ("  ok  {0}  ->  #{1}" -f $i.id, ($resp | ConvertFrom-Json).number)
  } else {
    Write-Host ("  !!  {0} -> {1}" -f $i.id, $resp) -ForegroundColor Yellow
  }
  Start-Sleep -Milliseconds 800   # respeta el limite de creacion de GitHub
}
Remove-Item $tmp -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Listo. Issues creados: $creados de $($data.issues.Count)" -ForegroundColor Cyan
Write-Host "Siguiente paso:  .\backlog\crear-proyecto.ps1" -ForegroundColor Cyan
 