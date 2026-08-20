# Arquitectura del frontend SSAH RRHH

## Decisión

El frontend usa **Vertical Slicing** y **Screaming Architecture** con una aplicación React
organizada por funcionalidades. Clean Architecture se aplica de forma pragmática: no se crea una
capa `domain` o `application` hasta que existan reglas propias del cliente que la justifiquen.

## Estructura

```text
src/
├── app/                 Composición, providers globales y rutas
├── features/
│   ├── auth/            Autenticación completa y autocontenida
│   └── bitacora/        Consulta de auditoría
├── shared/              Código reutilizable y sin conocimiento del negocio
└── main.jsx             Punto de entrada
```

Cada feature incorpora `api/`, `components/`, `hooks/`, `pages/`, `providers/` o `storage/`
cuando los necesita. No es obligatorio crear todas esas carpetas.

## Reglas de dependencia

1. `app` puede importar `features` y `shared` porque compone la aplicación.
2. Una `feature` puede importar `shared`, pero no otra feature.
3. `shared` no importa desde `features` ni desde `app`.
4. Las páginas orquestan; los componentes presentan; `api` conoce HTTP.
5. Un contrato del backend se representa una sola vez, cerca de la feature que lo usa.
6. `domain/` se agrega para reglas puras, entidades con comportamiento o value objects.
7. `application/` se agrega cuando un flujo coordina varias fuentes o reglas; una llamada HTTP
   directa no merece por sí sola un caso de uso.

## Por qué no se replica el backend

El backend protege reglas de negocio y necesita puertos, repositorios y casos de uso. La mayor parte
del frontend transforma interacciones en solicitudes HTTP. Duplicar `User`, DTOs y un caso de uso
por endpoint crea mantenimiento doble sin aumentar el aislamiento.

## Crecimiento

Un módulo se crea al ingresar su primera historia de usuario. Si una feature crece, se divide
internamente por flujo. El código se mueve a `shared` solo cuando existen al menos dos consumidores.
