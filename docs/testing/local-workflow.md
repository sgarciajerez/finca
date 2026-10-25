# Verificación del flujo local

Fecha: 2026-10-25.

## Suites

- 38 unitarios de dominio, aplicación y repositorio, con secciones Arrange / Act / Assert.
- 5 unitarios Angular TestBed: validación del formulario, emisión de datos confirmados, conservación ante fallo de generación/guardado y protección contra un guardado duplicado concurrente.
- 2 pruebas de integración HTTP.
- 8 E2E de Playwright: web y paquete MV3 real, persistencia tras recarga, renombrado, búsqueda, eliminación/cancelación, cambios protegidos, fallo de IndexedDB y auditorías axe de formulario/editor/biblioteca/diálogo a 320 px.

El test de extensión verifica que vaciar borradores conserva una clave ajena al prefijo de FINCA. La apertura del panel desde el icono nativo sigue pendiente de verificación manual; se prueban la configuración de sidePanel y la página del panel bajo un origen real chrome-extension.

Cobertura medida de dominio y aplicación: 100% en líneas, funciones, ramas y sentencias. No es cobertura de toda la interfaz ni de todos los adaptadores; sus recorridos principales se prueban por TestBed y E2E. Las comprobaciones de accesibilidad automáticas no equivalen a una auditoría manual completa con lector de pantalla.

Build actual aproximado: 720 kB sin comprimir en web y 719 kB en extensión; transferencia estimada de 145 kB. Presupuesto configurado: aviso a 750 kB y error a 800 kB.

Comando completo: npm run verify. La documentación y los comandos se comprueban junto con los builds. La generación es determinista sin IA: no se han evaluado respuestas de un proveedor real.
