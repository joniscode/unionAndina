# Unión Andina Analytics

Dashboard operativo y financiero para la **prueba técnica de Desarrollador Full-Stack & Especialista en IA de Unión Andina de Transportes**.

La aplicación carga un archivo Excel (`.xlsx`) **completamente en el navegador**, valida su estructura frente al archivo de referencia, detecta operaciones duplicadas, muestra un resumen previo y, al confirmar, presenta indicadores, gráficos, filtros y una tabla de registros.

> Los datos de demostración incluidos son **sintéticos** (archivo `Datos_Sinteticos_Prueba_Tecnica_Unatrans.xlsx`) y no representan operaciones reales de la compañía.

---

## 1. Objetivo de la prueba

Construir en ~3 horas un mini dashboard profesional que permita cargar un Excel, procesarlo y visualizar indicadores operativos y financieros, demostrando el uso de **Claude Code** como herramienta de desarrollo junto con buenas prácticas de ingeniería.

## 2. Tecnologías

| Área | Tecnología |
|---|---|
| UI | React 19 + TypeScript 6 (modo estricto) |
| Build | Vite 8 |
| Estilos | Tailwind CSS v4 (`@tailwindcss/vite`), tokens en `src/styles/globals.css` |
| Gráficos | Recharts 3 |
| Lectura Excel | SheetJS `xlsx` 0.20.3 (distribución oficial del CDN de SheetJS) |
| Pruebas | Vitest 5 |
| Calidad | ESLint 10 + typescript-eslint (`strict`) + react-hooks |
| Despliegue | Netlify (`netlify.toml`) |

**Sobre SheetJS:** la versión publicada en el registro npm (`xlsx@0.18.5`) está desactualizada y tiene vulnerabilidades conocidas. SheetJS distribuye las versiones mantenidas desde su CDN oficial, por eso `package.json` referencia `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`. `npm audit --omit=dev` reporta 0 vulnerabilidades.

**Sobre TypeScript 6:** el scaffold de Vite trae TypeScript 7, pero `typescript-eslint` aún no lo soporta (`<6.1`). Se fijó `~6.0` para poder usar ESLint, que exige la prueba.

No hay backend, autenticación, base de datos, variables secretas ni servicios externos de IA.

## 3. Requisitos

- Node.js **20.19+** (probado con Node 24.18 y npm 11.16).
- Navegador moderno (Chrome, Edge, Firefox o Safari recientes).

## 4. Ejecución local

```bash
npm install        # instala dependencias
npm run dev        # servidor de desarrollo (http://localhost:5173)
npm run build      # typecheck + build de producción en dist/
npm run preview    # sirve dist/ localmente (http://localhost:4173)
```

Calidad:

```bash
npm run typecheck  # tsc -b
npm run lint       # eslint .
npm test           # vitest run
npm run check      # todo lo anterior + build
```

## 5. Estructura de carpetas

```text
public/demo/                      Excel de demostración (copia sin modificar del original)
src/
  app/                            App (orquestación de estado) y pantalla de bienvenida
  assets/                         Logo corporativo original
  components/
    layout/                       Encabezado, pie y logo
    ui/                           Botón, alerta, badge, panel, spinner, iconos, estado vacío
  config/
    texts.json                    TODOS los textos de interfaz
    dataContract.ts               Contrato de datos: nombres exactos de columnas del Excel
    app.ts                        Locale, moneda, tamaño de página, ruta de la demo
    chartTheme.ts                 Colores de gráficos (referencias a variables CSS)
    statusTones.ts                Tono visual por estado (solo presentación)
    sections.ts                   Anclas de navegación
  features/
    excel/
      services/                   readWorkbook → normalizeRecords → deduplicate → processWorkbook
      validators/                 validateStructure (hoja y columnas obligatorias)
      hooks/                      importReducer (máquina de estados pura) + useExcelImport
      components/                 Dropzone, progreso, resumen previo, error, modal
    dashboard/                    KPIs, gráficos y useDashboardData (filtros + derivados)
    filters/                      Barra de filtros
    records/                      Tabla con búsqueda y paginación
  lib/                            Funciones puras: parse, format, metrics, filters, i18n
  styles/globals.css              Tokens de color (marca + funcionales) con @theme
  tests/                          Pruebas Vitest + helpers que generan Excel en memoria
  types/                          Tipos de dominio
```

Principios aplicados:

- **El lector de Excel no depende de React:** `processWorkbook(ArrayBuffer, nombre)` es una función pura que recibe bytes y devuelve un resultado tipado (`ok`/`error`).
- **Los cálculos no requieren renderizar:** `lib/metrics.ts` y `lib/filters.ts` son funciones puras probadas directamente.
- **Nombres técnicos separados de los textos visibles:** las columnas viven en `dataContract.ts`; los textos de interfaz, en `texts.json`.
- **Estado de React sin librerías externas:** `useReducer` para el flujo de importación y `useState` + `useMemo` para los filtros y los datos derivados.

## 6. Análisis del Excel de referencia

| Hoja | Contenido | Uso |
|---|---|---|
| `Datos` | 160 filas × 16 columnas | **Registros operativos** |
| `Diccionario` | Descripción de campos | Auxiliar (ignorada) |
| `Leer_primero` | Aviso de datos sintéticos | Auxiliar (ignorada) |

Columnas (contrato de datos): `ID_Operacion, Fecha, Zona, Ruta, Tipo_Servicio, Cliente_Anonimizado, Vehiculo_Codigo, Kilometros, Horas_Planeadas, Horas_Reales, Estado, Cumplimiento_SLA, Ingresos_COP, Costos_COP, Margen_COP, Calificacion_Servicio_1a5`.

Hallazgos verificados:

- No hay fórmulas: todos los valores son estáticos. `Margen_COP = Ingresos_COP − Costos_COP` se cumple en las 160 filas.
- No hay IDs duplicados, celdas vacías ni valores numéricos inválidos en el archivo original.
- Estados: Completado (108), Con novedad (32), Cancelado (20). SLA: Sí (89) / No (71).
- **Cliente:** existe `Cliente_Anonimizado` (6 valores), por lo que se implementó el filtro de cliente.
- **Ubicación:** solo existe `Zona` (6 regiones). **No hay columna de ciudad**; las ciudades aparecen únicamente dentro de `Ruta` ("Cali–Popayán"). El filtro geográfico usa `Zona` y no se derivaron ni inventaron ciudades.
- 27 operaciones tienen margen negativo, y las operaciones canceladas registran ingresos ($1.123.704). Se respetan tal como vienen en el archivo.
- No existe información de pagos: el indicador se rotula **"Ingresos registrados"** y no debe interpretarse como dinero recibido.

## 7. Funcionalidades implementadas

- Pantalla de bienvenida corporativa (logo, nombre, descripción y área de carga). **No se cargan datos automáticamente.**
- Carga por selección o arrastre de archivos `.xlsx`, disponible en cualquier momento mediante el botón **"Cargar otro Excel"**.
- **Volver al inicio** haciendo clic en el logo del encabezado. Pide confirmación porque descarta los datos cargados (no hay persistencia).
- Validación de estructura, detección de duplicados y advertencias de calidad de datos.
- Resumen previo con confirmación o cancelación.
- Etapas reales de procesamiento: leyendo → validando → resumen → preparando dashboard → éxito o error, con un indicador indeterminado (sin porcentajes simulados).
- Cinco indicadores: total de operaciones, ingresos registrados, costos, margen (con % sobre ingresos) y cumplimiento SLA.
- Dos gráficos: ingresos, costos y margen por zona; operaciones por estado.
- Cuatro filtros combinables: zona, cliente, tipo de servicio y estado, con opción global y botón para limpiar.
- Tabla responsive con búsqueda por ID, paginación (10 por página), importes en COP, badges de estado y SLA, y mensaje sin resultados.
- Datos de demostración opcionales (botón **"Usar datos de demostración"**), identificados con un aviso de datos ficticios.
- Diseño adaptable a escritorio, tablet y móvil, sin desplazamiento horizontal de la página.
- Carga diferida: el lector de Excel y Recharts se descargan solo cuando se necesitan (bundle inicial de ~79 KB gzip).

## 8. Flujo de carga y validación

```text
Seleccionar archivo ──► ¿extensión .xlsx? ──no──► Error (datos actuales intactos)
        │ sí
        ▼
   Leer (ArrayBuffer) ──► Buscar hoja con TODAS las columnas obligatorias
        │                    └─ ninguna ──► Error: lista de columnas faltantes
        ▼
   Normalizar filas (tipos, vacíos, inválidos) ──► ¿0 registros? ──► Error "sin registros"
        ▼
   Deduplicar por ID_Operacion
        ▼
   Resumen previo: leídos · únicos · duplicados (ID + filas) · advertencias
        │
   ┌────┴─────┐
Cancelar   Confirmar (una sola vez)
   │            ▼
   │      Reemplazo COMPLETO del dataset activo ──► Dashboard (filtros reiniciados)
   ▼
Datos actuales intactos
```

- La hoja de datos se identifica **por contenido**, no por nombre. Una hoja de diccionario o de instrucciones no tiene las columnas obligatorias y se ignora.
- Se aceptan columnas en otro orden y columnas adicionales.
- **No se bloquea por valores:** cualquier cantidad de registros y cualquier combinación de valores es válida. Los problemas de contenido se muestran como **advertencias**:
  - número inválido (por ejemplo `"N/A"` en `Costos_COP`): queda como `null`, **nunca se convierte en 0**, y se excluye del cálculo correspondiente;
  - fecha inválida;
  - valor de `Cumplimiento_SLA` distinto de Sí/No (se excluye del denominador del SLA);
  - registro sin `ID_Operacion`;
  - `Margen_COP` que no coincide con `Ingresos − Costos` (tolerancia de 1 COP).
- Las filas totalmente vacías se ignoran y la numeración de filas reportada corresponde a la del Excel.
- Los datos activos solo cambian al confirmar. Si el archivo nuevo se rechaza o se cancela, el dashboard conserva la información anterior.
- El reductor ignora confirmaciones repetidas y resultados de lecturas obsoletas.
- No existe acumulación ni persistencia: cada carga confirmada reemplaza totalmente la anterior y recargar la página vuelve a la pantalla inicial.

## 9. Tratamiento de duplicados

- La clave es `ID_Operacion` (texto sin espacios externos).
- Se **conserva la primera aparición** y las posteriores se excluyen de todos los cálculos.
- El resumen previo muestra el número de duplicados descartados y, por cada ID, la fila conservada y las filas descartadas.
- Los registros **sin identificador no se agrupan** entre sí: cada uno se conserva y se reporta como advertencia.
- El archivo original nunca se modifica.

## 10. Fórmulas de los indicadores

Se calculan sobre los registros **deduplicados y filtrados** (`lib/metrics.ts`):

| Indicador | Fórmula |
|---|---|
| Total de operaciones | número de registros únicos que cumplen los filtros |
| Ingresos registrados | Σ `Ingresos_COP` de los registros con ingreso **y** costo válidos |
| Costos totales | Σ `Costos_COP` de los mismos registros |
| Margen total | Ingresos − Costos (equivale a Σ `Margen_COP` cuando el archivo es consistente) |
| % margen | Margen / Ingresos × 100, solo si Ingresos > 0 (si no, "N/D") |
| Cumplimiento SLA | (registros con SLA = "Sí") / (registros con SLA "Sí" o "No") × 100 |

Las sumas financieras usan solo registros con **ambos** importes válidos, para que ingresos, costos y margen sean coherentes entre sí. Si se excluye alguno, el dashboard muestra una advertencia con la cantidad. La comparación de "Sí" ignora mayúsculas y tildes ("si", "SÍ").

Valores verificados con el archivo de referencia (prueba automatizada): 160 operaciones · ingresos $134.350.665 · costos $104.646.676 · margen $29.703.989 (22,1 %) · SLA 89/160 = 55,6 %.

## 11. Filtros

- **Zona geográfica, Cliente, Tipo de servicio y Estado de operación.**
- Las opciones se generan dinámicamente desde los datos activos (`buildFilterOptions`), sin catálogos estáticos y ordenadas alfabéticamente según el locale `es-CO`. Al confirmar un archivo con otras zonas o clientes, las opciones se reemplazan y los filtros se reinician.
- Los filtros se combinan con lógica **Y**. Cada uno tiene una opción global ("Todas las zonas", etc.) y hay un botón **"Limpiar filtros"**.
- Indicadores, gráficos y tabla consumen **el mismo arreglo filtrado** (`useDashboardData`).
- La búsqueda por ID es propia de la tabla y actúa sobre los registros ya filtrados.

## 12. Diseño y accesibilidad

- Logo original sin modificaciones (`src/assets/logo-union-andina.png`, solo escalado).
- Colores corporativos (`#008D36`, `#006633`, `#FFCA00`, `#F6A400`) y colores funcionales (rojo error, ámbar advertencia, azul información, neutros) centralizados en `@theme` de `globals.css`.
- Ningún estado depende solo del color: alertas y badges incluyen icono y texto.
- Paleta del gráfico financiero validada para daltonismo: ingresos `#00843A`, costos `#E39400`, margen `#4A6FE3`. El naranja de marca `#F6A400` no superaba el umbral de luminosidad y se ajustó. La leyenda, el tooltip y la tabla compensan el contraste bajo del ámbar.
- Gráficos sin animaciones decorativas; barras horizontales legibles en móvil.

## 13. Pruebas y resultados

`npm test` → **39 pruebas en 5 archivos, todas aprobadas** (Vitest 5.1, ejecutado el 2026-11-09).

| Requisito | Archivo | Pruebas |
|---|---|---|
| 1. Lectura de Excel válido | `excelImport.test.ts` | lee la hoja "Datos" del archivo real (160 registros), normaliza tipos, acepta columnas reordenadas o extra |
| 2. Columnas faltantes | `excelImport.test.ts` | informa las columnas faltantes, ignora hojas auxiliares, rechaza otras extensiones y contenido no válido |
| 3–4. Duplicados y primera aparición | `deduplicate.test.ts` | detección con ID y filas, conserva la primera, no agrupa IDs vacíos, totales sin duplicados |
| 5. Ingresos, costos y margen | `metrics.test.ts` | totales exactos del archivo real, exclusión de inválidos, % margen con denominador inválido, SLA, agrupaciones |
| 6. Filtros | `filters.test.ts` | opciones dinámicas, cliente, zona, combinación AND, búsqueda por ID |
| 7. Reemplazo completo | `importReducer.test.ts` | el archivo B reemplaza al A; cancelación y rechazo conservan los datos; doble confirmación ignorada |
| 8. Archivos sin registros | `excelImport.test.ts` | encabezados sin filas → error; filas vacías ignoradas |
| 9. Campos vacíos | `excelImport.test.ts` | celdas vacías → `null` sin errores; inválidos no se convierten en 0 |
| 10. Restauración de demo | `importReducer.test.ts` | la demo reemplaza los datos cargados y queda marcada como demostración |
| Volver al inicio | `importReducer.test.ts` | descarta los datos activos; no interrumpe una carga en curso |

Los archivos de prueba se generan **en memoria** con SheetJS (`tests/helpers.ts`), por lo que no se agregan Excel artificiales al repositorio.

Otras verificaciones ejecutadas:

- `npm run typecheck` sin errores, `npm run lint` sin errores ni advertencias, `npm run build` correcto.
- Verificación manual automatizada en navegador (Chrome con Playwright, script local fuera del repositorio) sobre el build de producción: pantalla inicial sin dashboard, resumen previo con duplicados y advertencias, doble clic en "Confirmar" sin efectos duplicados, error de columnas faltantes que conserva los datos, cancelación que conserva los datos, carga de demo, filtros por cliente y zona combinados, búsqueda, volver al inicio desde el logo (cancelar conserva el dashboard; aceptar muestra la bienvenida), y vista móvil de 390 px sin desplazamiento horizontal ni errores de consola.

## 14. Despliegue en Netlify

El proyecto incluye `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"
[build.environment]
  NODE_VERSION = "22"
```

Opción A, desde Git:

1. Subir el repositorio a GitHub, GitLab o Bitbucket.
2. En Netlify, **Add new site → Import an existing project** y seleccionar el repositorio.
3. Netlify detecta la configuración de `netlify.toml`. No hay variables de entorno que configurar.

Opción B, despliegue manual:

```bash
npm run build
npx netlify-cli deploy --prod --dir=dist
```

O arrastrar la carpeta `dist/` en *app.netlify.com/drop*.

La aplicación es una sola página sin rutas, así que no requiere reglas de redirección. El Excel se procesa en el navegador y no se envía a ningún servidor. Netlify solo sirve archivos estáticos.

## 15. Uso de Claude Code

El desarrollo se realizó con **Claude Code** como asistente de programación. Cada resultado se verificó ejecutando el código: pruebas, typecheck, lint, build y revisión en navegador.

- **Análisis de datos:** antes de escribir código, Claude Code inspeccionó el Excel con un script de Python (hojas, columnas, tipos, valores distintos, fórmulas, duplicados, consistencia del margen). Así se detectó la ausencia de una columna de ciudad y se confirmó la existencia del campo de cliente.
- **Arquitectura:** propuso la separación lector → validador → normalizador → deduplicador como funciones puras, y el reductor de importación como máquina de estados que se prueba sin React.
- **Generación de componentes:** generó los componentes de UI, el sistema de textos tipado (`t()` con claves validadas por TypeScript e interpolación `{param}`) y los tokens de Tailwind v4.
- **Resolución de problemas:**
  - incompatibilidad de TypeScript 7 con typescript-eslint, resuelta fijando TS 6.0;
  - elección de SheetJS desde el CDN oficial para evitar la versión vulnerable de npm;
  - paleta del gráfico que fallaba la validación de daltonismo, ajustada con un validador;
  - bundle de más de 1 MB, reducido con carga diferida;
  - leyenda ordenada alfabéticamente, columnas de la tabla recortadas y frases con plurales incorrectos ("1 operaciones"), detectados en capturas del navegador y corregidos.
- **Verificación:** las pruebas cubren los 10 escenarios solicitados, y los totales se contrastaron con los calculados de forma independiente en Python sobre el Excel original.

## 16. Limitaciones conocidas y posibles mejoras

- Solo se aceptan archivos `.xlsx`, no `.xls` ni `.csv`.
- El procesamiento ocurre en el hilo principal. Para archivos muy grandes (decenas de miles de filas) convendría un Web Worker.
- No hay persistencia por diseño: recargar la página vuelve a la pantalla inicial.
- Los tonos de estado (verde, ámbar, rojo) se asignan a los tres estados conocidos del archivo de referencia. Un estado nuevo se muestra con tono neutro y su texto real.
- El texto numérico con separadores de miles (`"1.234.567"`) se trata como inválido para no adivinar el formato. Los números nativos de Excel no tienen ese problema.
- Posibles mejoras: exportar la vista filtrada, filtro por rango de fechas, tendencia mensual, pruebas de componentes con Testing Library y pruebas E2E dentro del repositorio.
