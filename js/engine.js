/**
 * ====================================================================
 * ENGINE.JS - Motor de Cálculo de Materiales para Rotomoldeo Cytimaz
 * ====================================================================
 * Contiene todas las funciones matemáticas puras para:
 * 1. PT -> MP: Producto Terminado a Materia Prima (Kilos + Sacos de 24kg)
 * 2. MP -> PT: Materia Prima (Sacos o Kilos) a Producto Terminado (Capacidad)
 * 3. Conversiones a sacos de proveedor (24 kg por defecto o configurable)
 * ====================================================================
 */

const CalculationEngine = {
  /**
   * Obtiene el peso configurado del saco (por defecto 24 kg)
   * @returns {number}
   */
  getBagWeightKg() {
    return (APP_CONFIG && APP_CONFIG.bagWeightKg > 0) ? APP_CONFIG.bagWeightKg : 24;
  },

  /**
   * Obtiene un producto por su ID
   * @param {string} id 
   * @returns {object|null}
   */
  getProductById(id) {
    return PRODUCTS_DATA.find(p => p.id === id) || null;
  },

  /**
   * Convierte kilogramos a sacos de proveedor (ej. 24 kg)
   * Devuelve sacos completos, kilogramos restantes y sacos fraccionados
   * @param {number} kg 
   * @param {number} customBagWeightKg 
   * @returns {{ fullBags: number, remainderKg: number, totalBagsDecimal: number, bagWeightKg: number }}
   */
  kgToBags(kg, customBagWeightKg = null) {
    const bagSize = customBagWeightKg || this.getBagWeightKg();
    if (kg <= 0) return { fullBags: 0, remainderKg: 0, totalBagsDecimal: 0, bagWeightKg: bagSize };
    
    const fullBags = Math.floor(kg / bagSize);
    const remainderKg = parseFloat((kg % bagSize).toFixed(2));
    const totalBagsDecimal = parseFloat((kg / bagSize).toFixed(2));
    
    return { fullBags, remainderKg, totalBagsDecimal, bagWeightKg: bagSize };
  },

  /**
   * Convierte número de sacos a kilogramos
   * @param {number} bags 
   * @param {number} customBagWeightKg 
   * @returns {number}
   */
  bagsToKg(bags, customBagWeightKg = null) {
    const bagSize = customBagWeightKg || this.getBagWeightKg();
    return Math.max(0, parseFloat(bags) || 0) * bagSize;
  },

  /**
   * MÓDULO 1: Calcula el requerimiento de materias primas para una orden de producción.
   * Ejemplo: 50 cisternas de 1100L = 900 kg PE = 37.5 sacos de 24 kg (37 bultos + 12 kg).
   * 
   * @param {Array<{ productId: string, quantity: number }>} orderItems Lista de productos y cantidades
   * @param {number} scrapPercentage Porcentaje de merma / desperdicio (0 a 100)
   * @returns {object} Resumen total y desglose por producto/material
   */
  calculateOrderRequirements(orderItems, scrapPercentage = 0) {
    const bagSize = this.getBagWeightKg();
    const scrapFactor = 1 + (Math.max(0, scrapPercentage) / 100);

    // Acumuladores globales por tipo de material
    const materialTotals = {
      pe_arena: { id: 'pe_arena', name: 'Polietileno Arena / Claro', netKg: 0, withScrapKg: 0, bags: null },
      pe_negro: { id: 'pe_negro', name: 'Polietileno Negro (Filtro UV)', netKg: 0, withScrapKg: 0, bags: null },
      pe_espumado: { id: 'pe_espumado', name: 'Polietileno Espumado', netKg: 0, withScrapKg: 0, bags: null },
      pe_cisterna: { id: 'pe_cisterna', name: 'Polietileno Cisterna / Puro', netKg: 0, withScrapKg: 0, bags: null }
    };

    let totalFinishedPieces = 0;
    let totalNetWeightKg = 0;
    const itemsBreakdown = [];

    // Procesar cada ítem de la orden
    orderItems.forEach(item => {
      const product = this.getProductById(item.productId);
      const qty = parseInt(item.quantity, 10) || 0;

      if (!product || qty <= 0) return;

      totalFinishedPieces += qty;
      const productNetWeight = product.totalWeightKg * qty;
      totalNetWeightKg += productNetWeight;

      // Desglose por capas de este producto
      const layersDetail = product.layers.map(layer => {
        const layerNetKg = layer.weightKg * qty;
        const layerWithScrapKg = layerNetKg * scrapFactor;

        // Acumular en totales globales
        if (materialTotals[layer.materialId]) {
          materialTotals[layer.materialId].netKg += layerNetKg;
          materialTotals[layer.materialId].withScrapKg += layerWithScrapKg;
        }

        return {
          layerName: layer.layerName,
          materialId: layer.materialId,
          materialName: layer.materialName,
          unitLayerKg: layer.weightKg,
          totalLayerNetKg: layerNetKg,
          totalLayerWithScrapKg: parseFloat(layerWithScrapKg.toFixed(2)),
          layerBags: this.kgToBags(layerWithScrapKg, bagSize)
        };
      });

      itemsBreakdown.push({
        product,
        quantity: qty,
        unitWeightKg: product.totalWeightKg,
        subtotalNetKg: productNetWeight,
        subtotalWithScrapKg: parseFloat((productNetWeight * scrapFactor).toFixed(2)),
        bagsEquivalent: this.kgToBags(productNetWeight * scrapFactor, bagSize),
        layersDetail
      });
    });

    // Calcular bultos finales para cada material
    for (const matKey in materialTotals) {
      const mat = materialTotals[matKey];
      mat.netKg = parseFloat(mat.netKg.toFixed(2));
      mat.withScrapKg = parseFloat(mat.withScrapKg.toFixed(2));
      mat.bags = this.kgToBags(mat.withScrapKg, bagSize);
    }

    const totalWeightWithScrapKg = parseFloat((totalNetWeightKg * scrapFactor).toFixed(2));
    const totalBagsAll = this.kgToBags(totalWeightWithScrapKg, bagSize);

    return {
      totalFinishedPieces,
      totalNetWeightKg: parseFloat(totalNetWeightKg.toFixed(2)),
      totalWeightWithScrapKg,
      scrapPercentage,
      bagSizeKg: bagSize,
      totalBagsAll,
      materials: materialTotals,
      itemsBreakdown
    };
  },

  /**
   * MÓDULO 2: Calcula cuántas unidades de un producto se pueden fabricar
   * a partir de stock ingresado en Kilos o en Sacos de 24 kg.
   * Agrupa por TIPO DE MATERIAL ÚNICO (ej. Cisternas y Tambos = 1 solo campo de stock).
   * 
   * @param {string} productId ID del modelo a fabricar
   * @param {object} rawInputs { pe_arena, pe_negro, pe_espumado, pe_cisterna } (Valores ingresados)
   * @param {'kg'|'bags'} inputUnit Unidad en la que se ingresaron los datos ('kg' o 'bags')
   * @returns {object} Unidades alcanzables, sobrantes, cuellos de botella y sacos usados
   */
  calculateCapacityForProduct(productId, rawInputs, inputUnit = 'kg') {
    const product = this.getProductById(productId);
    if (!product) return null;

    const bagSize = this.getBagWeightKg();

    // Convertir stock a kg uniformemente
    const availableStockKg = {};
    for (const key in rawInputs) {
      const val = Math.max(0, parseFloat(rawInputs[key]) || 0);
      availableStockKg[key] = inputUnit === 'bags' ? val * bagSize : val;
    }

    // Agrupar capas por material único para no duplicar barras de insumo
    const uniqueMaterialsMap = {};
    const uniqueMaterialsList = [];

    product.layers.forEach(layer => {
      if (!uniqueMaterialsMap[layer.materialId]) {
        uniqueMaterialsMap[layer.materialId] = {
          materialId: layer.materialId,
          materialName: layer.materialName,
          totalReqPerUnitKg: 0,
          layersDescription: []
        };
        uniqueMaterialsList.push(uniqueMaterialsMap[layer.materialId]);
      }
      uniqueMaterialsMap[layer.materialId].totalReqPerUnitKg += layer.weightKg;
      uniqueMaterialsMap[layer.materialId].layersDescription.push(`${layer.layerName} (${layer.weightKg} kg)`);
    });

    let maxPossibleUnits = Infinity;
    let limitingMaterial = null;
    const materialAnalysis = [];

    uniqueMaterialsList.forEach(mat => {
      const stockKg = availableStockKg[mat.materialId] || 0;
      const reqPerUnitKg = mat.totalReqPerUnitKg;

      const unitsForThisMaterial = reqPerUnitKg > 0 ? Math.floor(stockKg / reqPerUnitKg) : Infinity;

      if (unitsForThisMaterial < maxPossibleUnits) {
        maxPossibleUnits = unitsForThisMaterial;
        limitingMaterial = {
          materialId: mat.materialId,
          materialName: mat.materialName,
          stockKg,
          reqPerUnitKg,
          unitsPossible: unitsForThisMaterial
        };
      }

      materialAnalysis.push({
        materialId: mat.materialId,
        materialName: mat.materialName,
        layersText: mat.layersDescription.join(' + '),
        stockAvailableKg: stockKg,
        stockAvailableBags: this.kgToBags(stockKg, bagSize),
        reqPerUnitKg: reqPerUnitKg,
        possibleUnits: unitsForThisMaterial
      });
    });

    if (maxPossibleUnits === Infinity) maxPossibleUnits = 0;

    // Calcular consumo total, sobrantes y faltantes para +1 unidad
    const leftovers = [];
    materialAnalysis.forEach(item => {
      const usedKg = maxPossibleUnits * item.reqPerUnitKg;
      const leftoverKg = parseFloat((item.stockAvailableKg - usedKg).toFixed(2));
      const nextUnitDeficitKg = parseFloat(Math.max(0, ((maxPossibleUnits + 1) * item.reqPerUnitKg) - item.stockAvailableKg).toFixed(2));

      leftovers.push({
        materialId: item.materialId,
        materialName: item.materialName,
        layersText: item.layersText,
        usedKg,
        usedBags: this.kgToBags(usedKg, bagSize),
        leftoverKg,
        leftoverBags: this.kgToBags(leftoverKg, bagSize),
        nextUnitDeficitKg,
        nextUnitDeficitBags: this.kgToBags(nextUnitDeficitKg, bagSize)
      });
    });

    return {
      product,
      inputUnit,
      bagSizeKg: bagSize,
      maxPossibleUnits,
      limitingMaterial,
      uniqueMaterialsList,
      materialAnalysis,
      leftovers,
      totalProducedKg: parseFloat((maxPossibleUnits * product.totalWeightKg).toFixed(2)),
      totalProducedBags: this.kgToBags(maxPossibleUnits * product.totalWeightKg, bagSize)
    };
  }
};
