# Servicio de publicación y asistente

Este código está preparado, pero **no está desplegado ni conectado**. La web pública conserva el guardado local hasta que se configure un servicio autenticado.

## Requisitos de activación

- Desplegar el Worker detrás de la autenticación de Sites; no usar un Worker público con cabeceras de identidad aceptadas directamente del cliente.
- Configurar `SITES_PUBLIC_HOST` y `OWNER_EMAIL` para la cuenta editora verificada.
- Configurar `FRONTEND_ORIGIN=https://joelfranqueira.github.io`.
- Configurar `GITHUB_TOKEN` como secreto de servidor con permisos Contents: Read and Write exclusivamente para `joelfranqueira/experiencias-de-vida`. El token no se incluye en el HTML ni en archivos versionados.
- Para IA, configurar `OPENAI_API_KEY` y `OPENAI_MODEL` como valores de servidor. El uso de la API tiene facturación independiente de ChatGPT.
- Completar `EXPERIENCE_SERVICE_ORIGIN` en ambas copias HTML con el origen del servicio y publicar la versión.
- Establecer y verificar la sesión del propietario en el servicio antes de probar guardado desde GitHub Pages. Si el navegador bloquea cookies entre sitios, alojar el editor en el mismo origen que el servicio; no sustituir autenticación por tokens expuestos al navegador.

## Contrato

- `GET /api/status`: autenticación, disponibilidad de publicación e IA y commit actual.
- `POST /api/publish`: recibe `{experiences, expectedCommit}`; valida fichas, escribe los tres archivos en un commit y actualiza `main` únicamente por fast-forward. El éxito confirma el envío a GitHub, no que Pages haya terminado de desplegar.
- `POST /api/draft`: recibe `{story}`; crea un borrador estructurado con la API de OpenAI, sin inventar datos ausentes, e intenta encontrar una imagen pública de referencia en Wikipedia. El usuario revisa antes de guardar.

Antes de habilitar la función, verificar acceso de propietario, rechazo de cuentas ajenas, conflictos entre dos editores, carga con fotos, error y recuperación de API, publicación real en Pages y persistencia al recargar.
