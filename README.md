# FINCA

Asistente para preparar anuncios inmobiliarios mediante una extensión de Chrome y una demo web.

## Estado

Proyecto en fase de diseño. Existen la estrategia, la documentación base y siete vistas HTML navegables en `designs/`, con estilos compartidos y acciones locales de demostración. Todavía no hay aplicación Angular, backend, package.json de la aplicación ni integración validada con portales. La verificación automatizada realizada sobre las maquetas no sustituye las futuras suites de la aplicación.

## Explorar los diseños

Abre [designs/index.html](./designs/index.html) para recorrer las vistas. Para comprobar almacenamiento entre páginas y portapapeles, se recomienda servir la carpeta por HTTP local:

```powershell
cd D:\Proyectos\finca
python -m http.server 4173 --bind 127.0.0.1 --directory designs
```

Después abre `http://127.0.0.1:4173/`. Python es una opción para previsualizar los diseños, no una dependencia del producto final.

Consulta [la guía de diseños](./designs/README.md) y [la revisión de accesibilidad](./designs/ACCESIBILIDAD.md).

## Producto previsto

Panel lateral, ficha del inmueble, generación y edición de texto, historial local de borradores y copia al portapapeles. La demo permitirá probar el recorrido con datos ficticios sin registro. La inserción en idealista y Fotocasa será posterior y dependerá de validación técnica y condiciones aplicables.

## Stack propuesto

Angular, TypeScript, Node.js y Express; Chrome Manifest V3; Vitest y Playwright. Persistencia local mediante adaptadores para Chrome e IndexedDB.

## Requisitos de ingeniería

- Tests unitarios con patrón Arrange / Act / Assert.
- Tests de integración y E2E web y extensión.
- Principios SOLID con dominio independiente de frameworks y adaptadores inyectados.
- TypeScript estricto, lint, formato, scripts reproducibles y CI.
- README y CHANGELOG mantenidos con cada entrega relevante.

## Documentación

- [Estrategia de desarrollo](./ESTRATEGIA_DESARROLLO.md): alcance, arquitectura, entregas y criterios de calidad.
- [Historial de cambios](./CHANGELOG.md): cambios realizados.

## Instalación y ejecución

La aplicación Angular y la extensión instalable están pendientes de la entrega 0. Sus requisitos de Node.js, variables, instalación, comandos y carga se añadirán cuando estén implementados y verificados. Los HTML de diseño se pueden previsualizar con el comando indicado arriba.

## Portfolio

Se prepararán demo pública, capturas reales, vídeo y caso de estudio. No hay despliegue ni soporte de portales que se pueda anunciar en este momento.
