/**
 * ====================================================================
 * MOD-PT-MP.JS - Módulo: Producto Terminado -> Materia Prima
 * ====================================================================
 * Permite planificar órdenes de producción:
 * - Seleccionar múltiples modelos y sus cantidades (ej. 50 cisternas de 1100L)
 * - Configurar porcentaje de merma opcional
 * - Generar el balance exacto de Polietileno Arena, Negro UV, Espumado y Cisterna
 * - Entrega la SUMA TOTAL EN KILOS y la CONVERSIÓN A SACOS DE 24 KILOS
 * - Muestra el informe desglosado por unidad y total acumulado
 * ====================================================================
 */

const ModPtMp = {
  // Filas activas de la orden: { id, productId, quantity }
  orderRows: [],

  /**
   * Inicializa el módulo
   */
  init() {
    this.container = document.getElementById('mod-pt-mp-container');
    if (!this.container) return;

    // Fila inicial de ejemplo: 50 Cisternas 1100L (el ejemplo clásico del usuario)
    this.orderRows = [
      { id: Date.now(), productId: 'cisterna-1100-trad', quantity: 50 }
    ];

    this.render();
  },

  /**
   * Agrega una nueva fila de producto
   */
  addRow(productId = '', quantity = 10) {
    this.orderRows.push({
      id: Date.now() + Math.floor(Math.random() * 1000),
      productId: productId || (PRODUCTS_DATA[0] ? PRODUCTS_DATA[0].id : ''),
      quantity: quantity
    });
    this.renderOrderList();
    this.calculate();
  },

  /**
   * Elimina una fila por su ID
   */
  removeRow(rowId) {
    this.orderRows = this.orderRows.filter(r => String(r.id) !== String(rowId));
    if (this.orderRows.length === 0) {
      this.addRow();
    } else {
      this.renderOrderList();
      this.calculate();
    }
  },

  /**
   * Limpia toda la lista de orden
   */
  clearOrder() {
    this.orderRows = [];
    this.addRow();
  },

  /**
   * Renderiza la vista principal del Módulo
   */
  render() {
    const bagKg = CalculationEngine.getBagWeightKg();

    this.container.innerHTML = `
      <div class="module-header">
        <div class="header-text">
          <div class="badge-tag">Módulo 1 • Planificación de Producción</div>
          <h2>📦 Producto Terminado ➔ Materia Prima</h2>
          <p>Ingresa los modelos y cantidades a fabricar para calcular los <strong>Kilos Totales</strong> y <strong>Sacos de ${bagKg} kg</strong> requeridos.</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" onclick="ModPtMp.clearOrder()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Nueva Orden
          </button>
        </div>
      </div>

      <!-- Accesos Rápidos de Adición -->
      <div class="quick-add-bar">
        <span class="quick-title">⚡ Atajos rápidos:</span>
        <div class="quick-buttons">
          <button class="pill pill-blue" onclick="ModPtMp.addRow('cisterna-1100-trad', 50)">+ 50 Cisternas 1100L</button>
          <button class="pill pill-sand" onclick="ModPtMp.addRow('tinaco-tricapa-1100-trad', 20)">+ 20 Tinacos 1100L Tricapa</button>
          <button class="pill pill-foam" onclick="ModPtMp.addRow('tinaco-bicapa-1100-trad', 20)">+ 20 Tinacos 1100L Bicapa</button>
          <button class="pill pill-blue" onclick="ModPtMp.addRow('cisterna-3000', 5)">+ 5 Cisternas 3000L</button>
          <button class="pill pill-blue" onclick="ModPtMp.addRow('cisterna-5500', 2)">+ 2 Cisternas 5500L</button>
          <button class="pill pill-sand" onclick="ModPtMp.addRow('tinaco-tricapa-600', 10)">+ 10 Tinacos 600L Tricapa</button>
          <button class="pill pill-blue" onclick="ModPtMp.addRow('tambo-especial', 15)">+ 15 Tambos 200L</button>
        </div>
      </div>

      <div class="grid-calculator">
        <!-- Panel Izquierdo: Selección de Productos -->
        <div class="card card-form">
          <div class="card-header-flex">
            <div>
              <h3>Modelos en la Orden</h3>
              <span class="subtext">Selecciona modelo y cantidad de piezas</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="ModPtMp.addRow()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Añadir Producto
            </button>
          </div>

          <!-- Contenedor dinámico de filas -->
          <div id="order-rows-list" class="order-rows-list"></div>

          <!-- Ajuste de Merma -->
          <div class="scrap-control-box">
            <div class="scrap-info">
              <label for="scrap-input-pt"><strong>Merma / Desperdicio (%):</strong></label>
              <span class="text-xs text-muted">Factor extra para compensar pérdidas operativas o arranque de ciclo</span>
            </div>
            <div class="input-addon-group">
              <input type="number" id="scrap-input-pt" min="0" max="30" step="0.5" value="0" oninput="ModPtMp.calculate()">
              <span class="addon-label">%</span>
            </div>
          </div>
        </div>

        <!-- Panel Derecho: Resumen de Kilos y Sacos de 24kg -->
        <div class="card card-summary" id="results-summary-box">
          <!-- Calculado dinámicamente -->
        </div>
      </div>

      <!-- Tabla de Desglose Completo e Informe Unitario -->
      <div class="card mt-6" id="order-breakdown-table-box">
        <!-- Calculado dinámicamente -->
      </div>
    `;

    this.renderOrderList();
    this.calculate();
  },

  /**
   * Renderiza las filas de selección de modelos
   */
  renderOrderList() {
    const list = document.getElementById('order-rows-list');
    if (!list) return;

    list.innerHTML = this.orderRows.map((row, index) => {
      return `
        <div class="order-row-item" data-id="${row.id}">
          <span class="item-index">${index + 1}</span>
          
          <div class="select-wrapper">
            <select class="form-control select-product" onchange="ModPtMp.updateRow('${row.id}', 'productId', this.value)">
              <optgroup label="🔵 Cisternas y Tambos (100% Polietileno)">
                ${PRODUCTS_DATA.filter(p => p.group === PRODUCT_GROUPS.CISTERNA).map(p => `
                  <option value="${p.id}" ${p.id === row.productId ? 'selected' : ''}>
                    ${p.name} — ${p.totalWeightKg} kg PE
                  </option>
                `).join('')}
              </optgroup>
              <optgroup label="🟢 Tinacos Bicapa (50% PE / 50% Espumado)">
                ${PRODUCTS_DATA.filter(p => p.group === PRODUCT_GROUPS.TINACO_BICAPA).map(p => `
                  <option value="${p.id}" ${p.id === row.productId ? 'selected' : ''}>
                    ${p.name} — ${p.totalWeightKg} kg (50/50)
                  </option>
                `).join('')}
              </optgroup>
              <optgroup label="🟠 Tinacos Tricapa (1/3 Arena + 1/3 Negro UV + 1/3 Espumado)">
                ${PRODUCTS_DATA.filter(p => p.group === PRODUCT_GROUPS.TINACO_TRICAPA).map(p => `
                  <option value="${p.id}" ${p.id === row.productId ? 'selected' : ''}>
                    ${p.name} — ${p.totalWeightKg} kg (3 Capas)
                  </option>
                `).join('')}
              </optgroup>
            </select>
          </div>

          <div class="quantity-input-group">
            <button type="button" class="btn-qty" onclick="ModPtMp.stepQty('${row.id}', -5)">-5</button>
            <button type="button" class="btn-qty" onclick="ModPtMp.stepQty('${row.id}', -1)">-</button>
            <input type="number" min="1" max="5000" class="form-control input-qty" value="${row.quantity}" 
              onchange="ModPtMp.updateRow('${row.id}', 'quantity', this.value)"
              oninput="ModPtMp.updateRow('${row.id}', 'quantity', this.value)">
            <button type="button" class="btn-qty" onclick="ModPtMp.stepQty('${row.id}', 1)">+</button>
            <button type="button" class="btn-qty" onclick="ModPtMp.stepQty('${row.id}', 5)">+5</button>
            <span class="unit-text">pzs</span>
          </div>

          <button class="btn-icon btn-danger-icon" title="Quitar modelo" onclick="ModPtMp.removeRow('${row.id}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
          </button>
        </div>
      `;
    }).join('');
  },

  /**
   * Actualiza el valor de una fila
   */
  updateRow(rowId, key, value) {
    const row = this.orderRows.find(r => String(r.id) === String(rowId));
    if (row) {
      if (key === 'quantity') {
        row.quantity = Math.max(1, parseInt(value, 10) || 1);
      } else {
        row[key] = value;
      }
      this.calculate();
    }
  },

  /**
   * Cambia la cantidad de forma relativa
   */
  stepQty(rowId, delta) {
    const row = this.orderRows.find(r => String(r.id) === String(rowId));
    if (row) {
      row.quantity = Math.max(1, (parseInt(row.quantity, 10) || 1) + delta);
      this.renderOrderList();
      this.calculate();
    }
  },

  /**
   * Realiza el cálculo con el motor
   */
  calculate() {
    const scrapInput = document.getElementById('scrap-input-pt');
    const scrapVal = scrapInput ? (parseFloat(scrapInput.value) || 0) : 0;

    const result = CalculationEngine.calculateOrderRequirements(this.orderRows, scrapVal);
    this.renderSummaryBox(result);
    this.renderBreakdownTable(result);
  },

  /**
   * Renderiza el resumen de Kilos y Sacos de 24kg
   */
  renderSummaryBox(result) {
    const box = document.getElementById('results-summary-box');
    if (!box) return;

    const bagSize = result.bagSizeKg;
    const mats = result.materials;

    box.innerHTML = `
      <div class="card-header-flex">
        <div>
          <h3>Balance Global de Materias Primas</h3>
          <span class="subtext">Conversión en base a sacos de <strong>${bagSize} kg</strong></span>
        </div>
        <span class="badge badge-accent">${result.totalFinishedPieces} Unidades a Fabricar</span>
      </div>

      <!-- Banner de Gran Total -->
      <div class="grand-total-hero">
        <div class="hero-block">
          <span class="hero-label">PESO TOTAL EN KILOGRAMOS</span>
          <span class="hero-value">${result.totalWeightWithScrapKg.toLocaleString('es-MX')} <small>kg</small></span>
          ${result.scrapPercentage > 0 ? `<span class="hero-sub">Incluye ${result.scrapPercentage}% de merma</span>` : `<span class="hero-sub">Peso neto sin merma</span>`}
        </div>

        <div class="hero-divider"></div>

        <div class="hero-block">
          <span class="hero-label">TOTAL EN SACOS DE ${bagSize} KG</span>
          <span class="hero-value">${result.totalBagsAll.fullBags} <small>sacos</small> ${result.totalBagsAll.remainderKg > 0 ? `+ ${result.totalBagsAll.remainderKg} kg` : ''}</span>
          <span class="hero-sub">Equivalente a <strong>${result.totalBagsAll.totalBagsDecimal}</strong> sacos</span>
        </div>
      </div>

      <!-- Tarjetas por Material -->
      <h4 class="section-subtitle mt-4">Desglose por Tipo de Resina:</h4>
      <div class="materials-cards-grid">
        <!-- Polietileno Cisterna -->
        <div class="mat-box mat-blue-box ${mats.pe_cisterna.withScrapKg > 0 ? 'active' : 'inactive'}">
          <div class="mat-box-header">
            <span class="icon">🔵</span>
            <strong>Polietileno Cisterna / Puro</strong>
          </div>
          <div class="mat-box-kg">${mats.pe_cisterna.withScrapKg.toLocaleString('es-MX')} kg</div>
          <div class="mat-box-bags">
            📦 <strong>${mats.pe_cisterna.bags.fullBags} sacos</strong> ${mats.pe_cisterna.bags.remainderKg > 0 ? `+ ${mats.pe_cisterna.bags.remainderKg} kg` : ''}
            <div class="text-xs text-muted">(${mats.pe_cisterna.bags.totalBagsDecimal} sacos de ${bagSize}kg)</div>
          </div>
        </div>

        <!-- Polietileno Arena / Claro -->
        <div class="mat-box mat-sand-box ${mats.pe_arena.withScrapKg > 0 ? 'active' : 'inactive'}">
          <div class="mat-box-header">
            <span class="icon">🟡</span>
            <strong>Polietileno Arena / Claro</strong>
          </div>
          <div class="mat-box-kg">${mats.pe_arena.withScrapKg.toLocaleString('es-MX')} kg</div>
          <div class="mat-box-bags">
            📦 <strong>${mats.pe_arena.bags.fullBags} sacos</strong> ${mats.pe_arena.bags.remainderKg > 0 ? `+ ${mats.pe_arena.bags.remainderKg} kg` : ''}
            <div class="text-xs text-muted">(${mats.pe_arena.bags.totalBagsDecimal} sacos de ${bagSize}kg)</div>
          </div>
        </div>

        <!-- Polietileno Negro UV -->
        <div class="mat-box mat-black-box ${mats.pe_negro.withScrapKg > 0 ? 'active' : 'inactive'}">
          <div class="mat-box-header">
            <span class="icon">⚫</span>
            <strong>Polietileno Negro (Filtro UV)</strong>
          </div>
          <div class="mat-box-kg">${mats.pe_negro.withScrapKg.toLocaleString('es-MX')} kg</div>
          <div class="mat-box-bags">
            📦 <strong>${mats.pe_negro.bags.fullBags} sacos</strong> ${mats.pe_negro.bags.remainderKg > 0 ? `+ ${mats.pe_negro.bags.remainderKg} kg` : ''}
            <div class="text-xs text-muted">(${mats.pe_negro.bags.totalBagsDecimal} sacos de ${bagSize}kg)</div>
          </div>
        </div>

        <!-- Polietileno Espumado -->
        <div class="mat-box mat-foam-box ${mats.pe_espumado.withScrapKg > 0 ? 'active' : 'inactive'}">
          <div class="mat-box-header">
            <span class="icon">⚪</span>
            <strong>Polietileno Espumado</strong>
          </div>
          <div class="mat-box-kg">${mats.pe_espumado.withScrapKg.toLocaleString('es-MX')} kg</div>
          <div class="mat-box-bags">
            📦 <strong>${mats.pe_espumado.bags.fullBags} sacos</strong> ${mats.pe_espumado.bags.remainderKg > 0 ? `+ ${mats.pe_espumado.bags.remainderKg} kg` : ''}
            <div class="text-xs text-muted">(${mats.pe_espumado.bags.totalBagsDecimal} sacos de ${bagSize}kg)</div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Renderiza la tabla con el informe unitario y el desglose de capas
   */
  renderBreakdownTable(result) {
    const container = document.getElementById('order-breakdown-table-box');
    if (!container) return;

    const bagSize = result.bagSizeKg;

    container.innerHTML = `
      <div class="card-header-flex">
        <div>
          <h3>📋 Informe Unitario y Desglose por Modelo</h3>
          <p class="text-muted">Detalla el peso de cada capa por pieza individual y el acumulado en kilos y sacos de la orden.</p>
        </div>
        <button class="btn btn-outline btn-sm" onclick="window.print()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Imprimir / PDF
        </button>
      </div>

      <div class="table-container">
        <table class="report-table">
          <thead>
            <tr>
              <th>Modelo Solicitado</th>
              <th>Categoría</th>
              <th class="text-center">Cant.</th>
              <th class="text-center">Peso Unitario</th>
              <th>Radiografía de Capas por Unidad</th>
              <th class="text-right">Subtotal Neto</th>
              <th class="text-right">Total (+Merma)</th>
              <th class="text-right">Sacos (${bagSize}kg)</th>
            </tr>
          </thead>
          <tbody>
            ${result.itemsBreakdown.map(item => {
              const p = item.product;
              return `
                <tr>
                  <td>
                    <strong>${p.name}</strong>
                    ${p.isPending ? '<span class="tag-pending">⚠️ Peso Estimado</span>' : ''}
                  </td>
                  <td>
                    <span class="badge ${p.group === PRODUCT_GROUPS.CISTERNA ? 'badge-blue' : (p.group === PRODUCT_GROUPS.TINACO_TRICAPA ? 'badge-sand' : 'badge-foam')}">
                      ${p.categoryLabel}
                    </span>
                  </td>
                  <td class="text-center font-bold">${item.quantity} pzs</td>
                  <td class="text-center">${item.unitWeightKg} kg</td>
                  <td>
                    <div class="layer-pill-stack">
                      ${item.layersDetail.map(l => `
                        <span class="layer-pill ${l.materialId}">
                          ${l.layerName}: <strong>${l.unitLayerKg} kg</strong> (${l.materialName})
                        </span>
                      `).join('')}
                    </div>
                  </td>
                  <td class="text-right">${item.subtotalNetKg.toLocaleString('es-MX')} kg</td>
                  <td class="text-right font-bold text-primary">${item.subtotalWithScrapKg.toLocaleString('es-MX')} kg</td>
                  <td class="text-right font-semibold">
                    ${item.bagsEquivalent.fullBags} bultos ${item.bagsEquivalent.remainderKg > 0 ? `+ ${item.bagsEquivalent.remainderKg}kg` : ''}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
          <tfoot>
            <tr class="table-summary-row">
              <td colspan="2"><strong>TOTALES ACUMULADOS DE LA ORDEN:</strong></td>
              <td class="text-center"><strong>${result.totalFinishedPieces} pzs</strong></td>
              <td class="text-center">-</td>
              <td>-</td>
              <td class="text-right"><strong>${result.totalNetWeightKg.toLocaleString('es-MX')} kg</strong></td>
              <td class="text-right font-bold text-primary"><strong>${result.totalWeightWithScrapKg.toLocaleString('es-MX')} kg</strong></td>
              <td class="text-right font-bold">
                <strong>${result.totalBagsAll.fullBags} sacos</strong> ${result.totalBagsAll.remainderKg > 0 ? `+ ${result.totalBagsAll.remainderKg}kg` : ''}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  }
};
