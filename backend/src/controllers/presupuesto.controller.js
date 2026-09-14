const { pool } = require('../config/database');
const logger = require('../utils/logger');

// Obtener presupuesto del proyecto
exports.getByProject = async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.query(`
      SELECT 
        p.*,
        cc.nombre as categoria_nombre,
        cc.tipo as categoria_tipo,
        w.codigo as wbs_codigo,
        w.nombre as wbs_nombre
      FROM presupuesto p
      LEFT JOIN categorias_costo cc ON p.categoria_id = cc.id
      LEFT JOIN wbs w ON p.wbs_id = w.id
      WHERE p.proyecto_id = ?
      ORDER BY cc.nombre, p.descripcion
    `, [id]);

    res.json({ success: true, data: items });
  } catch (error) {
    logger.error('Get presupuesto error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener resumen del presupuesto
exports.getSummary = async (req, res) => {
  try {
    const { id } = req.params;

    // Resumen por categoría
    const [byCategory] = await pool.query(`
      SELECT 
        cc.id,
        cc.nombre,
        cc.tipo,
        COALESCE(SUM(p.monto_aprobado), 0) as monto_aprobado,
        COALESCE(SUM(p.costo_total), 0) as monto_estimado
      FROM categorias_costo cc
      LEFT JOIN presupuesto p ON cc.id = p.categoria_id AND p.proyecto_id = ?
      GROUP BY cc.id, cc.nombre, cc.tipo
      ORDER BY cc.nombre
    `, [id]);

    // Totales
    const [totals] = await pool.query(`
      SELECT 
        COALESCE(SUM(monto_aprobado), 0) as total_aprobado,
        COALESCE(SUM(costo_total), 0) as total_estimado,
        COUNT(*) as total_items
      FROM presupuesto
      WHERE proyecto_id = ?
    `, [id]);

    // Gasto real
    const [realCosts] = await pool.query(`
      SELECT 
        COALESCE(SUM(monto), 0) as total_real
      FROM costos_reales
      WHERE proyecto_id = ?
    `, [id]);

    // Presupuesto del proyecto
    const [projectBudget] = await pool.query(`
      SELECT presupuesto_planeado
      FROM proyectos
      WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        byCategory,
        totals: totals[0],
        realCosts: realCosts[0],
        projectBudget: projectBudget[0]?.presupuesto_planeado || 0
      }
    });
  } catch (error) {
    logger.error('Get presupuesto summary error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener un elemento del presupuesto
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.query(
      'SELECT * FROM presupuesto WHERE id = ?',
      [id]
    );

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: items[0] });
  } catch (error) {
    logger.error('Get presupuesto item error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Crear elemento del presupuesto
exports.create = async (req, res) => {
  try {
    const { id } = req.params; // ID del proyecto
    const {
      wbs_id, categoria_id, descripcion, cantidad,
      unidad, costo_unitario, monto_aprobado
    } = req.body;

    // Limpiar y convertir datos
    const wbsId = (wbs_id && wbs_id !== '' && wbs_id !== 'null') ? parseInt(wbs_id) : null;
    const catId = parseInt(categoria_id) || 1;
    const cant = parseFloat(cantidad) || 0;
    const costoUnit = parseFloat(costo_unitario) || 0;
    const montoAprob = parseFloat(monto_aprobado) || 0;

    // costo_total es columna generada, NO se incluye en INSERT
    const [result] = await pool.query(`
      INSERT INTO presupuesto (
        proyecto_id, wbs_id, categoria_id, descripcion, cantidad,
        unidad, costo_unitario, monto_aprobado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, wbsId, catId, descripcion, cant,
      unidad, costoUnit, montoAprob || (cant * costoUnit)
    ]);

    const [newItem] = await pool.query(
      'SELECT * FROM presupuesto WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    logger.error('Create presupuesto error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Actualizar elemento del presupuesto
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { wbs_id, categoria_id, descripcion, cantidad, unidad, costo_unitario, monto_aprobado } = req.body;

    // Verificar que existe
    const [existing] = await pool.query('SELECT id FROM presupuesto WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Convertir datos de forma segura
    const wbsId = (wbs_id && wbs_id !== '' && wbs_id !== 'null') ? parseInt(wbs_id) : null;
    const catId = parseInt(categoria_id) || 1;
    const cant = parseFloat(cantidad) || 0;
    const costoUnit = parseFloat(costo_unitario) || 0;
    const montoAprob = parseFloat(monto_aprobado) || 0;

    // costo_total es columna generada, NO se incluye en UPDATE
    await pool.query(
      'UPDATE presupuesto SET wbs_id=?, categoria_id=?, descripcion=?, cantidad=?, unidad=?, costo_unitario=?, monto_aprobado=? WHERE id=?',
      [wbsId, catId, descripcion, cant, unidad, costoUnit, montoAprob || (cant * costoUnit), id]
    );

    const [updated] = await pool.query('SELECT * FROM presupuesto WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update presupuesto error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Eliminar elemento del presupuesto
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT id FROM presupuesto WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    await pool.query('DELETE FROM presupuesto WHERE id = ?', [id]);

    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    logger.error('Delete presupuesto error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Registrar gasto real
exports.addRealCost = async (req, res) => {
  try {
    const { id } = req.params; // ID del proyecto
    const { presupuesto_id, fecha, monto, descripcion, comprobante } = req.body;

    const [result] = await pool.query(`
      INSERT INTO costos_reales (
        proyecto_id, presupuesto_id, fecha, monto,
        descripcion, comprobante, registrado_por
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id, presupuesto_id, fecha, monto,
      descripcion, comprobante, req.user.id
    ]);

    const [newItem] = await pool.query(
      'SELECT * FROM costos_reales WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    logger.error('Add real cost error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener gastos reales
exports.getRealCosts = async (req, res) => {
  try {
    const { id } = req.params;

    const [costs] = await pool.query(`
      SELECT 
        cr.*,
        p.descripcion as presupuesto_descripcion,
        cc.nombre as categoria_nombre,
        u.nombre as registrado_por_nombre
      FROM costos_reales cr
      LEFT JOIN presupuesto p ON cr.presupuesto_id = p.id
      LEFT JOIN categorias_costo cc ON p.categoria_id = cc.id
      LEFT JOIN usuarios u ON cr.registrado_por = u.id
      WHERE cr.proyecto_id = ?
      ORDER BY cr.fecha DESC
    `, [id]);

    res.json({ success: true, data: costs });
  } catch (error) {
    logger.error('Get real costs error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Eliminar gasto real
exports.deleteRealCost = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT id FROM costos_reales WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Cost not found' });
    }

    await pool.query('DELETE FROM costos_reales WHERE id = ?', [id]);

    res.json({ success: true, message: 'Cost deleted' });
  } catch (error) {
    logger.error('Delete real cost error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener categorías
exports.getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT * FROM categorias_costo WHERE activo = 1 ORDER BY nombre'
    );
    res.json({ success: true, data: categories });
  } catch (error) {
    logger.error('Get categories error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener actividades WBS para vincular
exports.getWBSActivities = async (req, res) => {
  try {
    const { id } = req.params;

    const [activities] = await pool.query(`
      SELECT id, codigo, nombre, nivel
      FROM wbs
      WHERE proyecto_id = ? AND nivel = 3
      ORDER BY codigo
    `, [id]);

    res.json({ success: true, data: activities });
  } catch (error) {
    logger.error('Get WBS activities error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
