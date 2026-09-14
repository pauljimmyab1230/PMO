const { pool } = require('../config/database');
const logger = require('../utils/logger');

// Obtener datos del cronograma (WBS con fechas para Gantt)
exports.getGanttData = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener actividades del WBS con fechas
    const [activities] = await pool.query(`
      SELECT 
        w.id,
        w.codigo,
        w.nombre,
        w.nivel,
        w.padre_id,
        w.fecha_inicio,
        w.fecha_fin,
        w.duracion_dias,
        w.avance,
        w.estado,
        w.es_hito,
        w.responsable_id,
        u.nombre as responsable_nombre
      FROM wbs w
      LEFT JOIN usuarios u ON w.responsable_id = u.id
      WHERE w.proyecto_id = ? 
        AND w.fecha_inicio IS NOT NULL 
        AND w.fecha_fin IS NOT NULL
      ORDER BY w.fecha_inicio, w.codigo
    `, [id]);

    // Obtener dependencias
    const [dependencies] = await pool.query(`
      SELECT 
        actividad_origen_id as fromId,
        actividad_destino_id as toId,
        tipo_dependencia as type
      FROM dependencias_wbs
      WHERE actividad_origen_id IN (SELECT id FROM wbs WHERE proyecto_id = ?)
        AND actividad_destino_id IN (SELECT id FROM wbs WHERE proyecto_id = ?)
    `, [id, id]);

    // Obtener hitos
    const [milestones] = await pool.query(`
      SELECT 
        id,
        codigo,
        nombre,
        fecha_inicio as fecha,
        avance,
        estado
      FROM wbs
      WHERE proyecto_id = ? AND es_hito = 1
      ORDER BY fecha_inicio
    `, [id]);

    // Calcular fecha de inicio y fin del proyecto
    const [projectDates] = await pool.query(`
      SELECT 
        MIN(fecha_inicio) as fecha_inicio,
        MAX(fecha_fin) as fecha_fin
      FROM wbs
      WHERE proyecto_id = ? 
        AND fecha_inicio IS NOT NULL 
        AND fecha_fin IS NOT NULL
    `, [id]);

    res.json({
      success: true,
      data: {
        activities,
        dependencies,
        milestones,
        projectStart: projectDates[0]?.fecha_inicio,
        projectEnd: projectDates[0]?.fecha_fin
      }
    });
  } catch (error) {
    logger.error('Get Gantt data error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Agregar dependencia
exports.addDependency = async (req, res) => {
  try {
    const { actividad_origen_id, actividad_destino_id, tipo_dependencia } = req.body;

    // Verificar que ambas actividades pertenezcan al mismo proyecto
    const [activities] = await pool.query(
      'SELECT id, proyecto_id FROM wbs WHERE id IN (?, ?)',
      [actividad_origen_id, actividad_destino_id]
    );

    if (activities.length !== 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Activities not found' 
      });
    }

    if (activities[0].proyecto_id !== activities[1].proyecto_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Activities must be from the same project' 
      });
    }

    // Verificar que no exista ya la dependencia
    const [existing] = await pool.query(
      'SELECT id FROM dependencias_wbs WHERE actividad_origen_id = ? AND actividad_destino_id = ?',
      [actividad_origen_id, actividad_destino_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Dependency already exists' 
      });
    }

    const [result] = await pool.query(`
      INSERT INTO dependencias_wbs (actividad_origen_id, actividad_destino_id, tipo_dependencia)
      VALUES (?, ?, ?)
    `, [actividad_origen_id, actividad_destino_id, tipo_dependencia || 'fin-inicio']);

    res.status(201).json({ 
      success: true, 
      data: { id: result.insertId } 
    });
  } catch (error) {
    logger.error('Add dependency error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Eliminar dependencia
exports.deleteDependency = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT id FROM dependencias_wbs WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Dependency not found' });
    }

    await pool.query('DELETE FROM dependencias_wbs WHERE id = ?', [id]);

    res.json({ success: true, message: 'Dependency deleted' });
  } catch (error) {
    logger.error('Delete dependency error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Actualizar fecha de una actividad
exports.updateDates = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_inicio, fecha_fin } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM wbs WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    // Calcular duración
    let duracion = null;
    if (fecha_inicio && fecha_fin) {
      const start = new Date(fecha_inicio);
      const end = new Date(fecha_fin);
      duracion = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }

    await pool.query(`
      UPDATE wbs SET
        fecha_inicio = ?,
        fecha_fin = ?,
        duracion_dias = ?
      WHERE id = ?
    `, [fecha_inicio, fecha_fin, duracion, id]);

    const [updated] = await pool.query('SELECT * FROM wbs WHERE id = ?', [id]);

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update dates error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener estadísticas del cronograma
exports.getStats = async (req, res) => {
  try {
    const { id } = req.params;

    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_actividades,
        SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completadas,
        SUM(CASE WHEN estado = 'en_progreso' THEN 1 ELSE 0 END) as en_progreso,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        AVG(avance) as avance_promedio,
        MIN(fecha_inicio) as fecha_inicio,
        MAX(fecha_fin) as fecha_fin,
        SUM(duracion_dias) as duracion_total
      FROM wbs
      WHERE proyecto_id = ? AND fecha_inicio IS NOT NULL
    `, [id]);

    // Calcular días transcurridos y restantes
    const projectDates = stats[0];
    let diasTranscurridos = 0;
    let diasRestantes = 0;
    let porcentajeTiempo = 0;

    if (projectDates.fecha_inicio && projectDates.fecha_fin) {
      const inicio = new Date(projectDates.fecha_inicio);
      const fin = new Date(projectDates.fecha_fin);
      const hoy = new Date();
      
      const totalDias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
      diasTranscurridos = Math.ceil((hoy - inicio) / (1000 * 60 * 60 * 24));
      diasRestantes = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
      porcentajeTiempo = Math.min(100, Math.max(0, (diasTranscurridos / totalDias) * 100));
    }

    res.json({
      success: true,
      data: {
        ...stats[0],
        diasTranscurridos,
        diasRestantes,
        porcentajeTiempo: porcentajeTiempo.toFixed(1)
      }
    });
  } catch (error) {
    logger.error('Get stats error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
