<#
  crear-proyecto.ps1
  Crea el tablero de GitHub Projects y le agrega todos los issues del repositorio.

  Requiere un permiso adicional al de crear issues:
      gh auth refresh -s project

  Uso:
      .\backlog\crear-proyecto.ps1
      .\backlog\crear-proyecto.ps1 -Propietario Petulio14 -Titulo "Hub Cultural Santa Marta"
#>

param(
  [string]$Repo = "Petulio14/hub-cultural-santa-marta",
  [string]$Propietario = "Petulio14",
  [string]$Titulo = "Hub Cultural Santa Marta - Backlog"
)

$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Comprobando permisos de proyecto..." -ForegroundColor Cyan
$scopes = (gh auth status *>&1) | Out-String
if ($scopes -notmatch "project") {
  Write-Host "Falta el permiso 'project'. Ejecuta primero:" -ForegroundColor Yellow
  Write-Host "   gh auth refresh -s project" -ForegroundColor Yellow
  exit 1
}

# ---------------------------------------------------------------- proyecto
$existente = gh project list --owner $Propietario --format json | ConvertFrom-Json
$proy = $existente.projects | Where-Object { $_.title -eq $Titulo } | Select-Object -First 1
if (-not $proy) {
  Write-Host "Creando el proyecto '$Titulo'..." -ForegroundColor Green
  $proy = gh project create --owner $Propietario --title $Titulo --format json | ConvertFrom-Json
} else {
  Write-Host "El proyecto ya existe (numero $($proy.number))." -ForegroundColor Green
}
if (-not $proy -or -not $proy.number) {
  Write-Host "No se pudo crear ni encontrar el proyecto. Revisa el permiso 'project'." -ForegroundColor Red
  exit 1
}
$num = $proy.number
Write-Host "Proyecto numero: $num"

# ---------------------------------------------------------------- campos propios
Write-Host ""
Write-Host "Creando campos personalizados..." -ForegroundColor Green
function Crear-Campo($nombre, $tipo, $opciones) {
  $campos = gh project field-list $num --owner $Propietario --format json | ConvertFrom-Json
  if ($campos.fields | Where-Object { $_.name -eq $nombre }) {
    Write-Host "  ya existe  $nombre"; return
  }
  if ($opciones) {
    gh project field-create $num --owner $Propietario --name $nombre `
       --data-type $tipo --single-select-options $opciones | Out-Null
  } else {
    gh project field-create $num --owner $Propietario --name $nombre --data-type $tipo | Out-Null
  }
  Write-Host "  ok  $nombre"
}
Crear-Campo "Puntos de historia" "NUMBER" $null
Crear-Campo "Objetivo" "SINGLE_SELECT" "Objetivo 1,Objetivo 2,Objetivo 3"
Crear-Campo "Estado del flujo" "SINGLE_SELECT" "Product Backlog,Sprint Backlog,En desarrollo,En pruebas,Terminado"

# ---------------------------------------------------------------- agregar issues
Write-Host ""
Write-Host "Agregando los issues al proyecto..." -ForegroundColor Green
$issues = gh issue list --repo $Repo --state all --limit 200 --json number,title | ConvertFrom-Json
$n = 0
foreach ($i in $issues) {
  $url = "https://github.com/$Repo/issues/$($i.number)"
  gh project item-add $num --owner $Propietario --url $url | Out-Null
  if ($LASTEXITCODE -eq 0) { $n++; Write-Host ("  ok  #{0} {1}" -f $i.number, $i.title) }
  Start-Sleep -Milliseconds 400
}

Write-Host ""
Write-Host "Elementos agregados: $n" -ForegroundColor Cyan
Write-Host "Abre el tablero con:  gh project view $num --owner $Propietario --web" -ForegroundColor Cyan
Write-Host ""
Write-Host "Queda un paso manual en la web (2 minutos):" -ForegroundColor Yellow
Write-Host "  1. Crear un campo de tipo Iteration llamado 'Sprint', de 2 semanas, iniciando el 03/08/2026."
Write-Host "  2. En la vista de tablero, agrupar por 'Estado del flujo'."
Write-Host "  3. Rellenar 'Puntos de historia' desde la etiqueta puntos:N de cada issue."