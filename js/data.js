/**
 * ====================================================================
 * DATA.JS - Base de Datos de Productos y Configuración de Materiales
 * ====================================================================
 * Empresa: Cytimaz (Rotomoldeo)
 * 
 * Reglas de Composición:
 * 1. CISTERNA / TAMBO (Puro Polietileno): 100% Polietileno
 * 2. TINACO BICAPA: 50% Polietileno Color / Arena + 50% Espumado
 * 3. TINACO TRICAPA: 1/3 (33.33%) Polietileno Arena + 1/3 Polietileno Negro UV + 1/3 Espumado
 * 
 * Configuración de Proveedores:
 * - Peso estándar del saco: 24 kg
 * ====================================================================
 */

const PRODUCT_GROUPS = {
  TINACO_BICAPA: 'tinaco_bicapa',
  TINACO_TRICAPA: 'tinaco_tricapa',
  CISTERNA: 'cisterna'
};

const MATERIAL_TYPES = {
  PE_ARENA: { id: 'pe_arena', name: 'Polietileno Arena / Claro', color: '#D4B996', badgeClass: 'badge-sand', icon: '🟡' },
  PE_NEGRO: { id: 'pe_negro', name: 'Polietileno Negro (Filtro UV)', color: '#2B2B2B', badgeClass: 'badge-black', icon: '⚫' },
  PE_ESPUMADO: { id: 'pe_espumado', name: 'Polietileno Espumado', color: '#94A3B8', badgeClass: 'badge-foam', icon: '⚪' },
  PE_CISTERNA: { id: 'pe_cisterna', name: 'Polietileno Cisterna / Puro', color: '#0284C7', badgeClass: 'badge-blue', icon: '🔵' }
};

// Configuración global por defecto
const DEFAULT_CONFIG = {
  bagWeightKg: 24, // Sacos de proveedor de 24 kg
  adminPin: '8080', // Contraseña de seguridad para el panel de ajustes (engranaje)
  factoryResetDate: new Date().toISOString()
};

// Catálogo inicial de modelos Cytimaz
const INITIAL_PRODUCTS = [
  // --- TINACOS BICAPA (50% PE + 50% Espumado) ---
  {
    id: 'tinaco-bicapa-450',
    name: 'Tinaco 450 L Bicapa',
    capacity: 450,
    group: PRODUCT_GROUPS.TINACO_BICAPA,
    categoryLabel: 'Tinaco Bicapa',
    totalWeightKg: 8,
    layers: [
      { layerName: 'Capa Exterior', materialId: 'pe_arena', materialName: 'Polietileno Arena', weightKg: 4, percentage: 50 },
      { layerName: 'Capa Interior', materialId: 'pe_espumado', materialName: 'Polietileno Espumado', weightKg: 4, percentage: 50 }
    ],
    image: 'assets/img/modelos/tinaco_bicapa_generic.svg',
    isPending: false,
    notes: 'Tinaco pequeño bicapa (4 kg Arena + 4 kg Espumado).'
  },
  {
    id: 'tinaco-bicapa-600',
    name: 'Tinaco 600 L Bicapa',
    capacity: 600,
    group: PRODUCT_GROUPS.TINACO_BICAPA,
    categoryLabel: 'Tinaco Bicapa',
    totalWeightKg: 10,
    layers: [
      { layerName: 'Capa Exterior', materialId: 'pe_arena', materialName: 'Polietileno Arena', weightKg: 5, percentage: 50 },
      { layerName: 'Capa Interior', materialId: 'pe_espumado', materialName: 'Polietileno Espumado', weightKg: 5, percentage: 50 }
    ],
    image: 'assets/img/modelos/tinaco_bicapa_generic.svg',
    isPending: false,
    notes: 'Tinaco bicapa 600L (5 kg Arena + 5 kg Espumado).'
  },
  {
    id: 'tinaco-bicapa-800',
    name: 'Tinaco 800 L Bicapa',
    capacity: 800,
    group: PRODUCT_GROUPS.TINACO_BICAPA,
    categoryLabel: 'Tinaco Bicapa',
    totalWeightKg: 14,
    layers: [
      { layerName: 'Capa Exterior', materialId: 'pe_arena', materialName: 'Polietileno Arena', weightKg: 7, percentage: 50 },
      { layerName: 'Capa Interior', materialId: 'pe_espumado', materialName: 'Polietileno Espumado', weightKg: 7, percentage: 50 }
    ],
    image: 'assets/img/modelos/tinaco_bicapa_generic.svg',
    isPending: false,
    notes: 'Tinaco bicapa 800L estándar (7 kg Arena + 7 kg Espumado).'
  },
  {
    id: 'tinaco-bicapa-1100-trad',
    name: 'Tinaco 1100 L Tradicional Bicapa',
    capacity: 1100,
    group: PRODUCT_GROUPS.TINACO_BICAPA,
    categoryLabel: 'Tinaco Bicapa',
    totalWeightKg: 16,
    layers: [
      { layerName: 'Capa Exterior', materialId: 'pe_arena', materialName: 'Polietileno Arena', weightKg: 8, percentage: 50 },
      { layerName: 'Capa Interior', materialId: 'pe_espumado', materialName: 'Polietileno Espumado', weightKg: 8, percentage: 50 }
    ],
    image: 'assets/img/modelos/tinaco_bicapa_generic.svg',
    isPending: false,
    notes: 'Modelo tradicional estándar 1100L bicapa (8 kg Arena + 8 kg Espumado).'
  },
  {
    id: 'tinaco-bicapa-1100-bala',
    name: 'Tinaco 1100 L Bala / Vertical Bicapa',
    capacity: 1100,
    group: PRODUCT_GROUPS.TINACO_BICAPA,
    categoryLabel: 'Tinaco Bicapa',
    totalWeightKg: 16,
    layers: [
      { layerName: 'Capa Exterior', materialId: 'pe_arena', materialName: 'Polietileno Arena', weightKg: 8, percentage: 50 },
      { layerName: 'Capa Interior', materialId: 'pe_espumado', materialName: 'Polietileno Espumado', weightKg: 8, percentage: 50 }
    ],
    image: 'assets/img/modelos/tinaco_bicapa_generic.svg',
    isPending: false,
    notes: 'Modelo esbelto vertical 1100L bicapa (8 kg Arena + 8 kg Espumado).'
  },
  {
    id: 'tinaco-bicapa-1300',
    name: 'Tinaco 1300 L Bicapa',
    capacity: 1300,
    group: PRODUCT_GROUPS.TINACO_BICAPA,
    categoryLabel: 'Tinaco Bicapa',
    totalWeightKg: 20,
    layers: [
      { layerName: 'Capa Exterior', materialId: 'pe_arena', materialName: 'Polietileno Arena', weightKg: 10, percentage: 50 },
      { layerName: 'Capa Interior', materialId: 'pe_espumado', materialName: 'Polietileno Espumado', weightKg: 10, percentage: 50 }
    ],
    image: 'assets/img/modelos/tinaco_bicapa_generic.svg',
    isPending: true,
    notes: '⚠️ Cantidad pendiente por confirmar en planta (estimado 10 kg / 10 kg).'
  },

  // --- TINACOS TRICAPA (1/3 PE Arena + 1/3 PE Negro UV + 1/3 Espumado) ---
  {
    id: 'tinaco-tricapa-450',
    name: 'Tinaco 450 L Tricapa',
    capacity: 450,
    group: PRODUCT_GROUPS.TINACO_TRICAPA,
    categoryLabel: 'Tinaco Tricapa',
    totalWeightKg: 12,
    layers: [
      { layerName: 'Capa 1 (Exterior)', materialId: 'pe_arena', materialName: 'Polietileno Arena', weightKg: 4, percentage: 33.33 },
      { layerName: 'Capa 2 (Filtro UV)', materialId: 'pe_negro', materialName: 'Polietileno Negro UV', weightKg: 4, percentage: 33.33 },
      { layerName: 'Capa 3 (Interior)', materialId: 'pe_espumado', materialName: 'Polietileno Espumado', weightKg: 4, percentage: 33.33 }
    ],
    image: 'assets/img/modelos/tinaco_tricapa_generic.svg',
    isPending: false,
    notes: 'Tinaco tricapa 450L (4 kg Arena / 4 kg Negro UV / 4 kg Espumado).'
  },
  {
    id: 'tinaco-tricapa-600',
    name: 'Tinaco 600 L Tricapa',
    capacity: 600,
    group: PRODUCT_GROUPS.TINACO_TRICAPA,
    categoryLabel: 'Tinaco Tricapa',
    totalWeightKg: 15,
    layers: [
      { layerName: 'Capa 1 (Exterior)', materialId: 'pe_arena', materialName: 'Polietileno Arena', weightKg: 5, percentage: 33.33 },
      { layerName: 'Capa 2 (Filtro UV)', materialId: 'pe_negro', materialName: 'Polietileno Negro UV', weightKg: 5, percentage: 33.33 },
      { layerName: 'Capa 3 (Interior)', materialId: 'pe_espumado', materialName: 'Polietileno Espumado', weightKg: 5, percentage: 33.33 }
    ],
    image: 'assets/img/modelos/tinaco_tricapa_generic.svg',
    isPending: false,
    notes: 'Tinaco 600L tricapa en 3 partes iguales (5 kg Arena / 5 kg Negro UV / 5 kg Espumado).'
  },
  {
    id: 'tinaco-tricapa-800',
    name: 'Tinaco 800 L Tricapa',
    capacity: 800,
    group: PRODUCT_GROUPS.TINACO_TRICAPA,
    categoryLabel: 'Tinaco Tricapa',
    totalWeightKg: 21,
    layers: [
      { layerName: 'Capa 1 (Exterior)', materialId: 'pe_arena', materialName: 'Polietileno Arena', weightKg: 7, percentage: 33.33 },
      { layerName: 'Capa 2 (Filtro UV)', materialId: 'pe_negro', materialName: 'Polietileno Negro UV', weightKg: 7, percentage: 33.33 },
      { layerName: 'Capa 3 (Interior)', materialId: 'pe_espumado', materialName: 'Polietileno Espumado', weightKg: 7, percentage: 33.33 }
    ],
    image: 'assets/img/modelos/tinaco_tricapa_generic.svg',
    isPending: false,
    notes: 'Tinaco 800L tricapa en 3 partes iguales (7 kg Arena / 7 kg Negro UV / 7 kg Espumado).'
  },
  {
    id: 'tinaco-tricapa-1100-trad',
    name: 'Tinaco 1100 L Tradicional Tricapa',
    capacity: 1100,
    group: PRODUCT_GROUPS.TINACO_TRICAPA,
    categoryLabel: 'Tinaco Tricapa',
    totalWeightKg: 27,
    layers: [
      { layerName: 'Capa 1 (Exterior)', materialId: 'pe_arena', materialName: 'Polietileno Arena', weightKg: 9, percentage: 33.33 },
      { layerName: 'Capa 2 (Filtro UV)', materialId: 'pe_negro', materialName: 'Polietileno Negro UV', weightKg: 9, percentage: 33.33 },
      { layerName: 'Capa 3 (Interior)', materialId: 'pe_espumado', materialName: 'Polietileno Espumado', weightKg: 9, percentage: 33.33 }
    ],
    image: 'assets/img/modelos/tinaco_tricapa_generic.svg',
    isPending: false,
    notes: 'Tinaco 1100L tradicional tricapa (9 kg Arena / 9 kg Negro UV / 9 kg Espumado).'
  },
  {
    id: 'tinaco-tricapa-1100-bala',
    name: 'Tinaco 1100 L Bala / Vertical Tricapa',
    capacity: 1100,
    group: PRODUCT_GROUPS.TINACO_TRICAPA,
    categoryLabel: 'Tinaco Tricapa',
    totalWeightKg: 27,
    layers: [
      { layerName: 'Capa 1 (Exterior)', materialId: 'pe_arena', materialName: 'Polietileno Arena', weightKg: 9, percentage: 33.33 },
      { layerName: 'Capa 2 (Filtro UV)', materialId: 'pe_negro', materialName: 'Polietileno Negro UV', weightKg: 9, percentage: 33.33 },
      { layerName: 'Capa 3 (Interior)', materialId: 'pe_espumado', materialName: 'Polietileno Espumado', weightKg: 9, percentage: 33.33 }
    ],
    image: 'assets/img/modelos/tinaco_tricapa_generic.svg',
    isPending: false,
    notes: 'Tinaco 1100L bala tricapa (9 kg Arena / 9 kg Negro UV / 9 kg Espumado).'
  },
  {
    id: 'tinaco-tricapa-1300',
    name: 'Tinaco 1300 L Tricapa',
    capacity: 1300,
    group: PRODUCT_GROUPS.TINACO_TRICAPA,
    categoryLabel: 'Tinaco Tricapa',
    totalWeightKg: 30,
    layers: [
      { layerName: 'Capa 1 (Exterior)', materialId: 'pe_arena', materialName: 'Polietileno Arena', weightKg: 10, percentage: 33.33 },
      { layerName: 'Capa 2 (Filtro UV)', materialId: 'pe_negro', materialName: 'Polietileno Negro UV', weightKg: 10, percentage: 33.33 },
      { layerName: 'Capa 3 (Interior)', materialId: 'pe_espumado', materialName: 'Polietileno Espumado', weightKg: 10, percentage: 33.33 }
    ],
    image: 'assets/img/modelos/tinaco_tricapa_generic.svg',
    isPending: true,
    notes: '⚠️ Cantidad pendiente por confirmar en planta (estimado 10 kg / 10 kg / 10 kg).'
  },

  // --- CISTERNAS Y TAMBOS (Puro Polietileno en múltiples cargas/capas) ---
  {
    id: 'cisterna-1100-trad',
    name: 'Cisterna 1100 L Tradicional (Bicapa)',
    capacity: 1100,
    group: PRODUCT_GROUPS.CISTERNA,
    categoryLabel: 'Cisterna Bicapa',
    totalWeightKg: 18,
    layers: [
      { layerName: 'Capa 1 (1ra Carga)', materialId: 'pe_cisterna', materialName: 'Polietileno Cisterna', weightKg: 9, percentage: 50 },
      { layerName: 'Capa 2 (2da Carga)', materialId: 'pe_cisterna', materialName: 'Polietileno Cisterna', weightKg: 9, percentage: 50 }
    ],
    image: 'assets/img/modelos/cisterna_generic.svg',
    isPending: false,
    notes: 'Cisterna 1100L en 2 capas de 9 kg de polietileno cada una (18 kg total).'
  },
  {
    id: 'cisterna-1100-bala',
    name: 'Cisterna 1100 L Bala / Vertical (Bicapa)',
    capacity: 1100,
    group: PRODUCT_GROUPS.CISTERNA,
    categoryLabel: 'Cisterna Bicapa',
    totalWeightKg: 18,
    layers: [
      { layerName: 'Capa 1 (1ra Carga)', materialId: 'pe_cisterna', materialName: 'Polietileno Cisterna', weightKg: 9, percentage: 50 },
      { layerName: 'Capa 2 (2da Carga)', materialId: 'pe_cisterna', materialName: 'Polietileno Cisterna', weightKg: 9, percentage: 50 }
    ],
    image: 'assets/img/modelos/cisterna_generic.svg',
    isPending: false,
    notes: 'Cisterna 1100L bala vertical en 2 capas de 9 kg (18 kg total).'
  },
  {
    id: 'cisterna-1300',
    name: 'Cisterna 1300 L (Bicapa)',
    capacity: 1300,
    group: PRODUCT_GROUPS.CISTERNA,
    categoryLabel: 'Cisterna Bicapa',
    totalWeightKg: 24,
    layers: [
      { layerName: 'Capa 1 (1ra Carga)', materialId: 'pe_cisterna', materialName: 'Polietileno Cisterna', weightKg: 12, percentage: 50 },
      { layerName: 'Capa 2 (2da Carga)', materialId: 'pe_cisterna', materialName: 'Polietileno Cisterna', weightKg: 12, percentage: 50 }
    ],
    image: 'assets/img/modelos/cisterna_generic.svg',
    isPending: true,
    notes: '⚠️ Cantidad estimada: 2 capas de 12 kg (24 kg total).'
  },
  {
    id: 'cisterna-3000',
    name: 'Cisterna 3000 L (Bicapa Reforzada)',
    capacity: 3000,
    group: PRODUCT_GROUPS.CISTERNA,
    categoryLabel: 'Cisterna Bicapa',
    totalWeightKg: 50,
    layers: [
      { layerName: 'Capa 1 (1ra Carga)', materialId: 'pe_cisterna', materialName: 'Polietileno Cisterna', weightKg: 25, percentage: 50 },
      { layerName: 'Capa 2 (2da Carga)', materialId: 'pe_cisterna', materialName: 'Polietileno Cisterna', weightKg: 25, percentage: 50 }
    ],
    image: 'assets/img/modelos/cisterna_generic.svg',
    isPending: false,
    notes: 'Cisterna 3000L en 2 capas de 25 kg de polietileno cada una (50 kg total).'
  },
  {
    id: 'cisterna-5500',
    name: 'Cisterna 5500 L (4 Capas Industrial)',
    capacity: 5500,
    group: PRODUCT_GROUPS.CISTERNA,
    categoryLabel: 'Cisterna 4 Capas',
    totalWeightKg: 100,
    layers: [
      { layerName: 'Capa 1 (1ra Carga)', materialId: 'pe_cisterna', materialName: 'Polietileno Cisterna', weightKg: 25, percentage: 25 },
      { layerName: 'Capa 2 (2da Carga)', materialId: 'pe_cisterna', materialName: 'Polietileno Cisterna', weightKg: 25, percentage: 25 },
      { layerName: 'Capa 3 (3ra Carga)', materialId: 'pe_cisterna', materialName: 'Polietileno Cisterna', weightKg: 25, percentage: 25 },
      { layerName: 'Capa 4 (4ta Carga)', materialId: 'pe_cisterna', materialName: 'Polietileno Cisterna', weightKg: 25, percentage: 25 }
    ],
    image: 'assets/img/modelos/cisterna_generic.svg',
    isPending: false,
    notes: 'Cisterna industrial máxima capacidad 5500L en 4 capas de 25 kg cada una (100 kg total).'
  },
  {
    id: 'tambo-especial',
    name: 'Tambo Estándar 200 L (3 Cargas)',
    capacity: 200,
    group: PRODUCT_GROUPS.CISTERNA,
    categoryLabel: 'Tambo 3 Cargas',
    totalWeightKg: 6,
    layers: [
      { layerName: 'Capa 1 (1ra Carga)', materialId: 'pe_cisterna', materialName: 'Polietileno Estándar', weightKg: 2.5, percentage: 41.67 },
      { layerName: 'Capa 2 (2da Carga)', materialId: 'pe_cisterna', materialName: 'Polietileno Estándar', weightKg: 2.5, percentage: 41.67 },
      { layerName: 'Capa 3 (Refuerzo Final)', materialId: 'pe_cisterna', materialName: 'Polietileno Estándar', weightKg: 1.0, percentage: 16.66 }
    ],
    image: 'assets/img/modelos/tambo_generic.svg',
    isPending: false,
    notes: 'Tambo de 6 kg fabricado en 3 cargas de polietileno: 2.5 kg + 2.5 kg + 1 kg de refuerzo final.'
  }
];

/**
 * Gestor de Persistencia y Almacenamiento Local (DataManager)
 * Permite guardar cambios hechos desde el panel de ajustes (⚙️)
 */
const DataManager = {
  PRODUCTS_KEY: 'cytimaz_products_db_v1',
  CONFIG_KEY: 'cytimaz_config_db_v1',

  getProducts() {
    try {
      const stored = localStorage.getItem(this.PRODUCTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading localStorage products:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
  },

  saveProducts(productsList) {
    try {
      localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(productsList));
      PRODUCTS_DATA = productsList;
      return true;
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      return false;
    }
  },

  getConfig() {
    try {
      const stored = localStorage.getItem(this.CONFIG_KEY);
      if (stored) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Error reading localStorage config:', e);
    }
    return { ...DEFAULT_CONFIG };
  },

  saveConfig(configObj) {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(configObj));
      APP_CONFIG = configObj;
      return true;
    } catch (e) {
      console.error('Error saving config:', e);
      return false;
    }
  },

  resetToDefaults() {
    try {
      localStorage.removeItem(this.PRODUCTS_KEY);
      localStorage.removeItem(this.CONFIG_KEY);
      PRODUCTS_DATA = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
      APP_CONFIG = { ...DEFAULT_CONFIG };
      return true;
    } catch (e) {
      return false;
    }
  }
};

// Carga activa de productos y configuración
let PRODUCTS_DATA = DataManager.getProducts();
let APP_CONFIG = DataManager.getConfig();
