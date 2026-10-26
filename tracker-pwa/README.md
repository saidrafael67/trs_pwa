# Tracker PWA - Seguimiento de Fuerza e Hipertrofia

**Tracker** es una Progressive Web App (PWA) de alto rendimiento, minimalista y de alto contraste para el seguimiento de entrenamientos en el gimnasio y sobrecarga progresiva. Diseñada meticulosamente para usarse en **iPhone (Safari > "Agregar a pantalla de inicio")**, desarrollada en Windows y 100% autónoma en el cliente (sin servidores, sin cuentas de usuario, sin APIs de terceros y con funcionamiento offline garantizado).

---

## 🚀 Características Principales

- **Diseño táctil de alto contraste (Dark Minimalist):** Elementos táctiles de más de 48 px, paleta mate oscura para pantallas OLED, legible con manos sudadas y usable con una sola mano.
- **Registro en ≤ 3 toques:** Carga automática de los pesos y repeticiones de la última sesión realizada en el mismo ejercicio. Un toque en el histórico copia los valores directamente.
- **Sobrecarga Progresiva (Doble Progresión):** Algoritmo inteligente que analiza las series efectivas frente al rango objetivo de la rutina y sugiere en lenguaje natural subir peso (+2.5 kg tren superior / +5 kg tren inferior), sumar repeticiones o descargar fatiga.
- **Temporizador de descanso inteligente para iOS:** Basado en `Date.now()` (no en `setInterval` acumulativo), inmune a la suspensión en segundo plano de iOS Safari. Alerta de audio sintetizada con **Web Audio API** y háptica con técnica dual (`navigator.vibrate` + selector switch para WebKit iOS 17.4+).
- **Calculadora de discos gráfica:** Cálculo greedy de discos por lado (25, 20, 15, 10, 5, 2.5, 1.25, 0.5 kg) con barra configurable (20 kg, 15 kg, multipower), cálculo del peso más cercano inferior y visualizador gráfico de la barra.
- **Modo de ejecución enfocado:** Pantalla completa orientada a una única serie activa, botones gigantes de registro y avance directo al descanso y siguiente ejercicio.
- **Mapa de calor corporal en SVG interactivo:** Anatomía humana en vectores (vista frontal y posterior) dividida en 12 grupos musculares, coloreada dinámicamente según las series efectivas o el tonelaje acumulado en los últimos 7 días.
- **Curva de fuerza (e1RM):** Fórmulas Epley y Brzycki seleccionables, con advertencia y descarte para series de más de 12 repeticiones.
- **Persistencia y Respaldo:** IndexedDB con promesas para ejercicios, plantillas, historial y estado de sesión activa (recuperable si iOS cierra la app en segundo plano). Exportación completa a CSV y JSON; restauración total desde archivo JSON.

---

## 📁 Estructura del Proyecto

```text
fuerza-pwa/
├── index.html                   # HTML base con metas de iOS Standalone y Safe Areas
├── manifest.webmanifest         # Manifiesto PWA con rutas relativas
├── sw.js                        # Service Worker con caché versionada Cache-First
├── package.json                 # Scripts de test y generación de iconos
├── css/
│   ├── main.css                 # Variables CSS, reset, tipografía, safe-areas, tabs
│   ├── components.css           # Botones, steppers, chips RIR, modales, barras
│   └── views.css                # Estilos específicos de cada vista y SVG
├── js/
│   ├── app.js                   # Bootstrap, registro SW y router de navegación
│   ├── db.js                    # Capa IndexedDB con promesas y navigator.storage.persist()
│   ├── state.js                 # Gestor reactivo de estado y temporizador iOS
│   ├── utils.js                 # Web Audio API, hápticos, Screen Wake Lock y formatos
│   ├── seed-data.js             # Biblioteca de más de 65 ejercicios y 3 rutinas
│   ├── modules/                 # Módulos puros con pruebas unitarias en Node
│   │   ├── e1rm.js              # Fórmulas de e1RM (Epley y Brzycki)
│   │   ├── plates.js            # Algoritmo de cálculo de discos y barra
│   │   ├── progression.js       # Doble progresión y recomendaciones
│   │   └── volume.js            # Series efectivas semanales (primarias 1.0, secundarias 0.5)
│   ├── components/              # Componentes visuales desacoplados
│   │   ├── body-heatmap.js      # Mapa anatómico interactivo en SVG
│   │   ├── number-stepper.js    # Steppers numéricos táctiles grandes
│   │   ├── plate-modal.js       # Modal y visualizador de discos
│   │   └── timer.js             # Temporizador flotante de descanso
│   └── views/                   # Pantallas de la PWA
│       ├── workout.js           # Registro de series y modo enfocado
│       ├── history.js           # Historial cronológico desplegable
│       ├── progress.js          # Gráficos SVG de e1RM, volumen y tonelaje
│       ├── routines.js          # Creador y gestor de plantillas
│       └── settings.js          # Unidades, fórmulas, respaldo y avisos iOS
├── icons/                       # Iconos generados localmente sin librerías
│   ├── generate-icons.js        # Script de generación de PNG con zlib nativo
│   ├── icon-192.png             # Icono estándar PWA 192x192
│   ├── icon-512.png             # Icono estándar PWA 512x512
│   ├── icon-maskable.png        # Icono con zona segura para Android/iOS
│   ├── apple-touch-icon.png     # Icono específico para pantalla de inicio iOS (180x180)
│   └── favicon.svg              # Favicon vectorial
└── test/                        # Pruebas unitarias (ejecutables con node --test)
    ├── e1rm.test.js             # Pruebas de e1RM
    ├── plates.test.js           # Pruebas de calculadora de discos
    ├── progression.test.js      # Pruebas de progresión doble
    └── volume.test.js           # Pruebas de volumen y tonelaje
```

---

## 🧪 Pruebas Unitarias

Las funciones matemáticas y lógicas críticas son puras y cuentan con pruebas unitarias ejecutables directamente con Node.js sin dependencias externas:

```powershell
npm test
# O directamente:
node --test test/e1rm.test.js test/plates.test.js test/progression.test.js test/volume.test.js
```

---

## 💻 Cómo Probar en Local en Windows

Las PWAs requieren un contexto seguro (`localhost` o `https://`) para que el Service Worker y la Web Storage API funcionen correctamente.

### Opción 1: Con `serve` o `http-server` (Recomendada con Node)
Desde la terminal de Windows en la carpeta del proyecto:
```powershell
cd C:\Users\chihu\.gemini\antigravity\scratch\fuerza-pwa
npx serve .
# O con http-server:
npx http-server -p 8080 -c-1
```
Abre en tu navegador: `http://localhost:3000` (o el puerto indicado).

### Opción 2: Con Python (Si tienes Python instalado)
```powershell
python -m http.server 8080
```
Abre en tu navegador: `http://localhost:8080`.

---

## 🌐 Cómo Desplegar

Dado que todas las rutas son relativas (`./`), la aplicación funciona tanto en el dominio raíz como en cualquier subruta.

### Despliegue en GitHub Pages (Gratuito)
1. Crea un nuevo repositorio en GitHub (ejemplo: `fuerza-pwa`).
2. Sube los archivos a la rama `main`:
   ```powershell
   git init
   git add .
   git commit -m "feat: Fuerza PWA inicial"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/fuerza-pwa.git
   git push -u origin main
   ```
3. En GitHub, ve a **Settings** > **Pages**.
4. En **Build and deployment** > **Source**, selecciona `Deploy from a branch`.
5. Elige la rama `main` y la carpeta `/ (root)`, luego haz clic en **Save**.
6. En 1-2 minutos tu app estará disponible en: `https://TU_USUARIO.github.io/fuerza-pwa/`.

### Despliegue en Vercel (Gratuito)
1. Instala el CLI de Vercel o conéctalo desde [vercel.com](https://vercel.com).
2. Con el CLI:
   ```powershell
   npx vercel deploy --prod
   ```
3. La aplicación no requiere build step (`Framework Preset: Other`, Output Directory: `.`).

---

## 📱 Cómo Instalar en iPhone (Safari)

1. Abre **Safari** en tu iPhone y entra a la URL de tu despliegue (ej. `https://TU_USUARIO.github.io/fuerza-pwa/`).
2. Toca el botón **Compartir** (icono de cuadrado con flecha hacia arriba en la barra inferior de Safari).
3. Desliza hacia abajo y selecciona **"Agregar a pantalla de inicio"** (*Add to Home Screen*).
4. Confirma el nombre (sugerido: "Fuerza") y toca **"Agregar"** en la esquina superior derecha.
5. Se creará el icono de alta resolución en tu pantalla de inicio.
6. Ábrelo desde allí: la aplicación abrirá en **pantalla completa** (sin barras de URL ni navegación de Safari), respetando el notch / Dynamic Island y los márgenes inferiores (*safe-area-inset*).

---

## 🔄 Cómo Actualizar la Aplicación

1. Cuando subas cambios a GitHub Pages o Vercel, el Service Worker detectará en segundo plano los nuevos archivos mediante su caché versionada (`fuerza-v1.x`).
2. Al instante aparecerá un aviso discreto en la parte superior:
   > ⚡ **Nueva versión disponible** [Actualizar]
3. Al tocar **"Actualizar"**, el Service Worker ejecuta `skipWaiting()`, toma el control y recarga la interfaz con la última versión al instante, sin perder tus datos de IndexedDB.
