# Estado operativo del frontend SSAS RRHH

> Documento de lectura obligatoria para cualquier agente antes de modificar el frontend.
> Última auditoría documental: 2026-09-07.

## 1. Información general

| Campo | Valor real |
|---|---|
| Proyecto | `frontend_ssas_rrhh` |
| Objetivo | Interfaz web multiempresa para administración y procesos de RRHH |
| Lenguaje | TypeScript 5.8 |
| UI | React 19.2 |
| Enrutamiento | React Router 7.18 |
| Build/dev server | Vite 8.2 |
| Persistencia del frontend | Ninguna; sesión en `sessionStorage` y varios prototipos en memoria |
| Backend esperado | FastAPI SSAS RRHH, prefijo `/api/v1` |
| Contrato | `src/shared/api/schema.d.ts`, generado con `openapi-typescript` |
| Arquitectura | Vertical Slicing + Screaming Architecture + Clean Architecture pragmática |
| Despliegue | Railway mediante `npm start` (`vite preview`) |
| Pruebas automatizadas | PENDIENTE |

### Fuentes de verdad y precedencia

Cuando dos fuentes se contradigan, usar este orden:

1. Código y OpenAPI del backend que realmente será desplegado.
2. Adaptadores HTTP y comportamiento real del frontend.
3. Estos tres documentos operativos.
4. README y documentación histórica.
5. Prototipos, datos mock y documentos académicos.

Una pantalla visible no prueba integración. Si usa arreglos locales o `setTimeout`, su estado es
`PARCIAL` aunque su interfaz parezca completa.

## 2. Estado general

| Área | Estado | Observaciones |
|---|---|---|
| Arquitectura | PARCIAL | Slices claros, pero existen dependencias cruzadas contrarias a las reglas documentadas. |
| Configuración | IMPLEMENTADO | `.env` está ignorado; `.env.example` restaurado; Vite usa un único proxy `/api` local y conserva `preview.allowedHosts`. |
| Contrato OpenAPI | IMPLEMENTADO | `schema.d.ts` regenerado desde Railway y `npm run check:api` detecta drift contra el OpenAPI desplegado. |
| Cliente HTTP | PARCIAL | Maneja JSON, bearer y 401; no renueva automáticamente una sesión durante una petición fallida. |
| Autenticación | PARCIAL | Login, refresh, logout, perfil, recuperación tenant y cambio de clave conectados; faltan verificación de correo y recuperación platform. |
| Autorización visual | PENDIENTE | Las rutas solo distinguen `tenant/platform`; no evalúan permisos ni módulos habilitados. |
| Empresas | PARCIAL | La UI lista y aprovisiona; wrappers de detalle/edición/estado no tienen UI. |
| Usuarios | PARCIAL | Lista, crea, activa y desactiva; faltan detalle, edición, desbloqueo, contraseña administrativa, eliminación y restauración en UI. |
| Roles | PARCIAL | Lista, crea y elimina; faltan edición y matriz de permisos. |
| Permisos | PARCIAL | Backend aplica RBAC, pero el frontend no recibe catálogo ni permisos efectivos. |
| Bitácora | PARCIAL | Lista y filtra; falta paginación, contexto platform por empresa y validación E2E. |
| Organización | PARCIAL | Departamentos y cargos consumen la API real y respetan empresa_id; falta DELETE porque no está publicado en el OpenAPI desplegado. |
| Vacantes | PARCIAL | UI de CRUD y transiciones construida sobre mocks; backend no publica router autenticado de vacantes. |
| Tablero de postulaciones | PARCIAL | Kanban, rechazo, notas y puntaje son simulados en memoria. |
| Portal público | PARCIAL | Empresa, vacantes y envío son mock; backend local solo tiene creación y seguimiento público de postulaciones. |
| Módulos por empresa | PENDIENTE | No existe catálogo de módulos ni relación empresa-módulo en backend. |
| Dashboard global | PARCIAL | El menú platform solo muestra Empresas. |
| Manejo de errores | PARCIAL | Hay mensajes básicos; estados y formularios no comparten una estrategia uniforme. |
| Accesibilidad | DESCONOCIDO | No existe auditoría automatizada ni manual registrada. |
| Tests | PENDIENTE | No hay Vitest, Testing Library, MSW ni E2E. |
| Lint | PARCIAL | `npm run lint` termina bien, pero solo analiza `.js/.jsx`; la aplicación es `.ts/.tsx`. |
| Build TypeScript | IMPLEMENTADO | `npm run build` y `tsc --noEmit` pasan en la auditoría del 2026-09-07. |
| Documentación | PARCIAL | Se crea este sistema; `ARQUITECTURA_FRONTEND.md` estaba desactualizado. |

## 3. Arquitectura actual

```text
src/
├── app/
│   ├── guards/RequireRealm.tsx
│   ├── layouts/AppLayout.tsx
│   ├── pages/DashboardPage.tsx
│   ├── providers/AppProviders.tsx
│   ├── router/AppRouter.tsx
│   └── App.tsx
├── features/
│   ├── auth/          api, context, provider, storage, pages y componentes
│   ├── bitacora/      api y página
│   ├── empresas/      api, formulario y página
│   ├── organizacion/  api mock, departamentos, cargos y página
│   ├── portal/        api mock, portal público y postulación
│   ├── roles/         api y página
│   ├── tablero/       api mock, kanban, modales y página
│   ├── usuarios/      api y página
│   └── vacantes/      api mock, formulario, listado y modales
├── shared/
│   ├── api/httpClient.ts
│   ├── api/schema.d.ts
│   ├── components/FullPageStatus.tsx
│   └── styles/global.css
├── assets/
└── main.tsx
```

### Rutas de interfaz

| Ruta | Acceso | Feature | Estado |
|---|---|---|---|
| `/login` | Público invitado | Auth | PARCIAL |
| `/recuperar-clave` | Público invitado | Auth | PARCIAL |
| `/restablecer-clave` | Público invitado | Auth | PARCIAL |
| `/publico/:slug` | Público | Portal | PARCIAL, mock |
| `/` | Autenticado | Dashboard | PARCIAL |
| `/cambiar-clave` | Autenticado | Auth | PARCIAL |
| `/empresas` | Platform | Empresas | PARCIAL |
| `/usuarios` | Tenant | Usuarios | PARCIAL |
| `/roles` | Tenant | Roles | PARCIAL |
| `/bitacora` | Tenant | Bitácora | PARCIAL |
| `/organizacion` | Tenant | Organización | PARCIAL, mock |
| `/vacantes` | Tenant | Vacantes | PARCIAL, mock |
| `/vacantes/nueva` | Tenant | Vacantes | PARCIAL, mock |
| `/vacantes/:id/editar` | Tenant | Vacantes | PARCIAL, mock |
| `/vacantes/:id/tablero` | Tenant | Tablero | PARCIAL, mock |
| `/vacantes/tablero` | Tenant | Tablero | PARCIAL, mock |

## 4. Responsabilidad de cada parte

### `app/`

Compone providers, layout, guards y rutas. No debe contener reglas particulares de una feature ni
conocer detalles de request/response.

### `features/<feature>/api/`

Contiene el adaptador del slice hacia HTTP. Debe usar `shared/api/httpClient.ts`, aceptar tipos
orientados al caso de uso y no contener arreglos mock cuando la integración se declare terminada.

### `features/<feature>/pages/`

Orquesta carga, mutaciones, URL y estados de pantalla. No debe fabricar respuestas que deberían
provenir del backend.

### `features/<feature>/components/`

Presenta formularios, tablas, modales y controles reutilizables dentro del slice. La validación de
experiencia puede estar aquí; la regla de negocio definitiva pertenece al backend.

### `features/auth/context|providers|storage`

Mantiene la sesión y expone usuario/login/logout. Actualmente `sessionStorage` guarda tokens y realm.

### `shared/`

Código transversal sin conocimiento de un caso de negocio. Actualmente `httpClient.ts` importa
`features/auth/storage/tokenStorage.ts`; es una deuda arquitectónica registrada en `CORE-004`.

### Capas que no existen en el frontend

No hay `domain/`, `application/` ni repositories porque una llamada HTTP simple no los justifica.
Solo se crearán si aparece lógica pura compleja o coordinación de múltiples fuentes.

## 5. REGLAS QUE LOS AGENTES DEBEN RESPETAR

1. No implementar persistencia ni clientes de Supabase en el frontend.
2. No inventar rutas, payloads, permisos ni respuestas: consultar OpenAPI/backend.
3. No declarar una feature `IMPLEMENTADA` si usa mocks o no fue validada.
4. Una página coordina; un componente presenta; un archivo `api` integra HTTP.
5. El backend es la autoridad de seguridad; ocultar un menú no reemplaza un permiso.
6. No crear carpetas `domain/application/infrastructure` vacías.
7. Evitar importaciones entre features. Si dos slices necesitan un contrato, mover solo el contrato
   estable a `shared` o crear una frontera explícita aprobada.
8. `shared` no debe importar desde `features`.
9. Mantener `/api/v1` y la URL base en `VITE_API_URL`; no codificar dominios Railway en APIs.
10. No modificar `schema.d.ts` a mano; regenerarlo desde la fuente OpenAPI acordada.
11. No subir `.env`, tokens, contraseñas ni datos personales reales.
12. No tocar código o tareas ajenas al alcance asignado.
13. Preservar cambios no relacionados del usuario.
14. Ejecutar al menos build, lint real sobre TS y pruebas relacionadas antes de validar una tarea.
15. Actualizar los tres documentos al cerrar una tarea.

## 6. Seguridad

| Control | Estado | Implementación/observación |
|---|---|---|
| Login unificado | PARCIAL | `/api/v1/auth/login`; `empresa_slug` distingue tenant y platform. |
| Tokens JWT | PARCIAL | El frontend los recibe y conserva en `sessionStorage`; riesgo XSS permanece. |
| Refresh token | PARCIAL | Se usa al restaurar; no hay recuperación automática general ante expiración. |
| Logout | PARCIAL | Llama al backend y limpia storage; sin pruebas E2E. |
| 401 | IMPLEMENTADO | Limpia sesión y redirige a `/login`. |
| 403 | PARCIAL | Se muestra como error genérico; guards no conocen permisos. |
| Realm | IMPLEMENTADO | `/auth/me.empresa_id` determina `tenant/platform`. |
| Roles | PARCIAL | Se guardan en usuario, pero no gobiernan navegación. |
| Permisos efectivos | PENDIENTE | `/auth/me` no los entrega al frontend. |
| Módulos habilitados | PENDIENTE | Modelo y endpoint backend inexistentes. |
| `must_change_password` | PARCIAL | Se almacena, pero no fuerza la ruta de cambio. |
| Recuperación tenant | PARCIAL | UI y endpoint existen; depende de SMTP y validación real. |
| Recuperación platform | PENDIENTE | El backend exige `empresa_slug`; el frontend oculta el enlace. |
| Verificación email | PENDIENTE | Endpoints backend existen, sin wrapper/pantalla. |
| Multiempresa | PARCIAL | Backend aísla por `empresa_id`; frontend platform no permite seleccionar contexto de empresa. |
| Auditoría | PARCIAL | Consulta integrada; eventos son responsabilidad backend. |

Regla futura de acceso:

```text
empresa_activa AND modulo_habilitado AND permiso_efectivo
```

Para platform se exigen `empresa_id IS NULL` y permisos `platform:*`. El frontend nunca debe
inferir autorización solo por el texto del rol.

## 7. Convenciones reales

| Aspecto | Convención observada |
|---|---|
| Componentes/páginas | PascalCase y extensión `.tsx` |
| APIs/hooks/utilidades | camelCase y extensión `.ts` |
| Features | nombre de negocio en minúsculas y español |
| API base | `VITE_API_URL` sin `/` final |
| Rutas backend | `/api/v1/<recurso>` |
| Rutas UI | sustantivos en español, kebab-case cuando corresponde |
| Tipos OpenAPI | `components['schemas']['NombreSchema']` |
| Identificadores reales | UUID string en backend actual |
| Prototipos nuevos | Usan `number`; deben migrarse a UUID al integrar |
| Errores HTTP | `ApiError(message, status)` |
| Respuesta de error | FastAPI `detail` string o arreglo de validaciones |
| Estado de sesión | `loading`, `anonymous`, `authenticated` |
| Estilo | CSS global más CSS por feature en módulos recientes |

## 8. Mapa de módulos

| ID | Módulo | Responsabilidad | Estado | Ruta fuente |
|---|---|---|---|---|
| MOD-001 | App | Composición, navegación y guards | PARCIAL | `src/app` |
| MOD-002 | Auth | Sesión, login y contraseñas | PARCIAL | `src/features/auth` |
| MOD-003 | Empresas | Administración global de tenants | PARCIAL | `src/features/empresas` |
| MOD-004 | Usuarios | Cuentas por alcance | PARCIAL | `src/features/usuarios` |
| MOD-005 | Roles | Roles y asignación de permisos | PARCIAL | `src/features/roles` |
| MOD-006 | Bitácora | Auditoría consultable | PARCIAL | `src/features/bitacora` |
| MOD-007 | Organización | Departamentos y cargos | PARCIAL, mock | `src/features/organizacion` |
| MOD-008 | Vacantes | Gestión de vacantes | PARCIAL, mock | `src/features/vacantes` |
| MOD-009 | Tablero | Flujo interno de postulaciones | PARCIAL, mock | `src/features/tablero` |
| MOD-010 | Portal | Vacantes/postulación pública | PARCIAL, mock | `src/features/portal` |
| MOD-011 | Shared | HTTP, contrato y componentes comunes | PARCIAL | `src/shared` |
| MOD-012 | Catálogo de módulos | Habilitación por empresa | PENDIENTE | No existe |

## 9. Dependencias entre módulos

```text
App
├── Auth
├── Empresas
├── Usuarios ──(dependencia actual no deseada)──> Roles
├── Roles
├── Bitácora
├── Organización
├── Vacantes
├── Tablero ──(dependencia actual no deseada)──> Vacantes
└── Portal

Todas las features HTTP ──> shared/api/httpClient
shared/api/httpClient ──(deuda)──> auth/storage

Vacantes ──> Organización (cargo/departamento, hoy datos duplicados)
Tablero ──> Vacantes
Portal ──> Vacantes + Postulaciones
Autorización futura ──> Auth context + módulos empresa + permisos efectivos
```

## 10. Estado de implementación y bloqueadores

### Implementado con evidencia local

- Build TypeScript y bundle de producción.
- Composición principal React/Router.
- Cliente HTTP base y almacenamiento de sesión.
- Pantallas principales de nueve slices.

### Parcial

- Todo flujo HTTP carece de pruebas automatizadas/E2E registradas.
- Auth, empresas, usuarios, roles y bitácora tienen integración incompleta.
- Organización, vacantes, tablero y portal son prototipos en memoria.

### Pendiente

- Menú y guards por permisos/módulos.
- Contexto de empresa para plataforma.
- Catálogo y asignación de módulos por empresa.
- Tests unitarios, integración y E2E.
- ESLint sobre TypeScript.

### Bloqueadores externos

- Definir cuál OpenAPI es autoridad: backend local más reciente o Railway desplegado.
- Backend debe exponer permisos efectivos y módulos habilitados.
- Backend debe añadir catálogo de permisos para la matriz de roles.
- Vacantes y tablero interno no tienen endpoints backend completos.
- Portal carece de endpoints públicos de empresa y listado/detalle de vacantes.

### Inconsistencias detectadas

1. README afirma consumo exclusivo de API, pero cuatro features usan mocks.
2. `ARQUITECTURA_FRONTEND.md` omite cuatro features actuales.
3. Existen importaciones `usuarios -> roles`, `tablero -> vacantes` y `shared -> auth`.
4. El lint excluye `.ts/.tsx`.
5. `vite.config.js` activo contiene proxies sin `/api/v1` a un dominio diferente y no permite el
   host de preview; esas reglas además son ignoradas cuando `VITE_API_URL` es absoluto.
6. README pide copiar `.env.example`, pero Git registra ese archivo como eliminado.
7. Los mocks usan ID numérico mientras el backend usa UUID.
8. `schema.d.ts` no refleja Departamentos, Cargos ni Postulaciones del backend local.

## 11. PROTOCOLO PARA AGENTES

1. Leer este documento antes de trabajar.
2. Identificar el módulo y la TASK exacta en `03_BACKLOG_IMPLEMENTACION.md`.
3. Comprobar que sus dependencias estén `VALIDADO` o que la tarea permita trabajo paralelo.
4. Leer la ficha API relacionada en `02_API_ENDPOINTS.md`.
5. Confirmar el contrato en el OpenAPI fuente; no usar memoria ni mocks como contrato definitivo.
6. Revisar únicamente el slice, shared necesario y dependencias directas.
7. No rediseñar arquitectura ni ampliar alcance sin autorización.
8. Cambiar la TASK a `EN_PROGRESO`, registrar agente y fecha antes de editar.
9. Implementar exclusivamente el alcance asignado.
10. Ejecutar build, lint TypeScript y pruebas relacionadas.
11. Actualizar ficha API, backlog y este estado.
12. Marcar `VALIDADO` solo con evidencia registrada.
13. No modificar tareas de otros agentes ni archivos fuera de su propiedad declarada.

### Regla de coordinación multiagente

- Un solo agente puede ser propietario de `src/app/router`, `src/app/layouts` y contexto global a la vez.
- Agentes por feature pueden trabajar en paralelo si no tocan `shared` ni los mismos documentos.
- Los documentos tienen un agente integrador único; los demás entregan hallazgos al integrador.
- Cambios de contrato OpenAPI se realizan antes de integrar features que dependan de ellos.
