const { pool } = require('../config/database');
const logger = require('../utils/logger');

// ==================== ISSUES ====================

exports.getIssues = async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await pool.query(`
      SELECT i.*, u.nombre as responsable_nombre, w.codigo as wbs_codigo
      FROM issues i
      LEFT JOIN usuarios u ON i.responsable_id = u.id
      LEFT JOIN wbs w ON i.wbs_id = w.id
      WHERE i.proyecto_id = ?
      ORDER BY 
        CASE i.prioridad 
          WHEN 'critica' THEN 1 WHEN 'alta' THEN 2 WHEN 'media' THEN 3 ELSE 4 
        END,
        i.fecha_deteccion DESC
    `, [id]);
    res.json({ success: true, data: items });
  } catch (error) {
    logger.error('Get issues error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, prioridad, wbs_id, responsable_id } = req.body;

    const [result] = await pool.query(`
      INSERT INTO issues (proyecto_id, titulo, descripcion, prioridad, wbs_id, responsable_id, estado, fecha_deteccion)
      VALUES (?, ?, ?, ?, ?, ?, 'abierto', CURDATE())
    `, [id, titulo, descripcion, prioridad || 'media', wbs_id || null, responsable_id || null]);

    const [newItem] = await pool.query('SELECT * FROM issues WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    logger.error('Create issue error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, prioridad, estado, responsable_id, solucion, wbs_id } = req.body;

    const fecha_resolucion = estado === 'resuelto' || estado === 'cerrado' ? new Date() : null;

    await pool.query(`
      UPDATE issues SET
        titulo = ?, descripcion = ?, prioridad = ?, estado = ?,
        responsable_id = ?, solucion = ?, wbs_id = ?,
        fecha_resolucion = COALESCE(?, fecha_resolucion)
      WHERE id = ?
    `, [titulo, descripcion, prioridad, estado, responsable_id || null, solucion || null, wbs_id || null, fecha_resolucion, id]);

    const [updated] = await pool.query(`
      SELECT i.*, u.nombre as responsable_nombre
      FROM issues i LEFT JOIN usuarios u ON i.responsable_id = u.id
      WHERE i.id = ?
    `, [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update issue error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Cambiar solo estado del issue
exports.updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const fecha_resolucion = estado === 'resuelto' || estado === 'cerrado' ? new Date() : null;

    await pool.query(`
      UPDATE issues SET estado = ?, fecha_resolucion = COALESCE(?, fecha_resolucion) WHERE id = ?
    `, [estado, fecha_resolucion, id]);

    const [updated] = await pool.query(`
      SELECT i.*, u.nombre as responsable_nombre
      FROM issues i LEFT JOIN usuarios u ON i.responsable_id = u.id
      WHERE i.id = ?
    `, [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update issue status error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM issues WHERE id = ?', [id]);
    res.json({ success: true, message: 'Issue deleted' });
  } catch (error) {
    logger.error('Delete issue error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getIssuesSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const [byStatus] = await pool.query(`
      SELECT estado, COUNT(*) as total FROM issues WHERE proyecto_id = ? GROUP BY estado
    `, [id]);
    const [byPriority] = await pool.query(`
      SELECT prioridad, COUNT(*) as total FROM issues WHERE proyecto_id = ? GROUP BY prioridad
    `, [id]);
    const [stats] = await pool.query(`
      SELECT COUNT(*) as total, 
        SUM(CASE WHEN estado = 'abierto' THEN 1 ELSE 0 END) as abiertos,
        SUM(CASE WHEN prioridad = 'critica' THEN 1 ELSE 0 END) as criticos
      FROM issues WHERE proyecto_id = ?
    `, [id]);
    res.json({ success: true, data: { byStatus, byPriority, stats: stats[0] } });
  } catch (error) {
    logger.error('Get issues summary error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== ENTREGABLES ====================

exports.getEntregables = async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await pool.query(`
      SELECT e.*, u.nombre as aprobado_por_nombre, w.codigo as wbs_codigo
      FROM entregables e
      LEFT JOIN usuarios u ON e.aprobado_por = u.id
      LEFT JOIN wbs w ON e.wbs_id = w.id
      WHERE e.proyecto_id = ?
      ORDER BY e.fecha_entrega_planeada
    `, [id]);
    res.json({ success: true, data: items });
  } catch (error) {
    logger.error('Get entregables error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createEntregable = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, wbs_id, fecha_entrega_planeada } = req.body;

    const [result] = await pool.query(`
      INSERT INTO entregables (proyecto_id, nombre, descripcion, wbs_id, fecha_entrega_planeada, estado)
      VALUES (?, ?, ?, ?, ?, 'pendiente')
    `, [id, nombre, descripcion, wbs_id || null, fecha_entrega_planeada]);

    const [newItem] = await pool.query('SELECT * FROM entregables WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    logger.error('Create entregable error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateEntregable = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, estado, fecha_entrega_real, observaciones, aprobado_por } = req.body;

    const aprobado = (estado === 'aprobado' || estado === 'rechazado') ? req.user.id : aprobado_por;

    await pool.query(`
      UPDATE entregables SET
        nombre = ?, descripcion = ?, estado = ?, fecha_entrega_real = ?,
        observaciones = ?, aprobado_por = ?
      WHERE id = ?
    `, [nombre, descripcion, estado, fecha_entrega_real || null, observaciones, aprobado, id]);

    const [updated] = await pool.query(`
      SELECT e.*, u.nombre as aprobado_por_nombre
      FROM entregables e LEFT JOIN usuarios u ON e.aprobado_por = u.id
      WHERE e.id = ?
    `, [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update entregable error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Cambiar solo estado del entregable
exports.updateEntregableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, observaciones } = req.body;

    const aprobado_por = (estado === 'aprobado' || estado === 'rechazado') ? req.user.id : null;

    await pool.query(`
      UPDATE entregables SET estado = ?, observaciones = COALESCE(?, observaciones),
        aprobado_por = COALESCE(?, aprobado_por)
      WHERE id = ?
    `, [estado, observaciones, aprobado_por, id]);

    const [updated] = await pool.query(`
      SELECT e.*, u.nombre as aprobado_por_nombre
      FROM entregables e LEFT JOIN usuarios u ON e.aprobado_por = u.id
      WHERE e.id = ?
    `, [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update entregable status error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== ACTIVIDADES (registro_avances) ====================

exports.getActividades = async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await pool.query(`
      SELECT ra.*, u.nombre as registrado_nombre, w.codigo as wbs_codigo, w.nombre as wbs_nombre
      FROM registro_actividades ra
      LEFT JOIN usuarios u ON ra.registrado_por = u.id
      LEFT JOIN wbs w ON ra.wbs_id = w.id
      WHERE ra.proyecto_id = ?
      ORDER BY ra.fecha DESC
    `, [id]);
    res.json({ success: true, data: items });
  } catch (error) {
    logger.error('Get actividades error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createActividad = async (req, res) => {
  try {
    const { id } = req.params;
    const { wbs_id, fecha, actividad_realizada, avance_porcentaje, horas_trabajadas } = req.body;

    const [result] = await pool.query(`
      INSERT INTO registro_actividades (proyecto_id, wbs_id, fecha, actividad_realizada, avance_porcentaje, horas_trabajadas, registrado_por)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, wbs_id || null, fecha, actividad_realizada, avance_porcentaje || 0, horas_trabajadas || 0, req.user.id]);

    const [newItem] = await pool.query('SELECT * FROM registro_actividades WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    logger.error('Create actividad error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteActividad = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM registro_actividades WHERE id = ?', [id]);
    res.json({ success: true, message: 'Actividad deleted' });
  } catch (error) {
    logger.error('Delete actividad error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteEntregable = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM entregables WHERE id = ?', [id]);
    res.json({ success: true, message: 'Entregable deleted' });
  } catch (error) {
    logger.error('Delete entregable error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== BITÁCORA ====================

exports.getBitacora = async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await pool.query(`
      SELECT b.*, u.nombre as autor_nombre
      FROM bitacora b
      LEFT JOIN usuarios u ON b.autor_id = u.id
      WHERE b.proyecto_id = ?
      ORDER BY b.fecha DESC
    `, [id]);
    res.json({ success: true, data: items });
  } catch (error) {
    logger.error('Get bitacora error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createBitacora = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, descripcion, visible_sponsor } = req.body;

    const [result] = await pool.query(`
      INSERT INTO bitacora (proyecto_id, tipo, descripcion, autor_id, visible_sponsor)
      VALUES (?, ?, ?, ?, ?)
    `, [id, tipo, descripcion, req.user.id, visible_sponsor || false]);

    const [newItem] = await pool.query('SELECT * FROM bitacora WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    logger.error('Create bitacora error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteBitacora = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM bitacora WHERE id = ?', [id]);
    res.json({ success: true, message: 'Bitacora deleted' });
  } catch (error) {
    logger.error('Delete bitacora error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== RESUMEN EJECUCIÓN ====================

exports.getSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const [issues] = await pool.query(`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN estado = 'abierto' THEN 1 ELSE 0 END) as abiertos
      FROM issues WHERE proyecto_id = ?
    `, [id]);

    const [entregables] = await pool.query(`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN estado = 'aprobado' THEN 1 ELSE 0 END) as aprobados
      FROM entregables WHERE proyecto_id = ?
    `, [id]);

    const [actividades] = await pool.query(`
      SELECT COUNT(*) as total,
        COUNT(CASE WHEN avance_porcentaje > 0 AND avance_porcentaje < 100 THEN 1 END) as en_progreso
      FROM registro_actividades WHERE proyecto_id = ?
    `, [id]);

    const [bitacora] = await pool.query(`
      SELECT COUNT(*) as total FROM bitacora WHERE proyecto_id = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        issues: issues[0],
        entregables: entregables[0],
        actividades: actividades[0],
        bitacora: bitacora[0]
      }
    });
  } catch (error) {
    logger.error('Get ejecucion summary error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== UTILIDADES ====================

exports.getUsers = async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, nombre FROM usuarios WHERE activo = 1');
    res.json({ success: true, data: users });
  } catch (error) {
    logger.error('Get users error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getWBSActivities = async (req, res) => {
  try {
    const { id } = req.params;
    const [activities] = await pool.query('SELECT id, codigo, nombre FROM wbs WHERE proyecto_id = ? AND nivel = 3', [id]);
    res.json({ success: true, data: activities });
  } catch (error) {
    logger.error('Get WBS error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
