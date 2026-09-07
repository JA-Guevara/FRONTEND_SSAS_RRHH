# Backlog operativo multiagente — Frontend SSAS RRHH

> Centro de control. Estados permitidos: `PENDIENTE`, `EN_PROGRESO`, `BLOQUEADO`,
> `IMPLEMENTADO`, `VALIDADO`, `CANCELADO`. No iniciar una tarea con dependencias bloqueadas.

## Prioridades y tipos

- Prioridad: `CRITICA`, `ALTA`, `MEDIA`, `BAJA`.
- Tipo: `ARCHITECTURE`, `DATABASE`, `DOMAIN`, `USE_CASE`, `REPOSITORY`, `API`, `SECURITY`,
  `TEST`, `DOCUMENTATION`, `BUG`, `REFACTOR`, `INTEGRATION`.

## Matriz principal

| ID | Tarea | Módulo | Tipo | Prioridad | Estado | Dependencias | Endpoint |
|---|---|---|---|---|---|---|---|
| DOC-001 | Crear fuente de verdad de tres documentos | Documentación | DOCUMENTATION | CRITICA | VALIDADO | — | Todos |
| CORE-001 | Sincronizar OpenAPI y detectar drift | Shared/API | INTEGRATION | CRITICA | VALIDADO | DOC-001 | Todos |
| CORE-002 | Contexto de empresa seleccionada para platform | App | ARCHITECTURE | ALTA | EN_PROGRESO | CORE-001 | APIs con `empresa_id` |
| CORE-003 | Corregir configuración Vite y restaurar env example | Configuración | BUG | CRITICA | VALIDADO | DOC-001 | — |
| CORE-004 | Corregir fronteras entre slices | Arquitectura | REFACTOR | MEDIA | PENDIENTE | CORE-001 | — |
| AUTH-001 | Capacidades, permisos y módulos en sesión | Auth | SECURITY | ALTA | BLOQUEADO | BE-SEC-001, CORE-001 | API-AUTH-004 |
| AUTH-002 | Recuperación de contraseña platform | Auth | INTEGRATION | MEDIA | BLOQUEADO | BE-SEC-003 | API-AUTH-005/006 |
| AUTH-003 | Verificación email y cambio obligatorio | Auth | INTEGRATION | ALTA | PENDIENTE | CORE-001 | API-AUTH-007/008/009 |
| PLAT-001 | Panel global y navegación contextual | Plataforma | INTEGRATION | ALTA | PENDIENTE | CORE-002 | Varias |
| PLAT-002 | Completar gestión de empresas | Empresas | INTEGRATION | ALTA | PENDIENTE | CORE-001 | API-EMP-001..008 |
| PLAT-003 | Gestionar recursos de empresa desde platform | Plataforma | INTEGRATION | ALTA | PENDIENTE | CORE-002, ORG-001 | Usuarios/Roles/Auditoría/Org |
| USR-001 | Completar gestión de usuarios | Usuarios | INTEGRATION | ALTA | PENDIENTE | CORE-001 | API-USR-001..010 |
| ROL-001 | CRUD y matriz de permisos | Roles | INTEGRATION | ALTA | BLOQUEADO | CORE-001, BE-SEC-002 | API-ROL-001..006 |
| AUD-001 | Completar bitácora tenant/platform | Bitácora | INTEGRATION | MEDIA | PENDIENTE | CORE-002 | API-AUD-001/002 |
| ORG-001 | Reemplazar mocks de organización | Organización | INTEGRATION | ALTA | EN_PROGRESO | CORE-001 | API-DEP/CAR |
| REC-001 | Reemplazar mocks de vacantes | Vacantes | INTEGRATION | ALTA | BLOQUEADO | ORG-001, BE-REC-001 | API-VAC-001..007 |
| REC-002 | Reemplazar tablero mock | Tablero | INTEGRATION | ALTA | BLOQUEADO | REC-001, BE-REC-002 | API-TAB-001..007 |
| PORT-001 | Integrar portal y postulación pública | Portal | INTEGRATION | ALTA | BLOQUEADO | BE-REC-003, CORE-001 | API-PUB-001..005 |
| MOD-001 | UI catálogo y módulos por empresa | Módulos | INTEGRATION | ALTA | BLOQUEADO | BE-MOD-001, AUTH-001 | API-MOD-001..003 |
| MOD-002 | Seleccionar módulos al crear empresa | Empresas/Módulos | INTEGRATION | ALTA | BLOQUEADO | MOD-001, PLAT-002 | API-EMP-002, API-MOD-003 |
| TEST-001 | Instalar infraestructura de pruebas | Calidad | TEST | CRITICA | PENDIENTE | CORE-001 | — |
| TEST-002 | Integración por realm y errores HTTP | Calidad | TEST | ALTA | PENDIENTE | TEST-001, CORE-002 | Auth/CRUD |
| TEST-003 | Smoke E2E crítico | Calidad | TEST | MEDIA | BLOQUEADO | TEST-002, AUTH-001, PLAT-003 | Flujos críticos |
| DOC-002 | Sincronización documental continua | Documentación | DOCUMENTATION | ALTA | PENDIENTE | Todas | Todos |
| BE-SEC-001 | Exponer permisos y módulos efectivos | Backend/Auth | SECURITY | ALTA | BLOQUEADO | Decisión backend | API-AUTH-004 |
| BE-SEC-002 | Catálogo consultable de permisos | Backend/RBAC | API | ALTA | BLOQUEADO | Decisión backend | API-PER-001 |
| BE-SEC-003 | Recuperación platform sin empresa | Backend/Auth | API | MEDIA | BLOQUEADO | Decisión backend | API-AUTH-005 |
| BE-MOD-001 | Catálogo módulo + empresa_módulo | Backend/Módulos | DATABASE | ALTA | BLOQUEADO | Diseño backend | API-MOD-001..003 |
| BE-REC-001 | API autenticada de vacantes | Backend/Vacantes | API | ALTA | BLOQUEADO | Diseño backend | API-VAC-001..007 |
| BE-REC-002 | API interna de postulaciones/tablero | Backend/Postulaciones | API | ALTA | BLOQUEADO | BE-REC-001 | API-TAB-001..007 |
| BE-REC-003 | Empresa y vacantes públicas | Backend/Portal | API | ALTA | BLOQUEADO | BE-REC-001 | API-PUB-001..005 |

## Grafo de ejecución recomendado

```text
DOC-001
├── CORE-003
├── CORE-001 ──> TEST-001
│   ├── ORG-001
│   ├── PLAT-002
│   ├── USR-001
│   └── CORE-002 ──> PLAT-001 ──> PLAT-003 ──> AUD-001
└── DOC-002 (regla continua)

BE-SEC-001 ──> AUTH-001 ──> MOD-001
BE-SEC-002 ──> ROL-001
BE-MOD-001 ──> MOD-001 ──> MOD-002
BE-REC-001 ──> REC-001 ──> BE-REC-002 ──> REC-002
BE-REC-001 ──> BE-REC-003 ──> PORT-001
```

## Reglas de propiedad para trabajo paralelo

| Área | Propietario simultáneo máximo |
|---|---|
| `src/app/router`, `src/app/layouts`, contexts globales | 1 agente |
| Cada `src/features/<feature>` | 1 agente por feature |
| `src/shared/api` y schema OpenAPI | 1 agente de contrato |
| Configuración raíz | 1 agente de plataforma/build |
| Los tres documentos | 1 agente integrador |

Los agentes de feature entregan cambios documentales al integrador para evitar conflictos.

---

# TASK DOC-001

## Título
Crear y poblar la fuente de verdad documental del frontend.

## Estado
VALIDADO

## Prioridad / Tipo / Módulo
CRITICA / DOCUMENTATION / Documentación

## Descripción y objetivo
Auditar código real y crear `01_ESTADO_PROYECTO.md`, `02_API_ENDPOINTS.md` y este backlog sin
modificar lógica funcional.

## Dependencias / Endpoint relacionado
Ninguna / Todos.

## Archivos esperados
Los tres archivos `docs/0*.md`.

## Componentes
- [x] Auditoría de estructura, rutas y features.
- [x] Inventario API real, wrappers dormidos y mocks.
- [x] Backlog con dependencias frontend/backend.
- [x] Validación final de enlaces, IDs y consistencia.

## Criterios de aceptación
- [x] No se presenta un mock como integración real.
- [x] Cada API tiene ID y task.
- [x] Los bloqueos backend son explícitos.
- [x] Build/lint y revisión documental final registrados.

## Tests requeridos
- [x] `npm run build` de diagnóstico.
- [x] `npm run lint` de diagnóstico, anotando su cobertura insuficiente.

## Riesgos / Bloqueadores
OpenAPI desplegado y backend local divergen.

## Archivos modificados / Resultado / Fecha / Agente
Tres documentos nuevos; 66 endpoints y 31 tareas trazados; build y lint finalizan con código 0 / VALIDADO / 2026-09-07 / Codex raíz con auditorías multiagente.

---

# TASK CORE-001

## Título
Definir y sincronizar el contrato OpenAPI objetivo.

## Estado / Prioridad / Tipo / Módulo
VALIDADO / CRITICA / INTEGRATION / Shared API

## Objetivo
Elegir backend local o Railway como autoridad, regenerar `schema.d.ts` y evitar drift automático.

## Dependencias / Referencia
DOC-001 / todas las fichas de `02_API_ENDPOINTS.md`.

## Archivos esperados
`src/shared/api/schema.d.ts`, `package.json`, workflow CI o script de comprobación.

## Componentes
- [x] Registrar la URL desplegada como fuente de verdad (`VITE_API_URL` / `OPENAPI_URL`).
- [x] Regenerar `schema.d.ts` desde Railway.
- [x] Build pasa sin tipos manuales divergentes.
- [x] Añadir `npm run check:api` para detectar drift.

## Criterios de aceptación
- [x] Departamentos, cargos y postulaciones públicas aparecen en el backend objetivo.
- [x] Build pasa sin tipos manuales divergentes.
- [x] El check falla si el schema generado cambia inesperadamente.

## Tests / Riesgos
Build + prueba de generación. Riesgo: documentar local mientras producción ejecuta otra revisión.

## Archivos modificados / Resultado / Fecha / Agente
`src/shared/api/schema.d.ts`, `package.json`, `scripts/check-api-contract.mjs` / VALIDADO / 2026-09-07 / Copilot.

---

# TASK CORE-002

## Título
Crear contexto de empresa seleccionada para platform.

## Estado / Prioridad / Tipo / Módulo
EN_PROGRESO / ALTA / ARCHITECTURE / App

## Objetivo
Permitir que platform seleccione una empresa y reutilice Usuarios, Roles, Organización y Bitácora
en ese alcance, mostrando selector y breadcrumb visibles.

## Dependencias / Endpoint
CORE-001 / `GET /empresas` y APIs con query `empresa_id`.

## Archivos esperados
Nuevo contexto/hook de alcance; layout; router; selector compartido.

## Componentes
- [x] Estado de empresa elegida mediante contexto.
- [x] Persistencia segura sólo del ID no sensible en `sessionStorage`.
- [x] Selector visible en el layout y alcance en la identidad lateral.
- [x] Limpieza al cambiar de realm o cerrar sesión.

## Criterios de aceptación
- [x] Platform no entra a vistas tenant sin empresa seleccionada.
- [ ] Cada request contextual envía `empresa_id`; falta completar organización y vacantes.
- [x] La empresa activa se ve siempre en pantalla.

## Tests / Riesgos
Unit/integration por cambio de empresa. Riesgo crítico: contaminación cruzada entre tenants.

## Resultado / Fecha / Agente
`CompanyScopeContext`, `AppLayout`, `RequireRealm`, usuarios, roles y bitácora / EN_PROGRESO / 2026-09-07 / Copilot.

---

# TASK CORE-003

## Título
Corregir configuración Vite y contrato de variables.

## Estado / Prioridad / Tipo
VALIDADO / CRITICA / BUG

## Objetivo
Eliminar configuración comentada/obsoleta, restaurar `preview.allowedHosts`, usar un único proxy
coherente si se necesita y restaurar `.env.example` sin secretos.

## Dependencias / Archivos
DOC-001 / `vite.config.js`, `.env.example`, README.

## Criterios de aceptación
- [x] Railway admite `frontendssasrrhh-production.up.railway.app`.
- [x] Desarrollo usa el proxy `/api`; producción usa `VITE_API_URL`.
- [x] `.env.example` existe y Git nunca rastrea `.env`.
- [x] Vite no conserva dominios backend antiguos.

## Tests
- [x] `npm run lint`.
- [x] `npm run build`.
- [x] Configuración revisada con proxy `/api` y `preview.allowedHosts`.

## Riesgos / Resultado / Fecha / Agente
Puede bloquear todo el despliegue / VALIDADO / 2026-09-07 / Copilot.

---

# TASK CORE-004

## Título
Restaurar fronteras entre slices.

## Estado / Prioridad / Tipo
PENDIENTE / MEDIA / REFACTOR

## Objetivo
Eliminar dependencias `usuarios -> roles`, `tablero -> vacantes` y `shared -> auth` mediante
contratos compartidos mínimos o inyección, sin crear capas vacías.

## Dependencias / Archivos esperados
CORE-001 / features afectadas y `shared/api/httpClient.ts`.

## Criterios de aceptación
- [ ] `shared` no importa features.
- [ ] Ninguna feature importa implementación interna de otra.
- [ ] Comportamiento y contratos HTTP no cambian.

## Tests / Riesgos
Build y suite nueva. Riesgo de sobrediseño: preferir cambios pequeños.

## Resultado / Fecha / Agente
Pendiente / 2026-09-07 / No asignado.

---

# TASK AUTH-001

## Título
Autorizar menú y rutas por capacidades efectivas.

## Estado / Prioridad / Tipo
BLOQUEADO / ALTA / SECURITY

## Objetivo
Guardar permisos y módulos efectivos en sesión y construir menú/guards con su intersección.

## Dependencias / Endpoint
BE-SEC-001, CORE-001 / API-AUTH-004.

## Componentes
- [ ] Extender User/context.
- [ ] Guard por permiso y módulo.
- [ ] Menú dinámico.
- [ ] Ruta obligatoria cuando `must_change_password=true`.

## Criterios de aceptación
- [ ] Usuario no ve módulos deshabilitados ni acciones sin permiso.
- [ ] Navegación directa muestra 403 apropiado.
- [ ] Backend continúa siendo autoridad real.

## Tests / Riesgos
Matriz tenant/platform/roles. No inferir permisos por nombre de rol.

## Resultado / Fecha / Agente
Bloqueado por backend / 2026-09-07 / No asignado.

---

# TASK AUTH-002

## Título
Recuperación de contraseña para platform.

## Estado / Prioridad / Tipo
BLOQUEADO / MEDIA / INTEGRATION

## Objetivo
Permitir recuperación sin pedir empresa a un administrador global.

## Dependencias / Endpoint
BE-SEC-003 / API-AUTH-005 y API-AUTH-006.

## Criterios de aceptación
- [ ] Tenant exige slug.
- [ ] Platform omite slug.
- [ ] Respuesta no revela existencia de cuenta.
- [ ] Enlace correcto desde ambos modos de login.

## Tests / Riesgos
SMTP, cuenta inexistente, token expirado. Riesgo de enumeración de usuarios.

## Resultado / Fecha / Agente
Bloqueado / 2026-09-07 / No asignado.

---

# TASK AUTH-003

## Título
Completar verificación de correo y cambio obligatorio.

## Estado / Prioridad / Tipo
EN_PROGRESO / ALTA / INTEGRATION

## Dependencias / Endpoints
CORE-001 / API-AUTH-007, 008 y 009.

## Componentes
- [ ] Wrapper resend/verify.
- [ ] Pantalla `/verificar-correo`.
- [ ] Estado de envío/error.
- [ ] Guard `must_change_password`.

## Criterios de aceptación
- [ ] Token de email se procesa una vez.
- [ ] Reenvío tenant usa slug.
- [ ] Usuario obligado no entra a módulos antes de cambiar clave.

## Tests / Resultado / Fecha / Agente
Unit + integration / Pendiente / 2026-09-07 / No asignado.

---

# TASK PLAT-001

## Título
Panel global y navegación contextual.

## Estado / Prioridad / Tipo
PENDIENTE / ALTA / INTEGRATION

## Objetivo
Mostrar dashboard, Empresas, Administradores, Roles globales y Bitácora global; al seleccionar una
empresa, mostrar sus Usuarios, Roles, Organización y Bitácora.

## Dependencias
CORE-002.

## Criterios de aceptación
- [ ] Menú platform deja de limitarse a Empresas.
- [ ] Se diferencia contexto global de empresa.
- [ ] No se mezclan datos de empresas.

## Tests / Riesgos
Navegación por realm/contexto. Riesgo multiempresa alto.

## Resultado / Fecha / Agente
Pendiente / 2026-09-07 / No asignado.

---

# TASK PLAT-002

## Título
Completar Gestión de empresas.

## Estado / Prioridad / Tipo
PENDIENTE / ALTA / INTEGRATION

## Endpoint relacionado
API-EMP-001 a API-EMP-008.

## Componentes
- [ ] Búsqueda, filtro, paginación y estados.
- [ ] Detalle y edición.
- [ ] Activar/suspender.
- [ ] Eliminar/restaurar con confirmación.

## Criterios de aceptación
- [ ] Cada acción refleja respuesta real y errores 401/403/404/409/422.
- [ ] Acciones destructivas tienen confirmación.
- [ ] Listado no oculta fallos como lista vacía.

## Tests / Riesgos / Resultado
Integration y UI / borrado recuperable / Pendiente / No asignado.

---

# TASK PLAT-003

## Título
Reutilizar módulos tenant desde administración global.

## Estado / Prioridad / Tipo
PENDIENTE / ALTA / INTEGRATION

## Dependencias
CORE-002, PLAT-001, ORG-001.

## Objetivo
Pasar `empresa_id` seleccionado a Usuarios, Roles, Bitácora, Departamentos y Cargos.

## Criterios de aceptación
- [ ] Platform puede administrar una empresa sin iniciar otra sesión.
- [ ] Cambio de empresa invalida caches/selecciones anteriores.
- [ ] Tenant nunca puede enviar otra empresa efectiva.

## Tests / Riesgos / Resultado
Integración multiempresa / fuga de datos / Pendiente / No asignado.

---

# TASK USR-001

## Título
Completar gestión de usuarios.

## Estado / Prioridad / Tipo / Endpoint
PENDIENTE / ALTA / INTEGRATION / API-USR-001 a 010.

## Componentes
- [ ] Paginación y filtros reales.
- [ ] Detalle/edición.
- [ ] Desbloqueo y contraseña temporal.
- [ ] Eliminar/restaurar.
- [ ] Contexto `empresa_id` para platform.

## Criterios de aceptación
- [ ] Ninguna acción disponible sin permiso.
- [ ] Roles enviados pertenecen a la empresa.
- [ ] Clave administrativa fuerza cambio y revoca sesiones.
- [ ] Errores se muestran sin convertirlos en estado vacío.

## Tests / Riesgos / Resultado
CRUD, 401/403/404/409/422 / cuentas privilegiadas / Pendiente / No asignado.

---

# TASK ROL-001

## Título
Completar CRUD de roles y matriz de permisos.

## Estado / Prioridad / Tipo / Endpoint
BLOQUEADO / ALTA / INTEGRATION / API-ROL-001 a 006 y API-PER-001.

## Dependencias
CORE-001 y BE-SEC-002.

## Componentes
- [ ] Detalle/edición/estado.
- [ ] Catálogo agrupado por módulo.
- [ ] Matriz seleccionable.
- [ ] Contexto empresa para platform.

## Criterios de aceptación
- [ ] No se asignan permisos platform a rol tenant.
- [ ] Se envía el conjunto completo de IDs confirmado.
- [ ] Roles base protegidos respetan errores backend.

## Tests / Resultado
Unit/integration de matriz / Bloqueado / No asignado.

---

# TASK AUD-001

## Título
Completar bitácora tenant y global.

## Estado / Prioridad / Tipo / Endpoint
PENDIENTE / MEDIA / INTEGRATION / API-AUD-001 y 002.

## Componentes
- [ ] Paginación.
- [ ] Detalle obtenido por endpoint.
- [ ] Filtro empresa para platform.
- [ ] Corregir semántica HTML de fila expandida.

## Criterios de aceptación
- [ ] Tenant solo ve su empresa.
- [ ] Platform distingue global/empresa seleccionada.
- [ ] Fechas y filtros se serializan correctamente.

## Tests / Resultado
Integration y accesibilidad tabla / Pendiente / No asignado.

---

# TASK ORG-001

## Título
Reemplazar mocks de Departamentos y Cargos.

## Estado / Prioridad / Tipo
PENDIENTE / ALTA / INTEGRATION

## Endpoints
API-DEP-001..004 y API-CAR-001..004.

## Componentes
- [x] Resolver diferencias de contrato: IDs UUID; jerarquía, nivel y salarios no existen en el DTO desplegado.
- [x] Regenerar tipos desde OpenAPI.
- [x] Implementar adaptador HTTP para departamentos y cargos.
- [x] Carga y escritura contextualizadas con `empresa_id` en platform.
- [x] Eliminar arreglos y demoras simuladas.

## Criterios de aceptación
- [x] Recargar conserva datos porque provienen del backend.
- [ ] Departamento con cargos no se elimina y muestra 409; el OpenAPI desplegado no publica DELETE.
- [x] IDs se conservan como UUID del backend.

## Tests / Riesgos
Unit/integration. Decisión de contrato obligatoria antes de reemplazar UI.

## Resultado / Fecha / Agente
`organizacionApi.ts`, `OrganizacionPage.tsx`, `DepartamentosPanel.tsx`, `CargosPanel.tsx` / EN_PROGRESO / 2026-09-07 / Copilot.

---

# TASK REC-001

## Título
Integrar gestión autenticada de vacantes.

## Estado / Prioridad / Tipo
BLOQUEADO / ALTA / INTEGRATION

## Dependencias / Endpoint
ORG-001, BE-REC-001 / API-VAC-001..007.

## Componentes
- [ ] Sustituir arreglos/setTimeout.
- [ ] Tipos generados.
- [ ] CRUD y transiciones.
- [ ] Paginación/filtros server-side.

## Criterios de aceptación
- [ ] No existe estado mutable de negocio en memoria.
- [ ] Transiciones inválidas usan error backend.
- [ ] Aislamiento y permisos probados.

## Resultado / Fecha / Agente
Bloqueado / 2026-09-07 / No asignado.

---

# TASK REC-002

## Título
Integrar tablero interno de postulaciones.

## Estado / Prioridad / Tipo
BLOQUEADO / ALTA / INTEGRATION

## Dependencias / Endpoint
REC-001, BE-REC-002 / API-TAB-001..007.

## Componentes
- [ ] Listado y detalle reales.
- [ ] Etapas y movimiento.
- [ ] Rechazo, notas y puntaje.
- [ ] Descarga autorizada de CV.

## Criterios de aceptación
- [ ] Recargar conserva cada cambio.
- [ ] Puntaje y transiciones son validados por backend.
- [ ] CV no se expone sin permiso.

## Resultado / Fecha / Agente
Bloqueado / 2026-09-07 / No asignado.

---

# TASK PORT-001

## Título
Integrar portal público y postulación real.

## Estado / Prioridad / Tipo
BLOQUEADO / ALTA / INTEGRATION

## Dependencias / Endpoint
BE-REC-003, CORE-001 / API-PUB-001..005.

## Componentes
- [ ] Empresa/vacantes públicas.
- [ ] `FormData` multipart.
- [ ] CV PDF/DOCX máximo 5 MB.
- [ ] Código de seguimiento y consulta.
- [ ] Eliminar datos/código aleatorio mock.

## Criterios de aceptación
- [ ] Una postulación queda persistida.
- [ ] Duplicados y vacante cerrada se informan.
- [ ] Portal no expone datos internos.

## Tests / Resultado
Integration/E2E público / Bloqueado / No asignado.

---

# TASK MOD-001

## Título
Catálogo de módulos y asignación por empresa.

## Estado / Prioridad / Tipo
BLOQUEADO / ALTA / INTEGRATION

## Dependencias / Endpoint
BE-MOD-001, AUTH-001 / API-MOD-001..003.

## Componentes
- [ ] Catálogo global.
- [ ] Vista módulos de una empresa.
- [ ] Activar/desactivar con módulos core protegidos.
- [ ] Refrescar contexto/capacidades.

## Criterios de aceptación
- [ ] Platform administra módulos.
- [ ] Tenant ve solo módulos habilitados más sus permisos.
- [ ] Backend bloquea endpoint aunque se manipule la UI.

## Resultado / Fecha / Agente
Bloqueado / 2026-09-07 / No asignado.

---

# TASK MOD-002

## Título
Agregar módulos al alta y edición de empresa.

## Estado / Prioridad / Tipo
BLOQUEADO / ALTA / INTEGRATION

## Dependencias
MOD-001, PLAT-002.

## Componentes
- [ ] Paso datos empresa.
- [ ] Paso administrador inicial.
- [ ] Paso módulos.
- [ ] Resumen/confirmación y resultado parcial seguro.

## Criterios de aceptación
- [ ] Selección proviene del catálogo, no hardcode.
- [ ] Módulos core no pueden omitirse.
- [ ] Creación y asignación son transaccionales o compensables.

## Resultado / Fecha / Agente
Bloqueado / 2026-09-07 / No asignado.

---

# TASK TEST-001

## Título
Instalar pruebas y lint real de TypeScript.

## Estado / Prioridad / Tipo
PENDIENTE / CRITICA / TEST

## Dependencias
CORE-001.

## Archivos esperados
Configuración Vitest, Testing Library, MSW, setup, scripts y ESLint TS.

## Criterios de aceptación
- [ ] `npm test` existe y falla ante una regresión demostrable.
- [ ] `npm run lint` analiza `.ts/.tsx`.
- [ ] httpClient, AuthProvider y guards tienen pruebas iniciales.
- [ ] No se llama al backend real desde unit tests.

## Riesgos / Resultado / Fecha / Agente
Cambios de herramientas pueden afectar build / Pendiente / 2026-09-07 / No asignado.

---

# TASK TEST-002

## Título
Pruebas de integración por ámbito y errores.

## Estado / Prioridad / Tipo
PENDIENTE / ALTA / TEST

## Dependencias
TEST-001, CORE-002.

## Componentes y criterios
- [ ] Login tenant/platform.
- [ ] Contexto de empresa.
- [ ] Errores 401/403/404/409/422.
- [ ] Formularios no duplican mutaciones.
- [ ] Cambiar empresa elimina datos previos.

## Resultado / Fecha / Agente
Pendiente / 2026-09-07 / No asignado.

---

# TASK TEST-003

## Título
Smoke E2E de flujos críticos.

## Estado / Prioridad / Tipo
BLOQUEADO / MEDIA / TEST

## Dependencias
TEST-002, AUTH-001, PLAT-003.

## Criterios de aceptación
- [ ] Login platform y selección empresa.
- [ ] CRUD empresa/usuario/rol según permisos.
- [ ] Login tenant y navegación por módulos.
- [ ] Logout y expiración.

## Resultado / Fecha / Agente
Bloqueado / 2026-09-07 / No asignado.

---

# TASK DOC-002

## Título
Mantener sincronizados código, API, backlog y estado.

## Estado / Prioridad / Tipo
PENDIENTE / ALTA / DOCUMENTATION

## Objetivo
Regla continua aplicada al cierre de toda tarea.

## Criterios de aceptación
- [ ] API y task comparten referencias.
- [ ] Archivos, pruebas, resultado, fecha y agente quedan registrados.
- [ ] `01_ESTADO_PROYECTO.md` refleja el resultado.
- [ ] No hay estado IMPLEMENTADO sin evidencia.

## Resultado / Fecha / Agente
Se ejecuta con cada task / 2026-09-07 / Agente propietario + integrador docs.

---

# TASK BE-SEC-001

## Título
Exponer permisos y módulos efectivos en contexto autenticado.

## Estado / Prioridad / Tipo / Módulo
BLOQUEADO / ALTA / SECURITY / Backend Auth

## Objetivo
Extender `/auth/me` o crear endpoint equivalente con `permissions` y `enabled_modules`.

## Criterios de aceptación
- [ ] Permisos se calculan desde RBAC vigente.
- [ ] Módulos se calculan por empresa.
- [ ] Platform y tenant tienen contratos inequívocos.
- [ ] Tests backend prueban aislamiento.

## Bloqueador / Resultado
Requiere trabajo autorizado en repositorio backend / Pendiente.

---

# TASK BE-SEC-002

## Título
Exponer catálogo de permisos por alcance.

## Estado / Prioridad / Tipo
BLOQUEADO / ALTA / API

## Endpoint
API-PER-001.

## Criterios de aceptación
- [ ] Devuelve `PermissionSchema` agrupable por módulo.
- [ ] Tenant no obtiene permisos `platform:*`.
- [ ] Tiene autenticación, permiso y tests.

## Resultado
Requiere backend / Pendiente.

---

# TASK BE-SEC-003

## Título
Soportar recuperación de contraseña platform.

## Estado / Prioridad / Tipo
BLOQUEADO / MEDIA / API

## Criterios de aceptación
- [ ] `empresa_slug` opcional selecciona alcance como login.
- [ ] Respuesta no enumera cuentas.
- [ ] Tokens platform se revocan/consumen correctamente.

## Resultado
Requiere backend / Pendiente.

---

# TASK BE-MOD-001

## Título
Crear catálogo de módulos y habilitación por empresa.

## Estado / Prioridad / Tipo
BLOQUEADO / ALTA / DATABASE

## Componentes
- [ ] Modelo/migración `modulo`.
- [ ] Relación `empresa_modulo`.
- [ ] GET catálogo y GET/PUT por empresa.
- [ ] Dependencia de autorización por módulo.
- [ ] Auditoría y tests.

## Reglas
Acceso tenant = empresa activa + módulo habilitado + permiso efectivo. Auth y módulos core no se
deshabilitan. Planes/suscripciones quedan fuera hasta decisión expresa.

## Resultado
Requiere backend y migración / Pendiente.

---

# TASK BE-REC-001

## Título
Publicar API autenticada de Vacantes.

## Estado / Prioridad / Tipo
BLOQUEADO / ALTA / API

## Componentes
- [ ] Schemas y router CRUD.
- [ ] Use cases/repository faltantes.
- [ ] Transiciones publicar/pausar/cerrar.
- [ ] Permisos, auditoría y tests multiempresa.

## Endpoint
API-VAC-001 a 007.

## Resultado
Modelos existen; capa HTTP/aplicación está incompleta / Pendiente.

---

# TASK BE-REC-002

## Título
Publicar API interna del tablero de postulaciones.

## Estado / Prioridad / Tipo
BLOQUEADO / ALTA / API

## Dependencias / Endpoint
BE-REC-001 / API-TAB-001 a 007.

## Criterios
Transiciones, rechazo, notas, puntaje y CV autorizados, auditados y aislados por empresa.

## Resultado
Requiere backend / Pendiente.

---

# TASK BE-REC-003

## Título
Completar API pública de empresa y vacantes.

## Estado / Prioridad / Tipo
BLOQUEADO / ALTA / API

## Dependencias / Endpoint
BE-REC-001 / API-PUB-001 a 005.

## Criterios
- [ ] Solo empresas activas y vacantes publicadas/vigentes.
- [ ] No expone campos internos.
- [ ] Mantiene postulación multipart y seguimiento seguro.

## Resultado
POST/seguimiento existen; catálogo público falta / Pendiente.

==================================================
PROTOCOLO PARA AGENTES
==================================================

## ANTES DE TRABAJAR

1. Leer `docs/01_ESTADO_PROYECTO.md`.
2. Identificar la TASK asignada.
3. Leer la TASK completa.
4. Verificar que sus dependencias no estén bloqueadas.
5. Leer el endpoint relacionado en `docs/02_API_ENDPOINTS.md`.
6. Revisar el módulo y únicamente dependencias necesarias.
7. No rediseñar arquitectura sin autorización.
8. Cambiar la tarea a `EN_PROGRESO`, fecha y agente.

## DURANTE EL TRABAJO

1. Respetar arquitectura, nombres y convenciones existentes.
2. Implementar solamente el alcance de la TASK.
3. No modificar funcionalidades ni tareas ajenas.
4. No crear duplicaciones ni contratos manuales si existe OpenAPI.
5. No usar mocks para declarar una integración terminada.
6. No romper endpoints existentes.
7. Avisar al integrador si se necesita tocar un archivo compartido.

## DESPUÉS DEL TRABAJO

1. Ejecutar pruebas, build y lint real sobre TypeScript.
2. Validar comportamiento y registrar comandos/resultados.
3. Actualizar `02_API_ENDPOINTS.md`.
4. Actualizar `03_BACKLOG_IMPLEMENTACION.md`.
5. Actualizar `01_ESTADO_PROYECTO.md`.
6. Registrar archivos modificados, resultado y bloqueadores.
7. Usar `IMPLEMENTADO` para código terminado aún no validado y `VALIDADO` solo con evidencia.
8. No modificar tareas no relacionadas.

==================================================
