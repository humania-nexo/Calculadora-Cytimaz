/**
 * ====================================================================
 * APP.JS - Controlador Principal de la Aplicación PWA Cytimaz
 * ====================================================================
 * Gestiona:
 * - Navegación instantánea por pestañas (sin recargar)
 * - Modal de Configuración / Engranaje (⚙️) con protección por PIN
 * - Editor para modificar pesos, agregar nuevos modelos o cambiar tamaño de saco (24kg)
 * - PWA Service Worker y Banner de Instalación en Celular/PC
 * ====================================================================
 */

const App = {
  activeTab: 'mod-pt-mp',
  isPinUnlocked: false,
  deferredPrompt: null,

  /**
   * Inicialización global de la aplicación
   */
  init() {
    // 1. Inicializar PWA Service Worker
    this.registerServiceWorker();

    // 2. Escuchar evento de instalación PWA
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      const installBtn = document.getElementById('btn-pwa-install');
      if (installBtn) installBtn.style.display = 'inline-flex';
    });

    // 3. Inicializar módulos
    ModPtMp.init();
    ModMpPt.init();
    ModInforme.init();

    // 4. Activar pestaña por defecto
    this.switchTab('mod-pt-mp');

    // 5. Renderizar indicador de versión y bolsa
    this.updateHeaderBadge();
  },

  /**
   * Cambia de pestaña activa sin recargar
   */
  switchTab(tabId) {
    this.activeTab = tabId;

    // Actualizar botones de navegación
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // Ocultar todos los contenedores y mostrar el activo
    const tabs = ['mod-pt-mp', 'mod-mp-pt', 'mod-informe'];
    tabs.forEach(id => {
      const el = document.getElementById(`${id}-container`);
      if (el) {
        el.style.display = (id === tabId) ? 'block' : 'none';
      }
    });

    // Recalcular módulo activo
    if (tabId === 'mod-pt-mp') ModPtMp.calculate();
    if (tabId === 'mod-mp-pt') ModMpPt.calculate();
    if (tabId === 'mod-informe') ModInforme.renderCatalogGrid();

    // Scroll arriba suave
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /**
   * Actualiza el badge del encabezado con el peso del saco
   */
  updateHeaderBadge() {
    const badge = document.getElementById('header-bag-badge');
    if (badge) {
      const bagKg = CalculationEngine.getBagWeightKg();
      badge.innerHTML = `📦 Sacos: <strong>${bagKg} kg</strong>`;
    }
  },

  /**
   * Instala la PWA en el dispositivo
   */
  installPWA() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('PWA instalada por el usuario');
        }
        this.deferredPrompt = null;
        const installBtn = document.getElementById('btn-pwa-install');
        if (installBtn) installBtn.style.display = 'none';
      });
    } else {
      this.showToast('Para instalar: usa la opción "Agregar a pantalla principal" de tu navegador.');
    }
  },

  /**
   * Abre el modal de configuración (⚙️)
   */
  openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;

    modal.style.display = 'flex';

    if (!this.isPinUnlocked) {
      this.renderPinPrompt();
    } else {
      this.renderSettingsContent();
    }
  },

  /**
   * Cierra el modal de configuración
   */
  closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.style.display = 'none';
  },

  /**
   * Renderiza el formulario de ingreso de PIN
   */
  renderPinPrompt() {
    const body = document.getElementById('settings-modal-body');
    if (!body) return;

    body.innerHTML = `
      <div class="pin-prompt-box">
        <div class="lock-icon">🔒</div>
        <h3>Acceso al Panel de Administración</h3>
        <p class="text-muted">Ingresa la clave de acceso para modificar pesos, fórmulas o añadir nuevos modelos.</p>
        
        <div class="form-group mt-4">
          <input type="password" id="admin-pin-input" class="form-control text-center input-pin" placeholder="••••" maxlength="8" autofocus onkeyup="if(event.key==='Enter') App.verifyPin()">
        </div>

        <div id="pin-error-msg" class="text-danger text-xs mt-2" style="display:none;">
          ❌ Clave incorrecta. Inténtalo de nuevo.
        </div>

        <div class="modal-actions mt-4">
          <button class="btn btn-outline" onclick="App.closeSettingsModal()">Cancelar</button>
          <button class="btn btn-primary" onclick="App.verifyPin()">Desbloquear</button>
        </div>

        <div class="text-xs text-muted mt-3">
          (PIN de seguridad predeterminado: <code>8080</code>)
        </div>
      </div>
    `;
  },

  /**
   * Valida el PIN ingresado
   */
  verifyPin() {
    const input = document.getElementById('admin-pin-input');
    const errorMsg = document.getElementById('pin-error-msg');
    const enteredPin = input ? input.value.trim() : '';

    const currentPin = APP_CONFIG.adminPin || '8080';

    if (enteredPin === currentPin) {
      this.isPinUnlocked = true;
      this.renderSettingsContent();
      this.showToast('✅ Acceso autorizado al panel de ajustes');
    } else {
      if (errorMsg) errorMsg.style.display = 'block';
      if (input) {
        input.value = '';
        input.focus();
      }
    }
  },

  /**
   * Renderiza el panel de administración completo
   */
  renderSettingsContent() {
    const body = document.getElementById('settings-modal-body');
    if (!body) return;

    const bagKg = CalculationEngine.getBagWeightKg();

    body.innerHTML = `
      <div class="settings-content-wrapper">
        <div class="settings-header-banner">
          <div>
            <h3>⚙️ Panel de Configuración y Modelos</h3>
            <p class="text-muted">Ajusta el peso de los sacos del proveedor, modifica pesos de modelos o añade nuevos productos.</p>
          </div>
          <button class="btn btn-outline btn-sm text-danger" onclick="App.confirmResetDefaults()">
            Restablecer de Fábrica
          </button>
        </div>

        <!-- 1. Configuración de Saco y Clave -->
        <div class="settings-section">
          <h4>1. Configuración de Proveedor y Seguridad</h4>
          <div class="settings-form-row">
            <div class="form-group">
              <label><strong>Peso Estándar del Saco (kg):</strong></label>
              <div class="input-addon-group">
                <input type="number" id="cfg-bag-weight" class="form-control" value="${bagKg}" min="1" max="100">
                <span class="addon-label">kg</span>
              </div>
              <span class="text-xs text-muted">Cytimaz utiliza sacos de 24 kg.</span>
            </div>

            <div class="form-group">
              <label><strong>Cambiar Clave de Acceso (PIN):</strong></label>
              <input type="password" id="cfg-new-pin" class="form-control" placeholder="Dejar vacío para no cambiar">
              <span class="text-xs text-muted">PIN actual activo.</span>
            </div>
          </div>
          <button class="btn btn-primary btn-sm mt-2" onclick="App.saveGlobalConfig()">Guardar Ajustes de Proveedor</button>
        </div>

        <!-- 2. Formulario para Añadir Nuevo Modelo -->
        <div class="settings-section mt-5">
          <div class="card-header-flex">
            <h4>2. Añadir Nuevo Modelo al Catálogo</h4>
            <span class="badge badge-accent">+ Nuevo Producto</span>
          </div>

          <div class="new-model-form mt-3">
            <div class="settings-form-row">
              <div class="form-group flex-2">
                <label>Nombre del Modelo:</label>
                <input type="text" id="new-prod-name" class="form-control" placeholder="Ej. Cisterna 2500 L Horizontal">
              </div>
              <div class="form-group flex-1">
                <label>Capacidad (Litros):</label>
                <input type="number" id="new-prod-capacity" class="form-control" placeholder="2500" min="10">
              </div>
            </div>

            <div class="settings-form-row mt-2">
              <div class="form-group flex-1">
                <label>Tipo / Categoría de Producto:</label>
                <select id="new-prod-group" class="form-control" onchange="App.handleNewGroupChange(this.value)">
                  <option value="${PRODUCT_GROUPS.CISTERNA}">🔵 Cisterna / Tambo (100% Puro Polietileno)</option>
                  <option value="${PRODUCT_GROUPS.TINACO_BICAPA}">🟢 Tinaco Bicapa (50% PE Arena / 50% Espumado)</option>
                  <option value="${PRODUCT_GROUPS.TINACO_TRICAPA}">🟠 Tinaco Tricapa (1/3 Arena + 1/3 Negro UV + 1/3 Espumado)</option>
                </select>
              </div>
              <div class="form-group flex-1">
                <label>Peso Total Terminado (kg):</label>
                <input type="number" id="new-prod-weight" class="form-control" placeholder="Ej. 45" min="1" step="0.5">
              </div>
            </div>

            <div class="form-group mt-2">
              <label>Notas Técnicas (Opcional):</label>
              <input type="text" id="new-prod-notes" class="form-control" placeholder="Ej. Modelo especial para uso industrial">
            </div>

            <button class="btn btn-success btn-sm mt-3" onclick="App.addNewProduct()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Guardar y Añadir Modelo
            </button>
          </div>
        </div>

        <!-- 3. Lista y Edición de Modelos Existentes -->
        <div class="settings-section mt-5">
          <h4>3. Editar Modelos Existentes (${PRODUCTS_DATA.length})</h4>
          <p class="text-xs text-muted">Modifica los kilogramos totales de cualquier modelo. Las capas se calcularán automáticamente según su fórmula (100%, 50/50 o 1/3 cada una).</p>

          <div class="table-container mt-3">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Capacidad</th>
                  <th>Peso Total (kg)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${PRODUCTS_DATA.map((p, index) => {
                  return `
                    <tr>
                      <td>
                        <input type="text" class="form-control input-sm" id="edit-name-${index}" value="${p.name}">
                      </td>
                      <td>
                        <span class="badge ${p.group === PRODUCT_GROUPS.CISTERNA ? 'badge-blue' : (p.group === PRODUCT_GROUPS.TINACO_TRICAPA ? 'badge-sand' : 'badge-foam')}">
                          ${p.categoryLabel}
                        </span>
                      </td>
                      <td>
                        <input type="number" class="form-control input-sm text-center" id="edit-cap-${index}" value="${p.capacity}" style="width:90px">
                      </td>
                      <td>
                        <input type="number" step="0.5" class="form-control input-sm text-center font-bold" id="edit-weight-${index}" value="${p.totalWeightKg}" style="width:90px">
                      </td>
                      <td>
                        <div class="action-buttons-cell">
                          <button class="btn btn-primary btn-xs" onclick="App.saveModelEdit(${index})">Guardar</button>
                          <button class="btn btn-danger-icon btn-xs" title="Eliminar modelo" onclick="App.deleteModel(${index})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Guarda la configuración global (peso de saco y PIN)
   */
  saveGlobalConfig() {
    const bagWeight = parseFloat(document.getElementById('cfg-bag-weight').value) || 24;
    const newPinInput = document.getElementById('cfg-new-pin').value.trim();

    APP_CONFIG.bagWeightKg = bagWeight;
    if (newPinInput.length >= 4) {
      APP_CONFIG.adminPin = newPinInput;
    }

    DataManager.saveConfig(APP_CONFIG);
    this.updateHeaderBadge();
    this.showToast('✅ Configuración de proveedor guardada');
    this.renderSettingsContent();
    this.refreshAllModules();
  },

  /**
   * Añade un nuevo producto con capas auto-calculadas según la regla
   */
  addNewProduct() {
    const name = document.getElementById('new-prod-name').value.trim();
    const capacity = parseInt(document.getElementById('new-prod-capacity').value, 10) || 1000;
    const group = document.getElementById('new-prod-group').value;
    const totalWeightKg = parseFloat(document.getElementById('new-prod-weight').value) || 0;
    const notes = document.getElementById('new-prod-notes').value.trim() || 'Nuevo modelo agregado';

    if (!name || totalWeightKg <= 0) {
      alert('Por favor ingresa un nombre válido y un peso mayor a 0 kg.');
      return;
    }

    let categoryLabel = 'Cisterna';
    let layers = [];

    if (group === PRODUCT_GROUPS.CISTERNA) {
      categoryLabel = 'Cisterna';
      layers = [
        { layerName: 'Cuerpo Completo', materialId: 'pe_cisterna', materialName: 'Polietileno Cisterna', weightKg: totalWeightKg, percentage: 100 }
      ];
    } else if (group === PRODUCT_GROUPS.TINACO_BICAPA) {
      categoryLabel = 'Tinaco Bicapa';
      const half = parseFloat((totalWeightKg / 2).toFixed(2));
      layers = [
        { layerName: 'Capa Exterior', materialId: 'pe_arena', materialName: 'Polietileno Arena', weightKg: half, percentage: 50 },
        { layerName: 'Capa Interior', materialId: 'pe_espumado', materialName: 'Polietileno Espumado', weightKg: half, percentage: 50 }
      ];
    } else if (group === PRODUCT_GROUPS.TINACO_TRICAPA) {
      categoryLabel = 'Tinaco Tricapa';
      const third = parseFloat((totalWeightKg / 3).toFixed(2));
      layers = [
        { layerName: 'Capa 1 (Exterior)', materialId: 'pe_arena', materialName: 'Polietileno Arena', weightKg: third, percentage: 33.33 },
        { layerName: 'Capa 2 (Filtro UV)', materialId: 'pe_negro', materialName: 'Polietileno Negro UV', weightKg: third, percentage: 33.33 },
        { layerName: 'Capa 3 (Interior)', materialId: 'pe_espumado', materialName: 'Polietileno Espumado', weightKg: third, percentage: 33.33 }
      ];
    }

    const newProd = {
      id: 'custom-' + Date.now(),
      name,
      capacity,
      group,
      categoryLabel,
      totalWeightKg,
      layers,
      image: group === PRODUCT_GROUPS.CISTERNA ? 'assets/img/modelos/cisterna_generic.svg' : 'assets/img/modelos/tinaco_tricapa_generic.svg',
      isPending: false,
      notes
    };

    PRODUCTS_DATA.push(newProd);
    DataManager.saveProducts(PRODUCTS_DATA);

    this.showToast(`✅ Modelo "${name}" agregado exitosamente`);
    this.renderSettingsContent();
    this.refreshAllModules();
  },

  /**
   * Guarda la edición de un modelo
   */
  saveModelEdit(index) {
    const p = PRODUCTS_DATA[index];
    if (!p) return;

    const name = document.getElementById(`edit-name-${index}`).value.trim();
    const capacity = parseInt(document.getElementById(`edit-cap-${index}`).value, 10) || p.capacity;
    const totalWeightKg = parseFloat(document.getElementById(`edit-weight-${index}`).value) || p.totalWeightKg;

    p.name = name;
    p.capacity = capacity;
    p.totalWeightKg = totalWeightKg;
    p.isPending = false;

    // Recalcular capas según la fórmula del grupo
    if (p.group === PRODUCT_GROUPS.CISTERNA) {
      p.layers = [
        { layerName: 'Cuerpo Completo', materialId: 'pe_cisterna', materialName: 'Polietileno Cisterna', weightKg: totalWeightKg, percentage: 100 }
      ];
    } else if (p.group === PRODUCT_GROUPS.TINACO_BICAPA) {
      const half = parseFloat((totalWeightKg / 2).toFixed(2));
      p.layers = [
        { layerName: 'Capa Exterior', materialId: 'pe_arena', materialName: 'Polietileno Arena', weightKg: half, percentage: 50 },
        { layerName: 'Capa Interior', materialId: 'pe_espumado', materialName: 'Polietileno Espumado', weightKg: half, percentage: 50 }
      ];
    } else if (p.group === PRODUCT_GROUPS.TINACO_TRICAPA) {
      const third = parseFloat((totalWeightKg / 3).toFixed(2));
      p.layers = [
        { layerName: 'Capa 1 (Exterior)', materialId: 'pe_arena', materialName: 'Polietileno Arena', weightKg: third, percentage: 33.33 },
        { layerName: 'Capa 2 (Filtro UV)', materialId: 'pe_negro', materialName: 'Polietileno Negro UV', weightKg: third, percentage: 33.33 },
        { layerName: 'Capa 3 (Interior)', materialId: 'pe_espumado', materialName: 'Polietileno Espumado', weightKg: third, percentage: 33.33 }
      ];
    }

    DataManager.saveProducts(PRODUCTS_DATA);
    this.showToast(`✅ Modelo "${p.name}" actualizado`);
    this.refreshAllModules();
  },

  /**
   * Elimina un modelo del catálogo
   */
  deleteModel(index) {
    const p = PRODUCTS_DATA[index];
    if (!p) return;

    if (confirm(`¿Estás seguro de eliminar el modelo "${p.name}"?`)) {
      PRODUCTS_DATA.splice(index, 1);
      DataManager.saveProducts(PRODUCTS_DATA);
      this.showToast(`🗑️ Modelo eliminado`);
      this.renderSettingsContent();
      this.refreshAllModules();
    }
  },

  /**
   * Restablece los datos de fábrica
   */
  confirmResetDefaults() {
    if (confirm('¿Restablecer todos los modelos y configuraciones a los valores iniciales de fábrica?')) {
      DataManager.resetToDefaults();
      this.updateHeaderBadge();
      this.showToast('🔄 Valores de fábrica restaurados');
      this.renderSettingsContent();
      this.refreshAllModules();
    }
  },

  /**
   * Refresca todos los módulos tras un cambio en la base de datos
   */
  refreshAllModules() {
    ModPtMp.render();
    ModMpPt.render();
    ModInforme.render();
  },

  /**
   * Muestra un mensaje toast flotante
   */
  showToast(message) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;

    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  },

  /**
   * Registro del Service Worker para PWA Offline
   */
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.log('PWA ServiceWorker registrado con éxito:', reg.scope))
          .catch(err => console.warn('Error al registrar ServiceWorker:', err));
      });
    }
  }
};

// Inicializar la aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
