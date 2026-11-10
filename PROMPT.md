# PROMPT MAESTRO CONSOLIDADO
## Prueba técnica — Desarrollador Full-Stack y Especialista en IA
### Unión Andina de Transportes

**Herramienta de desarrollo:** Claude Code  
**Metodología:** Vibe Coding con especificaciones funcionales, implementación asistida, pruebas y auditoría independiente mediante Codex.

---

# 1. OBJETIVO GENERAL

Actúa como un desarrollador Full-Stack Senior, arquitecto frontend, especialista en visualización de datos y aseguramiento de calidad.

Desarrolla una aplicación web profesional, funcional y responsiva que permita cargar un archivo Excel de operaciones de transporte, procesar su información y visualizarla mediante un dashboard interactivo.

La aplicación debe cumplir los requisitos de la prueba técnica de Unión Andina de Transportes y demostrar el uso práctico de Vibe Coding para construir una solución funcional en un tiempo limitado.

El dashboard debe permitir comprender rápidamente el comportamiento operativo y financiero de los registros suministrados.

La solución debe ser clara, mantenible, modular y suficientemente robusta para manejar archivos con información incompleta o incorrecta.

No construir funcionalidades innecesarias que comprometan el alcance de la evaluación.

# 2. CONTEXTO DE LA PRUEBA

La evaluación contempla:

- Desarrollo de un dashboard utilizando datos de Excel.
- Mínimo tres indicadores clave.
- Mínimo una gráfica.
- Tabla de registros.
- Mínimo un filtro funcional.
- Entrega del código fuente o enlace a la aplicación.
- Identificación de la herramienta utilizada para Vibe Coding.
- Presentación de aproximadamente diez minutos.
- Espacio de preguntas y respuestas de aproximadamente cinco minutos.

El tiempo asignado para el desarrollo es de tres horas, contado desde la confirmación de recepción del correo de la prueba.

Priorizar la funcionalidad y los requisitos evaluables antes de cualquier mejora opcional.

# 3. STACK TECNOLÓGICO

Utilizar:

- React.
- TypeScript.
- Vite.
- Tailwind CSS v4.
- Recharts para las visualizaciones.
- Una biblioteca adecuada para leer archivos Excel, como SheetJS.
- Vitest para pruebas automatizadas.
- Git y GitHub para control de versiones.
- Netlify para el despliegue.

No implementar backend, base de datos, autenticación ni servicios de inteligencia artificial en producción, porque no son necesarios para el alcance.

El procesamiento del Excel debe realizarse localmente en el navegador.

Evitar dependencias innecesarias.

# 4. ESTRUCTURA Y ARQUITECTURA

Organizar el código de forma modular, separando:

- Componentes visuales.
- Páginas y composición principal.
- Tipos e interfaces.
- Lectura del Excel.
- Validación de datos.
- Normalización de registros.
- Deduplicación.
- Cálculo de indicadores.
- Lógica de filtros.
- Gráficos.
- Tabla.
- Estados de importación.
- Textos de interfaz.
- Configuración visual.
- Pruebas automatizadas.

Aplicar buenas prácticas de React y TypeScript.

Evitar componentes excesivamente grandes y lógica de negocio duplicada.

Separar la lógica de procesamiento de la presentación.

No utilizar valores simulados para aparentar que existen datos reales.

# 5. IDENTIDAD CORPORATIVA

Construir una interfaz moderna y profesional, alineada con la identidad de Unión Andina de Transportes.

Utilizar el logo original proporcionado.

No recrear, redibujar ni modificar la identidad gráfica de la empresa.

Tomar como referencia los siguientes colores corporativos:

- Verde principal: `#008D36`.
- Verde oscuro: `#006633`.
- Amarillo: `#FFCA00`.
- Naranja o amarillo oscuro: `#F6A400`.

Complementar con colores semánticos:

- Rojo para errores.
- Ámbar para advertencias.
- Azul para información.
- Grises para superficies, bordes y textos secundarios.

Centralizar colores, espaciados y estilos reutilizables mediante variables o tokens CSS.

Mantener contraste, legibilidad, consistencia y jerarquía visual.

# 6. CENTRALIZACIÓN DE TEXTOS

Todos los textos visibles de la aplicación deben estar centralizados en un archivo JSON.

Incluir:

- Títulos.
- Subtítulos.
- Descripciones.
- Botones.
- Etiquetas.
- Placeholders.
- Mensajes de carga.
- Mensajes de error.
- Advertencias.
- Estados vacíos.
- Confirmaciones.
- Textos de indicadores.
- Etiquetas de gráficos.
- Textos de tabla.
- Mensajes de validación.
- Etiquetas de accesibilidad.
- Mensajes dinámicos parametrizados.

Evitar textos funcionales dispersos directamente en componentes JSX.

Crear un mecanismo sencillo y reutilizable para consultar las traducciones o textos.

La interfaz debe estar en español.

# 7. PANTALLA INICIAL

Al abrir la aplicación, mostrar una pantalla de bienvenida corporativa.

Debe incluir:

- Logo original.
- Nombre de la empresa.
- Presentación breve del dashboard.
- Instrucciones claras.
- Área para seleccionar o arrastrar un archivo Excel.
- Estados de carga.
- Mensajes de error o advertencia.

No mostrar inicialmente registros ficticios, indicadores inventados ni gráficas con información simulada.

El dashboard debe activarse únicamente cuando exista un conjunto de datos confirmado.

Si existe una opción de cargar datos de demostración, debe identificarse claramente como demostración.

# 8. CONTRATO DEL ARCHIVO EXCEL

Utilizar como referencia el archivo suministrado para la prueba.

El libro de referencia contiene tres hojas:

- `Datos`.
- `Diccionario`.
- `Leer_primero`.

La hoja de datos contempla 16 columnas.

Leer el diccionario y las instrucciones del libro para determinar:

- Nombres exactos de columnas.
- Tipos de datos.
- Campos obligatorios.
- Campos opcionales.
- Dominios de valores.
- Unidades monetarias.
- Reglas de identificación.
- Interpretación de fechas.
- Reglas de cálculo.

No inventar nombres de columnas ni cambiar silenciosamente el contrato.

Validar que estén presentes las 16 columnas requeridas antes de procesar los registros.

Permitir valores nuevos en campos abiertos, como ciudades, clientes o servicios, siempre que respeten el contrato.

No restringir arbitrariamente los filtros a los valores del Excel de ejemplo.

# 9. CARGA Y VALIDACIÓN DEL EXCEL

Implementar un flujo de importación seguro y comprensible.

Etapas:

1. Seleccionar o arrastrar archivo.
2. Validar formato.
3. Validar tamaño.
4. Leer el libro.
5. Verificar las hojas y columnas requeridas.
6. Procesar los registros.
7. Validar los valores.
8. Detectar duplicados.
9. Preparar un resumen de importación.
10. Permitir confirmar o cancelar.
11. Actualizar el dashboard solo después de confirmar.

No reemplazar inmediatamente los datos actuales al seleccionar un archivo.

Si la carga falla, el archivo es rechazado o el usuario cancela, conservar el conjunto de datos previamente confirmado.

Mostrar indicadores de procesamiento y mensajes comprensibles.

# 10. RESUMEN DE IMPORTACIÓN

Antes de confirmar la importación, mostrar información suficiente para entender qué se cargará.

Distinguir:

- Total de registros leídos.
- Registros únicos.
- Registros utilizables.
- Registros sin incidencias.
- Registros con incidencias.
- Registros excluidos.
- Duplicados descartados.
- Total de advertencias.
- Total de errores.

No confundir cantidad de incidencias con cantidad de filas afectadas.

Un registro con tres advertencias debe contarse como un registro con incidencias y tres advertencias.

Cuando exista un error o advertencia, identificar:

- Hoja.
- Número de fila.
- Columna o campo.
- Motivo.
- Severidad.

Evitar mensajes que afirmen que los datos están completamente limpios cuando existen valores incorrectos o vacíos.

# 11. REEMPLAZO DE ARCHIVOS

Cada nueva importación confirmada debe reemplazar completamente el conjunto anterior.

No acumular registros de archivos diferentes.

Después de confirmar un nuevo archivo:

- Reemplazar los registros.
- Recalcular los indicadores.
- Reconstruir las opciones de filtros.
- Reiniciar los filtros anteriores.
- Reiniciar búsqueda y paginación.
- Actualizar los gráficos.
- Actualizar la tabla.
- Mostrar confirmación de carga.

Evitar dobles confirmaciones accidentales.

Si el usuario cancela o la nueva carga falla, conservar intacto el dashboard anterior.

# 12. OPERACIONES DUPLICADAS

Identificar las operaciones mediante `ID_Operacion`.

Verificar en el diccionario del Excel si este identificador debe ser único.

Cuando se confirme la unicidad:

- Conservar la primera aparición.
- Identificar apariciones posteriores del mismo ID.
- Descartar duplicados de los cálculos.
- Mostrar advertencias.
- Señalar especialmente los duplicados con contenido diferente.

No inventar una clave compuesta sin evidencia del contrato.

No eliminar silenciosamente registros legítimos.

# 13. OPERACIONES SIN IDENTIFICADOR

Los registros sin `ID_Operacion` no pueden identificarse, rastrearse ni deduplicarse correctamente.

Excluirlos del conjunto utilizable cuando el contrato establezca el identificador como obligatorio.

Mostrar claramente:

- Cantidad de registros excluidos.
- Filas afectadas.
- Motivo de exclusión.

No permitir que estos registros contaminen indicadores, filtros, gráficos ni totales.

Si no queda ningún registro utilizable, informar que el archivo no puede cargarse como conjunto válido.

# 14. NORMALIZACIÓN Y VALIDACIÓN DE DATOS

Validar cada campo conforme al diccionario.

Distinguir:

- Valores válidos.
- Valores vacíos.
- Valores incorrectos.
- Campos opcionales.
- Campos obligatorios.
- Valores fuera del dominio permitido.

No convertir automáticamente un valor incorrecto en cero.

No inventar información faltante.

Conservar los valores originales cuando sea necesario para trazabilidad y comparación.

Aplicar validación numérica con `Number.isFinite`.

Evitar que `NaN`, `Infinity` u otros valores no finitos contaminen los cálculos.

# 15. TRATAMIENTO DE FECHAS

Interpretar correctamente las fechas del Excel.

Aceptar fechas numéricas de serie de Excel y formatos textuales válidos conforme al contrato.

Considerar los sistemas de fechas:

- Excel 1900.
- Excel 1904.

Contemplar la particularidad del día ficticio 29/02/1900 en el sistema 1900.

Validar:

- Año.
- Mes.
- Día.
- Años bisiestos.
- Fechas imposibles.
- Fechas vacías.
- Formatos incorrectos.

No permitir que una fecha como `2025-02-31` se convierta silenciosamente en otra fecha.

Mostrar las fechas en formato colombiano:

`DD/MM/AAAA`

Evitar desplazamientos de fecha por conversiones de zona horaria.

Mantener un formato interno normalizado que permita ordenar y procesar correctamente los registros.

No mostrar números de serie de Excel directamente al usuario.

# 16. INDICADORES KPI

Implementar al menos tres KPI, preferiblemente cinco, según la información disponible:

1. Cantidad de operaciones.
2. Total de ingresos.
3. Total de costos.
4. Margen o utilidad calculada.
5. Cumplimiento de SLA.

Los KPI deben recalcularse al aplicar filtros.

No utilizar cifras estáticas.

Mostrar formatos monetarios adecuados para pesos colombianos.

Utilizar nombres, unidades y descripciones comprensibles.

# 17. REGLAS FINANCIERAS

Calcular el margen mediante:

`Margen calculado = Ingresos - Costos`

Mantener coherencia entre:

- KPI.
- Tabla.
- Gráficos.
- Totales filtrados.

Si el Excel contiene `Margen_COP`, conservar el valor informado y compararlo con el calculado.

Si existe una discrepancia, mostrar una advertencia.

No sustituir silenciosamente el valor original.

Cuando existan datos financieros incompletos:

- Sumar los ingresos válidos disponibles.
- Sumar los costos válidos disponibles.
- Calcular margen únicamente en registros con ingresos y costos válidos.
- No descartar ingresos válidos por ausencia de costos.
- No descartar costos válidos por ausencia de ingresos.
- Evitar presentar `$0` cuando no existe información suficiente.
- Mostrar `N/D` cuando corresponda.
- Informar la base de registros utilizada en cada indicador.

Documentar que los totales generales de ingresos y costos pueden tener bases diferentes y, por ello, su resta puede diferir del margen calculable.

Aplicar la misma política en los gráficos.

# 18. GRÁFICOS

Implementar visualizaciones mediante Recharts.

Incluir al menos:

- Un gráfico financiero.
- Un gráfico de distribución de operaciones por estado.

Los gráficos deben:

- Responder a los filtros.
- Utilizar los mismos registros y reglas que los KPI.
- Mostrar etiquetas y leyendas comprensibles.
- Adaptarse a diferentes tamaños de pantalla.
- Manejar conjuntos vacíos.
- Evitar valores inválidos.
- Respetar la identidad visual.

No mostrar gráficos con cifras ficticias cuando no haya datos cargados.

# 19. FILTROS DINÁMICOS

Implementar cuatro filtros principales:

1. Ubicación geográfica, ciudad o zona según el contrato real.
2. Cliente.
3. Tipo de servicio.
4. Estado de operación.

Las opciones deben derivarse del conjunto de datos confirmado.

No dejar ciudades, clientes o servicios escritos de forma fija en el código.

Los filtros deben combinarse mediante lógica AND.

Todos los KPI, gráficos y registros deben responder a la misma selección.

Incluir una acción para limpiar todos los filtros.

Mostrar un estado vacío cuando ninguna operación coincida.

Al reemplazar el Excel, reconstruir las opciones y reiniciar la selección.

# 20. TABLA DE REGISTROS

Implementar una tabla con los datos operativos relevantes.

Debe incluir:

- Encabezados claros.
- Fechas legibles.
- Formato monetario.
- Estado de operación.
- Margen calculado.
- Búsqueda.
- Paginación.
- Estados vacíos.
- Comportamiento responsivo.

La tabla debe responder a los mismos filtros que los indicadores y gráficos.

No mostrar un margen diferente al utilizado en el KPI sin explicar expresamente su origen.

Cuando el margen informado y el calculado difieran, señalarlo.

# 21. EXPERIENCIA DE USUARIO

Incluir:

- Estados de carga.
- Mensajes de éxito.
- Mensajes de error.
- Advertencias.
- Estados vacíos.
- Confirmaciones.
- Botones deshabilitados durante operaciones incompatibles.
- Protección contra doble confirmación.
- Diseño responsivo.
- Navegación clara.
- Indicaciones comprensibles para usuarios no técnicos.

Evitar bloqueos visuales y comportamientos inesperados.

Priorizar una experiencia sencilla para presentar el dashboard durante la evaluación.

# 22. ACCESIBILIDAD

Garantizar accesibilidad básica.

Para el modal de importación:

- Usar una estructura semántica apropiada.
- Mover el foco al interior cuando se abre.
- Contener la navegación Tab y Shift+Tab.
- Permitir Escape cuando corresponda.
- Restaurar el foco al elemento que abrió el modal.
- Mantener etiquetas accesibles.
- Evitar que el modal permanezca abierto o reaparezca sin intención del usuario.

Revisar contraste, navegación mediante teclado y mensajes accesibles.

# 23. ARCHIVOS GRANDES Y RENDIMIENTO

Definir límites razonables para proteger la aplicación.

Como política implementada y documentada:

- Tamaño máximo de archivo: 5 MiB.
- Máximo de registros: 10.000.

Rechazar archivos que excedan los límites con mensajes claros.

No truncar silenciosamente registros.

Evitar bloquear innecesariamente la interfaz.

No introducir Web Workers u otra complejidad adicional sin necesidad demostrada.

# 24. ESCENARIOS DE PRUEBA

Verificar el comportamiento con:

**Archivo de referencia**

- Las 16 columnas esperadas.
- Las tres hojas de referencia.
- Registros y cálculos reales del archivo.

**Escenario 1 — Reemplazo y ciudades válidas**

- Nuevas ciudades: Cali, Cartagena y Medellín.
- Reconstrucción de opciones de filtros.
- Reemplazo completo del dataset.
- Recálculo de indicadores.
- Reinicio de filtros.

**Escenario 2 — Duplicados y campos incorrectos**

- Operaciones duplicadas.
- Valores vacíos o inválidos.
- Advertencias.
- Exclusiones.
- Cálculos con importes parciales.
- Fechas almacenadas como números de Excel.

No modificar los archivos de prueba para forzar resultados favorables.

Si no están disponibles, documentar la limitación.

# 25. PRUEBAS AUTOMATIZADAS

Utilizar Vitest.

Cubrir, como mínimo:

- Fechas válidas e inválidas.
- Fechas numéricas Excel 1900/1904.
- Años bisiestos.
- Duplicados.
- Registros sin ID.
- Campos vacíos.
- Números no finitos.
- Límites de tamaño y filas.
- Reemplazo de datasets.
- Cancelación.
- Cálculo de indicadores.
- Margen financiero.
- Filtros combinados.
- Escenarios Excel.

Agregar pruebas de regresión para los defectos corregidos.

No considerar que las pruebas existentes garantizan por sí solas el cumplimiento completo.

# 26. VERIFICACIONES TÉCNICAS

Ejecutar los comandos reales del proyecto para comprobar:

- TypeScript.
- ESLint.
- Vitest.
- Build de producción.

Registrar los resultados.

Cuando el entorno lo permita, verificar en navegador:

- Pantalla inicial.
- Carga mediante selector.
- Arrastrar archivo.
- Confirmación.
- Cancelación.
- Reemplazo.
- Modal.
- Filtros.
- Indicadores.
- Gráficos.
- Búsqueda.
- Paginación.
- Responsividad.
- Errores de consola.
- Navegación mediante teclado.

No afirmar que una prueba pasó si no se ejecutó.

# 27. DOCUMENTACIÓN

Crear o actualizar README.md con:

- Descripción del proyecto.
- Objetivo de la prueba.
- Tecnologías utilizadas.
- Instalación.
- Comandos de desarrollo.
- Comandos de pruebas.
- Generación del build.
- Estructura del proyecto.
- Contrato del Excel.
- Reglas de importación.
- Reglas de duplicados.
- Reglas financieras.
- Interpretación de fechas.
- Límites de archivos.
- Decisiones técnicas.
- Limitaciones conocidas.
- Instrucciones de despliegue.
- Identificación de Claude Code como herramienta de Vibe Coding.

Explicar honestamente el papel de Claude Code en el desarrollo.

No presentar a Codex como herramienta de implementación si su participación fue únicamente de auditoría.

# 28. DESPLIEGUE

Preparar la aplicación para Netlify.

Garantizar:

- Build de producción funcional.
- Configuración de publicación adecuada.
- Compatibilidad de rutas.
- Carga de recursos estáticos.
- Ausencia de dependencias de un servidor local.
- Lectura de Excel desde el navegador.

No desplegar sin autorización.

Una compilación correcta no equivale a un despliegue verificado.

La URL pública debe comprobarse antes de declararla funcional.

# 29. CORRECCIONES POSTERIORES A LA PRIMERA AUDITORÍA DE CODEX

Corregir los hallazgos identificados:

**H01:** fechas imposibles aceptadas silenciosamente.

**H02:** campos vacíos e inválidos insuficientemente detectados.

**H03:** resumen de importación sin conteos suficientemente diferenciados.

**H04:** discrepancia entre margen mostrado en tabla y margen calculado en KPI.

**H05:** exclusión incorrecta de importes válidos cuando falta el otro componente financiero.

**H06:** modal sin gestión completa del foco.

**H07:** procesamiento de archivos sin límites adecuados.

**H08:** números no finitos aceptados durante conversiones.

Revisar adicionalmente:

- Fechas numéricas de Excel.
- Unicidad de operaciones.
- Duplicados con contenido diferente.
- Exclusión de registros sin ID.
- Consistencia entre tabla, gráficos y KPI.
- Pruebas de regresión.

Aplicar correcciones puntuales sin reconstruir el proyecto.

# 30. RESTRICCIONES DE MODIFICACIÓN

Mantener la arquitectura actual salvo que exista una razón técnica demostrable para modificarla.

No:

- Eliminar funcionalidades existentes.
- Cambiar el contrato de 16 columnas.
- Introducir backend o base de datos.
- Agregar autenticación innecesaria.
- Agregar dependencias injustificadas.
- Modificar el Excel original.
- Cambiar silenciosamente reglas de negocio.
- Sustituir el logo original.
- Dispersar textos fuera del JSON.
- Desplegar sin autorización.
- Ejecutar operaciones Git destructivas.
- Realizar commits sin autorización.

Toda modificación debe ser trazable y justificable.

# 31. INFORME FINAL DE CLAUDE CODE

Entregar un informe con:

**A. Resumen ejecutivo**

Descripción del trabajo realizado.

**B. Funcionalidades implementadas**

Relación de funcionalidades y archivos principales.

**C. Hallazgos corregidos**

Estado individual de H01–H08, con evidencia.

**D. Pruebas**

Comandos ejecutados, cantidad de pruebas aprobadas y fallidas.

**E. Regresiones**

Funciones verificadas después de las correcciones.

**F. Decisiones de negocio**

Explicar exclusiones, duplicados, fechas y cálculos financieros.

**G. Limitaciones**

Distinguir lo comprobado de lo pendiente.

**H. Preparación para auditoría**

Indicar si el proyecto está listo para revisión independiente.

No declarar un cumplimiento del 100 % sin evidencia.

# 32. AUDITORÍA INDEPENDIENTE

Una vez finalizadas las correcciones, el proyecto será revisado por Codex.

Codex actuará exclusivamente como auditor.

No deberá modificar el repositorio original.

La auditoría verificará:

- Los nueve requisitos oficiales.
- Los treinta criterios adicionales.
- Los ocho hallazgos iniciales.
- Los riesgos de duplicados.
- Las fechas de Excel.
- Los cálculos financieros.
- Las pruebas automatizadas.
- El build.
- Las regresiones.
- Los escenarios Excel.
- Los comportamientos del navegador.
- La preparación para Netlify.

Cualquier prueba que genere archivos deberá ejecutarse en una copia temporal aislada.

El resultado deberá distinguir entre:

- Implementación encontrada.
- Funcionalidad probada.
- Funcionalidad parcialmente verificada.
- Funcionalidad no verificada.

# 33. CRITERIO FINAL DE ACEPTACIÓN

El proyecto estará listo para entrega cuando:

1. Cumpla los requisitos oficiales.
2. Los indicadores sean correctos.
3. Los archivos Excel se interpreten correctamente.
4. Los filtros y gráficos funcionen.
5. No existan defectos conocidos que interrumpan los flujos principales.
6. Las pruebas automatizadas relevantes pasen.
7. La aplicación funcione en navegador.
8. La documentación sea coherente.
9. El despliegue, cuando se autorice, haya sido verificado.
10. Las limitaciones pendientes estén declaradas honestamente.

La prioridad es entregar una solución funcional, comprensible, profesional y defendible durante la presentación técnica.

---

# ANEXO — HALLAZGOS DE LA SEGUNDA AUDITORÍA

Este anexo documenta resultados posteriores; no debe presentarse como una instrucción que ya hubiera sido enviada durante la implementación inicial.

Codex confirmó 70 pruebas existentes aprobadas, TypeScript, ESLint y build correctos, pero detectó dos nuevos problemas:

**N01 — Reapertura involuntaria del modal.** Después de reemplazar los datos, el modal puede reaparecer cuando desaparece la notificación de éxito. Se requiere corregir la transición de estados y agregar una prueba de regresión.

**N02 — Calificaciones fuera de rango.** El campo `Calificacion_Servicio_1a5` acepta valores como 99 sin advertencia. Se requiere validar el rango contractual de 1 a 5 y reportar la incidencia correspondiente.

También quedaron pendientes la verificación independiente en navegador y la publicación en Netlify.

Estos hallazgos deberán cerrarse antes de declarar la entrega completamente validada.
