const { pool } = require('../config/database');
const logger = require('../utils/logger');

// Obtener riesgos del proyecto
exports.getByProject = async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.query(`
      SELECT 
        r.*,
        u.nombre as responsable_nombre
      FROM riesgos r
      LEFT JOIN usuarios u ON r.responsable_id = u.id
      WHERE r.proyecto_id = ?
      ORDER BY r.nivel_riesgo DESC, r.codigo
    `, [id]);

    res.json({ success: true, data: items });
  } catch (error) {
    logger.error('Get riesgos error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener resumen de riesgos
exports.getSummary = async (req, res) => {
  try {
    const { id } = req.params;

    // Resumen por estado
    const [byStatus] = await pool.query(`
      SELECT 
        estado,
        COUNT(*) as total
      FROM riesgos
      WHERE proyecto_id = ?
      GROUP BY estado
    `, [id]);

    // Resumen por nivel
    const [byLevel] = await pool.query(`
      SELECT 
        CASE 
          WHEN nivel_riesgo >= 20 THEN 'critico'
          WHEN nivel_riesgo >= 12 THEN 'alto'
          WHEN nivel_riesgo >= 6 THEN 'medio'
          ELSE 'bajo'
        END as nivel,
        COUNT(*) as total
      FROM riesgos
      WHERE proyecto_id = ?
      GROUP BY nivel
    `, [id]);

    // Resumen por categoría
    const [byCategory] = await pool.query(`
      SELECT 
        categoria,
        COUNT(*) as total,
        AVG(nivel_riesgo) as promedio
      FROM riesgos
      WHERE proyecto_id = ? AND categoria IS NOT NULL
      GROUP BY categoria
    `, [id]);

    // Estadísticas generales
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_riesgos,
        AVG(nivel_riesgo) as promedio_nivel,
        SUM(CASE WHEN estado = 'identificado' THEN 1 ELSE 0 END) as identificados,
        SUM(CASE WHEN estado = 'en_seguimiento' THEN 1 ELSE 0 END) as en_seguimiento,
        SUM(CASE WHEN estado = 'materializado' THEN 1 ELSE 0 END) as materializados,
        SUM(CASE WHEN estado = 'cerrado' THEN 1 ELSE 0 END) as cerrados
      FROM riesgos
      WHERE proyecto_id = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        byStatus,
        byLevel,
        byCategory,
        stats: stats[0]
      }
    });
  } catch (error) {
    logger.error('Get riesgos summary error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener heatmap (matriz de calor)
exports.getHeatmap = async (req, res) => {
  try {
    const { id } = req.params;

    const [risks] = await pool.query(`
      SELECT 
        id,
        codigo,
        titulo,
        probabilidad,
        impacto,
        nivel_riesgo,
        estado
      FROM riesgos
      WHERE proyecto_id = ?
    `, [id]);

    // Construir matriz 5x5
    const matrix = [];
    for (let p = 1; p <= 5; p++) {
      for (let i = 1; i <= 5; i++) {
        const level = p * i;
        const risksInCell = risks.filter(r => r.probabilidad === p && r.impacto === i);
        matrix.push({
          probabilidad: p,
          impacto: i,
          nivel: level,
          riesgos: risksInCell
        });
      }
    }

    res.json({ success: true, data: { matrix, risks } });
  } catch (error) {
    logger.error('Get heatmap error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener un riesgo
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.query(`
      SELECT r.*, u.nombre as responsable_nombre
      FROM riesgos r
      LEFT JOIN usuarios u ON r.responsable_id = u.id
      WHERE r.id = ?
    `, [id]);

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Risk not found' });
    }

    res.json({ success: true, data: items[0] });
  } catch (error) {
    logger.error('Get riesgo error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Crear riesgo
exports.create = async (req, res) => {
  try {
    const { id } = req.params; // ID del proyecto
    const {
      titulo, descripcion, probabilidad, impacto, categoria,
      tipo_impacto, tipo_respuesta, plan_respuesta, responsable_id
    } = req.body;

    // Generar código
    const [lastRisk] = await pool.query(
      'SELECT codigo FROM riesgos WHERE proyecto_id = ? ORDER BY id DESC LIMIT 1',
      [id]
    );
    
    let nextNum = 1;
    if (lastRisk.length > 0 && lastRisk[0].codigo) {
      const lastNum = parseInt(lastRisk[0].codigo.replace('R-', ''));
      nextNum = lastNum + 1;
    }
    const codigo = `R-${String(nextNum).padStart(3, '0')}`;

    // Convertir datos
    const prob = parseInt(probabilidad) || 3;
    const imp = parseInt(impacto) || 3;
    const respId = (responsable_id && responsable_id !== '' && responsable_id !== 'null') ? parseInt(responsable_id) : null;

    // nivel_riesgo es columna generada, NO se incluye en INSERT
    const [result] = await pool.query(`
      INSERT INTO riesgos (
        proyecto_id, codigo, titulo, descripcion, probabilidad, impacto,
        categoria, tipo_impacto, tipo_respuesta,
        plan_respuesta, responsable_id, estado, fecha_identificacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'identificado', CURDATE())
    `, [
      id, codigo, titulo, descripcion, prob, imp,
      categoria, tipo_impacto, tipo_respuesta,
      plan_respuesta, respId
    ]);

    const [newItem] = await pool.query(
      'SELECT * FROM riesgos WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    logger.error('Create riesgo error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Actualizar riesgo
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo, descripcion, probabilidad, impacto, categoria,
      tipo_impacto, tipo_respuesta, plan_respuesta, responsable_id, estado
    } = req.body;

    const [existing] = await pool.query('SELECT id FROM riesgos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Risk not found' });
    }

    // Convertir datos
    const prob = parseInt(probabilidad) || 3;
    const imp = parseInt(impacto) || 3;
    const respId = (responsable_id && responsable_id !== '' && responsable_id !== 'null') ? parseInt(responsable_id) : null;

    // nivel_riesgo es columna generada, NO se incluye en UPDATE
    // Si se cierra, registrar fecha
    const fecha_cierre = estado === 'cerrado' ? new Date() : null;

    await pool.query(`
      UPDATE riesgos SET
        titulo = ?, descripcion = ?, probabilidad = ?, impacto = ?,
        categoria = ?, tipo_impacto = ?, tipo_respuesta = ?,
        plan_respuesta = ?, responsable_id = ?, estado = ?,
        fecha_cierre = COALESCE(?, fecha_cierre)
      WHERE id = ?
    `, [
      titulo, descripcion, prob, imp,
      categoria, tipo_impacto, tipo_respuesta,
      plan_respuesta, respId, estado, fecha_cierre, id
    ]);

    const [updated] = await pool.query('SELECT * FROM riesgos WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update riesgo error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Eliminar riesgo
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM riesgos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Risk not found' });
    }

    await pool.query('DELETE FROM riesgos WHERE id = ?', [id]);
    res.json({ success: true, message: 'Risk deleted' });
  } catch (error) {
    logger.error('Delete riesgo error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener usuarios
exports.getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, nombre FROM usuarios WHERE activo = 1 ORDER BY nombre'
    );
    res.json({ success: true, data: users });
  } catch (error) {
    logger.error('Get users error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
