# ADR 001: workspace y primera entrega

Fecha: 2026-10-25. Estado: aceptado para el arranque.

Angular 22 y TypeScript 6, con npm workspaces privados. Se comparten fuentes mediante aliases y exports; no se publican paquetes ni se introduce Nx. Node.js 24 y npm 12 quedan acotados en engines y packageManager.

El mismo componente de ficha se compila en dos aplicaciones Angular. La extensión usa compilación AOT, todos los scripts locales y una política CSP sin eval ni scripts remotos. La optimización de CSS crítico está desactivada para evitar helpers inline en MV3.

La validación se define con Zod en dominio, sin imports de Angular/Express/Chrome. Los casos de uso y los adaptadores se añadirán al implementar el flujo local. ESLint prohíbe dependencias de infraestructura desde dominio y aplicación.

El presupuesto inicial de bundle es 750 kB de aviso y 800 kB de error sin comprimir, para Angular, Reactive Forms, validación y estilos compartidos. El primer build ocupa alrededor de 682 kB (136 kB de transferencia estimada). Se medirá de nuevo al añadir funcionalidad; no se presupone un valor de Lighthouse.

Se conserva la carpeta designs sin reformatear para facilitar la comparación con el trabajo visual aprobado. La portada animada todavía es una maqueta HTML.

La versión mínima de Chrome se fija en 119, coherente con el conjunto Baseline 2026-05-07 usado por Angular 22. Aunque la API sidePanel existe desde Chrome 114, no se anuncia compatibilidad de toda la aplicación con ese navegador anterior. Referencia: https://angular.dev/reference/versions#browser-support.
