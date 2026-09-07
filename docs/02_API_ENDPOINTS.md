# Contrato de integración API del frontend SSAS RRHH

> Inventario auditado el 2026-09-07. Este documento describe lo que el frontend consume o necesita;
> no sustituye el OpenAPI del backend. `IMPLEMENTADO` exige integración y pruebas; por ello las
> integraciones existentes sin tests permanecen `PARCIAL`.

## Estados

- `IMPLEMENTADO`: integrado y probado.
- `PARCIAL`: existe parte del flujo, wrapper, UI o backend, pero falta integración/prueba.
- `PENDIENTE`: contrato acordado pero aún no implementado.
- `BLOQUEADO`: depende de una decisión o endpoint backend inexistente.
- `DEPRECADO`: no debe utilizarse.

## Matriz general

| ID | Método | Endpoint | Módulo | Estado | Auth | Permiso | Task |
|---|---|---|---|---|---|---|---|
| API-AUTH-001 | POST | `/api/v1/auth/login` | Auth | PARCIAL | No | — | AUTH-001 |
| API-AUTH-002 | POST | `/api/v1/auth/refresh` | Auth | PARCIAL | No | — | AUTH-001 |
| API-AUTH-003 | POST | `/api/v1/auth/logout` | Auth | PARCIAL | Sí | autenticado | AUTH-001 |
| API-AUTH-004 | GET | `/api/v1/auth/me` | Auth | PARCIAL | Sí | autenticado | BE-SEC-001 |
| API-AUTH-005 | POST | `/api/v1/auth/password/forgot` | Auth | PARCIAL | No | — | AUTH-002 |
| API-AUTH-006 | POST | `/api/v1/auth/password/reset` | Auth | PARCIAL | No | — | AUTH-002 |
| API-AUTH-007 | POST | `/api/v1/auth/password/change` | Auth | PARCIAL | Sí | autenticado | AUTH-003 |
| API-AUTH-008 | POST | `/api/v1/auth/email/verification/resend` | Auth | PENDIENTE | No | — | AUTH-003 |
| API-AUTH-009 | POST | `/api/v1/auth/email/verify` | Auth | PENDIENTE | No | — | AUTH-003 |
| API-EMP-001 | GET | `/api/v1/empresas` | Empresas | PARCIAL | Sí | `platform:empresas:ver` | PLAT-002 |
| API-EMP-002 | POST | `/api/v1/empresas` | Empresas | PARCIAL | Sí | `platform:empresas:crear` | PLAT-002 |
| API-EMP-003 | GET | `/api/v1/empresas/{empresa_id}` | Empresas | PARCIAL | Sí | `empresa:ver` o platform | PLAT-002 |
| API-EMP-004 | PATCH | `/api/v1/empresas/{empresa_id}` | Empresas | PARCIAL | Sí | `empresa:editar` o platform | PLAT-002 |
| API-EMP-005 | PATCH | `/api/v1/empresas/{empresa_id}/activar` | Empresas | PARCIAL | Sí | `platform:empresas:suspender` | PLAT-002 |
| API-EMP-006 | PATCH | `/api/v1/empresas/{empresa_id}/suspender` | Empresas | PARCIAL | Sí | `platform:empresas:suspender` | PLAT-002 |
| API-EMP-007 | DELETE | `/api/v1/empresas/{empresa_id}` | Empresas | PENDIENTE | Sí | platform | PLAT-002 |
| API-EMP-008 | PATCH | `/api/v1/empresas/{empresa_id}/restaurar` | Empresas | PENDIENTE | Sí | platform | PLAT-002 |
| API-USR-001 | GET | `/api/v1/usuarios` | Usuarios | PARCIAL | Sí | `usuarios:ver` o platform | USR-001 |
| API-USR-002 | POST | `/api/v1/usuarios` | Usuarios | PARCIAL | Sí | `usuarios:crear` o platform | USR-001 |
| API-USR-003 | GET | `/api/v1/usuarios/{usuario_id}` | Usuarios | PENDIENTE | Sí | `usuarios:ver` o platform | USR-001 |
| API-USR-004 | PATCH | `/api/v1/usuarios/{usuario_id}` | Usuarios | PARCIAL | Sí | `usuarios:editar` o platform | USR-001 |
| API-USR-005 | PATCH | `/api/v1/usuarios/{usuario_id}/activar` | Usuarios | PARCIAL | Sí | `usuarios:editar` o platform | USR-001 |
| API-USR-006 | PATCH | `/api/v1/usuarios/{usuario_id}/desactivar` | Usuarios | PARCIAL | Sí | `usuarios:editar` o platform | USR-001 |
| API-USR-007 | PUT | `/api/v1/usuarios/{usuario_id}/password` | Usuarios | PENDIENTE | Sí | `usuarios:cambiar_password` o platform | USR-001 |
| API-USR-008 | PATCH | `/api/v1/usuarios/{usuario_id}/desbloquear` | Usuarios | PARCIAL | Sí | `usuarios:desbloquear` o platform | USR-001 |
| API-USR-009 | DELETE | `/api/v1/usuarios/{usuario_id}` | Usuarios | PENDIENTE | Sí | `usuarios:editar` o platform | USR-001 |
| API-USR-010 | PATCH | `/api/v1/usuarios/{usuario_id}/restaurar` | Usuarios | PENDIENTE | Sí | `usuarios:editar` o platform | USR-001 |
| API-ROL-001 | GET | `/api/v1/roles` | Roles | PARCIAL | Sí | `roles:gestionar` o platform | ROL-001 |
| API-ROL-002 | POST | `/api/v1/roles` | Roles | PARCIAL | Sí | `roles:gestionar` o platform | ROL-001 |
| API-ROL-003 | GET | `/api/v1/roles/{role_id}` | Roles | PENDIENTE | Sí | `roles:gestionar` o platform | ROL-001 |
| API-ROL-004 | PATCH | `/api/v1/roles/{role_id}` | Roles | PARCIAL | Sí | `roles:gestionar` o platform | ROL-001 |
| API-ROL-005 | DELETE | `/api/v1/roles/{role_id}` | Roles | PARCIAL | Sí | `roles:gestionar` o platform | ROL-001 |
| API-ROL-006 | PUT | `/api/v1/roles/{role_id}/permissions` | Roles | PARCIAL | Sí | `roles:gestionar` o platform | ROL-001 |
| API-PER-001 | GET | `/api/v1/permisos` | Permisos | BLOQUEADO | Sí | según alcance | BE-SEC-002 |
| API-AUD-001 | GET | `/api/v1/bitacora` | Bitácora | PARCIAL | Sí | `bitacora:ver` o `platform:bitacora:ver` | PLAT-003 |
| API-AUD-002 | GET | `/api/v1/bitacora/{audit_log_id}` | Bitácora | PARCIAL | Sí | igual anterior | AUD-001 |
| API-DEP-001 | GET | `/api/v1/departamentos` | Organización | PARCIAL | Sí | permiso organización | ORG-001 |
| API-DEP-002 | POST | `/api/v1/departamentos` | Organización | PARCIAL | Sí | permiso organización | ORG-001 |
| API-DEP-003 | PUT | `/api/v1/departamentos/{departamento_id}` | Organización | PARCIAL | Sí | permiso organización | ORG-001 |
| API-DEP-004 | DELETE | `/api/v1/departamentos/{departamento_id}` | Organización | PENDIENTE | Sí | permiso organización | ORG-001 |
| API-CAR-001 | GET | `/api/v1/cargos` | Organización | PARCIAL | Sí | permiso organización | ORG-001 |
| API-CAR-002 | POST | `/api/v1/cargos` | Organización | PARCIAL | Sí | permiso organización | ORG-001 |
| API-CAR-003 | PUT | `/api/v1/cargos/{cargo_id}` | Organización | PARCIAL | Sí | permiso organización | ORG-001 |
| API-CAR-004 | DELETE | `/api/v1/cargos/{cargo_id}` | Organización | PENDIENTE | Sí | permiso organización | ORG-001 |
| API-VAC-001 | GET | `/api/v1/vacantes` | Vacantes | BLOQUEADO | Sí | DECISIÓN PENDIENTE | BE-REC-001 |
| API-VAC-002 | POST | `/api/v1/vacantes` | Vacantes | BLOQUEADO | Sí | DECISIÓN PENDIENTE | BE-REC-001 |
| API-VAC-003 | GET | `/api/v1/vacantes/{vacante_id}` | Vacantes | BLOQUEADO | Sí | DECISIÓN PENDIENTE | BE-REC-001 |
| API-VAC-004 | PUT | `/api/v1/vacantes/{vacante_id}` | Vacantes | BLOQUEADO | Sí | DECISIÓN PENDIENTE | BE-REC-001 |
| API-VAC-005 | PATCH | `/api/v1/vacantes/{vacante_id}/publicar` | Vacantes | BLOQUEADO | Sí | DECISIÓN PENDIENTE | BE-REC-001 |
| API-VAC-006 | PATCH | `/api/v1/vacantes/{vacante_id}/pausar` | Vacantes | BLOQUEADO | Sí | DECISIÓN PENDIENTE | BE-REC-001 |
| API-VAC-007 | PATCH | `/api/v1/vacantes/{vacante_id}/cerrar` | Vacantes | BLOQUEADO | Sí | DECISIÓN PENDIENTE | BE-REC-001 |
| API-PUB-001 | GET | `/api/v1/publico/empresas/{slug}` | Portal | BLOQUEADO | No | — | BE-REC-003 |
| API-PUB-002 | GET | `/api/v1/publico/empresas/{slug}/vacantes` | Portal | BLOQUEADO | No | — | BE-REC-003 |
| API-PUB-003 | GET | `/api/v1/publico/vacantes/{vacante_id}` | Portal | BLOQUEADO | No | — | BE-REC-003 |
| API-PUB-004 | POST | `/api/v1/publico/postulaciones` | Portal | PARCIAL | No | — | PORT-001 |
| API-PUB-005 | GET | `/api/v1/publico/postulaciones/{codigo}` | Portal | PENDIENTE | No | — | PORT-001 |
| API-TAB-001 | GET | `/api/v1/vacantes/{vacante_id}/postulaciones` | Tablero | BLOQUEADO | Sí | DECISIÓN PENDIENTE | BE-REC-002 |
| API-TAB-002 | GET | `/api/v1/postulaciones/{postulacion_id}` | Tablero | BLOQUEADO | Sí | DECISIÓN PENDIENTE | BE-REC-002 |
| API-TAB-003 | PATCH | `/api/v1/postulaciones/{postulacion_id}/etapa` | Tablero | BLOQUEADO | Sí | DECISIÓN PENDIENTE | BE-REC-002 |
| API-TAB-004 | PATCH | `/api/v1/postulaciones/{postulacion_id}/rechazar` | Tablero | BLOQUEADO | Sí | DECISIÓN PENDIENTE | BE-REC-002 |
| API-TAB-005 | POST | `/api/v1/postulaciones/{postulacion_id}/notas` | Tablero | BLOQUEADO | Sí | DECISIÓN PENDIENTE | BE-REC-002 |
| API-TAB-006 | PATCH | `/api/v1/postulaciones/{postulacion_id}/puntaje` | Tablero | BLOQUEADO | Sí | DECISIÓN PENDIENTE | BE-REC-002 |
| API-TAB-007 | GET | `/api/v1/postulaciones/{postulacion_id}/cv` | Tablero | BLOQUEADO | Sí | DECISIÓN PENDIENTE | BE-REC-002 |
| API-MOD-001 | GET | `/api/v1/modulos` | Módulos | BLOQUEADO | Sí | platform | BE-MOD-001 |
| API-MOD-002 | GET | `/api/v1/empresas/{empresa_id}/modulos` | Módulos | BLOQUEADO | Sí | platform | BE-MOD-001 |
| API-MOD-003 | PUT | `/api/v1/empresas/{empresa_id}/modulos` | Módulos | BLOQUEADO | Sí | platform | BE-MOD-001 |

## Fichas de autenticación

### [API-AUTH-001] POST `/api/v1/auth/login`

**Estado:** PARCIAL  
**Descripción:** inicia sesión en empresa o plataforma. `empresa_slug` presente busca dentro del
tenant; ausente busca usuario global.  
**Actor:** usuario de empresa o administrador global.  
**Autenticación:** No. **Permiso:** —.  
**Dependencias:** AuthProvider, tokenStorage, `/auth/me`.

**Request — `application/json`:**

```json
{
  "empresa_slug": "empresa-demo",
  "email": "usuario@ejemplo.com",
  "username": null,
  "password": "************"
}
```

| Campo | Tipo | Obligatorio | Descripción | Validación |
|---|---|---|---|---|
| `empresa_slug` | string/null | No | Omitir para platform | 2-120, letras/números/guion |
| `email` | string/null | Condicional | Alternativa a username | email |
| `username` | string/null | Condicional | Alternativa a email | 1-80 |
| `password` | string | Sí | Clave | 8-72 |

**Response 200:**

```json
{
  "access_token": "<jwt>",
  "refresh_token": "<jwt>",
  "token_type": "bearer",
  "expires_in": 3600,
  "must_change_password": false
}
```

**Errores:** 401 credenciales/inactivo; 403 email no verificado; 422 validación; 423 bloqueo.  
**Reglas:** nunca registrar tokens; el realm definitivo se obtiene de `/auth/me.empresa_id`.  
**Implementación frontend:** `features/auth/api/authApi.ts`; `LoginPage.tsx`; `AuthProvider.tsx`.  
**Tests:** [ ] tenant [ ] platform [ ] email [ ] username [ ] 401 [ ] 403 [ ] 423.  
**Aceptación:** [ ] ambos ámbitos ingresan [ ] no se envía slug para platform [ ] tokens no se filtran.

### [API-AUTH-002] POST `/api/v1/auth/refresh`

**Estado:** PARCIAL. **Actor:** sesión existente. **Auth:** No bearer; usa refresh token.  
**Request:** `{"refresh_token":"<jwt>"}`.  
**Response 200:** mismo `TokenPairSchema` de login.  
**Errores:** 401 token inválido/revocado/expirado; 422 payload inválido.  
**Reglas:** conservar realm confirmado; no enviar el refresh a otro origen.  
**Implementación:** `authApi.refresh`, restauración en `AuthProvider`.  
**Tests:** [ ] éxito [ ] expirado [ ] revocado [ ] rotación.  
**Aceptación:** [ ] restaura sesión [ ] fallo limpia storage.

### [API-AUTH-003] POST `/api/v1/auth/logout`

**Estado:** PARCIAL. **Auth:** Sí. **Request:** `{"refresh_token":"<jwt>"}`.  
**Response 200:** `{"message":"Sesión cerrada correctamente"}`.  
**Errores:** 401; 422. **Implementación:** `authApi.logout`, `AuthProvider.logout`.  
**Tests:** [ ] revoca refresh [ ] limpia storage aun si falla HTTP.

### [API-AUTH-004] GET `/api/v1/auth/me`

**Estado:** PARCIAL. **Auth:** Sí. **Request:** sin body.  
**Response 200 real actual:**

```json
{
  "id": "uuid",
  "name": "Nombre Apellido",
  "email": "usuario@ejemplo.com",
  "empresa_id": "uuid-o-null",
  "username": "usuario",
  "roles": ["Administrador de Empresa"],
  "is_active": true,
  "email_verified": true,
  "must_change_password": false
}
```

**Errores:** 401; 404/inactivo según backend.  
**Reglas:** `empresa_id=null` significa platform. No usar el texto del rol como autorización.  
**Bloqueo:** no incluye `permissions` ni `enabled_modules`; ver `BE-SEC-001`.  
**Tests:** [ ] tenant [ ] platform [ ] usuario inactivo.

### [API-AUTH-005] POST `/api/v1/auth/password/forgot`

**Estado:** PARCIAL, solo tenant. **Auth:** No.  
**Request:** `{"email":"usuario@ejemplo.com","empresa_slug":"empresa-demo"}`.  
**Response 200:** `{"message":"...","reset_token":null}`.  
**Errores:** 422; 503 SMTP.  
**Reglas:** respuesta no debe revelar existencia de cuenta. Recuperación platform es
`DECISIÓN PENDIENTE` porque `empresa_slug` es obligatorio.  
**Tests:** [ ] existente [ ] inexistente [ ] SMTP no configurado.

### [API-AUTH-006] POST `/api/v1/auth/password/reset`

**Estado:** PARCIAL. **Auth:** No.  
**Request:** `{"token":"token-un-solo-uso","new_password":"************"}`.  
**Response 200:** `{"message":"Contraseña actualizada"}`.  
**Errores:** 400/401 token; 422 contraseña. **Tests:** [ ] éxito [ ] expirado [ ] reutilizado.

### [API-AUTH-007] POST `/api/v1/auth/password/change`

**Estado:** PARCIAL. **Auth:** Sí.  
**Request:** `{"current_password":"********","new_password":"************"}`.  
**Response 200:** `{"message":"Contraseña actualizada"}`.  
**Errores:** 401; 422. **Regla:** debe atender `must_change_password`.  
**Tests:** [ ] clave actual incorrecta [ ] política [ ] revocación de sesiones.

### [API-AUTH-008] POST `/api/v1/auth/email/verification/resend`

**Estado:** PENDIENTE. **Auth:** No.  
**Request:** `{"email":"usuario@ejemplo.com","empresa_slug":"empresa-demo"}`.  
**Response 200:** `{"message":"..."}`. **Dependencia:** SMTP. **Task:** AUTH-003.

### [API-AUTH-009] POST `/api/v1/auth/email/verify`

**Estado:** PENDIENTE. **Auth:** No.  
**Request:** `{"token":"token-verificacion"}`.  
**Response 200:** `{"message":"Correo verificado"}`. **Task:** AUTH-003.

## Fichas de empresas

### [API-EMP-001] GET `/api/v1/empresas`

**Estado:** PARCIAL. **Actor:** platform. **Auth:** Sí. **Permiso:** `platform:empresas:ver`.  
**Query:** `search`, `activo`, `page`, `per_page`. **Request body:** ninguno.  
**Response 200:** `{"items":[{"id":"uuid","razon_social":"...","nombre_comercial":"...","slug":"...","activo":true}],"total":1,"page":1,"per_page":20,"total_pages":1}`.  
**Errores:** 401, 403, 422. **UI:** listado; faltan filtros/paginación/error explícito.  
**Tests:** [ ] búsqueda [ ] estado [ ] paginación [ ] 403.

### [API-EMP-002] POST `/api/v1/empresas`

**Estado:** PARCIAL. **Actor:** platform. **Permiso:** `platform:empresas:crear`.  
**Request:**

```json
{
  "empresa": {
    "nit": null,
    "razon_social": "Empresa SRL",
    "nombre_comercial": "Empresa",
    "slug": "empresa",
    "email": null,
    "telefono": null,
    "direccion": null,
    "ciudad": null,
    "logo_url": null
  },
  "administrador": {
    "nombre": "Nombre",
    "apellido": "Apellido",
    "email": "admin@empresa.com",
    "username": "admin",
    "password": "************",
    "telefono": null
  }
}
```

**Response 201:** `{"empresa":{"id":"uuid","slug":"empresa","activo":true},"administrador_id":"uuid","administrador_email":"admin@empresa.com","verification_email_sent":true}`.  
**Errores:** 401, 403, 409 duplicado, 422.  
**Reglas:** creación transaccional empresa/admin; todavía no admite módulos.  
**Tests:** [ ] éxito [ ] slug/NIT duplicado [ ] correo admin duplicado [ ] SMTP falla sin perder empresa.

### [API-EMP-003] GET `/api/v1/empresas/{empresa_id}`

**Estado:** PARCIAL: wrapper sin UI. **Request:** sin body. **Response 200:** `EmpresaResponse`.  
**Errores:** 401, 403, 404. **Task:** PLAT-002.

### [API-EMP-004] PATCH `/api/v1/empresas/{empresa_id}`

**Estado:** PARCIAL: wrapper sin UI.  
**Request:** campos opcionales de empresa: `nit`, `razon_social`, `nombre_comercial`, `slug`,
`email`, `telefono`, `direccion`, `ciudad`, `logo_url`.  
**Response:** `EmpresaResponse`. **Errores:** 401, 403, 404, 409, 422.

### [API-EMP-005] PATCH `/api/v1/empresas/{empresa_id}/activar`

**Estado:** PARCIAL: wrapper sin UI. **Request:** sin body. **Response:** `EmpresaResponse`.  
**Errores:** 401, 403, 404. **Regla:** solo platform autorizado.

### [API-EMP-006] PATCH `/api/v1/empresas/{empresa_id}/suspender`

**Estado:** PARCIAL: wrapper sin UI. **Request:** sin body. **Response:** `EmpresaResponse`.  
**Errores:** 401, 403, 404. **Regla:** suspender debe impedir operación tenant en backend.

### [API-EMP-007] DELETE `/api/v1/empresas/{empresa_id}`

**Estado:** PENDIENTE; existe en backend local y no en schema generado.  
**Request:** sin body. **Response:** `EmpresaResponse` con estado de eliminación recuperable.  
**Campos exactos nuevos:** regenerar OpenAPI; no inventar. **Errores:** 401, 403, 404, 409.

### [API-EMP-008] PATCH `/api/v1/empresas/{empresa_id}/restaurar`

**Estado:** PENDIENTE; existe en backend local y no en schema generado.  
**Request:** sin body. **Response:** `EmpresaResponse`. **Contrato exacto:** pendiente de sincronización.

## Fichas de usuarios

### [API-USR-001] GET `/api/v1/usuarios`

**Estado:** PARCIAL. **Query:** `empresa_id` (platform), `search`, `is_active`, `page`, `per_page`.  
**Response:** `UsuarioPageResponse` con `items`, `total`, `page`, `per_page`, `total_pages`.  
**Errores:** 401, 403, 422. **UI:** tenant; platform/contexto empresa pendiente.

### [API-USR-002] POST `/api/v1/usuarios`

**Estado:** PARCIAL. **Request:**

```json
{
  "empresa_id": "uuid-opcional-para-platform",
  "nombre": "Nombre",
  "apellido": "Apellido",
  "email": "usuario@empresa.com",
  "username": "usuario",
  "password": "************",
  "telefono": null,
  "role_ids": ["uuid-rol"]
}
```

**Response 201:** `UsuarioResponse`. **Errores:** 401, 403, 409, 422.  
**Reglas:** roles deben pertenecer al alcance; tenant no puede elegir otra empresa.

### [API-USR-003] GET `/api/v1/usuarios/{usuario_id}`

**Estado:** PENDIENTE. **Query:** `empresa_id` opcional para platform.  
**Response:** `UsuarioResponse`. **Errores:** 401, 403, 404.

### [API-USR-004] PATCH `/api/v1/usuarios/{usuario_id}`

**Estado:** PARCIAL, wrapper sin UI. **Request:** campos opcionales `nombre`, `apellido`, `email`,
`username`, `telefono`, `role_ids`. **Response:** `UsuarioResponse`.  
**Errores:** 401, 403, 404, 409, 422.

### [API-USR-005] PATCH `/api/v1/usuarios/{usuario_id}/activar`

**Estado:** PARCIAL. **Request:** sin body. **Response:** `UsuarioResponse`. **Errores:** 401,403,404.

### [API-USR-006] PATCH `/api/v1/usuarios/{usuario_id}/desactivar`

**Estado:** PARCIAL. **Request:** sin body. **Response:** `UsuarioResponse`. **Errores:** 401,403,404.

### [API-USR-007] PUT `/api/v1/usuarios/{usuario_id}/password`

**Estado:** PENDIENTE.  
**Request:** `{"new_password":"************","must_change_password":true}`.  
**Response:** `UsuarioResponse`. **Regla:** revoca sesiones existentes. **Errores:** 401,403,404,422.

### [API-USR-008] PATCH `/api/v1/usuarios/{usuario_id}/desbloquear`

**Estado:** PARCIAL, wrapper sin UI. **Request:** sin body. **Response:** `UsuarioResponse`.

### [API-USR-009] DELETE `/api/v1/usuarios/{usuario_id}`

**Estado:** PENDIENTE. **Request:** sin body. **Response:** `UsuarioResponse`.  
**Contrato de campos de borrado:** sincronizar OpenAPI local. **Errores:** 401,403,404,409.

### [API-USR-010] PATCH `/api/v1/usuarios/{usuario_id}/restaurar`

**Estado:** PENDIENTE. **Request:** sin body. **Response:** `UsuarioResponse`.  
**Errores:** 401,403,404,409.

## Fichas de roles, permisos y bitácora

### [API-ROL-001] GET `/api/v1/roles`

**Estado:** PARCIAL. **Query:** `empresa_id` opcional para platform.  
**Response:** arreglo de `RoleSchema`: `id`, `empresa_id`, `name`, `codigo`, `description`,
`is_active`, `permissions[]`. **Errores:** 401,403,422.

### [API-ROL-002] POST `/api/v1/roles`

**Estado:** PARCIAL. **Request:** `{"name":"Reclutador","codigo":"RECLUTADOR","description":"..."}`.  
**Query:** `empresa_id` para platform. **Response 201:** `RoleSchema`. **Errores:** 401,403,409,422.

### [API-ROL-003] GET `/api/v1/roles/{role_id}`

**Estado:** PENDIENTE. **Query:** `empresa_id` opcional. **Response:** `RoleSchema`.

### [API-ROL-004] PATCH `/api/v1/roles/{role_id}`

**Estado:** PARCIAL, wrapper sin UI. **Request:** `{"name":"...","description":"...","is_active":true}`.  
**Response:** `RoleSchema`. **Errores:** 401,403,404,409,422.

### [API-ROL-005] DELETE `/api/v1/roles/{role_id}`

**Estado:** PARCIAL. **Request:** sin body. **Response:** HTTP 204. **Errores:** 401,403,404,409.

### [API-ROL-006] PUT `/api/v1/roles/{role_id}/permissions`

**Estado:** PARCIAL. **Request:** `{"permission_ids":["uuid"]}`. La asignación existe, pero la UI completa queda bloqueada por la falta del catálogo consultable de permisos.  
**Response:** `RoleSchema`. **Bloqueo:** no existe listado completo de permisos para seleccionar.

### [API-PER-001] GET `/api/v1/permisos`

**Estado:** BLOQUEADO, backend inexistente. **Actor:** administradores autorizados.  
**Request esperado:** sin body; filtros de alcance/módulo son `DECISIÓN PENDIENTE`.  
**Response propuesta:** arreglo de `PermissionSchema` ya existente (`id`, `name`, `resource`,
`action`, `description`). **Criterios:** no exponer permisos de platform a roles tenant.

### [API-AUD-001] GET `/api/v1/bitacora`

**Estado:** PARCIAL. **Query:** `empresa_id` para platform, `user_id`, `module`, `action`,
`start_date`, `end_date`, `page`, `per_page`. **Response:** `AuditLogPageSchema`.  
**Errores:** 401,403,422. **Regla:** solo lectura; tenant queda limitado a su empresa.

### [API-AUD-002] GET `/api/v1/bitacora/{audit_log_id}`

**Estado:** PARCIAL, wrapper no usado. **Query:** `empresa_id` para platform.  
**Response:** `AuditLogSchema`. **Errores:** 401,403,404.

## Fichas de organización

> El backend local contiene estas rutas, pero `organizacionApi.ts` no realiza HTTP. Sus IDs y campos
> mock no coinciden completamente con backend. CORE-001 debe fijar el OpenAPI antes de reemplazarlo.

### [API-DEP-001] GET `/api/v1/departamentos`

**Estado:** PARCIAL. **Query:** `empresa_id` para platform, `activo`. **Request:** sin body.  
**Response:** `DepartamentoResponse[]` del backend definitivo. **Errores:** 401,403,422.

### [API-DEP-002] POST `/api/v1/departamentos`

**Estado:** PARCIAL. **Request:** `CrearDepartamentoRequest`; campos exactos deben regenerarse.  
**Response 201:** `DepartamentoResponse`. **Errores:** 401,403,409,422.

### [API-DEP-003] PUT `/api/v1/departamentos/{departamento_id}`

**Estado:** PARCIAL. **Request:** `ActualizarDepartamentoRequest`. **Response:** `DepartamentoResponse`.  
**Errores:** 401,403,404,409,422.

### [API-DEP-004] DELETE `/api/v1/departamentos/{departamento_id}`

**Estado:** PENDIENTE. **Request:** sin body. **Response:** HTTP 204.  
**Errores:** 401,403,404,409 si tiene cargos.

### [API-CAR-001] GET `/api/v1/cargos`

**Estado:** PARCIAL. **Query:** `empresa_id`, `activo`, `departamento_id`.  
**Response:** `CargoResponse[]`. **Errores:** 401,403,422.

### [API-CAR-002] POST `/api/v1/cargos`

**Estado:** PARCIAL. **Request:** `CrearCargoRequest`; contrato exacto pendiente de schema actualizado.  
**Response 201:** `CargoResponse`. **Errores:** 401,403,409,422.

### [API-CAR-003] PUT `/api/v1/cargos/{cargo_id}`

**Estado:** PARCIAL. **Request:** `ActualizarCargoRequest`. **Response:** `CargoResponse`.  
**Errores:** 401,403,404,409,422.

### [API-CAR-004] DELETE `/api/v1/cargos/{cargo_id}`

**Estado:** PENDIENTE. **Request:** sin body. **Response:** HTTP 204.  
**Errores:** 401,403,404,409 si tiene dependencias.

## Fichas de reclutamiento y portal

### API-VAC-001 a API-VAC-007 — Vacantes autenticadas

**Estado:** BLOQUEADO. El frontend simula lista, detalle, crear, actualizar, publicar, pausar y cerrar;
el backend local tiene entidades/modelos pero no router ni casos de uso HTTP de vacantes.  
**Actor:** reclutador tenant. **Auth:** Sí. **Permisos:** DECISIÓN PENDIENTE.  
**Request/response:** deben derivarse de schemas backend futuros; los tipos mock no son contrato.  
**Reglas observadas en prototipo, no aprobadas:** estado inicial `BORRADOR`; descripción obligatoria
para publicar; salario mínimo no mayor al máximo; estados `BORRADOR/PUBLICADA/PAUSADA/CERRADA`.  
**Tests requeridos por endpoint:** éxito, 401, 403, 404, 409/422 y transición inválida.

### [API-PUB-001] GET `/api/v1/publico/empresas/{slug}`

**Estado:** BLOQUEADO. **Auth:** No. **Request:** sin body.  
**Response propuesta:** `{"slug":"empresa","nombre_comercial":"Empresa","ciudad":"..."}`.  
**DECISIÓN PENDIENTE:** campos públicos autorizados y comportamiento de empresa suspendida.

### [API-PUB-002] GET `/api/v1/publico/empresas/{slug}/vacantes`

**Estado:** BLOQUEADO. **Auth:** No. **Query:** paginación/filtros por definir.  
**Response:** lista paginada de vacantes `PUBLICADA` vigentes; contrato definitivo pendiente.

### [API-PUB-003] GET `/api/v1/publico/vacantes/{vacante_id}`

**Estado:** BLOQUEADO. **Auth:** No. **Response:** detalle público sin campos internos.  
**Errores previstos:** 404 si no existe/no está publicada; confirmar en backend antes de implementar.

### [API-PUB-004] POST `/api/v1/publico/postulaciones`

**Estado:** PARCIAL: backend local existe, frontend aún simula. **Content-Type:** `multipart/form-data`.  
**Request conocido:** datos del postulante, `vacante_id`, experiencia y CV obligatorio. Los nombres
exactos deben importarse del OpenAPI actualizado. CV: PDF/DOCX, máximo 5 MB según backend.  
**Response 201:** `{"id":"uuid","codigo_seguimiento":"...","estado":"...","fecha_postulacion":"ISO-8601"}`.  
**Errores:** 404 vacante; 409 postulación duplicada; 413/422 archivo o validación.  
**Tests:** [ ] multipart real [ ] límite/tipo CV [ ] duplicado [ ] vacante cerrada.

### [API-PUB-005] GET `/api/v1/publico/postulaciones/{codigo}`

**Estado:** PENDIENTE. **Auth:** No. **Request:** sin body.  
**Response:** `{"codigo_seguimiento":"...","estado":"...","etapa":"...","vacante":"...","fecha_postulacion":"ISO-8601","fecha_ultimo_cambio":"ISO-8601"}`.  
**Errores:** 404. **Regla:** no exponer datos personales por código.

### API-TAB-001 a API-TAB-007 — Tablero interno

**Estado:** BLOQUEADO. El frontend simula listado, detalle, cambio de etapa, rechazo, notas, puntaje y
descarga de CV. No existe contrato HTTP backend para esas acciones.  
**Auth:** Sí. **Permisos:** DECISIÓN PENDIENTE. **IDs:** deben ser UUID, no `number`.  
**Reglas candidatas no confirmadas:** etapas ordenadas por empresa; puntaje 0-100; rechazo exige
motivo; CV con autorización; toda transición queda auditada.  
**Criterios:** [ ] contratos OpenAPI [ ] aislamiento tenant [ ] transiciones validadas [ ] auditoría.

## Fichas de módulos por empresa

### [API-MOD-001] GET `/api/v1/modulos`

**Estado:** BLOQUEADO. **Descripción:** catálogo administrable por platform.  
**Request:** sin body. **Response propuesta:** `[{"id":"uuid","codigo":"VACANTES","nombre":"Vacantes","activo":true,"es_core":false}]`.  
**DECISIÓN PENDIENTE:** CRUD del catálogo y módulos core.

### [API-MOD-002] GET `/api/v1/empresas/{empresa_id}/modulos`

**Estado:** BLOQUEADO. **Descripción:** módulos efectivos de una empresa.  
**Response propuesta:** arreglo con código, habilitado y metadatos. **Permiso:** platform.

### [API-MOD-003] PUT `/api/v1/empresas/{empresa_id}/modulos`

**Estado:** BLOQUEADO. **Request propuesto:** `{"module_codes":["USUARIOS","ROLES","BITACORA"]}`.  
**Response:** configuración efectiva. **Reglas:** Auth y módulos core no se deshabilitan; operación
transaccional y auditada. El contrato definitivo pertenece a `BE-MOD-001`.

## Implementación y trazabilidad

| Área | Adaptador/pantalla |
|---|---|
| Auth | `src/features/auth/api/authApi.ts` |
| Empresas | `src/features/empresas/api/empresasApi.ts` |
| Usuarios | `src/features/usuarios/api/usuariosApi.ts` |
| Roles | `src/features/roles/api/rolesApi.ts` |
| Bitácora | `src/features/bitacora/api/bitacoraApi.ts` |
| Organización mock | `src/features/organizacion/api/organizacionApi.ts` |
| Vacantes mock | `src/features/vacantes/api/vacantesApi.ts` |
| Tablero mock | `src/features/tablero/api/tableroApi.ts` |
| Portal mock | `src/features/portal/api/portalApi.ts` |
| Transporte | `src/shared/api/httpClient.ts` |
| Contrato generado | `src/shared/api/schema.d.ts` |

## Protocolo para modificar una ficha

1. Confirmar método/ruta/schema en el OpenAPI objetivo.
2. Actualizar matriz y ficha antes o junto con el código.
3. No cambiar `PENDIENTE/BLOQUEADO` a `IMPLEMENTADO` sin pruebas.
4. Referenciar la TASK y archivos reales.
5. Registrar decisiones pendientes explícitamente; no llenar huecos con el mock.
