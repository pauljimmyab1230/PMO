const { pool } = require('../config/database');
const logger = require('../utils/logger');

// Dashboard global de todos los proyectos
exports.getDashboard = async (req, res) => {
  try {
    // Total de proyectos por estado
    const [byStatus] = await pool.query(`
      SELECT ep.nombre as estado, COUNT(p.id) as total, ep.color
      FROM proyectos p
      LEFT JOIN estados_proyecto ep ON p.estado_id = ep.id
      GROUP BY ep.id, ep.nombre, ep.color
      ORDER BY ep.orden
    `);

    // Total de proyectos
    const [total] = await pool.query('SELECT COUNT(*) as total FROM proyectos');

    // Presupuesto total
    const [presupuesto] = await pool.query(`
      SELECT 
        COALESCE(SUM(presupuesto_planeado), 0) as total_planeado,
        COALESCE(SUM(presupuesto_real), 0) as total_real
      FROM proyectos
    `);

    // Gastos reales
    const [gastos] = await pool.query(`
      SELECT COALESCE(SUM(monto), 0) as total_gastado
      FROM costos_reales
    `);

    // Issues abiertos (todos los proyectos)
    const [issues] = await pool.query(`
      SELECT COUNT(*) as total_abiertos
      FROM issues WHERE estado = 'abierto'
    `);

    // Riesgos críticos
    const [riesgos] = await pool.query(`
      SELECT COUNT(*) as criticos
      FROM riesgos WHERE nivel_riesgo >= 15 AND estado != 'cerrado'
    `);

    // Proyectos por área
    const [byArea] = await pool.query(`
      SELECT a.nombre as area, COUNT(p.id) as total
      FROM proyectos p
      LEFT JOIN areas a ON p.area_id = a.id
      WHERE a.nombre IS NOT NULL
      GROUP BY a.id, a.nombre
      ORDER BY total DESC
    `);

    // Proyectos próximos a vencer (próximos 30 días)
    const [proximosVencer] = await pool.query(`
      SELECT p.id, p.codigo, p.nombre, p.fecha_fin_planeada,
             DATEDIFF(p.fecha_fin_planeada, CURDATE()) as dias_restantes,
             ep.nombre as estado
      FROM proyectos p
      LEFT JOIN estados_proyecto ep ON p.estado_id = ep.id
      WHERE p.fecha_fin_planeada BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        AND ep.es_estado_final = 0
      ORDER BY p.fecha_fin_planeada
      LIMIT 10
    `);

    // Últimos proyectos creados
    const [ultimosProyectos] = await pool.query(`
      SELECT p.id, p.codigo, p.nombre, p.creado_en as fecha_creacion, ep.nombre as estado,
             u.nombre as pm_nombre
      FROM proyectos p
      LEFT JOIN estados_proyecto ep ON p.estado_id = ep.id
      LEFT JOIN usuarios u ON p.pm_id = u.id
      ORDER BY p.creado_en DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        total: total[0].total,
        byStatus,
        presupuesto: {
          total_planeado: presupuesto[0].total_planeado,
          total_real: presupuesto[0].total_real,
          total_gastado: gastos[0].total_gastado
        },
        issues: issues[0],
        riesgos: riesgos[0],
        byArea,
        proximosVencer,
        ultimosProyectos
      }
    });
  } catch (error) {
    logger.error('Get portafolio dashboard error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener todos los proyectos con resumen
exports.getProjects = async (req, res) => {
  try {
    const [projects] = await pool.query(`
      SELECT 
        p.*,
        ep.nombre as estado_nombre,
        ep.color as estado_color,
        tp.nombre as tipo_nombre,
        u1.nombre as sponsor_nombre,
        u2.nombre as pm_nombre,
        a.nombre as area_nombre,
        (SELECT COUNT(*) FROM issues WHERE proyecto_id = p.id AND estado = 'abierto') as issues_abiertos,
        (SELECT COUNT(*) FROM riesgos WHERE proyecto_id = p.id AND nivel_riesgo >= 15 AND estado != 'cerrado') as riesgos_criticos,
        (SELECT AVG(avance) FROM wbs WHERE proyecto_id = p.id AND nivel = 3) as avance_wbs
      FROM proyectos p
      LEFT JOIN estados_proyecto ep ON p.estado_id = ep.id
      LEFT JOIN tipos_proyecto tp ON p.tipo_id = tp.id
      LEFT JOIN usuarios u1 ON p.sponsor_id = u1.id
      LEFT JOIN usuarios u2 ON p.pm_id = u2.id
      LEFT JOIN areas a ON p.area_id = a.id
      ORDER BY p.creado_en DESC
    `);
    res.json({ success: true, data: projects });
  } catch (error) {
    logger.error('Get portafolio projects error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener estadísticas por PM
exports.getStatsByPM = async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        u.id,
        u.nombre,
        COUNT(p.id) as total_proyectos,
        SUM(CASE WHEN ep.es_estado_final = 0 THEN 1 ELSE 0 END) as activos,
        SUM(CASE WHEN ep.nombre = 'Cerrado' THEN 1 ELSE 0 END) as cerrados,
        AVG((SELECT AVG(avance) FROM wbs WHERE proyecto_id = p.id AND nivel = 3)) as avance_promedio
      FROM usuarios u
      LEFT JOIN proyectos p ON u.id = p.pm_id
      LEFT JOIN estados_proyecto ep ON p.estado_id = ep.id
      WHERE u.rol IN ('pm', 'pmo')
      GROUP BY u.id, u.nombre
      HAVING total_proyectos > 0
      ORDER BY total_proyectos DESC
    `);
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Get stats by PM error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
