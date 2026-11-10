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
      validators/                 validateStructure (hoja, columnas obligatorias, límites)
      hooks/                      importReducer (máquina de estados pura) + useExcelImport
      components/                 Dropzone, progreso, resumen previo, error, modal
    dashboard/                    KPIs, gráficos y useDashboardData (filtros + derivados)
    filters/                      Barra de filtros
    records/                      Tabla con búsqueda y paginación
  lib/                            Funciones puras: parse, dates, format, metrics, filters, i18n
  styles/globals.css              Tokens de color (marca + funcionales) con @theme
  tests/                          Pruebas Vitest, helpers que generan Excel en memoria y fixtures/ con los escenarios
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

Columnas (contrato de datos, `config/dataContract.ts`): `ID_Operacion, Fecha, Zona, Ruta, Tipo_Servicio, Cliente_Anonimizado, Vehiculo_Codigo, Kilometros, Horas_Planeadas, Horas_Reales, Estado, Cumplimiento_SLA, Ingresos_COP, Costos_COP, Margen_COP, Calificacion_Servicio_1a5`.

Hallazgos verificados:

- No hay fórmulas: todos los valores son estáticos. `Margen_COP = Ingresos_COP − Costos_COP` se cumple en las 160 filas.
- No hay IDs duplicados, celdas vacías ni valores numéricos inválidos en el archivo original.
- La hoja `Diccionario` define `ID_Operacion` como *"Identificador ficticio **único** de la operación"*. Esa es la base contractual de la regla de duplicados.
- Estados: Completado (108), Con novedad (32), Cancelado (20). SLA: Sí (89) / No (71).
- **Cliente:** existe `Cliente_Anonimizado`, por lo que se implementó el filtro de cliente.
- **Ubicación:** el contrato solo tiene `Zona`; **no hay columna de ciudad** (las ciudades aparecen dentro de `Ruta`). El filtro de ubicación usa `Zona` tal como venga en el archivo: regiones en la referencia y ciudades en el Escenario 1.
- 27 operaciones tienen margen negativo, y las canceladas registran ingresos ($1.123.704). Se respetan tal como vienen.
- No existe información de pagos: el indicador se rotula **"Ingresos registrados"**.

### Archivos de escenario (auditoría)

Copiados **sin modificar** a `src/tests/fixtures/` (hash SHA-256 idéntico al original):

| Archivo | Contenido relevante |
|---|---|
| `Escenario_1_Reemplazo_Ciudades_Validas.xlsx` | 36 registros válidos; `Zona` con ciudades (Cali, Cartagena, Medellín); estado nuevo `Pendiente`; `Fecha` como número de serie con formato General |
| `Escenario_2_Duplicados_Campos_Erroneos.xlsx` | 18 filas: 2 duplicados idénticos (ESC-0002, ESC-0006), cliente vacío, ingreso no numérico, costo vacío y zona vacía |

## 7. Funcionalidades implementadas

- Pantalla de bienvenida corporativa (logo, nombre, descripción y área de carga). **No se cargan datos automáticamente.**
- Carga por selección o arrastre de archivos `.xlsx`, disponible en cualquier momento mediante el botón **"Cargar otro Excel"**.
- **Volver al inicio** haciendo clic en el logo del encabezado. Pide confirmación porque descarta los datos cargados (no hay persistencia).
- Validación de estructura, límites de tamaño, validación por campo (errores y advertencias) y detección de duplicados con conflicto de contenido.
- Resumen previo con conteos separados de registros e incidencias, y confirmación o cancelación.
- Etapas reales de procesamiento: leyendo → validando → resumen → preparando dashboard → éxito o error, con un indicador indeterminado (sin porcentajes simulados).
- Cinco indicadores: total de operaciones, ingresos registrados, costos, margen (con % sobre su base) y cumplimiento SLA. Cada uno indica su base cuando hay datos incompletos.
- Dos gráficos: ingresos, costos y margen por zona; operaciones por estado.
- Cuatro filtros combinables: zona, cliente, tipo de servicio y estado, con opción global y botón para limpiar.
- Tabla responsive con búsqueda por ID, paginación (10 por página), fechas `DD/MM/AAAA`, importes en COP, margen calculado con aviso de discrepancia, y badges de estado y SLA.
- Datos de demostración opcionales, identificados con un aviso de datos ficticios.
- Modal accesible (`<dialog>` nativo): foco inicial, foco contenido, Escape y restauración del foco.
- Diseño adaptable a escritorio, tablet y móvil, sin desplazamiento horizontal de la página.
- Carga diferida: el lector de Excel y Recharts se descargan solo cuando se necesitan.

## 8. Flujo de carga y validación

```text
Seleccionar archivo ──► ¿.xlsx y ≤ 5 MB? ──no──► Error (datos actuales intactos)
        │ sí
        ▼
   Leer (ArrayBuffer, máx. 10.000 filas) ──► Hoja con las 16 columnas obligatorias
        │                                       └─ ninguna ──► Error: columnas faltantes
        ▼                                       └─ > 10.000 registros ──► Error (sin truncar)
   Normalizar y validar cada campo ──► ¿0 registros? ──► Error "sin registros"
        ▼
   Deduplicar por ID_Operacion (+ detectar conflictos de contenido)
        ▼
   Excluir registros con error ──► ¿0 utilizables? ──► Error "sin registros utilizables"
        ▼
   Resumen previo: conteos · duplicados · incidencias (hoja, fila, columna, motivo)
        │
   ┌────┴─────┐
Cancelar   Confirmar (una sola vez)
   │            ▼
   │      Reemplazo COMPLETO del dataset activo ──► Dashboard (filtros reiniciados)
   ▼
Datos actuales intactos
```

- La hoja de datos se identifica **por contenido**, no por nombre; las hojas auxiliares se ignoran.
- Se aceptan columnas en otro orden y columnas adicionales.
- Las filas totalmente vacías se ignoran y la numeración de filas reportada corresponde a la del Excel.
- Los datos activos solo cambian al confirmar. El reductor ignora confirmaciones repetidas y resultados de lecturas obsoletas.

### Política de validación por campo

Definida en `FIELD_RULES` (`config/dataContract.ts`). Ningún valor inválido se convierte en cero.

| Campo | Tipo | Vacío | Inválido | Efecto |
|---|---|---|---|---|
| `ID_Operacion` | identificador | **Error** | — | Registro **excluido de todos los cálculos** (no puede deduplicarse ni rastrearse) |
| `Fecha` | fecha | Advertencia | Advertencia | Fecha como "—" |
| `Zona`, `Cliente_Anonimizado`, `Tipo_Servicio`, `Estado` | texto | Advertencia | — | Visible solo con la opción global del filtro; grupo "Sin dato" en gráficos |
| `Cumplimiento_SLA` | Sí / No | Advertencia | Advertencia | Excluido del denominador del SLA |
| `Ingresos_COP`, `Costos_COP` | número | Advertencia | Advertencia | Excluido de su total y del margen |
| `Margen_COP` | número | Advertencia | Advertencia | Valor informado; además se advierte si difiere de Ingresos − Costos (tolerancia 1 COP) |
| `Ruta`, `Vehiculo_Codigo`, `Kilometros`, `Horas_*`, `Calificacion_*` | opcional | sin incidencia | Advertencia | Solo informativo |

Cada incidencia indica **hoja, fila, columna, severidad y motivo**. El resumen previo muestra por separado: registros leídos, duplicados descartados, registros únicos, excluidos de cálculos, sin incidencias, con incidencias (una fila con varias incidencias cuenta una sola vez), advertencias y errores.

### Fechas

- Se leen como número de serie (sin `cellDates`) y se convierten con aritmética UTC respetando el sistema **1900 o 1904** del libro (`lib/dates.ts`). Se tiene en cuenta el día ficticio 29/02/1900 de Excel.
- También se acepta texto `AAAA-MM-DD` y `DD/MM/AAAA`.
- Se validan año, mes y día, incluidos los años bisiestos: `2025-02-31` o `29/02/2025` se reportan como inválidas y **no se desplazan**.
- Se normalizan como texto `AAAA-MM-DD` (ordenable, sin zona horaria) y se muestran como `DD/MM/AAAA`.

### Límites (H07)

| Límite | Valor | Justificación |
|---|---|---|
| Tamaño de archivo | 5 MB | Se comprueba antes de leer el archivo, para no cargarlo en memoria |
| Registros por hoja | 10.000 | Medido con SheetJS en Node: ~2 s para 10.000 filas y ~3,7 s para 20.000, en el hilo principal |

Si la hoja declara más filas que el límite, el archivo se **rechaza** con un mensaje, nunca se trunca en silencio. No se añadió un Web Worker porque, con estos límites, la espera medida es aceptable y el loader indica la etapa en curso.

## 9. Tratamiento de duplicados

- La clave es `ID_Operacion` (texto sin espacios externos), definida como **única** en la hoja `Diccionario`.
- Se **conserva la primera aparición** y las posteriores se excluyen de todos los cálculos.
- Si una aparición posterior tiene **contenido diferente**, se informa como advertencia ("Diferente en filas …"), porque podría ser un registro legítimo mal identificado. No se inventa una clave compuesta.
- El resumen muestra, por cada ID, la fila conservada, las filas descartadas y si el contenido es idéntico o diferente.
- Los registros sin identificador no se agrupan entre sí; se reportan como error y se excluyen.
- El archivo original nunca se modifica.

## 10. Fórmulas de los indicadores

Se calculan sobre los registros **utilizables, deduplicados y filtrados** (`lib/metrics.ts`). Indicadores, gráficos y tabla usan la misma política:

| Indicador | Fórmula | Base |
|---|---|---|
| Total de operaciones | número de registros | todos los registros filtrados |
| Ingresos registrados | Σ `Ingresos_COP` | registros con ingreso válido (aunque falte el costo) |
| Costos totales | Σ `Costos_COP` | registros con costo válido (aunque falte el ingreso) |
| Margen total | Σ (`Ingresos_COP` − `Costos_COP`) | solo registros con **ambos** importes válidos |
| % margen | Margen / Ingresos **de esa misma base** × 100 | si los ingresos de la base son ≤ 0 → "N/D" |
| Cumplimiento SLA | registros "Sí" / registros "Sí" o "No" × 100 | registros con SLA reconocido |

- Sin registros válidos, el indicador muestra **"N/D"**, nunca `$0`.
- Si una base no incluye todas las operaciones, la tarjeta muestra "Base: X de Y operaciones…" y el dashboard muestra un aviso: en ese caso Ingresos − Costos puede no coincidir con el margen.
- **Margen calculado vs. informado:** la tabla muestra el margen **calculado** (columna "Margen calc."), igual que los indicadores. `Margen_COP` se conserva sin modificar (`reportedMargin`). Si difiere, la celda muestra un icono de advertencia y el valor informado (texto accesible), y el resumen previo lo reporta.
- Todos los números pasan por `Number.isFinite`; `NaN`, `Infinity` o un desbordamiento en una suma se tratan como dato no disponible.

Valores verificados con pruebas automatizadas y contrastados de forma independiente con Python/openpyxl:

| Archivo | Operaciones | Ingresos (base) | Costos (base) | Margen (base) | SLA |
|---|---|---|---|---|---|
| Referencia | 160 | $134.350.665 (160) | $104.646.676 (160) | $29.703.989 (160) · 22,1 % | 89/160 |
| Escenario 1 | 36 | $34.182.000 (36) | $22.830.840 (36) | $11.351.160 (36) · 33,2 % | 27/36 |
| Escenario 2 | 16 únicos | $10.206.000 (15) | $6.699.780 (15) | $3.144.060 (14) · 33,8 % | 12/16 |

## 11. Filtros

- **Zona geográfica, Cliente, Tipo de servicio y Estado de operación.**
- Las opciones se generan desde los datos activos (`buildFilterOptions`), sin catálogos estáticos y ordenadas según el locale `es-CO`. Al confirmar otro archivo, las opciones se reemplazan y los filtros se reinician.
- Los filtros se combinan con lógica **Y**. Cada uno tiene una opción global y hay un botón **"Limpiar filtros"**.
- Indicadores, gráficos y tabla consumen **el mismo arreglo filtrado** (`useDashboardData`).
- La búsqueda por ID es propia de la tabla y actúa sobre los registros ya filtrados.

## 12. Diseño y accesibilidad

- Logo original sin modificaciones (`src/assets/logo-union-andina.png`, solo escalado).
- Colores corporativos y funcionales (rojo error, ámbar advertencia, azul información, neutros) centralizados en `@theme` de `globals.css`.
- Ningún estado depende solo del color: alertas, badges e indicadores de discrepancia incluyen icono y texto.
- Paleta del gráfico financiero validada para daltonismo: ingresos `#00843A`, costos `#E39400`, margen `#4A6FE3`.
- **Modal:** `<dialog>` con `showModal()`, que deja el fondo inerte, más:
  - foco inicial en el modal;
  - Tab y Shift+Tab ciclan dentro del modal;
  - Escape cierra, salvo durante el procesamiento;
  - el foco se reubica dentro del modal al cambiar de etapa y vuelve al botón que lo abrió al cerrarse;
  - `aria-labelledby` y `aria-describedby`.

## 13. Pruebas y resultados

`npm test` → **70 pruebas en 7 archivos, todas aprobadas** (Vitest 5.1, ejecutado el 2026-11-09).

| Área | Archivo | Cobertura |
|---|---|---|
| Lectura y estructura | `excelImport.test.ts` | Hoja "Datos" del archivo real; columnas reordenadas o extra; columnas faltantes; hojas auxiliares; extensión; contenido no Excel |
| Sin registros | `excelImport.test.ts` | Encabezados sin filas; ningún registro utilizable; filas vacías |
| H02 Campos | `excelImport.test.ts` | Cada obligatorio vacío con hoja, fila, columna y severidad; opcionales; ID vacío → error excluido; inválidos no se convierten en 0 |
| H03 Resumen | `excelImport.test.ts` | Conteos separados; una fila con varias incidencias cuenta una vez |
| H04 Margen | `excelImport.test.ts`, `metrics.test.ts` | Discrepancia advertida; informado conservado; KPI con margen calculado |
| H05 Importes incompletos | `metrics.test.ts` | Ingreso sin costo y viceversa; base del margen y del %; N/D en lugar de 0; gráficos con la misma política |
| H07 Límites | `excelImport.test.ts` | Tamaño máximo; máximo de registros sin truncar |
| H08 No finitos | `excelImport.test.ts`, `metrics.test.ts` | Texto que desborda a Infinity; NaN e Infinity en totales; suma desbordada |
| H01 y fechas | `dates.test.ts` | Fechas imposibles; bisiestos; series 1900 (incluido el 29/02/1900 ficticio) y 1904; libro marcado como 1904; celdas con formato de fecha; texto `AAAA-MM-DD` y `DD/MM/AAAA`; formato de salida |
| Duplicados | `deduplicate.test.ts` | Primera aparición; conflicto de contenido; IDs vacíos sin agrupar |
| Escenarios | `scenarios.test.ts` | Escenario 1 reemplaza opciones y recalcula; Escenario 2 genera las 4 advertencias exactas sin contaminar totales |
| Filtros | `filters.test.ts` | Opciones dinámicas; cliente; zona; combinación AND; búsqueda |
| Flujo | `importReducer.test.ts` | Reemplazo completo; cancelación y rechazo conservan datos; doble confirmación; lecturas obsoletas; demo; volver al inicio |

Otras verificaciones ejecutadas:

- `npm run typecheck` sin errores, `npm run lint` sin errores ni advertencias, `npm run build` correcto.
- **Navegador** (Chrome con Playwright sobre el build de producción; script local fuera del repositorio):
  - pantalla inicial sin dashboard y archivo de 6 MB rechazado;
  - resumen del Escenario 2 (18 / 2 / 16 / 0 / 12 / 4 / 4 / 0) y doble clic en confirmar sin efecto duplicado;
  - KPI con bases parciales y "—" en márgenes no calculables;
  - modal: foco inicial, Tab y Shift+Tab contenidos (35 pulsaciones), fondo inerte, Escape y foco restaurado;
  - rechazo y cancelación que conservan datos;
  - reemplazo por el Escenario 1 con las opciones Cali / Cartagena / Medellín;
  - filtros combinados y limpieza, paginación y búsqueda;
  - demo y volver al inicio;
  - móvil de 390 px sin desbordamiento y sin errores de consola.
- **Zonas horarias:** con la emulación de Chrome (Asia/Tokyo, America/Los_Angeles y Pacific/Kiritimati), las primeras fechas fueron 03/02/2025 (Escenario 1) y 06/01/2025 (referencia), sin desplazamientos.

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

La aplicación es una sola página sin rutas, así que no requiere reglas de redirección. El Excel se procesa en el navegador y no se envía a ningún servidor.

## 15. Uso de Claude Code

El desarrollo se realizó con **Claude Code** como asistente de programación. Cada resultado se verificó ejecutando el código: pruebas, typecheck, lint, build y revisión en navegador.

- **Análisis de datos:** inspección del Excel con Python (hojas, columnas, tipos, fórmulas, duplicados, consistencia del margen) antes de escribir código.
- **Arquitectura:** funciones puras (lector → validador → normalizador → deduplicador) y un reductor de importación que se prueba sin React.
- **Generación de componentes:** UI, textos tipados (`t()` con interpolación) y tokens de Tailwind v4.
- **Corrección postauditoría (Codex):**
  - Claude Code leyó el informe de auditoría independiente y analizó los archivos de escenario;
  - descubrió que las fechas venían como números de serie con formato General, un caso que el informe no mencionaba;
  - midió el rendimiento de SheetJS para fijar los límites;
  - corrigió H01–H08 con pruebas específicas;
  - detectó en la verificación en navegador que el `<dialog>` nativo dejaba salir el foco hacia la interfaz del navegador, y lo corrigió;
  - comprobó que Node en Windows ignora la variable `TZ`, por lo que las zonas horarias se verificaron con la emulación de Chrome.
- **Verificación:** totales contrastados de forma independiente con Python sobre los tres archivos.

## 16. Limitaciones conocidas y posibles mejoras

- Solo se aceptan archivos `.xlsx`, no `.xls` ni `.csv`.
- **Pruebas de componentes:** no hay pruebas automatizadas de componentes React en el repositorio (Vitest corre en entorno Node). La interfaz y el modal se verificaron con un script de Playwright local que no forma parte del repositorio.
- **Pruebas y zona horaria:** las pruebas unitarias se ejecutaron en la zona horaria del equipo (America/Bogota). La independencia de zona horaria se verificó en el navegador con emulación.
- **Límites:** se calibraron en Node con libros generados; el tiempo real depende del equipo del usuario.
- **Margen informado:** `Margen_COP` vacío o inválido genera advertencia, pero no afecta los cálculos, porque el margen siempre se calcula.
- **Estados nuevos:** un estado no conocido (p. ej. `Pendiente`) se muestra con tono neutro y su texto real.
- **Números con separadores:** el texto con separadores de miles (`"1.234.567"`) se trata como inválido para no adivinar el formato.
- **Despliegue:** no hay persistencia por diseño, y el despliegue en Netlify no se ha ejecutado desde este entorno.
- **Posibles mejoras:** Web Worker si se requieren archivos mayores, exportación de la vista filtrada, filtro por fechas y pruebas de componentes con Testing Library.
