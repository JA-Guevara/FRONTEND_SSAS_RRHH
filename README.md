# Frontend SSAS RRHH

Aplicación React/TypeScript que consume exclusivamente la API de SSAS RRHH. El navegador no se
conecta a PostgreSQL ni contiene credenciales de Supabase.

## Configuración

Copiar `.env.example` a `.env` y definir:

```text
VITE_API_URL=https://backendssasrrhh-production.up.railway.app
```

## Ejecución

```bash
npm install
npm run dev
```

## Validación

```bash
npm run lint
npm run build
npm run check:api
```

`npm run build` verifica TypeScript antes de generar la aplicación.

## Contrato del backend

Los tipos de `src/shared/api/schema.d.ts` se generan desde el OpenAPI desplegado:

```bash
npm run generate:api
```

Swagger: https://backendssasrrhh-production.up.railway.app/docs

La arquitectura está documentada en [`docs/ARQUITECTURA_FRONTEND.md`](docs/ARQUITECTURA_FRONTEND.md).
