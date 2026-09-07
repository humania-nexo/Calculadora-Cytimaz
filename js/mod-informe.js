/**
 * ====================================================================
 * MOD-INFORME.JS - Módulo: Ficha Técnica e Informe Individual por Modelo
 * ====================================================================
 * Permite consultar la radiografía completa de cualquier modelo:
 * - Catálogo interactivo con buscador y filtros por categoría
 * - Ficha técnica detallada con visualización gráfica de capas
 * - Placeholder de imagen con soporte para subir/cambiar foto
 * - Mini calculadora instantánea por modelo
 * - Exportación / Impresión directa a PDF
 * ====================================================================
 */

const ModInforme = {
  activeCategory: 'all',
  searchQuery: '',
  selectedProductId: 'tinaco-tricapa-1100-trad',
  customImageOverrides: {}, // Guardado temporal o en sesión de fotos subidas

  /**
   * Inicializa el módulo
   */
  init() {
    this.container = document.getElementById('mod-informe-container');
    if (!this.container) return;

    this.render();
  },

  /**
   * Filtra por categoría
   */
  setCategory(cat) {
    this.activeCategory = cat;
    this.renderCatalogGrid();
  },

  /**
   * Filtra por búsqueda de texto
   */
  setSearch(query) {
    this.searchQuery = query.toLowerCase().trim();
    this.renderCatalogGrid();
  },

  /**
   * Selecciona un producto para ver su ficha
   */
  selectProduct(productId) {
    this.selectedProductId = productId;
    this.renderProductDetail();
    // Desplazar suavemente a la ficha en móviles
    const detailCard = document.getElementById('model-detail-card');
    if (detailCard && window.innerWidth < 992) {
      detailCard.scrollIntoView({ behavior: 'smooth' });
    }
  },

  /**
   * Manejador de subida de imagen local para el modelo
   */
  handleImageUpload(event, productId) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.customImageOverrides[productId] = e.target.result;
      this.renderProductDetail();
      this.renderCatalogGrid();
    };
    reader.readAsDataURL(file);
  },

  /**
   * Renderiza la vista principal del módulo
   */
  render() {
    const bagKg = CalculationEngine.getBagWeightKg();

    this.container.innerHTML = `
      <div class="module-header">
        <div class="header-text">
          <div class="badge-tag">Módulo 3 • Catálogo & Fichas Técnicas</div>
          <h2>📋 Informe Individual y Ficha Técnica por Modelo</h2>
          <p>Consulta la composición de capas, pesos unitarios en kilos y sacos (${bagKg} kg), e imágenes de cada producto.</p>
        </div>
      </div>

      <!-- Barra de Filtros y Búsqueda -->
      <div class="catalog-filters-bar">
        <div class="filter-tabs">
          <button class="filter-btn ${this.activeCategory === 'all' ? 'active' : ''}" onclick="ModInforme.setCategory('all')">
            Todos (${PRODUCTS_DATA.length})
          </button>
          <button class="filter-btn ${this.activeCategory === PRODUCT_GROUPS.CISTERNA ? 'active' : ''}" onclick="ModInforme.setCategory('${PRODUCT_GROUPS.CISTERNA}')">
            🔵 Cisternas y Tambos
          </button>
          <button class="filter-btn ${this.activeCategory === PRODUCT_GROUPS.TINACO_BICAPA ? 'active' : ''}" onclick="ModInforme.setCategory('${PRODUCT_GROUPS.TINACO_BICAPA}')">
            🟢 Tinacos Bicapa
          </button>
          <button class="filter-btn ${this.activeCategory === PRODUCT_GROUPS.TINACO_TRICAPA ? 'active' : ''}" onclick="ModInforme.setCategory('${PRODUCT_GROUPS.TINACO_TRICAPA}')">
            🟠 Tinacos Tricapa
          </button>
        </div>

        <div class="search-box">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Buscar por modelo o capacidad..." class="form-control input-search" oninput="ModInforme.setSearch(this.value)">
        </div>
      </div>

      <div class="informe-layout-grid">
        <!-- Columna Izquierda: Grid de Modelos -->
        <div class="catalog-column">
          <div id="catalog-products-list" class="catalog-cards-grid">
            <!-- Renderizado dinámicamente -->
          </div>
        </div>

        <!-- Columna Derecha: Ficha Técnica Detallada -->
        <div class="detail-column" id="model-detail-card">
          <!-- Renderizado dinámicamente -->
        </div>
      </div>
    `;

    this.renderCatalogGrid();
    this.renderProductDetail();
  },

  /**
   * Renderiza el catálogo de productos filtrado
   */
  renderCatalogGrid() {
    const list = document.getElementById('catalog-products-list');
    if (!list) return;

    let filtered = PRODUCTS_DATA.filter(p => {
      const matchesCategory = this.activeCategory === 'all' || p.group === this.activeCategory;
      const matchesQuery = !this.searchQuery || p.name.toLowerCase().includes(this.searchQuery) || String(p.capacity).includes(this.searchQuery);
      return matchesCategory && matchesQuery;
    });

    if (filtered.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <p>No se encontraron modelos con el criterio seleccionado.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = filtered.map(p => {
      const isSelected = p.id === this.selectedProductId;
      const imgSrc = this.customImageOverrides[p.id] || p.image;

      return `
        <div class="product-card-item ${isSelected ? 'selected' : ''}" onclick="ModInforme.selectProduct('${p.id}')">
          <div class="card-thumb">
            <img src="${imgSrc}" alt="${p.name}" class="product-thumb-img" onerror="this.src='assets/img/modelos/tinaco_bicapa_generic.svg'">
          </div>
          <div class="card-body-mini">
            <span class="badge ${p.group === PRODUCT_GROUPS.CISTERNA ? 'badge-blue' : (p.group === PRODUCT_GROUPS.TINACO_TRICAPA ? 'badge-sand' : 'badge-foam')}">
              ${p.categoryLabel}
            </span>
            <h4 class="card-prod-title">${p.name}</h4>
            <div class="card-prod-weight">
              Peso total: <strong>${p.totalWeightKg} kg</strong>
              ${p.isPending ? '<span class="text-warning text-xs">⚠️ Pendiente</span>' : ''}
            </div>
            <div class="card-layers-count">${p.layers.length} ${p.layers.length === 1 ? 'Capa monomaterial' : 'Capas'}</div>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Renderiza la ficha técnica completa del modelo seleccionado
   */
  renderProductDetail() {
    const detailBox = document.getElementById('model-detail-card');
    if (!detailBox) return;

    const p = CalculationEngine.getProductById(this.selectedProductId) || PRODUCTS_DATA[0];
    if (!p) return;

    const bagSize = CalculationEngine.getBagWeightKg();
    const bagConv = CalculationEngine.kgToBags(p.totalWeightKg, bagSize);
    const imgSrc = this.customImageOverrides[p.id] || p.image;

    detailBox.innerHTML = `
      <div class="card card-detail-sheet">
        <div class="detail-header-bar">
          <div>
            <span class="badge ${p.group === PRODUCT_GROUPS.CISTERNA ? 'badge-blue' : (p.group === PRODUCT_GROUPS.TINACO_TRICAPA ? 'badge-sand' : 'badge-foam')}">
              ${p.categoryLabel}
            </span>
            <h2>${p.name}</h2>
            <span class="text-xs text-muted">Capacidad Nominal: <strong>${p.capacity} Litros</strong></span>
          </div>
          <button class="btn btn-outline btn-sm" onclick="window.print()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Imprimir Ficha
          </button>
        </div>

        <!-- Sección de Imagen y Peso Principal -->
        <div class="detail-top-grid">
          <div class="product-image-frame">
            <img src="${imgSrc}" alt="${p.name}" class="product-featured-img" onerror="this.src='assets/img/modelos/tinaco_bicapa_generic.svg'">
            
            <label class="btn-change-photo" title="Subir o cambiar foto del modelo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              Cambiar Foto
              <input type="file" accept="image/*" style="display:none" onchange="ModInforme.handleImageUpload(event, '${p.id}')">
            </label>
          </div>

          <div class="product-key-metrics">
            <div class="metric-card">
              <span class="m-label">PESO TOTAL POR UNIDAD</span>
              <span class="m-val">${p.totalWeightKg} <small>kg</small></span>
              <span class="m-sub">Peso de polietileno terminado</span>
            </div>

            <div class="metric-card">
              <span class="m-label">EQUIVALENCIA EN SACOS (${bagSize} KG)</span>
              <span class="m-val">${bagConv.totalBagsDecimal} <small>sacos</small></span>
              <span class="m-sub">${bagConv.fullBags} sacos enteros ${bagConv.remainderKg > 0 ? `+ ${bagConv.remainderKg} kg` : ''}</span>
            </div>
          </div>
        </div>

        <!-- Radiografía Gráfica de Capas -->
        <div class="layers-radiography-section">
          <h3>🔬 Radiografía de Capas y Composición</h3>
          <p class="text-xs text-muted mb-3">Distribución porcentual y en peso para una sola pieza de este modelo:</p>

          <!-- Barra de Proporciones Visual -->
          <div class="layer-stacked-bar">
            ${p.layers.map(l => {
              const bg = MATERIAL_TYPES[l.materialId.toUpperCase()] ? MATERIAL_TYPES[l.materialId.toUpperCase()].color : '#0284C7';
              return `
                <div class="layer-bar-segment" style="width: ${l.percentage}%; background-color: ${bg};" title="${l.layerName}: ${l.weightKg} kg (${l.percentage}%)">
                  <span>${l.percentage.toFixed(0)}%</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Tarjetas explicativas de cada capa -->
          <div class="layers-cards-list mt-4">
            ${p.layers.map((l, i) => {
              return `
                <div class="layer-detail-item">
                  <div class="layer-item-badge">Capa ${i + 1}</div>
                  <div class="layer-item-content">
                    <div class="layer-item-title">
                      <strong>${l.layerName}</strong> — <span class="text-muted">${l.materialName}</span>
                    </div>
                    <div class="layer-item-values">
                      <strong>${l.weightKg} kg</strong> (${l.percentage}% del total) • ≈ ${(l.weightKg / bagSize).toFixed(2)} sacos de ${bagSize}kg
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Mini Calculadora Rápida por Modelo -->
        <div class="quick-batch-calculator mt-5">
          <h3>⚡ Calculadora Rápida para este Modelo</h3>
          <div class="quick-batch-control">
            <span>Para fabricar:</span>
            <input type="number" id="quick-batch-qty" min="1" max="1000" value="10" class="form-control input-inline-qty" oninput="ModInforme.updateQuickBatch('${p.id}')">
            <span>piezas de <strong>${p.name}</strong></span>
          </div>

          <div id="quick-batch-result" class="quick-batch-output">
            <!-- Calculado en updateQuickBatch -->
          </div>
        </div>

        <!-- Notas técnicas del modelo -->
        <div class="model-notes-box mt-4">
          <strong>Notas Técnicas:</strong>
          <p>${p.notes}</p>
        </div>
      </div>
    `;

    this.updateQuickBatch(p.id);
  },

  /**
   * Actualiza el cálculo rápido de lote dentro de la ficha
   */
  updateQuickBatch(productId) {
    const qtyInput = document.getElementById('quick-batch-qty');
    const resultBox = document.getElementById('quick-batch-result');
    if (!qtyInput || !resultBox) return;

    const p = CalculationEngine.getProductById(productId);
    if (!p) return;

    const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
    const bagSize = CalculationEngine.getBagWeightKg();
    const totalKg = p.totalWeightKg * qty;
    const totalBags = CalculationEngine.kgToBags(totalKg, bagSize);

    resultBox.innerHTML = `
      <div class="batch-stat-row">
        <div>Total de Material Requerido: <strong>${totalKg.toLocaleString('es-MX')} kg</strong></div>
        <div>Total en Sacos (${bagSize}kg): <strong>${totalBags.fullBags} sacos</strong> ${totalBags.remainderKg > 0 ? `+ ${totalBags.remainderKg} kg` : ''} (≈ ${totalBags.totalBagsDecimal} sacos)</div>
      </div>
      <div class="batch-layers-mini">
        ${p.layers.map(l => {
          const lKg = l.weightKg * qty;
          const lBags = CalculationEngine.kgToBags(lKg, bagSize);
          return `
            <div class="batch-layer-tag">
              ${l.materialName}: <strong>${lKg} kg</strong> (${lBags.fullBags} sacos ${lBags.remainderKg > 0 ? `+ ${lBags.remainderKg}kg` : ''})
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
};
