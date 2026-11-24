# Tercer nivel exclusivo por subcategoría

La actualización del 24/11/2026 incorpora exactamente las 620 fichas del archivo del usuario, con 50 ediciones, cinco eliminaciones y la foto de Pousada do Vale. El registro `catalogue-import-2026-11-24.json` conserva huellas de entrada por ficha. No ejecutar las antiguas reclasificaciones por ID sobre esta copia.

Las 52 subcategorías vigentes tienen opciones propias en `third-levels.json`. La persistencia es `thirdLevels[categoría][subcategoría] = valor`; solo se guardan rutas activas de la ficha. Una ficha con varias categorías tiene un valor independiente por ruta. Lo desconocido queda Por clasificar.

Restaurantes conserva compatibilidad con `cuisine` y Edificios históricos con `buildingType`. Los demás controles se generan por ruta y no comparten valores entre padres. Filtros, fichas, búsqueda, mapa, editor, exportación e importación usan la misma clasificación. El servicio valida que cada valor corresponda a su categoría y subcategoría.

Pruebas: locations.cjs, taxonomy.cjs, catalogue-review.cjs y third-levels.cjs, además de validateExperiences del servicio. La publicación automática y la IA siguen desconectadas.

## Revisión solicitada el 24/11/2026 · versión 6.4

Esta decisión reemplaza la regla anterior de tener un tercer nivel en todas las subcategorías. Quedan 55 subcategorías. Espectáculos, Recitales y Alojamientos ya no tienen Tipo; tampoco Bares y coctelerías ni Bodegas. Running conserva solo Carreras oficiales y Entrenamientos. Se agregan Rock Nacional, Rock Internacional, Airbnb, Cervecerías, Restobar, Heladerías y Buceo y snorkel. Hoteles reúne hoteles, resorts y posadas/cabañas; Hostel & B2B reúne hostels y hostales, usando el rótulo de la solicitud.

La migración `migrateSegments20261124` es idempotente y se aplica también a las copias guardadas en el navegador y a las importaciones. Conserva las 620 fichas, sus campos personales y fotos. Guarda la clasificación anterior en `classificationHistory`, y el detalle queda en `segmentation-review-2026-11-24.json`. Buceo y snorkel también se puede encontrar desde Actividades y excursiones sin quitar Deportes. Básquet y Rugby siguen en Eventos deportivos.

La interfaz muestra países y categorías como filtros complementarios. Un clic reemplaza las opciones del mismo nivel; Shift/Ctrl/Cmd o Selección múltiple permite combinar. Seleccionar todas y Anular selección son acciones pequeñas fuera de la lista. Sin selección, el nivel no restringe resultados. Las subcategorías y tipos se distribuyen horizontalmente, con iconos SVG independientes de las fuentes del equipo. Las fichas mantienen nombres solo en categorías principales y describen los otros iconos mediante etiquetas accesibles y ayuda al apuntarlos. El mapa conserva sus puntos y colores, sin leyenda de categorías.

Cada ficha admite una calificación entera de 0 a 5; lo no calificado queda sin nota. Las estrellas y el editor guardan `rating` en los datos del navegador y en los respaldos. La publicación automática sigue pendiente de conexión: las notas personales todavía no se sincronizan solas entre dispositivos.

Verificaciones adicionales: `node tests/segmentation.cjs`, validación del Worker y revisión de filtros, iconos y estrellas en navegador de escritorio. Las decisiones anteriores se conservan como historial.
