# Backlog del proyecto

Carga automática de las 40 historias de usuario del **Anexo A** del trabajo de grado como issues de GitHub, organizadas en 8 sprints.

## Qué hay aquí

| Archivo | Contenido |
| --- | --- |
| `backlog.json` | Las 40 historias con su cuerpo completo, etiquetas y sprint. Es la fuente de datos de los scripts. |
| `crear-backlog.ps1` | Crea las etiquetas, los 8 hitos y los 40 issues en el repositorio. |
| `crear-proyecto.ps1` | Crea el tablero de GitHub Projects, sus campos y agrega los issues. |
| `historias-de-usuario.csv` | El mismo backlog en CSV, por si se necesita importar a otra herramienta. |

## Paso a paso

### 1. Instalar GitHub CLI

```powershell
winget install --id GitHub.cli
```

Cierra y vuelve a abrir PowerShell para que quede en el `PATH`.

### 2. Iniciar sesión

```powershell
gh auth login
```

Elige `GitHub.com` → `HTTPS` → `Login with a web browser` y pega el código que aparece.

### 3. Crear etiquetas, hitos e issues

Desde la raíz del repositorio:

```powershell
.\backlog\crear-backlog.ps1 -DryRun   # revisa qué haría, sin enviar nada
.\backlog\crear-backlog.ps1           # ahora sí
```

Tarda alrededor de un minuto. Al terminar tendrás 40 issues, cada uno con su narrativa, sus criterios de aceptación como casillas marcables y su Definición de Terminado.

> Si PowerShell bloquea la ejecución del script:
> `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

### 4. Crear el tablero

```powershell
gh auth refresh -s project     # permiso adicional, solo la primera vez
.\backlog\crear-proyecto.ps1
```

### 5. Últimos ajustes en la web

Tres cosas que la CLI no puede hacer y toman dos minutos:

1. Crear un campo de tipo **Iteration** llamado `Sprint`, de dos semanas, iniciando el 03/08/2026.
2. En la vista de tablero, agrupar por `Estado del flujo`.
3. Rellenar `Puntos de historia` en cada tarjeta, tomando el valor de su etiqueta `puntos:N`.

## Cómo trabajar el día a día

Una rama por historia:

```powershell
git checkout -b hu-21-publicar-evento
# ... trabajo ...
git commit -m "HU-21: formulario de publicación de eventos"
git push -u origin hu-21-publicar-evento
gh pr create --fill
```

En la descripción del pull request escribe `Closes #21`. Al aprobarlo y fusionarlo, GitHub cierra el issue solo y la tarjeta pasa a `Terminado`. Así queda la trazabilidad entre historia, código y despliegue que exige el informe de validación.

Marca cada criterio de aceptación en el issue conforme lo verifiques: al cerrar el sprint, esas casillas son la evidencia de las pruebas funcionales.

## Estructura del backlog

| Épica | Nombre | Sprints |
| --- | --- | --- |
| E0 | Fundación del proyecto y habilitadoras técnicas | 1 a 3 |
| E1 | Acceso y gestión de cuentas | 4 |
| E2 | Perfiles de actores culturales y hubs | 5 |
| E3 | Publicación y moderación de contenido | 5 |
| E4 | Descubrimiento y contacto | 6 |
| E5 | Mapa interactivo | 6 |
| E6 | Calidad, accesibilidad y medición | 7 |
| E7 | Cierre, despliegue y documentación | 8 |

Total: 40 historias, 173 puntos de historia.

## Recomendación

No borres issues ni comentarios. El historial del tablero —los cierres, las revisiones, los cambios de columna— es la prueba de que Scrum se aplicó durante el desarrollo y no se documentó después. Es la diferencia entre afirmar que hubo retrospectivas y poder mostrarlas.
