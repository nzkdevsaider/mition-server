# Mition API - Crear y asociar notas con IA

Mition API permite almacenar notas rápidas, analizarlas y asociarlas a un grupo de notas con inteligencia artificial para mejorar la productividad y organización.

**Este es un proyecto en versión ALPHA.**

## Pre-requisitos
- [Una API KEY de Anthropic](https://console.anthropic.com/)
- [Bun](https://bun.sh/)

## Desarrollo

- Inicializa la base de datos
```bash
bunx prisma init

```
- Genera el esquema
```bash
bunx prisma generate 
```

- Crear la migración inicial
```bash
bunx prisma migrate dev --name init
```

- Inicia el servidor
```bash
bun run src/index
```
