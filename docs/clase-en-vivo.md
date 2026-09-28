# Clase de Soy Nacho White

Página: `/clase-en-vivo`. Shopify + Meta Ads, gratuita, domingo 4 de octubre de 2026 a las 18:00 en `America/Santiago` (21:00 UTC). No se ha definido duración ni enlace de reunión.

## Inscripciones

- El formulario envía nombre, correo, consentimiento específico de esta clase y UTM source/medium/campaign a `/api/class-registration`.
- Cada contacto se guarda en Resend, segmento **Soy Nacho White · Shopify + Meta Ads · 04 oct 2026** (`167c49eb-b4b0-41e7-92dd-155457636285`).
- La propiedad `snw_20261004_registration` conserva fecha del registro, nombre, consentimiento y atribución. No sustituye la fecha de alta global de contactos anteriores.
- Las repeticiones conservan la primera inscripción. No se cambia la preferencia global de baja de contactos existentes.
- La confirmación en pantalla aparece después del guardado. Los errores conservan los campos para reintentar. No hay registros simulados.
- La inscripción cierra al comienzo de la clase. El archivo `.ics` no inventa una hora de término ni una URL de reunión.
- Honeypot, validación en servidor, límite de tamaño y comprobación de origen. Hay un límite por IP con memoria acotada por instancia; no es un límite distribuido. Para campañas masivas, configurar también una regla de rate limiting en el firewall de Vercel para este endpoint.
- Se puede consultar/exportar la lista desde Audience en Resend filtrando este segmento. No compartir el listado de asistentes públicamente.

## Configuración

Vercel, proyecto `intothecom`, equipo `ignacios-projects-91899df9`:

- `RESEND_CONTACTS_API_KEY`: secreto independiente para contactos; Resend requiere Full access. Creación y almacenamiento autorizados por Ignacio. La clave original de envío no se modifica.
- `LIVE_CLASS_SEGMENT_ID`: ID del segmento anterior.
- `scripts/setup-live-class.js` provisiona el segmento y la propiedad de forma idempotente sólo cuando `LIVE_CLASS_SETUP=1`. Los builds normales no provisionan nada.

## Comunicaciones pendientes

Esta entrega **guarda inscripciones y muestra la confirmación en pantalla**. El endpoint no envía emails ni programa recordatorios. Tampoco crea una reunión de Zoom/Meet o cambia el nombre de Skool.

Antes de la clase hay que definir el enlace y enviar el acceso a los inscritos. La pregunta sobre Google Meet/Zoom está pendiente. No enviar campañas ni invitaciones generales sin autorización de Nacho.

Texto propuesto de confirmación (aún no enviado):

> Asunto: Tu clase de Shopify + Meta Ads · domingo 4 de octubre
>
> ¡Ya estás en la lista! Nos vemos el domingo 4 de octubre a las 18:00, hora de Chile (Santiago), en la clase gratuita de Shopify + Meta Ads con Nacho. El acceso a la reunión se compartirá antes de la clase. Guarda la fecha: https://www.intothecom.com/clase-en-vivo. Si necesitas corregir tus datos, responde a ignacio@intothecom.com.

## Verificación

`npm run test:class` comprueba guardado, consentimiento, duplicados, preferencias de baja, fallos parciales, conflictos concurrentes, origen, datos inválidos, honeypot, tamaño y cierre por fecha. `npm run build` verifica el sitio existente. La comprobación real usa un correo reservado `example.com`, verifica contacto/segmento/propiedad y elimina exclusivamente ese registro de prueba; no envía mensajes.
