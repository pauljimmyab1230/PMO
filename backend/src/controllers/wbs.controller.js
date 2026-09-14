const { pool } = require('../config/database');
const logger = require('../utils/logger');

// Obtener WBS completo de un proyecto (estructura jerárquica)
exports.getByProject = async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.query(`
      SELECT w.*, u.nombre as responsable_nombre
      FROM wbs w
      LEFT JOIN usuarios u ON w.responsable_id = u.id
      WHERE w.proyecto_id = ?
      ORDER BY w.codigo
    `, [id]);

    // Construir estructura jerárquica (O(n))
    const buildTree = (items) => {
      const map = new Map();
      const roots = [];
      
      items.forEach(item => {
        map.set(item.id, { ...item, children: [] });
      });
      
      items.forEach(item => {
        const node = map.get(item.id);
        if (item.padre_id === null || item.padre_id === undefined) {
          roots.push(node);
        } else {
          const parent = map.get(item.padre_id);
          if (parent) {
            parent.children.push(node);
          }
        }
      });
      
      return roots;
    };

    const tree = buildTree(items);

    res.json({ success: true, data: tree });
  } catch (error) {
    logger.error('Get WBS error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener WBS plano (para tablas)
exports.getByProjectFlat = async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.query(`
      SELECT w.*, u.nombre as responsable_nombre
      FROM wbs w
      LEFT JOIN usuarios u ON w.responsable_id = u.id
      WHERE w.proyecto_id = ?
      ORDER BY w.codigo
    `, [id]);

    res.json({ success: true, data: items });
  } catch (error) {
    logger.error('Get WBS flat error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener un elemento del WBS
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.query(`
      SELECT w.*, u.nombre as responsable_nombre
      FROM wbs w
      LEFT JOIN usuarios u ON w.responsable_id = u.id
      WHERE w.id = ?
    `, [id]);

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: items[0] });
  } catch (error) {
    logger.error('Get WBS item error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Crear elemento del WBS
exports.create = async (req, res) => {
  try {
    const { id } = req.params; // ID del proyecto
    const {
      codigo, nombre, descripcion, nivel, padre_id,
      responsable_id, fecha_inicio, fecha_fin, duracion_dias,
      costo_estimado, es_hito, orden
    } = req.body;

    // Validar que el padre pertenezca al mismo proyecto
    if (padre_id) {
      const [parent] = await pool.query(
        'SELECT id FROM wbs WHERE id = ? AND proyecto_id = ?',
        [padre_id, id]
      );
      if (parent.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Parent item does not belong to this project' 
        });
      }
    }

    // Calcular duración si no se proporciona
    let duracion = duracion_dias;
    if (!duracion && fecha_inicio && fecha_fin) {
      const start = new Date(fecha_inicio);
      const end = new Date(fecha_fin);
      duracion = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }

    const [result] = await pool.query(`
      INSERT INTO wbs (
        proyecto_id, codigo, nombre, descripcion, nivel, padre_id,
        responsable_id, fecha_inicio, fecha_fin, duracion_dias,
        costo_estimado, es_hito, orden
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, codigo, nombre, descripcion, nivel || 1, padre_id,
      responsable_id, fecha_inicio, fecha_fin, duracion,
      costo_estimado || 0, es_hito || false, orden || 0
    ]);

    const [newItem] = await pool.query(
      'SELECT * FROM wbs WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    logger.error('Create WBS error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Actualizar elemento del WBS
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      codigo, nombre, descripcion, nivel,
      responsable_id, fecha_inicio, fecha_fin, duracion_dias,
      costo_estimado, costo_real, estado, avance, es_hito, orden
    } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM wbs WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Calcular duración si no se proporciona
    let duracion = duracion_dias || null;
    if (!duracion && fecha_inicio && fecha_fin) {
      const start = new Date(fecha_inicio);
      const end = new Date(fecha_fin);
      duracion = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }

    // Limpiar responsable_id (convertir string vacío a null)
    const responsableId = responsable_id === '' || responsable_id === 'null' ? null : responsable_id;

    await pool.query(`
      UPDATE wbs SET
        codigo = ?, nombre = ?, descripcion = ?, nivel = ?,
        responsable_id = ?, fecha_inicio = ?, fecha_fin = ?, duracion_dias = ?,
        costo_estimado = ?, costo_real = ?, estado = ?, avance = ?, 
        es_hito = ?, orden = ?
      WHERE id = ?
    `, [
      codigo, nombre, descripcion, nivel || 1,
      responsableId, fecha_inicio || null, fecha_fin || null, duracion,
      costo_estimado || 0, costo_real || 0, estado || 'pendiente', avance || 0, 
      es_hito || false, orden || 0, id
    ]);

    const [updated] = await pool.query(
      'SELECT * FROM wbs WHERE id = ?',
      [id]
    );

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update WBS error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Actualizar avance de un elemento
exports.updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { avance, estado } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM wbs WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    await pool.query(`
      UPDATE wbs SET
        avance = ?, estado = ?
      WHERE id = ?
    `, [avance, estado, id]);

    const [updated] = await pool.query(
      'SELECT * FROM wbs WHERE id = ?',
      [id]
    );

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update WBS progress error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Eliminar elemento del WBS
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT id FROM wbs WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Verificar si tiene hijos
    const [children] = await pool.query(
      'SELECT COUNT(*) as count FROM wbs WHERE padre_id = ?',
      [id]
    );

    if (children[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete item with children' 
      });
    }

    // Verificar si tiene dependencias
    const [dependencies] = await pool.query(
      'SELECT COUNT(*) as count FROM dependencias_wbs WHERE actividad_origen_id = ? OR actividad_destino_id = ?',
      [id, id]
    );

    if (dependencies[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete item with dependencies' 
      });
    }

    await pool.query('DELETE FROM wbs WHERE id = ?', [id]);

    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    logger.error('Delete WBS error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener resumen del WBS
exports.getSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const [summary] = await pool.query(`
      SELECT 
        nivel,
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completados,
        SUM(CASE WHEN estado = 'en_progreso' THEN 1 ELSE 0 END) as en_progreso,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        AVG(avance) as avance_promedio,
        SUM(costo_estimado) as costo_total_estimado,
        SUM(costo_real) as costo_total_real
      FROM wbs 
      WHERE proyecto_id = ?
      GROUP BY nivel
      ORDER BY nivel
    `, [id]);

    res.json({ success: true, data: summary });
  } catch (error) {
    logger.error('Get WBS summary error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener ruta crítica (actividades en camino crítico)
exports.getCriticalPath = async (req, res) => {
  try {
    const { id } = req.params;

    const [activities] = await pool.query(`
      SELECT w.*, 
             GROUP_CONCAT(DISTINCT wd.actividad_origen_id) as dependencias
      FROM wbs w
      LEFT JOIN dependencias_wbs wd ON w.id = wd.actividad_destino_id
      WHERE w.proyecto_id = ? AND w.nivel = 3
      GROUP BY w.id
      ORDER BY w.fecha_inicio
    `, [id]);

    res.json({ success: true, data: activities });
  } catch (error) {
    logger.error('Get critical path error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener usuarios para asignar
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
