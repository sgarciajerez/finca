# ADR 002: flujo local y adaptadores de persistencia

Fecha: 2026-10-25. Estado: implementado.

Se inyectan dos puertos pequeños: ListingGenerator y DraftRepository. GenerateListing valida la ficha y preferencias antes de invocar el generador; valida también su salida. ExampleListingGenerator usa plantillas deterministas y hechos confirmados, sin enviar datos ni interpretar notas como instrucciones.

SaveDraft recibe fábricas de identidad y reloj. Al actualizar conserva identidad, nombre y fecha de creación; no recrea silenciosamente un borrador que ha desaparecido.

ValidatedDraftRepository valida versiones de esquema, datos y texto. Cada borrador se escribe en una clave independiente: IndexedDB en web y chrome.storage.local en extensión. Las operaciones de IndexedDB esperan a la finalización de la transacción. Chrome solo elimina claves con prefijo propio, conservando datos ajenos. No se añade sincronización ni una base remota.

AssistantStore concentra estado, operaciones asíncronas y mensajes. Los componentes mantienen formularios, navegación y diálogos nativos. Los cambios manuales requieren confirmación antes de ser reemplazados. Los fallos de almacenamiento se comunican sin vaciar el editor.

Quedan fuera de esta entrega las preferencias persistentes, el autoguardado de una sesión y la portada animada en Angular. Los prototipos aprobados siguen disponibles sin modificaciones.
