const { pool } = require('../config/database');
const logger = require('../utils/logger');

// ==================== EVALUACIÓN DEL PROYECTO ====================

exports.getEvaluacion = async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await pool.query(`
      SELECT e.*, u.nombre as evaluado_por_nombre
      FROM evaluacion_proyecto e
      LEFT JOIN usuarios u ON e.evaluado_por = u.id
      WHERE e.proyecto_id = ?
    `, [id]);
    res.json({ success: true, data: items[0] || null });
  } catch (error) {
    logger.error('Get evaluacion error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createOrUpdateEvaluacion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      alcance_cumplido, tiempo_cumplido, costo_cumplido, calidad_cumplida,
      impacto_esperado, impacto_real, beneficiarios_alcanzados, beneficiarios_esperados,
      satisfaccion_sponsor, satisfaccion_equipo, satisfaccion_beneficiarios,
      calificacion, lecciones_clave, recomendaciones
    } = req.body;

    const [existing] = await pool.query('SELECT id FROM evaluacion_proyecto WHERE proyecto_id = ?', [id]);

    if (existing.length > 0) {
      await pool.query(`
        UPDATE evaluacion_proyecto SET
          alcance_cumplido=?, tiempo_cumplido=?, costo_cumplido=?, calidad_cumplida=?,
          impacto_esperado=?, impacto_real=?, beneficiarios_alcanzados=?, beneficiarios_esperados=?,
          satisfaccion_sponsor=?, satisfaccion_equipo=?, satisfaccion_beneficiarios=?,
          calificacion=?, lecciones_clave=?, recomendaciones=?,
          evaluado_por=?, fecha_evaluacion=CURDATE()
        WHERE proyecto_id=?
      `, [
        alcance_cumplido, tiempo_cumplido, costo_cumplido, calidad_cumplida,
        impacto_esperado, impacto_real, beneficiarios_alcanzados, beneficiarios_esperados,
        satisfaccion_sponsor, satisfaccion_equipo, satisfaccion_beneficiarios,
        calificacion, lecciones_clave, recomendaciones,
        req.user.id, id
      ]);
    } else {
      await pool.query(`
        INSERT INTO evaluacion_proyecto (
          proyecto_id, alcance_cumplido, tiempo_cumplido, costo_cumplido, calidad_cumplida,
          impacto_esperado, impacto_real, beneficiarios_alcanzados, beneficiarios_esperados,
          satisfaccion_sponsor, satisfaccion_equipo, satisfaccion_beneficiarios,
          calificacion, lecciones_clave, recomendaciones,
          evaluado_por, fecha_evaluacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
      `, [
        id, alcance_cumplido, tiempo_cumplido, costo_cumplido, calidad_cumplida,
        impacto_esperado, impacto_real, beneficiarios_alcanzados, beneficiarios_esperados,
        satisfaccion_sponsor, satisfaccion_equipo, satisfaccion_beneficiarios,
        calificacion, lecciones_clave, recomendaciones, req.user.id
      ]);
    }

    const [updated] = await pool.query('SELECT * FROM evaluacion_proyecto WHERE proyecto_id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Save evaluacion error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== ENCUESTAS A BENEFICIARIOS ====================

exports.getEncuestas = async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await pool.query('SELECT * FROM encuestas_beneficiarios WHERE proyecto_id = ?', [id]);
    res.json({ success: true, data: items });
  } catch (error) {
    logger.error('Get encuestas error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createEncuesta = async (req, res) => {
  try {
    const { id } = req.params;
    const { pregunta, tipo_respuesta, respuesta_promedio, total_respuestas } = req.body;

    const [result] = await pool.query(`
      INSERT INTO encuestas_beneficiarios (proyecto_id, pregunta, tipo_respuesta, respuesta_promedio, total_respuestas)
      VALUES (?, ?, ?, ?, ?)
    `, [id, pregunta, tipo_respuesta, respuesta_promedio || 0, total_respuestas || 0]);

    const [newItem] = await pool.query('SELECT * FROM encuestas_beneficiarios WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    logger.error('Create encuesta error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateEncuesta = async (req, res) => {
  try {
    const { id } = req.params;
    const { pregunta, tipo_respuesta, respuesta_promedio, total_respuestas } = req.body;

    await pool.query(`
      UPDATE encuestas_beneficiarios SET pregunta=?, tipo_respuesta=?, respuesta_promedio=?, total_respuestas=? WHERE id=?
    `, [pregunta, tipo_respuesta, respuesta_promedio, total_respuestas, id]);

    const [updated] = await pool.query('SELECT * FROM encuestas_beneficiarios WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update encuesta error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteEncuesta = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM encuestas_beneficiarios WHERE id = ?', [id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    logger.error('Delete encuesta error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== RESUMEN DE EVALUACIÓN ====================

exports.getResumen = async (req, res) => {
  try {
    const { id } = req.params;

    // Datos del proyecto
    const [project] = await pool.query('SELECT * FROM proyectos WHERE id = ?', [id]);

    // Datos del marco lógico
    const [marcoLogico] = await pool.query(`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN avance_porcentaje = 100 THEN 1 ELSE 0 END) as cumplidos
      FROM marco_logico WHERE proyecto_id = ?
    `, [id]);

    // Datos WBS
    const [wbs] = await pool.query(`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completadas
      FROM wbs WHERE proyecto_id = ? AND nivel = 3
    `, [id]);

    // Datos presupuesto
    const [presupuesto] = await pool.query(`
      SELECT COALESCE(SUM(monto_aprobado), 0) as total FROM presupuesto WHERE proyecto_id = ?
    `, [id]);
    const [gastoReal] = await pool.query(`
      SELECT COALESCE(SUM(monto), 0) as gasto_real FROM costos_reales WHERE proyecto_id = ?
    `, [id]);

    // Datos entregables
    const [entregables] = await pool.query(`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN estado = 'aprobado' THEN 1 ELSE 0 END) as aprobados
      FROM entregables WHERE proyecto_id = ?
    `, [id]);

    // Lecciones aprendidas
    const [lecciones] = await pool.query(`
      SELECT COUNT(*) as total FROM lecciones_aprendidas WHERE proyecto_id = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        project: project[0],
        marcoLogico: marcoLogico[0],
        wbs: wbs[0],
        presupuesto: { total: presupuesto[0].total, real: gastoReal[0].gasto_real },
        entregables: entregables[0],
        lecciones: lecciones[0]
      }
    });
  } catch (error) {
    logger.error('Get resumen error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
