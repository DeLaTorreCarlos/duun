# CHANGELOG — DunaWizard

Todos los cambios al cerebro estático de DunaWizard se documentan aquí.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

## [Sin publicar]

### Añadido
- Límite: no crear archivos fuera de este workspace (el repositorio duun).
- Regla de versionado: la versión solo se incrementa cuando el usuario lo indica explícitamente.

## [0.00.03] - 2026-08-25

### Cambiado
- El nombre visible del agente ahora incluye la versión: el archivo de definición se
  renombró a `DunaWizard v0.00.03.agent.md` y debe renombrarse en cada cambio de versión.
- La regla preflight de sincronía de versión ahora exige actualizar también el nombre del archivo.

## [0.00.02] - 2026-08-25

### Añadido
- Sección de **Reglas Preflight**; la primera regla exige que todo cambio en el cerebro
  estático se refleje en el nombre (versión) del agente.
- Definición del agente creada en la carpeta de prompts de usuario con el nombre versionado.

## [0.00.01] - 2026-08-25

### Añadido
- Creación inicial del cerebro estático ([DunaWizard.md](DunaWizard.md)).
- Definición de identidad, contexto del proyecto duun, comportamiento, capacidades y límites.
- Esquema de versionado `MAYOR.MENOR.PARCHE`.
- Nombre del agente establecido como **DunaWizard v0.00.01**.
