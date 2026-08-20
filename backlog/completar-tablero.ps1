<#
  completar-tablero.ps1
  Rellena los campos del tablero para las 40 tarjetas, sin tocarlas una por una:
    - "Puntos de historia"  se toma de la etiqueta puntos:N del issue
    - "Sprint"              se toma del hito del issue (requiere el campo Iteration ya creado)
    - "Estado del flujo"    se pone en Product Backlog

  Antes de correrlo hay que crear a mano el campo Iteration llamado Sprint
  (la CLI no puede crear ese tipo de campo). Ver backlog/README.md.

  Uso:
    .\backlog\completar-tablero.ps1
    .\backlog\completar-tablero.ps1 -DryRun
#>

param(
  [string]$Repo = "Petulio14/hub-cultural-santa-marta",
  [string]$Propietario = "Petulio14",
  [string]$Titulo = "Hub Cultural Santa Marta - Backlog",
  [switch]$DryRun
)

$ErrorActionPreference = "Continue"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# ---------------------------------------------------------------- proyecto
$lista = gh project list --owner $Propietario --format json | ConvertFrom-Json
$proy = $lista.projects | Where-Object { $_.title -eq $Titulo } | Select-Object -First 1
if (-not $proy) {
  Write-Host "No encontre el proyecto '$Titulo'. Corre primero crear-proyecto.ps1" -ForegroundColor Red
  exit 1
}
$num = $proy.number
$projectId = $proy.id
Write-Host "Proyecto: $Titulo (numero $num)" -ForegroundColor Cyan

# ---------------------------------------------------------------- campos
$campos = (gh project field-list $num --owner $Propietario --format json | ConvertFrom-Json).fields
function Buscar-Campo($nombre) { $campos | Where-Object { $_.name -eq $nombre } | Select-Object -First 1 }

$fPuntos  = Buscar-Campo "Puntos de historia"
$fSprint  = Buscar-Campo "Sprint"
$fEstado  = Buscar-Campo "Estado del flujo"

if (-not $fPuntos) { Write-Host "Falta el campo 'Puntos de historia'." -ForegroundColor Yellow }
if (-not $fEstado) { Write-Host "Falta el campo 'Estado del flujo'." -ForegroundColor Yellow }
if (-not $fSprint) {
  Write-Host "Falta el campo 'Sprint' de tipo Iteration. Crealo en la web (ver README) y vuelve." -ForegroundColor Yellow
}

# iteraciones disponibles
$iteraciones = @()
if ($fSprint -and $fSprint.configuration -and $fSprint.configuration.iterations) {
  $iteraciones = $fSprint.configuration.iterations
  Write-Host ("Iteraciones encontradas: {0}" -f $iteraciones.Count)
  if ($iteraciones.Count -lt 8) {
    Write-Host "  Aviso: hay menos de 8 iteraciones. Agrega las que falten en Settings -> Sprint." -ForegroundColor Yellow
  }
}

# opcion "Product Backlog" del campo de estado
$optBacklog = $null
if ($fEstado -and $fEstado.options) {
  $optBacklog = $fEstado.options | Where-Object { $_.name -eq "Product Backlog" } | Select-Object -First 1
}

# ---------------------------------------------------------------- datos de los issues
Write-Host "Leyendo issues..." -ForegroundColor Green
$issues = gh issue list --repo $Repo --state all --limit 200 --json number,title,labels,milestone | ConvertFrom-Json
$porNumero = @{}
foreach ($i in $issues) { $porNumero[[string]$i.number] = $i }

$items = (gh project item-list $num --owner $Propietario --limit 200 --format json | ConvertFrom-Json).items
Write-Host ("Tarjetas en el tablero: {0}" -f $items.Count)
Write-Host ""

# ---------------------------------------------------------------- recorrido
$ok = 0
foreach ($it in $items) {
  if (-not $it.content -or -not $it.content.number) { continue }
  $iss = $porNumero[[string]$it.content.number]
  if (-not $iss) { continue }

  $etiquetas = @($iss.labels | ForEach-Object { $_.name })
  $lblPuntos = $etiquetas | Where-Object { $_ -like "puntos:*" } | Select-Object -First 1
  $puntos = $null
  if ($lblPuntos) { $puntos = [int]($lblPuntos -replace "puntos:", "") }
  $hito = if ($iss.milestone) { $iss.milestone.title } else { $null }

  $resumen = "#{0} {1}" -f $iss.number, $iss.title
  if ($DryRun) {
    Write-Host ("  [sim] {0}  -> puntos={1} sprint={2}" -f $resumen, $puntos, $hito)
    continue
  }

  # puntos de historia
  if ($fPuntos -and $puntos) {
    gh project item-edit --id $it.id --project-id $projectId --field-id $fPuntos.id --number $puntos *> $null
  }

  # sprint (iteracion): primero por titulo, si no por orden
  if ($fSprint -and $hito -and $iteraciones.Count -gt 0) {
    $iter = $iteraciones | Where-Object { $_.title -eq $hito } | Select-Object -First 1
    if (-not $iter) {
      $n = [int]($hito -replace "[^0-9]", "")
      if ($n -ge 1 -and $n -le $iteraciones.Count) { $iter = $iteraciones[$n - 1] }
    }
    if ($iter) {
      gh project item-edit --id $it.id --project-id $projectId --field-id $fSprint.id --iteration-id $iter.id *> $null
    }
  }

  # estado inicial
  if ($fEstado -and $optBacklog) {
    gh project item-edit --id $it.id --project-id $projectId --field-id $fEstado.id `
       --single-select-option-id $optBacklog.id *> $null
  }

  $ok++
  Write-Host ("  ok  {0}  (puntos {1}, {2})" -f $resumen, $puntos, $hito)
  Start-Sleep -Milliseconds 350
}

Write-Host ""
Write-Host "Tarjetas actualizadas: $ok" -ForegroundColor Cyan
Write-Host "Abre el tablero:  gh project view $num --owner $Propietario --web" -ForegroundColor Cyan
 
