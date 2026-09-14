const { pool } = require('../config/database');
const logger = require('../utils/logger');

// Obtener asignaciones de recursos del proyecto
exports.getByProject = async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.query(`
      SELECT 
        ar.*,
        u.nombre as usuario_nombre,
        u.email as usuario_email,
        rp.nombre as rol_nombre,
        rp.tarifa_hora,
        w.codigo as wbs_codigo,
        w.nombre as wbs_nombre
      FROM asignacion_recursos ar
      LEFT JOIN usuarios u ON ar.usuario_id = u.id
      LEFT JOIN roles_proyecto rp ON ar.rol_id = rp.id
      LEFT JOIN wbs w ON ar.wbs_id = w.id
      WHERE ar.proyecto_id = ?
      ORDER BY u.nombre
    `, [id]);

    res.json({ success: true, data: items });
  } catch (error) {
    logger.error('Get recursos error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener resumen de recursos
exports.getSummary = async (req, res) => {
  try {
    const { id } = req.params;

    // Resumen por usuario
    const [byUser] = await pool.query(`
      SELECT 
        u.id,
        u.nombre,
        rp.nombre as rol,
        COUNT(ar.id) as asignaciones,
        SUM(ar.porcentaje) as total_porcentaje,
        SUM(ar.horas_planeadas) as total_horas
      FROM asignacion_recursos ar
      LEFT JOIN usuarios u ON ar.usuario_id = u.id
      LEFT JOIN roles_proyecto rp ON ar.rol_id = rp.id
      WHERE ar.proyecto_id = ?
      GROUP BY u.id, u.nombre, rp.nombre
      ORDER BY u.nombre
    `, [id]);

    // Resumen por rol
    const [byRole] = await pool.query(`
      SELECT 
        rp.nombre as rol,
        COUNT(DISTINCT ar.usuario_id) as personas,
        SUM(ar.horas_planeadas) as total_horas,
        SUM(ar.horas_planeadas * rp.tarifa_hora) as costo_total
      FROM asignacion_recursos ar
      LEFT JOIN roles_proyecto rp ON ar.rol_id = rp.id
      WHERE ar.proyecto_id = ?
      GROUP BY rp.id, rp.nombre
    `, [id]);

    // Estadísticas generales
    const [stats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT ar.usuario_id) as total_personas,
        COUNT(ar.id) as total_asignaciones,
        SUM(ar.horas_planeadas) as total_horas,
        SUM(ar.horas_reales) as horas_reales,
        AVG(ar.porcentaje) as promedio_dedicacion
      FROM asignacion_recursos ar
      WHERE ar.proyecto_id = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        byUser,
        byRole,
        stats: stats[0]
      }
    });
  } catch (error) {
    logger.error('Get recursos summary error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener una asignación
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.query(`
      SELECT ar.*, u.nombre as usuario_nombre, rp.nombre as rol_nombre
      FROM asignacion_recursos ar
      LEFT JOIN usuarios u ON ar.usuario_id = u.id
      LEFT JOIN roles_proyecto rp ON ar.rol_id = rp.id
      WHERE ar.id = ?
    `, [id]);

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.json({ success: true, data: items[0] });
  } catch (error) {
    logger.error('Get recurso error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Crear asignación
exports.create = async (req, res) => {
  try {
    const { id } = req.params; // ID del proyecto
    const {
      usuario_id, wbs_id, rol_id, porcentaje,
      fecha_inicio, fecha_fin, horas_planeadas
    } = req.body;

    // Verificar que el usuario no esté ya asignado a esta actividad
    const [existing] = await pool.query(`
      SELECT id FROM asignacion_recursos 
      WHERE proyecto_id = ? AND usuario_id = ? AND wbs_id = ? AND wbs_id IS NOT NULL
    `, [id, usuario_id, wbs_id]);

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already assigned to this activity' 
      });
    }

    const [result] = await pool.query(`
      INSERT INTO asignacion_recursos (
        proyecto_id, usuario_id, wbs_id, rol_id, porcentaje,
        fecha_inicio, fecha_fin, horas_planeadas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, usuario_id, wbs_id || null, rol_id || null, porcentaje || 100,
      fecha_inicio, fecha_fin, horas_planeadas || 0
    ]);

    const [newItem] = await pool.query(`
      SELECT ar.*, u.nombre as usuario_nombre, rp.nombre as rol_nombre
      FROM asignacion_recursos ar
      LEFT JOIN usuarios u ON ar.usuario_id = u.id
      LEFT JOIN roles_proyecto rp ON ar.rol_id = rp.id
      WHERE ar.id = ?
    `, [result.insertId]);

    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    logger.error('Create recurso error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Actualizar asignación
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      usuario_id, wbs_id, rol_id, porcentaje,
      fecha_inicio, fecha_fin, horas_planeadas, horas_reales
    } = req.body;

    const [existing] = await pool.query('SELECT id FROM asignacion_recursos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    await pool.query(`
      UPDATE asignacion_recursos SET
        usuario_id = ?, wbs_id = ?, rol_id = ?, porcentaje = ?,
        fecha_inicio = ?, fecha_fin = ?, horas_planeadas = ?, horas_reales = ?
      WHERE id = ?
    `, [
      usuario_id, wbs_id || null, rol_id || null, porcentaje || 100,
      fecha_inicio, fecha_fin, horas_planeadas || 0, horas_reales || 0, id
    ]);

    const [updated] = await pool.query(`
      SELECT ar.*, u.nombre as usuario_nombre, rp.nombre as rol_nombre
      FROM asignacion_recursos ar
      LEFT JOIN usuarios u ON ar.usuario_id = u.id
      LEFT JOIN roles_proyecto rp ON ar.rol_id = rp.id
      WHERE ar.id = ?
    `, [id]);

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update recurso error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Eliminar asignación
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM asignacion_recursos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    await pool.query('DELETE FROM asignacion_recursos WHERE id = ?', [id]);
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    logger.error('Delete recurso error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener usuarios disponibles
exports.getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, nombre, email FROM usuarios WHERE activo = 1 ORDER BY nombre'
    );
    res.json({ success: true, data: users });
  } catch (error) {
    logger.error('Get users error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener roles
exports.getRoles = async (req, res) => {
  try {
    const [roles] = await pool.query(
      'SELECT * FROM roles_proyecto WHERE activo = 1 ORDER BY nombre'
    );
    res.json({ success: true, data: roles });
  } catch (error) {
    logger.error('Get roles error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener actividades WBS
exports.getWBSActivities = async (req, res) => {
  try {
    const { id } = req.params;
    const [activities] = await pool.query(`
      SELECT id, codigo, nombre, nivel
      FROM wbs WHERE proyecto_id = ? AND nivel = 3
      ORDER BY codigo
    `, [id]);
    res.json({ success: true, data: activities });
  } catch (error) {
    logger.error('Get WBS error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
