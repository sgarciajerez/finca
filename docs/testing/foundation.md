# Verificación de la base técnica

Fecha: 2026-10-25.

- 14 tests unitarios AAA: reglas, normalización, límites, datos desconocidos y entradas malformadas.
- Cobertura del módulo de dominio inicial: 100% en líneas, funciones, sentencias y ramas.
- 2 pruebas de integración: salud de API y ausencia del endpoint de generación todavía no implementado.
- 3 E2E: validación y conservación de datos; teclado, reflow a 320 px y axe; carga del paquete MV3 y ejecución de la ficha en su origen real.
- Build de producción web, extensión y API; tipos de código/plantillas; ESLint y Prettier.

Las pruebas de extensión comprueban getPanelBehavior y getOptions en el service worker real. La apertura del panel desde el icono del navegador sigue siendo una verificación manual. No se ha probado publicación en portales.

Comando reproducible completo: npm run verify. El informe HTML de Playwright se genera en playwright-report y la cobertura en coverage; ambos son artefactos ignorados por Git y adjuntos en CI.
