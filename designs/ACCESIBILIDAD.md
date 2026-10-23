# Revisión de accesibilidad del prototipo

Fecha: 23/10/2026. Alcance: HTML de designs, no extensión instalada ni aplicación Angular.

## Objetivo

Diseñar con referencia a WCAG 2.2 AA. No es una certificación ni una evaluación completa de conformidad.

## Comprobaciones realizadas

- Chromium mediante Playwright: siete vistas cargadas sin errores JavaScript.
- axe-core mediante @axe-core/playwright: cero violaciones detectadas con etiquetas wcag2a, wcag2aa, wcag21aa y wcag22aa en los estados iniciales de las siete páginas.
- Auditoría adicional del formulario con errores visibles y del diálogo de reemplazo: cero violaciones detectadas.
- Escape cierra el diálogo y devuelve el foco al botón que lo abrió.
- Comprobación de reflow a 320, 390, 768 y 1440 píxeles CSS: sin desbordamiento horizontal de documento.
- Enlace para saltar al contenido activable con teclado y foco trasladado al contenido principal.
- Preferencia de movimiento reducido: el indicador de carga deja de animarse.
- Identificadores HTML únicos y referencias locales a archivos existentes.
- Revisión visual de capturas de escritorio y móvil.

Flujos funcionales verificados: datos inválidos y corrección, generación local, edición protegida frente a reemplazo, copia al portapapeles, guardado y persistencia tras recarga, búsqueda, renombrado, eliminación con cancelación, carga de ejemplos, preferencias y demo web.

## Contraste de tokens

Cálculo sRGB con luminancia relativa. Las combinaciones de texto de esta tabla superan 4.5:1. Borde de control y foco se evalúan como elementos no textuales frente al fondo indicado, con referencia mínima 3:1.

| Combinación | Colores | Ratio |
| --- | --- | --- |
| Texto / marfil | #202e29 / #f5f3eb | 12.74:1 |
| Texto secundario / marfil | #59645b / #f5f3eb | 5.56:1 |
| Botón / papel | #173f35 / #fffefa | 11.57:1 |
| Texto / salvia | #173f35 / #e2e9dc | 9.41:1 |
| Arcilla / marfil | #934c2c / #f5f3eb | 5.71:1 |
| Borde de control / papel | #7b8478 / #fffefa | 3.84:1 |
| Foco / papel | #185bcc / #fffefa | 6.11:1 |

## Decisiones incorporadas

- HTML semántico: landmarks, jerarquía de títulos, enlaces para navegación y botones para acciones.
- Etiquetas visibles y agrupaciones con fieldset/legend; placeholders no usados como etiquetas.
- Errores resumidos con enlaces al campo, aria-invalid y descripción individual.
- Diálogos nativos con título accesible, cancelación y gestión de foco.
- Notificaciones locales mediante role=status, sin depender únicamente del color.
- Estados seleccionados expresados mediante controles nativos y aria-current en navegación.
- Foco azul con contorno y separación respecto al control.
- Controles principales de al menos 44 píxeles de alto y zonas clicables amplias.
- SVG decorativos ocultos de tecnologías de asistencia.
- Soporte de prefers-reduced-motion y tratamiento de forced-colors.
- Sin desplazamientos automáticos animados obligatorios ni interacciones exclusivas de hover.

## Pendiente de revisión manual

- Lectura real con NVDA/Chrome y VoiceOver/Safari, especialmente errores, avisos y diálogos.
- Ampliación y espaciado de texto con preferencias de usuario; el reflow medido no sustituye todas estas pruebas.
- Alto contraste de Windows en una sesión real y con distintos ajustes de color.
- Recorrido exhaustivo de teclado de todas las acciones y evaluación con usuarios.
- Apertura y comportamiento en el panel nativo de Chrome cuando exista la extensión.
- Validaciones adicionales al migrar a Angular y al incorporar IA y portales reales.

Fuente de criterios: https://www.w3.org/WAI/WCAG22/quickref/

La ausencia de hallazgos automáticos no demuestra conformidad completa; las limitaciones anteriores siguen vigentes.


## Segunda revisión: movimiento y selección

Revisión tras incorporar la casa interactiva y sustituir los desplegables por radios nativos:

- Repetida la auditoría de las siete páginas con las mismas etiquetas: cero violaciones detectadas.
- Flujo de ficha, editor, borradores, preferencias y demo verificado tras el cambio de controles.
- Navegación de venta a alquiler con flecha derecha; tipo y estado seleccionados conservados en el texto de salida.
- Seis zonas de la casa activadas con teclado y descripciones correspondientes comprobadas.
- Secuencia real del saludo: personaje visible, animación de mano activa y retorno al interior al terminar.
- Pausa, reanudación y modo de movimiento reducido comprobados. En movimiento reducido no se ejecuta el saludo automático y la activación explícita muestra una pose estática.
- Versión móvil a 320 px sin desbordamiento, activación por clic/toque y auditoría automática sin hallazgos.
- Las entradas de texto e interfaz animan su posición sin desvanecer el texto: se conserva el contraste durante la transición.
- Las pistas de la casa son descartables con Escape y su superficie admite hover.

Los tests de la casa y el editor no produjeron errores JavaScript. Se mantienen pendientes las evaluaciones manuales de tecnologías de asistencia descritas arriba. La ilustración es decorativa para el lector de pantalla; sus acciones tienen controles HTML con nombre y un mensaje de estado textual.
