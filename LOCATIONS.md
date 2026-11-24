# Ubicaciones · revisión del 24/11/2026

Se conservaron las 631 experiencias y todas sus fotos, fechas, acompañantes y eliminaciones anteriores.
De las 107 fichas que no aparecían en el mapa, 99 ahora tienen una referencia de ciudad o zona. También se corrigieron dos ubicaciones erróneas causadas por buscar «caba» dentro de «caballo/caballitos». El mapa reconoce 623 fichas y conserva ocho pendientes sin inventar una sede.

El detalle de cada una de las 107 fichas está en `location-review.json`. `location-repairs.json` permite incorporar solo campos de ubicación a copias locales que todavía coinciden con el registro revisado, conservando ediciones personales y sin restaurar fichas eliminadas. La revisión de publicación se conserva para no reemplazar una copia local con cambios por la semilla publicada.

## Autocompletado

- Diccionario de 34.244 ciudades, procedente de https://download.geonames.org/export/dump/cities15000.zip, descargado el 24/11/2026. Incluye nombres originales, formas sin diacríticos y nombres habituales en español.
- 249 países y territorios con nombres en español (Intl.DisplayNames).
- Resultados mundiales en español mediante https://geocoding-api.open-meteo.com/v1/search?language=es. Traducciones cuando están disponibles; nombres propios originales en los demás casos. El proveedor recibe exclusivamente la consulta del campo ubicación, nunca el relato o los acompañantes.
- La selección guarda coordenadas, país, fuente y precisión. Los puntos son aproximados de ciudad/zona; no son direcciones verificadas de locales.
- Las ciudades del diccionario y lugares del catálogo siguen disponibles si falla la búsqueda en línea. El diccionario necesita descargarse al menos una vez; no se promete un catálogo mundial completo sin conexión en la primera visita.
- Cobertura de ciudades y países, no de todos los establecimientos o domicilios del mundo. Direcciones, barrios y locales pueden escribirse manualmente; Google Maps permite consultarlos aparte.
- No se usa el servidor público Nominatim para autocompletado.

Fuentes y licencia: GeoNames https://www.geonames.org/ (CC BY 4.0 https://creativecommons.org/licenses/by/4.0/), Open-Meteo https://open-meteo.com/en/docs/geocoding-api. Las referencias regionales sin una ciudad en cities15000 están identificadas como aproximadas en el informe.

## Verificación

`node tests/locations.cjs` comprueba arranque, filtros compartidos con el mapa, carga rápida (Banfield, Tokio, Praga y Nairobi), ambigüedad de Osaka, país, coordenadas y conservación de datos personales durante la migración.

Pendientes: #4 baño turco (ciudad), #31 Mundial Rusia (registrar ambas sedes), #185 vuelo con Ciro y Los Pericos (ciudad/aeropuerto), #673 Un tranvía llamado deseo, #674 Rocky, #675 El jefe del jefe, #691 Pucha y #692 Canchero (ciudad/teatro).
