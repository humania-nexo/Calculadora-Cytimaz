/**
 * ====================================================================
 * MOD-MP-PT.JS - Módulo: Materia Prima -> Producto Terminado
 * ====================================================================
 * Permite realizar el cálculo inverso:
 * - Ingresar la cantidad de material disponible (en SACOS de 24kg o en KILOS)
 * - Seleccionar el modelo objetivo a fabricar (ej. Cisterna 3000L con 8 sacos)
 * - Determina cuántas piezas se pueden fabricar exactamente
 * - Identifica cuellos de botella (material limitante), sobrantes y faltantes
 * ====================================================================
 */

const ModMpPt = {
  // Estado local
  selectedProductId: 'cisterna-3000',
  inputUnit: 'bags', // 'bags' o 'kg'
  inputs: {
    pe_cisterna: 8,  // 8 sacos por defecto (ejemplo del usuario)
    pe_arena: 10,
    pe_negro: 10,
    pe_espumado: 10
  },

  /**
   * Inicializa el módulo
   */
  init() {
    this.container = document.getElementById('mod-mp-pt-container');
    if (!this.container) return;

    this.render();
  },

  /**
   * Cambia la unidad de entrada (Sacos vs Kilos)
   */
  setInputUnit(unit) {
    if (this.inputUnit === unit) return;
    const bagSize = CalculationEngine.getBagWeightKg();

    // Convertir valores actuales para no perder el contexto
    if (unit === 'kg') {
      for (const k in this.inputs) {
        this.inputs[k] = this.inputs[k] * bagSize;
      }
    } else {
      for (const k in this.inputs) {
        this.inputs[k] = parseFloat((this.inputs[k] / bagSize).toFixed(1));
      }
    }

    this.inputUnit = unit;
    this.render();
  },

  /**
   * Selecciona un producto objetivo
   */
  selectProduct(productId) {
    this.selectedProductId = productId;
    this.render();
  },

  /**
   * Actualiza el valor de un insumo
   */
  updateInput(materialId, value) {
    this.inputs[materialId] = Math.max(0, parseFloat(value) || 0);
    this.calculate();
  },

  /**
   * Incrementa o decrementa rápidamente
   */
  stepInput(materialId, delta) {
    this.inputs[materialId] = Math.max(0, (parseFloat(this.inputs[materialId]) || 0) + delta);
    this.render();
  },

  /**
   * Renderiza la interfaz del módulo
   */
  render() {
    const bagKg = CalculationEngine.getBagWeightKg();
    const product = CalculationEngine.getProductById(this.selectedProductId) || PRODUCTS_DATA[0];

    this.container.innerHTML = `
      <div class="module-header">
        <div class="header-text">
          <div class="badge-tag">Módulo 2 • Capacidad y Cuellos de Botella</div>
          <h2>🔄 Materia Prima ➔ Producto Terminado</h2>
          <p>¿Tienes stock de resina y quieres saber cuántas piezas puedes fabricar? Ingresa tus sacos o kilos disponibles.</p>
        </div>
      </div>

      <!-- Selector de Unidad (Sacos vs Kilos) -->
      <div class="unit-toggle-bar">
        <span class="unit-toggle-label">Modo de Ingreso de Stock:</span>
        <div class="toggle-buttons">
          <button class="btn-toggle ${this.inputUnit === 'bags' ? 'active' : ''}" onclick="ModMpPt.setInputUnit('bags')">
            📦 Por Sacos (${bagKg} kg c/u)
          </button>
          <button class="btn-toggle ${this.inputUnit === 'kg' ? 'active' : ''}" onclick="ModMpPt.setInputUnit('kg')">
            ⚖️ Por Kilogramos (kg)
          </button>
        </div>
      </div>

      <div class="grid-calculator">
        <!-- Panel Izquierdo: Selección del Modelo y Entrada de Stock -->
        <div class="card card-form">
          <div class="card-header-flex">
            <div>
              <h3>1. Selecciona el Modelo a Producir</h3>
              <span class="subtext">El cálculo se adaptará a las capas requeridas</span>
            </div>
          </div>

          <div class="form-group mb-4">
            <select class="form-control select-large" onchange="ModMpPt.selectProduct(this.value)">
              <optgroup label="🔵 Cisternas y Tambos (100% Polietileno)">
                ${PRODUCTS_DATA.filter(p => p.group === PRODUCT_GROUPS.CISTERNA).map(p => `
                  <option value="${p.id}" ${p.id === this.selectedProductId ? 'selected' : ''}>
                    ${p.name} — ${p.totalWeightKg} kg PE
                  </option>
                `).join('')}
              </optgroup>
              <optgroup label="🟢 Tinacos Bicapa (50% PE / 50% Espumado)">
                ${PRODUCTS_DATA.filter(p => p.group === PRODUCT_GROUPS.TINACO_BICAPA).map(p => `
                  <option value="${p.id}" ${p.id === this.selectedProductId ? 'selected' : ''}>
                    ${p.name} — ${p.totalWeightKg} kg (50/50)
                  </option>
                `).join('')}
              </optgroup>
              <optgroup label="🟠 Tinacos Tricapa (3 Capas: Arena + Negro UV + Espumado)">
                ${PRODUCTS_DATA.filter(p => p.group === PRODUCT_GROUPS.TINACO_TRICAPA).map(p => `
                  <option value="${p.id}" ${p.id === this.selectedProductId ? 'selected' : ''}>
                    ${p.name} — ${p.totalWeightKg} kg (3 Capas)
                  </option>
                `).join('')}
              </optgroup>
            </select>
          </div>

          <!-- Ficha rápida del modelo seleccionado -->
          <div class="selected-product-banner">
            <div class="banner-title">${product.name}</div>
            <div class="banner-specs">
              <span>Peso Unitario: <strong>${product.totalWeightKg} kg</strong></span>
              <span>Categoría: <strong>${product.categoryLabel}</strong></span>
              <span>Capas: <strong>${product.layers.length}</strong></span>
            </div>
            <div class="banner-layers">
              ${product.layers.map(l => `
                <span class="layer-pill ${l.materialId}">
                  ${l.layerName}: <strong>${l.weightKg} kg</strong> (${l.materialName})
                </span>
              `).join('')}
            </div>
          </div>

          <h3 class="mt-5 mb-2">2. Ingresa el Stock Disponible</h3>
          <p class="text-xs text-muted mb-3">
            ${this.inputUnit === 'bags' ? `Ingresa la cantidad de sacos de ${bagKg} kg:` : 'Ingresa la cantidad de kilogramos:'}
          </p>

          <div class="stock-inputs-list">
            ${product.layers.map(layer => {
              const val = this.inputs[layer.materialId] || 0;
              const unitLabel = this.inputUnit === 'bags' ? `sacos (${bagKg}kg)` : 'kg';
              return `
                <div class="stock-input-row">
                  <div class="stock-label">
                    <span class="mat-dot-indicator ${layer.materialId}"></span>
                    <div>
                      <strong>${layer.materialName}</strong>
                      <div class="text-xs text-muted">${layer.layerName} (requiere ${layer.weightKg} kg/pz)</div>
                    </div>
                  </div>
                  <div class="stock-control">
                    <button type="button" class="btn-qty" onclick="ModMpPt.stepInput('${layer.materialId}', -5)">-5</button>
                    <button type="button" class="btn-qty" onclick="ModMpPt.stepInput('${layer.materialId}', -1)">-1</button>
                    <input type="number" min="0" step="${this.inputUnit === 'bags' ? '1' : '5'}" 
                      class="form-control stock-field" value="${val}"
                      oninput="ModMpPt.updateInput('${layer.materialId}', this.value)"
                      onchange="ModMpPt.updateInput('${layer.materialId}', this.value)">
                    <button type="button" class="btn-qty" onclick="ModMpPt.stepInput('${layer.materialId}', 1)">+1</button>
                    <button type="button" class="btn-qty" onclick="ModMpPt.stepInput('${layer.materialId}', 5)">+5</button>
                    <span class="stock-unit">${unitLabel}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Panel Derecho: Capacidad Alcanzable y Sobrantes -->
        <div class="card card-summary" id="mp-pt-results-box">
          <!-- Calculado dinámicamente -->
        </div>
      </div>
    `;

    this.calculate();
  },

  /**
   * Ejecuta el cálculo inverso
   */
  calculate() {
    const box = document.getElementById('mp-pt-results-box');
    if (!box) return;

    const result = CalculationEngine.calculateCapacityForProduct(
      this.selectedProductId,
      this.inputs,
      this.inputUnit
    );

    if (!result) return;

    const p = result.product;
    const bagSize = result.bagSizeKg;

    box.innerHTML = `
      <div class="card-header-flex">
        <div>
          <h3>Resultado de Capacidad de Producción</h3>
          <span class="subtext">Para modelo: <strong>${p.name}</strong></span>
        </div>
      </div>

      <!-- Hero Banner de Unidades Posibles -->
      <div class="capacity-hero">
        <div class="capacity-badge-label">PIEZAS COMPLETAS A FABRICAR:</div>
        <div class="capacity-number">${result.maxPossibleUnits} <span class="unit-pzs">unidades</span></div>
        <div class="capacity-stats">
          <span>📦 Total producto terminado: <strong>${result.totalProducedKg.toLocaleString('es-MX')} kg</strong> (${result.totalProducedBags.totalBagsDecimal} sacos)</span>
        </div>
      </div>

      <!-- Cuello de Botella o Factor Limitante -->
      <div class="bottleneck-banner ${result.limitingMaterial ? 'warning' : 'success'} mt-4">
        <div class="bottleneck-icon">⚠️</div>
        <div class="bottleneck-text">
          <strong>Material Limitante (Cuello de Botella):</strong>
          <div>
            ${result.limitingMaterial ? `
              El componente <strong>${result.limitingMaterial.materialName}</strong> limita la producción a <strong>${result.maxPossibleUnits} piezas</strong>.
            ` : 'No hay restricciones de material.'}
          </div>
        </div>
      </div>

      <!-- Balance por Capa: Usado, Sobrante y Faltante para +1 pieza -->
      <h4 class="section-subtitle mt-4">Balance Detallado de Stock:</h4>
      <div class="leftovers-list">
        ${result.leftovers.map(item => {
          return `
            <div class="leftover-card">
              <div class="leftover-header">
                <strong>${item.materialName}</strong>
                <span class="badge badge-outline">Usado: ${item.usedKg} kg (${item.usedBags.fullBags} sacos ${item.usedBags.remainderKg > 0 ? `+ ${item.usedBags.remainderKg}kg` : ''})</span>
              </div>
              
              <div class="leftover-grid">
                <div class="leftover-item">
                  <span class="lbl">Sobrante disponible:</span>
                  <span class="val font-semibold text-success">
                    ${item.leftoverKg} kg
                    <small>(${item.leftoverBags.fullBags} sacos + ${item.leftoverBags.remainderKg} kg)</small>
                  </span>
                </div>

                <div class="leftover-item">
                  <span class="lbl">Faltante para fabricar +1 pieza:</span>
                  <span class="val ${item.nextUnitDeficitKg > 0 ? 'text-danger font-bold' : 'text-success'}">
                    ${item.nextUnitDeficitKg > 0 ? `Faltan ${item.nextUnitDeficitKg} kg (${item.nextUnitDeficitBags.totalBagsDecimal} sacos)` : '✅ Ya tienes suficiente para la siguiente'}
                  </span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
};
