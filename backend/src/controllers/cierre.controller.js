const { pool } = require('../config/database');
const logger = require('../utils/logger');

// ==================== CHECKLIST DE CIERRE ====================

exports.getCierre = async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await pool.query(`
      SELECT c.*, u.nombre as cerrado_por_nombre
      FROM cierre_proyecto c
      LEFT JOIN usuarios u ON c.cerrado_por = u.id
      WHERE c.proyecto_id = ?
    `, [id]);
    res.json({ success: true, data: items[0] || null });
  } catch (error) {
    logger.error('Get cierre error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createOrUpdateCierre = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      alcance_completado, documentacion_entregada, contratos_cerrados,
      activos_transferidos, lecciones_registradas, motivo_cierre, observaciones
    } = req.body;

    const [existing] = await pool.query('SELECT id FROM cierre_proyecto WHERE proyecto_id = ?', [id]);

    if (existing.length > 0) {
      await pool.query(`
        UPDATE cierre_proyecto SET
          alcance_completado = ?, documentacion_entregada = ?, contratos_cerrados = ?,
          activos_transferidos = ?, lecciones_registradas = ?,
          motivo_cierre = ?, observaciones = ?,
          cerrado_por = ?, fecha_cierre = CURDATE()
        WHERE proyecto_id = ?
      `, [
        alcance_completado, documentacion_entregada, contratos_cerrados,
        activos_transferidos, lecciones_registradas,
        motivo_cierre, observaciones, req.user.id, id
      ]);
    } else {
      await pool.query(`
        INSERT INTO cierre_proyecto (
          proyecto_id, alcance_completado, documentacion_entregada, contratos_cerrados,
          activos_transferidos, lecciones_registradas,
          motivo_cierre, observaciones, cerrado_por, fecha_cierre
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
      `, [
        id, alcance_completado, documentacion_entregada, contratos_cerrados,
        activos_transferidos, lecciones_registradas,
        motivo_cierre, observaciones, req.user.id
      ]);
    }

    const [updated] = await pool.query('SELECT * FROM cierre_proyecto WHERE proyecto_id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Save cierre error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== LECCIONES APRENDIDAS ====================

exports.getLecciones = async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await pool.query(`
      SELECT l.*, u.nombre as registrador_nombre
      FROM lecciones_aprendidas l
      LEFT JOIN usuarios u ON l.registrador_por = u.id
      WHERE l.proyecto_id = ?
      ORDER BY l.creado_en DESC
    `, [id]);
    res.json({ success: true, data: items });
  } catch (error) {
    logger.error('Get lecciones error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createLeccion = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoria, titulo, descripcion, recomendacion } = req.body;

    const [result] = await pool.query(`
      INSERT INTO lecciones_aprendidas (proyecto_id, categoria, titulo, descripcion, recomendacion, registrador_por)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, categoria, titulo, descripcion, recomendacion, req.user.id]);

    const [newItem] = await pool.query('SELECT * FROM lecciones_aprendidas WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    logger.error('Create leccion error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateLeccion = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoria, titulo, descripcion, recomendacion } = req.body;

    await pool.query(`
      UPDATE lecciones_aprendidas SET categoria=?, titulo=?, descripcion=?, recomendacion=? WHERE id=?
    `, [categoria, titulo, descripcion, recomendacion, id]);

    const [updated] = await pool.query('SELECT * FROM lecciones_aprendidas WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update leccion error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteLeccion = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM lecciones_aprendidas WHERE id = ?', [id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    logger.error('Delete leccion error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== TRANSFERENCIA DE ACTIVOS ====================

exports.getTransferencias = async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await pool.query(`
      SELECT t.*, a.nombre as area_destino_nombre, u1.nombre as responsable_nombre, u2.nombre as recibido_por_nombre
      FROM transferencia_activos t
      LEFT JOIN areas a ON t.area_destino = a.id
      LEFT JOIN usuarios u1 ON t.responsable = u1.id
      LEFT JOIN usuarios u2 ON t.recibido_por = u2.id
      WHERE t.proyecto_id = ?
    `, [id]);
    res.json({ success: true, data: items });
  } catch (error) {
    logger.error('Get transferencias error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createTransferencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo, descripcion, area_destino, responsable } = req.body;

    const [result] = await pool.query(`
      INSERT INTO transferencia_activos (proyecto_id, activo, descripcion, area_destino, responsable, estado)
      VALUES (?, ?, ?, ?, ?, 'pendiente')
    `, [id, activo, descripcion, area_destino || null, responsable || null]);

    const [newItem] = await pool.query('SELECT * FROM transferencia_activos WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    logger.error('Create transferencia error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateTransferenciaStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, recibido_por } = req.body;

    await pool.query(`
      UPDATE transferencia_activos SET estado=?, recibido_por=? WHERE id=?
    `, [estado, recibido_por || req.user.id, id]);

    const [updated] = await pool.query('SELECT * FROM transferencia_activos WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update transferencia error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteTransferencia = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM transferencia_activos WHERE id = ?', [id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    logger.error('Delete transferencia error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== CIERRE FINANCIERO ====================

exports.getCierreFinanciero = async (req, res) => {
  try {
    const { id } = req.params;
    const [items] = await pool.query(`
      SELECT cf.*, u.nombre as aprobado_por_nombre
      FROM cierre_financiero cf
      LEFT JOIN usuarios u ON cf.aprobado_por = u.id
      WHERE cf.proyecto_id = ?
    `, [id]);
    res.json({ success: true, data: items[0] || null });
  } catch (error) {
    logger.error('Get cierre financiero error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createOrUpdateCierreFinanciero = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      presupuesto_total, gasto_total, ahorro_generado, sobrecosto,
      contratos_cerrados, pagos_pendientes, balance_final
    } = req.body;

    const [existing] = await pool.query('SELECT id FROM cierre_financiero WHERE proyecto_id = ?', [id]);

    if (existing.length > 0) {
      await pool.query(`
        UPDATE cierre_financiero SET
          presupuesto_total=?, gasto_total=?, ahorro_generado=?, sobrecosto=?,
          contratos_cerrados=?, pagos_pendientes=?, balance_final=?,
          aprobado_por=?, fecha_cierre=CURDATE()
        WHERE proyecto_id=?
      `, [
        presupuesto_total, gasto_total, ahorro_generado, sobrecosto,
        contratos_cerrados, pagos_pendientes, balance_final,
        req.user.id, id
      ]);
    } else {
      await pool.query(`
        INSERT INTO cierre_financiero (
          proyecto_id, presupuesto_total, gasto_total, ahorro_generado, sobrecosto,
          contratos_cerrados, pagos_pendientes, balance_final,
          aprobado_por, fecha_cierre
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
      `, [
        id, presupuesto_total, gasto_total, ahorro_generado, sobrecosto,
        contratos_cerrados, pagos_pendientes, balance_final, req.user.id
      ]);
    }

    const [updated] = await pool.query('SELECT * FROM cierre_financiero WHERE proyecto_id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Save cierre financiero error', { error: error.message });
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

exports.getAreas = async (req, res) => {
  try {
    const [areas] = await pool.query('SELECT id, nombre FROM areas WHERE activo = 1');
    res.json({ success: true, data: areas });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
