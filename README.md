# FINCA

Asistente de anuncios inmobiliarios: una demo web Angular y una extensión de Chrome con la misma ficha y reglas de negocio.

## Estado actual

Primera entrega técnica en develop: ficha validada compartida, paquete Chrome Manifest V3, API de salud y comprobaciones automatizadas. La generación de texto y el historial se implementarán en la siguiente rama. No hay conexión con IA ni portales.

Los diseños HTML aprobados siguen en [designs](./designs/README.md), incluida la casa interactiva. La portada y sus animaciones todavía no se han migrado a Angular.

## Requisitos e instalación

- Node.js 24 LTS, desde 24.15, y npm 12.2.
- Chrome 114 o posterior para la extensión.

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

`npm run dev:extension` reconstruye el panel en desarrollo; el empaquetado inicial se realiza con `build:extension`. Recarga la extensión después de cambios en el manifiesto o el service worker.

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
packages/application  Casos de uso y puertos (siguiente entrega)
packages/ui       Componentes Angular compartidos
packages/storage  Adaptadores de persistencia (siguiente entrega)
tests/integration API HTTP
tests/e2e         Navegador web y paquete real de extensión
scripts           Build y servidor local compatibles con Windows/Linux
designs           Prototipos visuales de referencia
docs              Decisiones y evidencia de pruebas
```

Dominio no conoce Angular, Express ni Chrome; las reglas de importación se comprueban con ESLint. La UI usa un formulario reactivo y eventos tipados para entregar datos normalizados.

## Ramas

- `master`: estrategia y diseños iniciales; no se ha publicado una versión estable de aplicación.
- `develop`: entregas integradas tras las comprobaciones.
- `feature/*`: un desarrollo importante por rama, integrado con commits de merge.
- `fix/*`: correcciones aisladas.

Los commits se publican con Santiago García <sgarciajerez@gmail.com>. La primera versión estable se integrará en master cuando se acuerde.

## Documentación

[Estrategia](./ESTRATEGIA_DESARROLLO.md) · [Changelog](./CHANGELOG.md) · [Decisiones](./docs/decisions/001-workspace.md) · [Verificación](./docs/testing/foundation.md)

## Límites

El E2E de extensión carga el paquete real, comprueba sus APIs y prueba la página del panel. La apertura mediante el icono del navegador nativo requiere verificación manual: abrir una URL chrome-extension no la sustituye. No hay despliegue público, publicación en la tienda ni integración con idealista/Fotocasa.
