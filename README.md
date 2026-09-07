# Calculadora de Materiales Cytimaz (Rotomoldeo)

Progressive Web App (PWA) desarrollada para la planificación de producción y balance de materias primas en la fabricación de tinacos, cisternas y tambos por rotomoldeo.

Diseñada para funcionar **offline (sin internet)** directamente en planta y alojarse de forma 100% gratuita y automática en **GitHub Pages**:
🔗 **Repositorio:** [https://github.com/humania-nexo/Calculadora-Cytimaz](https://github.com/humania-nexo/Calculadora-Cytimaz)

---

## 🎯 Sentido y Propósito de la Aplicación

Los proveedores entregan la resina en **sacos de 24 kilos**. La aplicación permite responder en segundos a dos preguntas clave de producción:

1. **"¿Cuánto material necesito para hacer 50 cisternas de 1100L?"**
   - Calcula la suma total de kilogramos y la conversión exacta en **cuántos sacos de 24 kg** se requieren (ej. 900 kg = 37.5 sacos = 37 sacos + 12 kg).
2. **"¿Cuántas cisternas de 3000L puedo fabricar con 8 sacos de material?"**
   - Realiza el cálculo inverso identificando el material limitante (cuello de botella), los sobrantes y cuánto material falta para completar una pieza adicional.

---

## 🏗️ Reglas de Composición y Capas (Rotomoldeo)

1. **🔵 Cisternas y Tambos (Puro Polietileno en Cargas Múltiples):**
   - **Cisternas Estándar (1100L, 1300L, 3000L):** Se fabrican en **2 capas (Bicapa 50/50)** del mismo material (ej. 1100L = 9 kg Capa 1 + 9 kg Capa 2).
   - **Cisterna Industrial 5500L:** Se fabrica en **4 capas (25% cada una)** de 25 kg por carga (100 kg total de Polietileno Cisterna).
   - **Tambo 200L (3 Cargas):** Se fabrica en **3 cargas de polietileno** (2.5 kg + 2.5 kg + 1.0 kg de refuerzo final = 6 kg total).
2. **🟢 Tinacos Bicapa (50% PE + 50% Espumado):**
   - **50% Capa Exterior:** Polietileno Arena / Claro.
   - **50% Capa Interior:** Polietileno Espumado (aislante térmico y rigidez).
3. **🟠 Tinacos Tricapa (1/3 cada capa = 33.33% c/u):**
   - **33.33% (1/3) Capa 1 (Exterior):** Polietileno Arena / Claro.
   - **33.33% (1/3) Capa 2 (Intermedia):** Polietileno Negro (Filtro UV contra algas y fotosíntesis).
   - **33.33% (1/3) Capa 3 (Interior):** Polietileno Espumado.

---

## 📱 Los 3 Módulos de la Aplicación

### 1. 📦 Producto Terminado ➔ Materia Prima
- Permite armar una orden de producción combinando múltiples modelos y cantidades.
- Factor de merma / arranque de máquina configurable (0% a 30%).
- Desglose por tipo de resina en **Kg totales** y en **Sacos de 24 kg**.
- Tabla de informe unitario con radiografía de capas y botón de impresión a PDF.

### 2. 🔄 Materia Prima ➔ Producto Terminado
- Selector de modo: **Por Sacos (24 kg)** o **Por Kilogramos (kg)**.
- Detección de cuello de botella / material limitante.
- Balance de stock: material consumido, material sobrante y déficit para la siguiente unidad.

### 3. 📋 Fichas Técnicas e Informe Individual
- Catálogo interactivo con buscador y filtros por categoría.
- Radiografía gráfica porcentual de capas.
- **Placeholders de imágenes** con botón para cargar/cambiar fotos del modelo en vivo.
- Mini-calculadora integrada por modelo e impresión de ficha técnica.

---

## ⚙️ Panel de Ajustes (Engranaje)

Al hacer clic en el botón **⚙️ Ajustes** en la esquina superior derecha:
- Protegido por clave PIN (Clave por defecto de fábrica: `8080`).
- Permite cambiar el **peso estándar del saco** (por defecto 24 kg).
- Permite **modificar el peso o nombre de cualquier modelo existente**.
- Permite **añadir nuevos modelos** al catálogo eligiendo la categoría (Cisterna 100%, Tinaco Bicapa 50/50 o Tinaco Tricapa 1/3).
- Todos los cambios se guardan automáticamente en `localStorage` del navegador y persisten en el dispositivo.

---

## 📁 Estructura Modular del Proyecto

```
Calculadora-Cytimaz/
├── index.html              # Estructura principal PWA
├── manifest.json           # Configuración PWA para instalación
├── sw.js                   # Service Worker (Modo Offline)
├── README.md               # Documentación completa
├── css/
│   └── styles.css          # Estilos visuales e industriales comentados
├── js/
│   ├── data.js             # Base de datos de modelos, capas y persistencia
│   ├── engine.js           # Motor matemático de cálculo y conversiones a sacos de 24kg
│   ├── mod-pt-mp.js        # Módulo 1: PT -> Materia Prima
│   ├── mod-mp-pt.js        # Módulo 2: Materia Prima -> PT
│   ├── mod-informe.js      # Módulo 3: Fichas técnicas e informes
│   └── app.js              # Controlador principal y modal de ajustes
└── assets/
    ├── icons/              # Íconos de la aplicación (192px y 512px)
    └── img/modelos/        # Ilustraciones vectoriales y fotos de cada modelo
```

---

## 🚀 Cómo Publicar en GitHub Pages

1. Sube todos los archivos a la rama principal (`main`) de tu repositorio: `https://github.com/humania-nexo/Calculadora-Cytimaz`.
2. En GitHub, ve a **Settings** ➔ **Pages**.
3. En **Branch**, selecciona `main` y la carpeta `/ (root)`.
4. Haz clic en **Save**.
5. ¡Listo! En 1 minuto tu aplicación estará disponible en línea en:
   `https://humania-nexo.github.io/Calculadora-Cytimaz/`
