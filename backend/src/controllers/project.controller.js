const { pool } = require('../config/database');
const logger = require('../utils/logger');

exports.getAll = async (req, res) => {
  try {
    const [projects] = await pool.query(`
      SELECT p.*, 
             ep.nombre as estado_nombre,
             tp.nombre as tipo_nombre,
             u1.nombre as sponsor_nombre,
             u2.nombre as pm_nombre
      FROM proyectos p
      LEFT JOIN estados_proyecto ep ON p.estado_id = ep.id
      LEFT JOIN tipos_proyecto tp ON p.tipo_id = tp.id
      LEFT JOIN usuarios u1 ON p.sponsor_id = u1.id
      LEFT JOIN usuarios u2 ON p.pm_id = u2.id
      ORDER BY p.creado_en DESC
    `);
    res.json({ success: true, data: projects });
  } catch (error) {
    logger.error('Get dashboard error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [projects] = await pool.query(`
      SELECT p.*, 
             ep.nombre as estado_nombre,
             tp.nombre as tipo_nombre,
             u1.nombre as sponsor_nombre,
             u2.nombre as pm_nombre,
             a.nombre as area_nombre
      FROM proyectos p
      LEFT JOIN estados_proyecto ep ON p.estado_id = ep.id
      LEFT JOIN tipos_proyecto tp ON p.tipo_id = tp.id
      LEFT JOIN usuarios u1 ON p.sponsor_id = u1.id
      LEFT JOIN usuarios u2 ON p.pm_id = u2.id
      LEFT JOIN areas a ON p.area_id = a.id
      WHERE p.id = ?
    `, [id]);

    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: projects[0] });
  } catch (error) {
    logger.error('Get project error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      nombre, descripcion, tipo_id, sponsor_id, pm_id, area_id,
      fecha_inicio_planeada, fecha_fin_planeada, presupuesto_planeado,
      justificacion, objetivogeneral, alcance_general
    } = req.body;

    // Generate project code
    const [lastProject] = await connection.query(
      'SELECT codigo FROM proyectos ORDER BY id DESC LIMIT 1'
    );
    
    let nextNumber = 1;
    if (lastProject.length > 0) {
      const lastCode = lastProject[0].codigo;
      const lastNum = parseInt(lastCode.split('-').pop());
      nextNumber = lastNum + 1;
    }
    const codigo = `PRY-${new Date().getFullYear()}-${String(nextNumber).padStart(3, '0')}`;

    // Get default "Borrador" state
    const [states] = await connection.query(
      'SELECT id FROM estados_proyecto WHERE nombre = ? LIMIT 1',
      ['Borrador']
    );
    const estado_id = states.length > 0 ? states[0].id : 1;

    const [result] = await connection.query(`
      INSERT INTO proyectos (
        nombre, codigo, descripcion, tipo_id, estado_id, sponsor_id, pm_id, area_id,
        fecha_solicitud, fecha_inicio_planeada, fecha_fin_planeada, 
        presupuesto_planeado, justificacion, objetivogeneral, alcance_general,
        creado_por
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?)
    `, [
      nombre, codigo, descripcion, tipo_id, estado_id, sponsor_id, pm_id, area_id,
      fecha_inicio_planeada, fecha_fin_planeada, presupuesto_planeado,
      justificacion, objetivogeneral, alcance_general, req.user.id
    ]);

    const [newProject] = await connection.query(
      'SELECT * FROM proyectos WHERE id = ?',
      [result.insertId]
    );

    await connection.commit();

    res.status(201).json({ success: true, data: newProject[0] });
  } catch (error) {
    await connection.rollback();
    logger.error('Create project error', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre, descripcion, tipo_id, sponsor_id, pm_id, area_id,
      fecha_inicio_planeada, fecha_fin_planeada, presupuesto_planeado,
      justificacion, objetivogeneral, alcance_general
    } = req.body;

    const [existing] = await pool.query('SELECT id FROM proyectos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await pool.query(`
      UPDATE proyectos SET
        nombre = ?, descripcion = ?, tipo_id = ?, sponsor_id = ?, pm_id = ?, area_id = ?,
        fecha_inicio_planeada = ?, fecha_fin_planeada = ?, presupuesto_planeado = ?,
        justificacion = ?, objetivogeneral = ?, alcance_general = ?,
        actualizado_en = NOW()
      WHERE id = ?
    `, [
      nombre, descripcion, tipo_id, sponsor_id, pm_id, area_id,
      fecha_inicio_planeada, fecha_fin_planeada, presupuesto_planeado,
      justificacion, objetivogeneral, alcance_general, id
    ]);

    const [updated] = await pool.query('SELECT * FROM proyectos WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Create project error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM proyectos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await pool.query('DELETE FROM proyectos WHERE id = ?', [id]);
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    logger.error('Update project error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateState = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_id } = req.body;

    const [existing] = await pool.query('SELECT id FROM proyectos WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await pool.query(
      'UPDATE proyectos SET estado_id = ?, actualizado_en = NOW() WHERE id = ?',
      [estado_id, id]
    );

    const [updated] = await pool.query(`
      SELECT p.*, ep.nombre as estado_nombre
      FROM proyectos p
      LEFT JOIN estados_proyecto ep ON p.estado_id = ep.id
      WHERE p.id = ?
    `, [id]);

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Delete project error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const { id } = req.params;

    // Get project basic info
    const [projects] = await pool.query(`
      SELECT p.*, ep.nombre as estado_nombre
      FROM proyectos p
      LEFT JOIN estados_proyecto ep ON p.estado_id = ep.id
      WHERE p.id = ?
    `, [id]);

    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Get WBS summary
    const [wbsSummary] = await pool.query(`
      SELECT 
        COUNT(*) as total_actividades,
        SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completadas,
        SUM(CASE WHEN estado = 'en_progreso' THEN 1 ELSE 0 END) as en_progreso,
        AVG(avance) as avance_promedio
      FROM wbs WHERE proyecto_id = ? AND nivel = 3
    `, [id]);

    // Get budget summary
    const [budgetSummary] = await pool.query(`
      SELECT 
        SUM(monto_aprobado) as presupuesto_total,
        (SELECT SUM(monto) FROM costos_reales WHERE proyecto_id = ?) as gasto_real
      FROM presupuesto WHERE proyecto_id = ?
    `, [id, id]);

    // Get risks summary
    const [risksSummary] = await pool.query(`
      SELECT 
        COUNT(*) as total_riesgos,
        SUM(CASE WHEN nivel_riesgo >= 15 THEN 1 ELSE 0 END) as criticos,
        SUM(CASE WHEN estado = 'identificado' THEN 1 ELSE 0 END) as activos
      FROM riesgos WHERE proyecto_id = ?
    `, [id]);

    // Get issues summary
    const [issuesSummary] = await pool.query(`
      SELECT 
        COUNT(*) as total_issues,
        SUM(CASE WHEN estado = 'abierto' THEN 1 ELSE 0 END) as abiertos,
        SUM(CASE WHEN prioridad = 'critica' THEN 1 ELSE 0 END) as criticos
      FROM issues WHERE proyecto_id = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        project: projects[0],
        wbs: {
          total_actividades: parseInt(wbsSummary[0].total_actividades) || 0,
          completadas: parseInt(wbsSummary[0].completadas) || 0,
          en_progreso: parseInt(wbsSummary[0].en_progreso) || 0,
          avance_promedio: parseFloat(wbsSummary[0].avance_promedio) || 0
        },
        budget: {
          presupuesto_total: parseFloat(budgetSummary[0].presupuesto_total) || 0,
          gasto_real: parseFloat(budgetSummary[0].gasto_real) || 0
        },
        risks: {
          total_riesgos: parseInt(risksSummary[0].total_riesgos) || 0,
          criticos: parseInt(risksSummary[0].criticos) || 0,
          activos: parseInt(risksSummary[0].activos) || 0
        },
        issues: {
          total_issues: parseInt(issuesSummary[0].total_issues) || 0,
          abiertos: parseInt(issuesSummary[0].abiertos) || 0,
          criticos: parseInt(issuesSummary[0].criticos) || 0
        }
      }
    });
  } catch (error) {
    logger.error('Update project state error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
