# Tercer nivel exclusivo por subcategoría

La actualización del 24/11/2026 incorpora exactamente las 620 fichas del archivo del usuario, con 50 ediciones, cinco eliminaciones y la foto de Pousada do Vale. El registro `catalogue-import-2026-11-24.json` conserva huellas de entrada por ficha. No ejecutar las antiguas reclasificaciones por ID sobre esta copia.

Las 52 subcategorías vigentes tienen opciones propias en `third-levels.json`. La persistencia es `thirdLevels[categoría][subcategoría] = valor`; solo se guardan rutas activas de la ficha. Una ficha con varias categorías tiene un valor independiente por ruta. Lo desconocido queda Por clasificar.

Restaurantes conserva compatibilidad con `cuisine` y Edificios históricos con `buildingType`. Los demás controles se generan por ruta y no comparten valores entre padres. Filtros, fichas, búsqueda, mapa, editor, exportación e importación usan la misma clasificación. El servicio valida que cada valor corresponda a su categoría y subcategoría.

Pruebas: locations.cjs, taxonomy.cjs, catalogue-review.cjs y third-levels.cjs, además de validateExperiences del servicio. La publicación automática y la IA siguen desconectadas.
