# FINCA · Diseños de referencia

Prototipo HTML/CSS/JavaScript creado el 23/10/2026. Base visual y de comportamiento para la posterior implementación Angular; no es una extensión instalable.

## Vistas

| Archivo | Propósito |
| --- | --- |
| [index.html](./index.html) | Presentación de la identidad y acceso a todas las vistas. |
| [inmueble.html](./inmueble.html) | Panel lateral: ficha, extras confirmados y validación. |
| [anuncio.html](./anuncio.html) | Panel lateral: editor, ajustes del ejemplo, guardado y copia. |
| [borradores.html](./borradores.html) | Biblioteca, búsqueda, renombrado, eliminación y estados vacíos. |
| [ajustes.html](./ajustes.html) | Preferencias y borrado de los datos del prototipo. |
| [demo.html](./demo.html) | Flujo web con ficha y vista previa; adaptable a móvil. |
| [estados.html](./estados.html) | Referencias de bienvenida, espera, error, límite, portal no compatible y biblioteca vacía. |

## Previsualización

Puedes abrir index.html directamente. Para comprobar todos los comportamientos, usar HTTP local: el almacenamiento entre archivos file:// no es uniforme entre navegadores y el portapapeles puede requerir un contexto seguro y permiso.

Desde la raíz del proyecto:

```powershell
python -m http.server 4173 --bind 127.0.0.1 --directory designs
```

Abrir http://127.0.0.1:4173/ y detener el servidor con Ctrl+C al terminar. También sirve cualquier servidor estático local equivalente. No se requiere compilación, CDN, fuentes externas ni instalación de paquetes para estas vistas.

## Recorrido de revisión

1. Abrir la ficha, introducir una superficie negativa e intentar continuar: aparece un resumen enlazado y el error junto al campo.
2. Corregir la ficha y preparar el anuncio: se genera un ejemplo determinista sin IA.
3. Editar el texto, intentar actualizarlo y cancelar el reemplazo: se conserva lo escrito.
4. Guardar, abrir Borradores, renombrar, buscar, recuperar y eliminar un borrador.
5. Cargar los ejemplos ficticios si se quiere ver la biblioteca con contenido.
6. Cambiar preferencias, recargar y verificar su conservación.
7. Repetir el flujo en demo.html y con viewport estrecho.
8. En Ajustes, eliminar los datos para volver al estado inicial.

## La casa interactiva

En index.html, explora la ventana superior izquierda para saludar al vecino, la ventana con flores para encender la luz, la puerta, la ventana inferior derecha para descubrir al gato, el árbol y el sol para ver pasar un pájaro.

También puedes usar Tab para recorrer las seis zonas y Enter o Espacio para activarlas. Las pistas se pueden descartar con Escape. En móvil basta con tocar. El botón «Pausar animaciones» detiene y restablece la escena; al reanudar, puedes volver a activar los detalles.

Hay un único saludo de bienvenida, de menos de cinco segundos. Las demás sorpresas necesitan exploración: no hay un bucle de eventos automático permanente. La escena responde de forma estática al activar controles cuando el sistema o las preferencias del prototipo solicitan movimiento reducido; no se activa por hover en ese modo.

El acabado se organiza en `assets/motion.css` y el controlador de la casa en `assets/house.js`. El dibujo es SVG integrado en HTML, sin vídeo ni recursos externos. Los desplegables se han sustituido por radios nativos presentados como segmentos, tarjetas o listas: conservan el manejo habitual con Tab y flechas.

## Sistema visual

Tokens CSS en `assets/styles.css`:

- Verde bosque `#173F35`: marca, acciones y texto destacado.
- Marfil `#F5F3EB` y papel `#FFFEFA`: fondos.
- Salvia `#E2E9DC`: selecciones y superficies suaves.
- Piedra `#E9E8DF`: detalles y separadores decorativos.
- Arcilla `#934C2C`: acentos editoriales.
- Texto `#202E29`, secundario `#59645B` y foco azul `#185BCC`.

Tipografía de sistema para controles y Georgia para títulos. Los iconos SVG decorativos se ocultan del árbol de accesibilidad y las acciones conservan un nombre textual.

## Separación al migrar a Angular

- Extraer el contenedor del panel, navegación, formulario, resumen, editor, avisos y tarjetas de borrador como componentes.
- Mantener los tokens y revisar tamaños dentro del panel nativo real.
- Convertir la ficha a Reactive Forms y los estados a servicios/Signals.
- Separar plantilla de generación, persistencia y UI mediante los puertos de la estrategia.
- Sustituir localStorage por los adaptadores chrome.storage.local / IndexedDB previstos.
- Reemplazar las plantillas por una API de generación al implementar el backend.
- Llevar los flujos verificados a las suites Vitest AAA y Playwright del producto.

## Límites intencionados

Los textos se obtienen de plantillas locales y las notas libres no se incorporan a la descripción. No hay IA real, datos extraídos de portales, publicación, inserción en formularios externos ni sincronización entre dispositivos. Los estados de error y carga son referencias visuales, no una conexión activa. Las interacciones locales de la demo sí guardan datos reales en el navegador.

Consulta [ACCESIBILIDAD.md](./ACCESIBILIDAD.md) para el alcance de la revisión.
