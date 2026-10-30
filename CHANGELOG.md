# Changelog

Historial de cambios realizados en FINCA. Las funciones previstas se documentan en la estrategia, no como funcionalidades entregadas.

## [Unreleased]

### Workspace safety and web experience — 2026-10-30

- Formulario vacío por defecto; cargar datos ficticios es una acción explícita y protegida ante cambios sin guardar.
- Ficha y selecciones permanecen al cambiar de sección; abrir otro borrador o empezar uno nuevo pide confirmación si reemplaza datos pendientes. El navegador avisa antes de salir con cambios.
- Guardar conserva como línea base el texto escrito en almacenamiento, incluso si hay ediciones durante la operación.
- Los errores de validación llevan el foco al primer campo incorrecto y lo desplazan a la zona visible.
- Composición web ampliada en escritorio, panel adaptable a móvil y Chrome, y tarjeta de borrador con precio y fecha.
- Ilustración SVG de la casa con saludo animado, gato, pájaros, luz y jardín; respeta movimiento reducido y teclado.
- Añadidas pruebas AAA y E2E para ficha segura, conservación de cambios y guardado concurrente.

### Local listing workflow — 2026-10-25

- Generación determinista sin IA, validada mediante un puerto sustituible; tono, longitud, edición y copia.
- Borradores versionados: guardado/actualización, búsqueda, apertura, renombrado y eliminación con confirmación.
- Persistencia real con IndexedDB en web y chrome.storage.local en extensión, con validación al leer/escribir.
- Confirmación antes de reemplazar ediciones; conservación de texto ante fallos y protección contra doble guardado.
- 38 unitarios AAA, 5 tests Angular TestBed, 2 de integración y 8 E2E; auditorías automáticas de accesibilidad en pantallas y diálogos.
- Modo de desarrollo de extensión que reconstruye panel y service worker conservando el manifiesto.

### Development foundation — 2026-10-25

- Workspace npm con Angular compartido entre web y extensión MV3; TypeScript estricto, ESLint, Prettier y scripts reproducibles.
- Formulario de inmueble con validación independiente, selección nativa accesible y protección de campos ante errores.
- API Express de salud, sin generación real configurada.
- Vitest AAA con cobertura, integración HTTP, E2E web/Chrome real y CI de GitHub Actions.
- Flujo de ramas master / develop / feature con identidad de commit configurada localmente.

### Fixed

- Fondo de la tarjeta 03 del índice corregido para que el barrido animado sea visible, igual que en el resto de tarjetas.

### Changed

- Dirección visual con bordes más rectos, superficies alternas y espaciado menos uniforme.
- Desplegables sustituidos por controles segmentados, tarjetas y listas de radio nativas para operación, tipo, estado, tono y longitud.
- Entradas y microinteracciones con transiciones más expresivas, conservando el contraste del texto durante el movimiento.

### Added

- Casa interactiva vectorial con vecino que sale, saluda y vuelve a entrar; gato, ventana iluminada, puerta, jardín y pájaro.
- Activación por ratón, clic, toque o teclado; botón de pausa, respuestas estáticas con movimiento reducido y pistas descartables con Escape.
- Archivos separados motion.css y house.js para el acabado visual y el comportamiento de la ilustración.

- Siete vistas HTML en designs: índice visual, ficha, editor, borradores, ajustes, demo web y estados de interfaz.
- Sistema visual compartido con verde bosque, marfil, salvia y acento arcilla; ilustración vectorial propia sin recursos remotos.
- Interacciones de prototipo: validación, generación determinista sin IA, edición, copia, guardado, búsqueda, renombrado, eliminación y preferencias locales.
- Tratamiento de accesibilidad con HTML semántico, teclado, foco, avisos, reflow y reducción de movimiento.
- Guía de diseños y resultados de revisión automática y funcional del prototipo.

- Estrategia inicial del producto: extensión de Chrome y demo web para preparar anuncios inmobiliarios.
- Stack propuesto alineado con el perfil profesional: Angular, TypeScript y Node.js.
- Plan de arquitectura y estructura objetivo con aplicación explícita de SOLID.
- Requisitos de unitarios AAA, integración, E2E, cobertura y CI.
- Contrato de scripts y configuración de package.json para la entrega inicial.
- README con el estado real del proyecto.

No hay versiones de software publicadas todavía.
