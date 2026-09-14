const { pool } = require('../config/database');
const logger = require('../utils/logger');

// ==================== ACTA DE CONSTITUCIÓN (CHARTER) ====================

exports.getCharter = async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await pool.query(`
      SELECT c.*, u.nombre as aprobado_por_nombre
      FROM acta_constitucion c
      LEFT JOIN usuarios u ON c.aprobado_por = u.id
      WHERE c.proyecto_id = ?
    `, [id]);
    res.json({ success: true, data: items[0] || null });
  } catch (error) {
    logger.error('Get charter error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createOrUpdateCharter = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      resumen_ejecutivo, necesidad_negocio, alcance_alto_nivel,
      hitos_principales, supuestos_clave, restricciones,
      riesgos_principales, presupuesto_estimado,
      fecha_inicio_estimada, fecha_fin_estimada, estado
    } = req.body;

    const [existing] = await pool.query('SELECT id FROM acta_constitucion WHERE proyecto_id = ?', [id]);

    if (existing.length > 0) {
      await pool.query(`
        UPDATE acta_constitucion SET
          resumen_ejecutivo=?, necesidad_negocio=?, alcance_alto_nivel=?,
          hitos_principales=?, supuestos_clave=?, restricciones=?,
          riesgos_principales=?, presupuesto_estimado=?,
          fecha_inicio_estimada=?, fecha_fin_estimada=?, estado=?
        WHERE proyecto_id=?
      `, [
        resumen_ejecutivo, necesidad_negocio, alcance_alto_nivel,
        JSON.stringify(hitos_principales), supuestos_clave, restricciones,
        riesgos_principales, presupuesto_estimado,
        fecha_inicio_estimada, fecha_fin_estimada, estado || 'borrador', id
      ]);
    } else {
      await pool.query(`
        INSERT INTO acta_constitucion (
          proyecto_id, resumen_ejecutivo, necesidad_negocio, alcance_alto_nivel,
          hitos_principales, supuestos_clave, restricciones,
          riesgos_principales, presupuesto_estimado,
          fecha_inicio_estimada, fecha_fin_estimada, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id, resumen_ejecutivo, necesidad_negocio, alcance_alto_nivel,
        JSON.stringify(hitos_principales), supuestos_clave, restricciones,
        riesgos_principales, presupuesto_estimado,
        fecha_inicio_estimada, fecha_fin_estimada, estado || 'borrador'
      ]);
    }

    const [updated] = await pool.query('SELECT * FROM acta_constitucion WHERE proyecto_id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Save charter error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.approveCharter = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`
      UPDATE acta_constitucion SET estado='aprobado', aprobado_por=?, fecha_aprobacion=CURDATE()
      WHERE proyecto_id=?
    `, [req.user.id, id]);
    const [updated] = await pool.query('SELECT * FROM acta_constitucion WHERE proyecto_id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Approve charter error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== STAKEHOLDERS ====================

exports.getStakeholders = async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await pool.query(`
      SELECT s.*, u.nombre as responsable_nombre
      FROM stakeholders s
      LEFT JOIN usuarios u ON s.responsable_id = u.id
      WHERE s.proyecto_id = ?
      ORDER BY s.nivel_poder DESC, s.nivel_interes DESC
    `, [id]);
    res.json({ success: true, data: items });
  } catch (error) {
    logger.error('Get stakeholders error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createStakeholder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre, organisation, cargo, email, telefono,
      nivel_poder, nivel_interes, expectativas, actitud,
      estrategia_gestion, responsable_id
    } = req.body;

    const [result] = await pool.query(`
      INSERT INTO stakeholders (
        proyecto_id, nombre, organisation, cargo, email, telefono,
        nivel_poder, nivel_interes, expectativas, actitud,
        estrategia_gestion, responsable_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, nombre, organisation, cargo, email, telefono,
      nivel_poder || 3, nivel_interes || 3, expectativas, actitud || 'neutral',
      estrategia_gestion, responsable_id || null
    ]);

    const [newItem] = await pool.query('SELECT * FROM stakeholders WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    logger.error('Create stakeholder error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateStakeholder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre, organisation, cargo, email, telefono,
      nivel_poder, nivel_interes, expectativas, actitud,
      estrategia_gestion, responsable_id
    } = req.body;

    await pool.query(`
      UPDATE stakeholders SET
        nombre=?, organisation=?, cargo=?, email=?, telefono=?,
        nivel_poder=?, nivel_interes=?, expectativas=?, actitud=?,
        estrategia_gestion=?, responsable_id=?
      WHERE id=?
    `, [
      nombre, organisation, cargo, email, telefono,
      nivel_poder, nivel_interes, expectativas, actitud,
      estrategia_gestion, responsable_id || null, id
    ]);

    const [updated] = await pool.query('SELECT * FROM stakeholders WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update stakeholder error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteStakeholder = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM stakeholders WHERE id = ?', [id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    logger.error('Delete stakeholder error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== ANÁLISIS DE VIABILIDAD ====================

exports.getViabilidad = async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await pool.query(`
      SELECT v.*, u.nombre as evaluado_por_nombre
      FROM analisis_viabilidad v
      LEFT JOIN usuarios u ON v.evaluado_por = u.id
      WHERE v.proyecto_id = ?
    `, [id]);
    res.json({ success: true, data: items });
  } catch (error) {
    logger.error('Get viabilidad error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createViabilidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, justificacion, es_viable, condiciones } = req.body;

    const [result] = await pool.query(`
      INSERT INTO analisis_viabilidad (proyecto_id, tipo, justificacion, es_viable, condiciones, evaluado_por, fecha_evaluacion)
      VALUES (?, ?, ?, ?, ?, ?, CURDATE())
    `, [id, tipo, justificacion, es_viable, condiciones, req.user.id]);

    const [newItem] = await pool.query('SELECT * FROM analisis_viabilidad WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    logger.error('Create viabilidad error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateViabilidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, justificacion, es_viable, condiciones } = req.body;

    await pool.query(`
      UPDATE analisis_viabilidad SET tipo=?, justificacion=?, es_viable=?, condiciones=? WHERE id=?
    `, [tipo, justificacion, es_viable, condiciones, id]);

    const [updated] = await pool.query('SELECT * FROM analisis_viabilidad WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update viabilidad error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteViabilidad = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM analisis_viabilidad WHERE id = ?', [id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    logger.error('Delete viabilidad error', { error: error.message });
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
