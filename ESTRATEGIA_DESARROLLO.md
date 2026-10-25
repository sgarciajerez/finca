# FINCA
## Asistente de anuncios inmobiliarios

Estrategia de desarrollo · 23 de octubre de 2026 · Estado: primera implementación local en develop

> De la ficha del inmueble a un anuncio claro, editable y listo para revisar.

## 1. Objetivo del producto

Crear una extensión de Chrome que acompañe al profesional inmobiliario mientras prepara un anuncio y una web pública que permita probar la experiencia sin instalar nada ni disponer de cuenta en un portal.

La primera entrega incluirá panel lateral, ficha del inmueble, generación y edición de texto, historial local de borradores y copia al portapapeles. La inserción en idealista y Fotocasa llegará después, portal a portal y tras validar su viabilidad. El usuario realizará la publicación final.

FINCA es un nombre de trabajo: breve, reconocible y relacionado con el sector. La disponibilidad de marca, dominio y nombre en Chrome Web Store queda pendiente de comprobar.

## 2. Encaje con el perfil de Santiago

El CV aportado presenta experiencia con Angular, TypeScript, JavaScript, LitElement/Cells, APIs REST, Node.js y .NET; también incluye AutoContent AI y el proyecto CSV Import Doctor.

FINCA debe aportar una demostración nueva y completa: una misma experiencia en web y extensión, persistencia local, integración con el navegador y generación de contenido bajo control del usuario.

Decisión propuesta: reforzar Angular y TypeScript, coherentes con el posicionamiento Frontend / Full Stack del CV, y utilizar Node.js para mantener el proyecto dentro del ecosistema JavaScript. TypeScript será el lenguaje principal sobre JavaScript. No hace falta incorporar .NET ni varios frameworks a este MVP.

Competencias que deberá hacer visibles:

- Diseño de producto y experiencia de usuario con un problema concreto.
- Angular: componentes reutilizables, formularios reactivos, servicios y estado con Signals.
- TypeScript: contratos compartidos y separación entre dominio e integraciones.
- Chrome Manifest V3: panel lateral, almacenamiento, permisos y mensajería.
- Backend: API de generación, validación, gestión de errores y límites de uso.
- Calidad: accesibilidad, pruebas de flujos críticos y documentación de decisiones.

## 3. Usuario y recorrido principal

Usuario inicial: agente de una agencia pequeña que redacta anuncios a partir de sus propios datos.

Recorrido:

1. Abrir FINCA, en la demo web o en el panel lateral.
2. Cargar un ejemplo ficticio o completar la ficha.
3. Revisar datos faltantes y elegir tono y longitud.
4. Generar una descripción basada en la ficha confirmada.
5. Editar manualmente o solicitar un ajuste de estilo.
6. Guardar un borrador y copiar el texto.
7. En una fase posterior, insertar el contenido en un formulario compatible tras una acción explícita.

Propuesta diferencial: ayudar a redactar anuncios concretos sin inventar características y hacer visibles los datos que faltan.

## 4. Alcance del MVP

| Función | Comportamiento esperado |
| --- | --- |
| Panel lateral | Abrir el asistente desde el icono de la extensión. |
| Ficha | Operación, tipo de inmueble, localidad, precio, superficie, habitaciones, baños, estado y extras. |
| Datos desconocidos | Diferenciar un dato desconocido de una respuesta negativa; no asumir ascensor, terraza o reforma. |
| Preferencias | Tono profesional, cercano o exclusivo; longitud breve o estándar. |
| Generación | Crear una descripción y un encabezado opcional; mostrar qué campos pueden utilizarse según el destino. |
| Editor | Modificar el texto y pedir ajustes sin añadir hechos nuevos. |
| Borradores | Guardar, recuperar, renombrar y eliminar versiones locales. |
| Copiar | Copiar la descripción con confirmación visible y manejo de errores. |
| Demo pública | Acceso sin registro, ejemplos ficticios y recorrido completo. |
| Estados | Carga, error, límite de uso y modo de demostración claramente identificados. |

La demo tendrá un modo de ejemplos predefinidos, etiquetado como tal, que funcione sin claves ni llamadas de pago. La generación real será un modo separado servido por el backend y con límites de consumo.

Fuera del MVP: publicación automática, scraping de anuncios, sincronización entre dispositivos, pagos, CRM completo, edición de imágenes, valoraciones de mercado y análisis de fotos. Tampoco se prometerá una mejora de contactos o posicionamiento sin mediciones.

## 5. Stack propuesto

| Capa | Elección | Motivo |
| --- | --- | --- |
| Lenguaje | TypeScript sobre JavaScript | Encaja con el CV y permite compartir contratos. |
| UI web y panel | Angular, componentes standalone | Reutilizar formulario, editor e historial. |
| Estado | Signals y servicios | Mantener el estado sencillo, sin añadir un gestor global inicialmente. |
| Formularios | Reactive Forms | Validación y estados explícitos. |
| Estilos | SCSS y variables CSS | Diseño propio, responsive y con pocos componentes externos. |
| Extensión | Manifest V3 y Chrome APIs | Panel lateral nativo y almacenamiento local. |
| Backend | Node.js + Express + TypeScript | API pequeña dentro del mismo ecosistema. |
| Validación de API | Zod | Validación en tiempo de ejecución de entradas y salidas. |
| IA | Adaptador de proveedor en el servidor | Cambiar proveedor sin acoplar la interfaz ni exponer claves. |
| Persistencia | chrome.storage.local / IndexedDB web | Borradores locales; sin base de datos remota en el MVP. |
| Tests unitarios | Vitest y Angular TestBed para componentes | Patrón AAA obligatorio y pruebas de comportamiento. |
| Tests E2E | Playwright | Recorridos web y extensión en Chromium con contexto persistente. |
| Calidad | ESLint, Prettier y TypeScript estricto | Comprobaciones reproducibles antes de integrar cambios. |
| Organización | npm workspaces | Compartir código sin una plataforma de monorepo adicional. |

Antes de instalar, seleccionar versiones estables compatibles con el Node.js disponible y guardar el lockfile. No fijar números de versión en este documento.

## 6. Arquitectura prevista

Estructura objetivo; solo se crearán módulos de implementación cuando tengan responsabilidad y contenido reales:

```text
finca/
  README.md
  CHANGELOG.md
  ESTRATEGIA_DESARROLLO.md
  designs/                     # Vistas HTML, estilos e interacción de referencia
  package.json                 # Contrato de scripts y workspaces
  package-lock.json
  .env.example                 # Nombres de configuración, nunca secretos
  .github/workflows/ci.yml
  apps/
    web/src/app/
      features/                # Ficha, editor, borradores y demo
      composition/             # Configuración e inyección de adaptadores
    extension/
      manifest.json
      src/
        panel/                 # Interfaz Angular
        background/            # Service worker y ciclo de vida
        content/               # Adaptadores de formularios, cuando existan
        composition/           # Inyección para entorno Chrome
    api/src/
      presentation/http/       # Rutas, middleware y mapeo de errores
      infrastructure/          # Proveedor de IA y servicios externos
      composition/             # Construcción de dependencias
  packages/
    domain/src/                # Modelos y reglas puras
    application/src/
      ports/                   # Contratos de repositorios y generación
      use-cases/               # Generar, revisar y guardar borradores
    ui/src/                    # Componentes Angular compartidos
    storage/src/               # Adaptadores Chrome e IndexedDB
  tests/
    e2e/web/
    e2e/extension/
    integration/               # HTTP y contratos de adaptadores
    fixtures/                  # Datos ficticios y formulario de portal
    support/                   # Ayudas pequeñas compartidas
  scripts/                     # Automatización compatible con Windows y CI
  docs/
    decisions/                 # Decisiones de arquitectura
    testing/                   # Matriz de casos y evidencia
    portfolio/                 # Caso de estudio y capturas
```

Los tests unitarios vivirán junto al código como `*.spec.ts`; los E2E se identificarán como `*.e2e.ts`. Separar sus configuraciones evita que un runner ejecute la suite del otro. Evitar carpetas genéricas como `helpers` o `utils` sin una responsabilidad definida.

### 6.1. Principios SOLID aplicados

| Principio | Regla para FINCA | Ejemplo verificable |
| --- | --- | --- |
| Responsabilidad única | Separar presentación, reglas, casos de uso y acceso externo. | El componente de ficha no llama al proveedor de IA ni escribe directamente en Chrome storage. |
| Abierto/cerrado | Extender mediante adaptadores detrás de contratos estables. | Añadir Fotocasa no obliga a modificar el caso de uso de generación. |
| Sustitución de Liskov | Los adaptadores respetan las mismas garantías observables. | Un repositorio en memoria y uno en IndexedDB pasan la misma suite de contrato. |
| Segregación de interfaces | Contratos pequeños, definidos por la necesidad del consumidor. | `DraftRepository` y `ListingGenerator` separados de las capacidades de un portal. |
| Inversión de dependencias | Los casos de uso dependen de puertos, no de frameworks o proveedores. | Inyectar un generador simulado en tests y el proveedor real en el servidor. |

Dirección de dependencias: dominio sin Angular, Express, DOM o Chrome; aplicación depende de dominio y puertos; infraestructura implementa puertos; composición conecta implementaciones. La UI llama a casos de uso o a un cliente HTTP mediante contratos. Los contratos de generación pueden compartirse, pero la implementación del proveedor y sus secretos quedan exclusivamente en el servidor.

Aplicar SOLID con proporcionalidad: funciones puras para reglas sencillas, interfaces en límites de infraestructura y composición explícita. No crear una interfaz por cada clase, jerarquías innecesarias ni clases base para forzar reutilización. Registrar excepciones con su motivo en `docs/decisions/`.

La web y el panel consumirán la misma lógica de ficha y edición. Las APIs de Chrome permanecerán en adaptadores de la extensión. El historial será independiente en cada entorno; no habrá sincronización implícita.

Primer experimento técnico obligatorio: compilar un panel mínimo Angular en modo producción, cargarlo como extensión desempaquetada y verificar apertura, estilos y ausencia de errores de CSP. Todo el código ejecutable debe ir empaquetado; sin scripts remotos ni compilación de plantillas en tiempo de ejecución. El service worker no dependerá de Angular ni del DOM.

Si este experimento revela una complejidad desproporcionada, documentar la decisión antes de cambiar el stack. WXT queda como alternativa a evaluar, no como dependencia inicial.

## 7. Datos y contrato de generación

Modelo inicial:

- Property: identificador, operación, tipo, localidad, precio en EUR, superficie en m², habitaciones, baños, estado y extras confirmados.
- GenerationPreferences: tono, longitud e idioma; solo español en la primera versión.
- Draft: identificador, versión de esquema, ficha, preferencias, texto generado, texto editado y fechas.
- GenerationResult: descripción, encabezado opcional y avisos estructurados.

Separar el texto original del generado y del editado evita perder trabajo. Regenerar no debe sobrescribir cambios manuales sin una elección explícita dentro de la interfaz.

Contrato orientativo: POST /api/generate recibe ficha validada y preferencias; POST /api/rewrite recibe la ficha original, texto e instrucción de edición. Ambas respuestas se validan en el servidor.

Reglas de generación:

- Emplear solo hechos confirmados; no inventar orientación, servicios cercanos, rentabilidad o estado legal.
- Mantener cifras, unidades y operación coherentes con la ficha.
- Tratar las notas libres como datos, no como instrucciones del sistema.
- Pedir confirmación de ambigüedades relevantes; no completar automáticamente datos desconocidos.
- Mostrar avisos deterministas por campos incompletos. Las comprobaciones no garantizan que la IA nunca se equivoque: la revisión humana sigue siendo parte del flujo.
- Preservar ficha y texto ante fallos, cancelaciones o límites del proveedor.

## 8. Integración progresiva con portales

Etapa 1: copiar el texto funciona con cualquier destino y no depende de acceso a los portales.

Etapa 2: usar un formulario ficticio propio para probar detección de campos, mensajería e inserción sin publicar nada. Identificarlo claramente como simulación.

Etapa 3: elegir idealista como primer candidato y validar el formulario real con acceso legítimo. Comprobar condiciones aplicables y compatibilidad antes de anunciar soporte. El orden puede cambiar si Fotocasa resulta más viable.

Etapa 4: añadir el segundo portal con un adaptador independiente y pruebas propias.

Cada adaptador debe detectar el formulario compatible, insertar solo en los campos previstos y confirmar el resultado. Si el portal cambia o no se reconoce, ofrecer copia manual. No sobrescribir contenido existente sin confirmación del usuario. Solicitar permisos al activar la función y para los sitios necesarios.

No usar APIs privadas, capturar credenciales ni reutilizar contenido de terceros. La documentación de Fotocasa Pro describe conexión de CRM mediante activación y API key; no equivale a acceso público inmediato para FINCA. La publicación directa por API es una investigación futura y no condiciona el MVP.

## 9. Seguridad, privacidad y costes

- Claves del proveedor exclusivamente en el servidor, fuera del repositorio y del paquete de extensión.
- No solicitar nombre, teléfono o dirección exacta para generar una descripción; advertir si se incluyen en notas libres.
- Explicar qué datos se envían al proveedor al usar generación real.
- Permitir borrar todos los borradores locales. No registrar fichas completas en logs.
- Limitar tamaño de entrada, frecuencia, concurrencia y presupuesto global de generación. CORS no sustituye controles de abuso.
- Aplicar tiempos de espera y evitar reintentos automáticos que dupliquen costes.
- Documentar proveedor, retención y límites concretos antes de habilitar la generación pública real.

## 10. Plan por entregas y criterios de salida

### Entrega 0: prueba técnica y base

- Panel Angular compilado y cargado en Chrome con Manifest V3.
- Web mínima y contratos compartidos.
- package.json y workspaces con scripts ejecutables; README y CHANGELOG actualizados.
- Vitest con primer unitario AAA de una regla real, Playwright con primer E2E del recorrido disponible y CI inicial.
- Límites de dependencia y TypeScript estricto configurados.
- Salida: mismo componente de ficha visible en web y extensión, sin errores de carga o CSP.

### Entrega 1: experiencia local completa

- Ficha, validaciones, ejemplos ficticios, editor, copia e historial.
- Adaptadores de almacenamiento y recuperación tras cerrar y abrir.
- Salida: completar todo el recorrido sin servidor ni registro, con generación de ejemplo claramente etiquetada.

### Entrega 2: generación real

- API, adaptador de IA, validación, ajustes de texto y límites de consumo.
- Salida: generar y editar con datos confirmados; simular fallo del proveedor sin perder trabajo ni filtrar claves.

### Entrega 3: demo y presentación profesional

- Web pública responsive, flujo de demostración, instrucciones de instalación y vídeo breve.
- Salida: un reclutador puede probar ficha, resultado, edición e historial en menos de dos minutos, sin instalar la extensión.

### Entrega 4: primer portal

- Prototipo sobre formulario ficticio y validación del candidato real.
- Salida: inserción tras clic, comportamiento seguro ante campos desconocidos y copia manual disponible. Solo declarar compatibilidad real si se ha verificado.

### Entrega 5: segundo portal y distribución

- Segundo adaptador y documentación de compatibilidad.
- Evaluar publicación en Chrome Web Store con paquete, permisos, política de privacidad y materiales preparados.
- Salida: evidencia de cada integración y estado de distribución descritos con precisión.

Las entregas son secuenciales y no implican fechas comprometidas. Primero se termina una versión útil; después se amplía la integración.

## 11. Estrategia de pruebas y calidad obligatoria

### 11.1. Unitarios con patrón AAA

Todos los tests unitarios seguirán Arrange / Act / Assert con bloques reconocibles y comentarios `// Arrange`, `// Act` y `// Assert`. Cada test describirá una conducta, su condición y resultado esperado. Un Act representa una operación o interacción de negocio; puede haber varias aserciones relacionadas con ese resultado.

Ejemplo de especificación orientativa, no código implementado:

```typescript
it('rechaza guardar un borrador con superficie negativa', async () => {
  // Arrange
  const repository = createInMemoryDraftRepository();
  const saveDraft = createSaveDraft(repository);
  const draft = buildDraft({ areaM2: -10 });

  // Act
  const result = await saveDraft(draft);

  // Assert
  expect(result.ok).toBe(false);
  expect(await repository.list()).toEqual([]);
});
```

Reglas:

- Vitest para dominio, aplicación y Node.js; Angular TestBed para comportamiento de componentes y servicios Angular.
- Casos válidos, inválidos, límites y errores relevantes. Probar contratos y resultados, sin acoplarse a métodos privados.
- Dobles en límites externos: IA, reloj, almacenamiento y APIs Chrome. No simular toda la implementación.
- Cada test tendrá datos aislados y deterministas. Sin llamadas a portales reales o modelos de pago.
- Evitar sleeps, dependencias del orden de ejecución y snapshots masivos.
- Primera meta de cobertura: 80% en líneas, funciones, ramas y sentencias de dominio y aplicación, con exclusiones explícitas para código generado. Ajustarla solo con justificación documentada. La cifra no sustituye la calidad de los casos.
- Probar comportamientos críticos aunque la cobertura global ya cumpla el objetivo.

### 11.2. Integración

Verificar la API HTTP con entradas y salidas reales y un proveedor de IA simulado. Comprobar validación, errores, timeout y límites de consumo. Ejecutar suites de contrato compartidas para adaptadores de borradores.

### 11.3. E2E con Playwright

Recorridos obligatorios al existir la funcionalidad:

1. Abrir la demo, cargar ejemplo, generar con proveedor controlado, editar y copiar.
2. Guardar un borrador, recargar la aplicación y recuperarlo; eliminarlo y comprobar su ausencia.
3. Mostrar validaciones por datos inválidos sin perder el resto del formulario.
4. Simular fallo y límite de la API preservando trabajo y permitiendo recuperación.
5. Cargar el paquete real de extensión en Chromium y verificar UI, mensajes y persistencia Chrome.
6. Insertar en el formulario ficticio, detectar campos ausentes y proteger contenido previo.

La suite de extensión usará el Chromium de Playwright con un contexto persistente y perfil temporal aislado. Visitar la página HTML del panel permite probar su UI, pero no demuestra por sí solo la apertura del panel nativo: verificar esa apertura con automatización si es fiable y, en su defecto, con una prueba manual documentada en Chrome. No presentar un mock de Chrome como E2E de la extensión.

Usar selectores por rol y nombre accesible; recurrir a `data-testid` solo cuando sea necesario. Esperas por condiciones observables, sin pausas arbitrarias. Guardar trazas y capturas ante fallo. La suite automatizada no dependerá de credenciales de idealista/Fotocasa; las verificaciones reales tendrán evidencia manual separada.

### 11.4. Criterio de terminado por funcionalidad

- Comportamiento implementado, incluidos errores y estados vacíos relevantes.
- Unitarios AAA correspondientes, integración si cruza límites y E2E si cambia un recorrido principal.
- Lint, formato, tipos, tests y builds afectados pasando.
- Navegación por teclado, foco y mensajes de estado revisados en cambios de UI.
- README actualizado si cambian instalación, configuración o uso; CHANGELOG actualizado con el cambio observable.
- Ningún test omitido o pendiente usado para presentar una funcionalidad como verificada.

CI ejecutará instalación reproducible, comprobaciones estáticas, unitarios con cobertura, integración, build y E2E. La suite de extensión consumirá el paquete compilado. Publicar informes de prueba y trazas de fallo; no añadir badges hasta tener un repositorio y una ejecución reales.

Las pruebas automáticas no dependerán de textos exactos de un modelo. Usar proveedor simulado y una matriz manual de casos para valorar la generación real.

### 11.5. Contrato del package.json

Crear `package.json` raíz y manifiestos de los workspaces en la entrega 0. Deben tener nombre, descripción, versión inicial, `private: true` donde no se publiquen paquetes, `type`, workspaces explícitos y versiones compatibles del entorno en `engines` y `packageManager`. No inventar URLs de repositorio, demo o licencia; incorporarlas al definirse.

Separar dependencias de ejecución y desarrollo. Guardar `package-lock.json`, usar `npm ci` en CI y evitar herramientas globales. Los scripts serán compatibles con PowerShell y CI; usar scripts Node para operaciones de archivos que dependan del sistema operativo.

Contrato de comandos a implementar y comprobar:

| Script | Responsabilidad |
| --- | --- |
| `dev:web` | Arrancar la demo web. |
| `dev:api` | Arrancar la API en desarrollo. |
| `dev:extension` | Reconstruir la extensión para carga local. |
| `build` | Compilar paquetes compartidos y aplicaciones en orden de dependencia. |
| `build:extension` | Producir el paquete MV3 cargable. |
| `lint` | Comprobar reglas estáticas y límites de dependencias. |
| `format` / `format:check` | Aplicar / comprobar formato. |
| `typecheck` | Validar tipos sin emitir artefactos. |
| `test` / `test:unit` | Ejecutar unitarios una vez y fallar si no se encuentran pruebas. |
| `test:watch` | Ejecutar unitarios en modo interactivo. |
| `test:coverage` | Medir y comprobar umbrales. |
| `test:integration` | Ejecutar contratos e integración HTTP. |
| `test:e2e` | Ejecutar suites web y extensión; preparar los builds necesarios. |
| `test:e2e:web` / `test:e2e:extension` | Ejecutar cada suite por separado. |
| `test:e2e:ui` | Abrir el runner interactivo para depuración. |
| `check` | Ejecutar formato, lint, tipos, unitarios e integración. |
| `verify` | Ejecutar check, builds y E2E en orden; comando completo previo a entrega. |

Ningún script será un placeholder que devuelva éxito. Los comandos y suites se añadirán al existir su implementación y se documentará su estado. Evitar `--if-present` o `passWithNoTests` para encubrir una comprobación obligatoria ausente.

### 11.6. README y CHANGELOG

El README explicará problema, estado real, stack, requisitos, instalación, variables de entorno, comandos, ejecución web/API, carga de extensión, pruebas, arquitectura, límites de integración y roadmap. Añadir demo, capturas y enlaces cuando existan.

El CHANGELOG mantendrá una sección `Unreleased` y versiones fechadas al entregar versiones reales. Agrupar cambios bajo Added, Changed, Fixed y otras categorías cuando proceda. Registrar cambios concretos, sin confundir requisitos previstos con funciones ya implementadas. Mantener la versión publicada coherente con el manifiesto del paquete.

## 12. Diseño y evidencia para el portfolio

Dirección visual: interfaz editorial limpia, tonos piedra y verde, buena tipografía, controles claros y vista previa del anuncio. Evitar una pantalla de chat como única experiencia.

Preparar:

- Demo pública y repositorio con instrucciones reproducibles.
- Capturas de la web y del panel real de Chrome.
- Vídeo de 60-90 segundos con el recorrido principal.
- Caso de estudio: problema, decisiones, arquitectura, validación y limitaciones.
- Métricas verificables: tiempo de completar tareas en pruebas, número de pasos, peso del paquete y resultados de accesibilidad. No inventar impacto comercial.
- README que distinga funciones implementadas, simuladas y previstas.

Texto propuesto para el CV, utilizable cuando esas funciones estén implementadas:

> FINCA | Angular, TypeScript, Node.js y Chrome Extensions. Desarrollé una extensión con panel lateral y una demo web para preparar anuncios inmobiliarios, con generación asistida por IA, edición y borradores locales. Compartí componentes y contratos entre entornos e implementé una API con validación y límites de uso.

Si solo está terminado el prototipo local, describirlo como prototipo y no atribuirle todavía generación real ni integración con portales.

## 13. Próxima sesión de implementación

1. Revisar herramientas instaladas y versiones compatibles.
2. Crear workspace y aplicaciones mínimas.
3. Completar el experimento Angular + panel lateral MV3.
4. Implementar una ficha compartida con un ejemplo ficticio.
5. Añadir package.json, configuración estricta y scripts comprobados.
6. Implementar el primer unitario AAA y el primer E2E del flujo disponible.
7. Registrar decisiones, comandos y cambios en README y CHANGELOG; configurar CI.

## 14. Fuentes y comprobaciones pendientes

Documentación oficial consultada el 23/10/2026:

- Angular: https://angular.dev/overview
- Panel lateral Chrome: https://developer.chrome.com/docs/extensions/reference/api/sidePanel
- Seguridad MV3 y código empaquetado: https://developer.chrome.com/docs/extensions/develop/migrate/improve-security
- Content scripts: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts
- Pruebas Angular / Vitest: https://angular.dev/guide/testing
- E2E de extensiones con Playwright: https://playwright.dev/docs/chrome-extensions
- Manifiesto npm: https://docs.npmjs.com/cli/v11/configuring-npm/package-json/
- WXT, alternativa evaluable: https://wxt.dev/
- Conexión CRM Fotocasa Pro: https://pro.fotocasa.es/bienvenida-pack-basic/
- Condiciones idealista: https://www.idealista.com/ayuda/articulos/terminos-y-condiciones-generales-de-idealista/

Pendientes: disponibilidad del nombre, versiones del entorno, prueba Angular/MV3, proveedor y coste de IA, condiciones y acceso a formularios, hosting y distribución de la extensión.

Este documento define la estrategia. No acredita implementación, despliegue, permiso de integración ni publicación en ninguna tienda.


## 15. Base visual disponible

El 23/10/2026 se creó `designs/` con siete vistas HTML navegables: `index.html`, `inmueble.html`, `anuncio.html`, `borradores.html`, `ajustes.html`, `demo.html` y `estados.html`.

Las vistas comparten `assets/styles.css` y `assets/prototype.js`. Son referencia para la implementación Angular: el JavaScript de la maqueta no sustituye la separación por dominio, casos de uso y adaptadores prevista. La interacción local permite revisar el producto antes de implementar la arquitectura definitiva.

Se eligió una paleta de verde bosque, marfil, piedra y salvia con acento arcilla. El objetivo de accesibilidad es WCAG 2.2 AA; los resultados y límites de las comprobaciones constan en `designs/ACCESIBILIDAD.md`. El prototipo no acredita una certificación de conformidad.


### Evolución visual del prototipo

La portada incorpora una casa SVG interactiva controlada mediante HTML, CSS y JavaScript local. Ventanas, puerta y jardín tienen controles de teclado y respuestas a ratón/toque, pausa y alternativa sin movimiento. Los selectores pasan a opciones visibles con radios nativos. La dirección visual mezcla bordes rectos, superficies alternas y motion expresivo sin desvanecer texto. Al migrar a Angular, encapsular la escena y su limpieza de eventos/timers en un componente independiente; conservar estos contratos de accesibilidad.


## 16. Desarrollo iniciado — 25/10/2026

Se han separado las entregas en `feature/project-foundation` y `feature/local-listing-workflow`, con integraciones mediante merge en develop. master conserva la base documental inicial y espera una versión estable acordada.

Implementado: workspace Angular/TypeScript, paquete MV3, API de salud, ficha compartida, generación local por plantillas, editor y repositorios de borradores. Incluye scripts, CI, unitarios AAA, Angular TestBed, integración y E2E web/extensión. Consultar README y docs/testing para los comandos y las comprobaciones actuales.

Pendiente: portada animada en Angular, preferencias persistentes, generación real y adaptadores de portales. La apertura nativa del panel desde el icono necesita una comprobación manual separada de los E2E.
