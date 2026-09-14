const { pool } = require('../config/database');
const logger = require('../utils/logger');

// ==================== DASHBOARD ====================

exports.getDashboard = async (req, res) => {
  try {
    const { id } = req.params;

    // Info del proyecto
    const [project] = await pool.query(`
      SELECT p.*, ep.nombre as estado_nombre
      FROM proyectos p LEFT JOIN estados_proyecto ep ON p.estado_id = ep.id
      WHERE p.id = ?
    `, [id]);

    // WBS summary
    const [wbs] = await pool.query(`
      SELECT COUNT(*) as total,
        COUNT(CASE WHEN estado = 'completado' THEN 1 END) as completadas,
        COUNT(CASE WHEN estado = 'en_progreso' THEN 1 END) as en_progreso,
        AVG(avance) as avance_promedio
      FROM wbs WHERE proyecto_id = ? AND nivel = 3
    `, [id]);

    // Presupuesto
    const [presupuesto] = await pool.query(`
      SELECT COALESCE(SUM(monto_aprobado), 0) as total_aprobado
      FROM presupuesto WHERE proyecto_id = ?
    `, [id]);
    const [gastoReal] = await pool.query(`
      SELECT COALESCE(SUM(monto), 0) as total_real
      FROM costos_reales WHERE proyecto_id = ?
    `, [id]);

    // Issues
    const [issues] = await pool.query(`
      SELECT COUNT(*) as total,
        COUNT(CASE WHEN estado = 'abierto' THEN 1 END) as abiertos,
        COUNT(CASE WHEN prioridad = 'critica' THEN 1 END) as criticos
      FROM issues WHERE proyecto_id = ?
    `, [id]);

    // Riesgos
    const [riesgos] = await pool.query(`
      SELECT COUNT(*) as total,
        COUNT(CASE WHEN nivel_riesgo >= 15 THEN 1 END) as criticos
      FROM riesgos WHERE proyecto_id = ?
    `, [id]);

    // Entregables
    const [entregables] = await pool.query(`
      SELECT COUNT(*) as total,
        COUNT(CASE WHEN estado = 'aprobado' THEN 1 END) as aprobados
      FROM entregables WHERE proyecto_id = ?
    `, [id]);

    // Días del proyecto
    const projectData = project[0];
    let diasTranscurridos = 0, diasRestantes = 0, porcentajeTiempo = 0;
    if (projectData?.fecha_inicio_planeada && projectData?.fecha_fin_planeada) {
      const inicio = new Date(projectData.fecha_inicio_planeada);
      const fin = new Date(projectData.fecha_fin_planeada);
      const hoy = new Date();
      const totalDias = (fin - inicio) / (1000 * 60 * 60 * 24);
      diasTranscurridos = Math.max(0, (hoy - inicio) / (1000 * 60 * 60 * 24));
      diasRestantes = Math.max(0, (fin - hoy) / (1000 * 60 * 60 * 24));
      porcentajeTiempo = Math.min(100, Math.max(0, (diasTranscurridos / totalDias) * 100));
    }

    res.json({
      success: true,
      data: {
        project: projectData,
        wbs: wbs[0],
        presupuesto: { total: presupuesto[0].total_aprobado, real: gastoReal[0].total_real },
        issues: issues[0],
        riesgos: riesgos[0],
        entregables: entregables[0],
        tiempo: { diasTranscurridos: Math.round(diasTranscurridos), diasRestantes: Math.round(diasRestantes), porcentajeTiempo: porcentajeTiempo.toFixed(1) }
      }
    });
  } catch (error) {
    logger.error('Get dashboard error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== VALOR GANADO ====================

exports.getValorGanado = async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await pool.query('SELECT * FROM valor_ganado WHERE proyecto_id = ? ORDER BY periodo', [id]);
    res.json({ success: true, data: items });
  } catch (error) {
    logger.error('Get valor ganado error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createValorGanado = async (req, res) => {
  try {
    const { id } = req.params;
    const { periodo, pv, ev, ac, bac, eac, etc, vac } = req.body;

    const [result] = await pool.query(`
      INSERT INTO valor_ganado (proyecto_id, periodo, pv, ev, ac, bac, eac, etc, vac)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, periodo, pv, ev, ac, bac, eac || null, etc || null, vac || null]);

    const [newItem] = await pool.query('SELECT * FROM valor_ganado WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    logger.error('Create valor ganado error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteValorGanado = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM valor_ganado WHERE id = ?', [id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    logger.error('Delete valor ganado error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== INDICADORES ====================

exports.getIndicadores = async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await pool.query(`
      SELECT i.*, u.nombre as responsable_nombre
      FROM indicadores i LEFT JOIN usuarios u ON i.responsable_id = u.id
      WHERE i.proyecto_id = ?
    `, [id]);
    res.json({ success: true, data: items });
  } catch (error) {
    logger.error('Get indicadores error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createIndicador = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, formula, meta, unidad, frecuencia_medicion, responsable_id } = req.body;

    const [result] = await pool.query(`
      INSERT INTO indicadores (proyecto_id, nombre, formula, meta, unidad, frecuencia_medicion, responsable_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, nombre, formula, meta, unidad, frecuencia_medicion, responsable_id || null]);

    const [newItem] = await pool.query('SELECT * FROM indicadores WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    logger.error('Create indicador error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateIndicador = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, formula, meta, unidad, frecuencia_medicion, responsable_id } = req.body;

    await pool.query(`
      UPDATE indicadores SET nombre=?, formula=?, meta=?, unidad=?, frecuencia_medicion=?, responsable_id=? WHERE id=?
    `, [nombre, formula, meta, unidad, frecuencia_medicion, responsable_id || null, id]);

    const [updated] = await pool.query('SELECT * FROM indicadores WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update indicador error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteIndicador = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM indicadores WHERE id = ?', [id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    logger.error('Delete indicador error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== CONTROL DE CAMBIOS ====================

exports.getCambios = async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await pool.query(`
      SELECT sc.*, u1.nombre as solicitado_por_nombre, u2.nombre as decidido_por_nombre
      FROM solicitudes_cambio sc
      LEFT JOIN usuarios u1 ON sc.solicitado_por = u1.id
      LEFT JOIN usuarios u2 ON sc.decidido_por = u2.id
      WHERE sc.proyecto_id = ?
      ORDER BY sc.fecha_solicitud DESC
    `, [id]);
    res.json({ success: true, data: items });
  } catch (error) {
    logger.error('Get cambios error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createCambio = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, justificacion, impacto_alcance, impacto_tiempo, impacto_costo, impacto_calidad } = req.body;

    const [last] = await pool.query('SELECT codigo FROM solicitudes_cambio WHERE proyecto_id = ? ORDER BY id DESC LIMIT 1', [id]);
    let nextNum = 1;
    if (last.length > 0 && last[0].codigo) { nextNum = parseInt(last[0].codigo.replace('CC-', '')) + 1; }
    const codigo = `CC-${String(nextNum).padStart(3, '0')}`;

    const [result] = await pool.query(`
      INSERT INTO solicitudes_cambio (proyecto_id, codigo, titulo, descripcion, justificacion,
        impacto_alcance, impacto_tiempo, impacto_costo, impacto_calidad, solicitado_por, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'solicitado')
    `, [id, codigo, titulo, descripcion, justificacion, impacto_alcance, impacto_tiempo, impacto_costo || 0, impacto_calidad, req.user.id]);

    const [newItem] = await pool.query('SELECT * FROM solicitudes_cambio WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    logger.error('Create cambio error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateCambio = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, justificacion, impacto_alcance, impacto_tiempo, impacto_costo, impacto_calidad } = req.body;

    await pool.query(`
      UPDATE solicitudes_cambio SET titulo=?, descripcion=?, justificacion=?,
        impacto_alcance=?, impacto_tiempo=?, impacto_costo=?, impacto_calidad=?
      WHERE id=?
    `, [titulo, descripcion, justificacion, impacto_alcance, impacto_tiempo, impacto_costo || 0, impacto_calidad, id]);

    const [updated] = await pool.query('SELECT * FROM solicitudes_cambio WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update cambio error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateCambioStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, motivo_decision } = req.body;

    await pool.query(`
      UPDATE solicitudes_cambio SET estado=?, decidido_por=?, fecha_decision=CURDATE(), motivo_decision=? WHERE id=?
    `, [estado, req.user.id, motivo_decision || null, id]);

    const [updated] = await pool.query(`
      SELECT sc.*, u1.nombre as solicitado_por_nombre, u2.nombre as decidido_por_nombre
      FROM solicitudes_cambio sc
      LEFT JOIN usuarios u1 ON sc.solicitado_por = u1.id
      LEFT JOIN usuarios u2 ON sc.decidido_por = u2.id
      WHERE sc.id = ?
    `, [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update cambio status error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteCambio = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM solicitudes_cambio WHERE id = ?', [id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    logger.error('Delete cambio error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== UTILIDADES ====================

exports.getUsers = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, nombre FROM usuarios WHERE activo = 1');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
