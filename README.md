# FINCA

Asistente de anuncios inmobiliarios: una demo web Angular y una extensión de Chrome con la misma ficha y reglas de negocio.

## Estado actual

La demo comienza con una ficha vacía para evitar publicar datos ficticios por error. Puedes cargar un ejemplo explícitamente, validar los datos, preparar un texto determinista, cambiar tono/longitud, editar, copiar y guardar borradores; buscarlos, renombrarlos, recuperarlos o eliminarlos. La ficha conserva cambios al cambiar de sección y avisa antes de reemplazarlos o cerrar la página. Web y extensión comparten UI y casos de uso. No hay conexión con IA ni portales.

La experiencia web tiene una composición amplia para escritorio y se adapta al panel de extensión y a pantallas pequeñas. Incluye una casa SVG interactiva: el vecino saluda bajo demanda y el gato, el jardín, la luz y los pájaros responden al puntero, al foco y a la preferencia de movimiento reducido. Los diseños HTML aprobados siguen en [designs](./designs/README.md).

## Requisitos e instalación

- Node.js 24 LTS, desde 24.15, y npm 12.2.
- Chrome 119 o posterior para la extensión.

```bash
npm ci
npx playwright install chromium
```

No hacen falta claves ni variables para ejecutar la web. `.env.example` documenta el puerto opcional de la API; no se incluyen secretos.

## Ejecutar

```bash
npm run dev:web
npm run dev:api
```

Web: http://127.0.0.1:4200. API: http://127.0.0.1:3000/api/health. La API indica expresamente que la generación no está configurada.

### Extensión

```bash
npm run build:extension
```

En `chrome://extensions`, activa el modo de desarrollador, elige «Cargar descomprimida» y selecciona `dist/extension/browser`. Pulsa el icono de FINCA para abrir el panel lateral. La extensión solo solicita `sidePanel` y `storage`.

`npm run dev:extension` mantiene el panel, el service worker y el manifiesto en modo desarrollo, sin borrar el paquete al reconstruir. Recarga la extensión después de cambios en el manifiesto o el service worker.

### Diseños HTML

```powershell
python -m http.server 4173 --bind 127.0.0.1 --directory designs
```

Python es opcional y sirve únicamente para explorar las maquetas en http://127.0.0.1:4173.

## Scripts

| Comando                               | Resultado                                                              |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `dev:web`, `dev:api`, `dev:extension` | Desarrollo de cada entorno.                                            |
| `build`                               | Compilar web, extensión y API.                                         |
| `preview:web`                         | Servir el build web en el puerto 4200.                                 |
| `format`, `format:check`              | Aplicar o comprobar Prettier.                                          |
| `lint`, `typecheck`                   | ESLint y tipos de TypeScript y plantillas Angular.                     |
| `test`, `test:unit`, `test:watch`     | Unitarios con Vitest y patrón AAA.                                     |
| `test:coverage`                       | Cobertura de dominio/aplicación con mínimo 80% en las cuatro métricas. |
| `test:integration`                    | Integración HTTP con Supertest y Vitest.                               |
| `test:e2e`                            | Compilar y ejecutar Playwright web y extensión.                        |
| `test:e2e:web`, `test:e2e:extension`  | Ejecutar una sola suite, preparando el build.                          |
| `test:e2e:ui`                         | Depurar suites sobre los builds ya creados.                            |
| `check`                               | Formato, lint, tipos, cobertura e integración.                         |
| `verify`                              | Todas las comprobaciones, builds y E2E.                                |

CI ejecuta `npm ci`, instala Chromium y corre `npm run verify`. Los informes se adjuntan a cada ejecución. No se utilizan portales ni cuentas reales en las pruebas.

## Estructura y SOLID

```text
apps/web          Entrada y composición de la demo Angular
apps/extension    Entrada Angular, manifiesto MV3 y service worker
apps/api          Servidor Express y configuración de arranque
packages/domain   Esquema, modelo y reglas de validación
packages/application  Casos de uso de generación/guardado y puertos
packages/ui       Componentes Angular compartidos
packages/storage  IndexedDB, Chrome storage y validación de borradores
tests/integration API HTTP
tests/e2e         Navegador web y paquete real de extensión
scripts           Build y servidor local compatibles con Windows/Linux
designs           Prototipos visuales de referencia
docs              Decisiones y evidencia de pruebas
```

Dominio no conoce Angular, Express ni Chrome; las reglas de importación se comprueban con ESLint. La UI usa un formulario reactivo, Signals y eventos tipados. Generación y repositorio se inyectan mediante tokens; el almacenamiento se elige en la composición de cada aplicación. El generador de ejemplo es local y no usa las notas libres como instrucciones.

## Ramas

- `master`: estrategia y diseños iniciales; no se ha publicado una versión estable de aplicación.
- `develop`: entregas integradas tras las comprobaciones.
- `feature/*`: un desarrollo importante por rama, integrado con commits de merge.
- `fix/*`: correcciones aisladas.

Los commits se publican con Santiago García <sgarciajerez@gmail.com>. La primera versión estable se integrará en master cuando se acuerde.

## Documentación

[Estrategia](./ESTRATEGIA_DESARROLLO.md) · [Changelog](./CHANGELOG.md) · [Decisiones](./docs/decisions/001-workspace.md) · [Verificación inicial](./docs/testing/foundation.md) · [Flujo local](./docs/testing/local-workflow.md)

## Persistencia y revisión

La web guarda en IndexedDB (`finca-app`) y la extensión en `chrome.storage.local` con claves propias. Los registros tienen versión de esquema y se validan al leer y escribir. No se sincronizan entre entornos. No se eliminan registros incompatibles silenciosamente: la interfaz informa y permite vaciar la biblioteca con confirmación.

La actualización del ejemplo y la apertura de otro borrador piden confirmación si hay cambios manuales. Guardar dos veces actualiza el mismo borrador. Los errores de generación o almacenamiento conservan el texto en pantalla. Los cambios sin guardar permanecen solo durante la sesión de la página; guarda o copia antes de cerrarla.

## Pendiente

- Migración de la portada con casa interactiva a un componente Angular.
- Preferencias persistentes y recuperación automática de una sesión sin guardar.
- API de generación real, revisión de calidad y controles de consumo.
- Adaptadores de inserción en portales tras validar el acceso y sus condiciones.
- Publicación de una primera versión estable y distribución en Chrome Web Store.

## Límites

El E2E de extensión carga el paquete real, comprueba sus APIs y prueba la página del panel. La apertura mediante el icono del navegador nativo requiere verificación manual: abrir una URL chrome-extension no la sustituye. No hay despliegue público, publicación en la tienda ni integración con idealista/Fotocasa.
