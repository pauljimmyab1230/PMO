const { pool } = require('../config/database');
const logger = require('../utils/logger');

// Obtener marco lógico completo de un proyecto (estructura jerárquica)
exports.getByProject = async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.query(`
      SELECT ml.*, nml.nombre as nivel_nombre, nml.nivel_numero
      FROM marco_logico ml
      LEFT JOIN niveles_marco_logico nml ON ml.nivel_id = nml.id
      WHERE ml.proyecto_id = ?
      ORDER BY ml.orden, ml.codigo
    `, [id]);

    // Construir estructura jerárquica (O(n) instead of O(n²))
    const buildTree = (items) => {
      const map = new Map();
      const roots = [];
      
      // Crear mapa de nodos
      items.forEach(item => {
        map.set(item.id, { ...item, children: [] });
      });
      
      // Construir árbol
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
    logger.error('Get marco logico error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener marco lógico plano (para tablas)
exports.getByProjectFlat = async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.query(`
      SELECT ml.*, nml.nombre as nivel_nombre, nml.nivel_numero,
             u.nombre as responsable_nombre
      FROM marco_logico ml
      LEFT JOIN niveles_marco_logico nml ON ml.nivel_id = nml.id
      LEFT JOIN usuarios u ON ml.responsable_id = u.id
      WHERE ml.proyecto_id = ?
      ORDER BY ml.codigo
    `, [id]);

    res.json({ success: true, data: items });
  } catch (error) {
    logger.error('Get marco logico flat error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener un elemento del marco lógico
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await pool.query(`
      SELECT ml.*, nml.nombre as nivel_nombre
      FROM marco_logico ml
      LEFT JOIN niveles_marco_logico nml ON ml.nivel_id = nml.id
      WHERE ml.id = ?
    `, [id]);

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: items[0] });
  } catch (error) {
    logger.error('Get marco logico item error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Crear elemento del marco lógico
exports.create = async (req, res) => {
  try {
    const { id } = req.params; // ID del proyecto
    const {
      nivel_id, codigo, descripcion, indicador, meta,
      metodo_verificacion, supuestos, padre_id, orden
    } = req.body;

    // Validar que el padre pertenezca al mismo proyecto
    if (padre_id) {
      const [parent] = await pool.query(
        'SELECT id FROM marco_logico WHERE id = ? AND proyecto_id = ?',
        [padre_id, id]
      );
      if (parent.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Parent item does not belong to this project' 
        });
      }
    }

    const [result] = await pool.query(`
      INSERT INTO marco_logico (
        proyecto_id, nivel_id, codigo, descripcion, indicador, meta,
        metodo_verificacion, supuestos, padre_id, orden
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, nivel_id, codigo, descripcion, indicador, meta,
      metodo_verificacion, supuestos, padre_id, orden || 0
    ]);

    const [newItem] = await pool.query(
      'SELECT * FROM marco_logico WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    logger.error('Create marco logico error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Actualizar elemento del marco lógico
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nivel_id, codigo, descripcion, indicador, meta,
      metodo_verificacion, supuestos, avance_porcentaje, orden
    } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM marco_logico WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    await pool.query(`
      UPDATE marco_logico SET
        nivel_id = ?, codigo = ?, descripcion = ?, indicador = ?, meta = ?,
        metodo_verificacion = ?, supuestos = ?, avance_porcentaje = ?, orden = ?
      WHERE id = ?
    `, [
      nivel_id, codigo, descripcion, indicador, meta,
      metodo_verificacion, supuestos, avance_porcentaje || 0, orden, id
    ]);

    const [updated] = await pool.query(
      'SELECT * FROM marco_logico WHERE id = ?',
      [id]
    );

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update marco logico error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Actualizar avance de un elemento
exports.updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { avance_porcentaje } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM marco_logico WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    await pool.query(`
      UPDATE marco_logico SET
        avance_porcentaje = ?, avance_fecha = CURDATE()
      WHERE id = ?
    `, [avance_porcentaje, id]);

    const [updated] = await pool.query(
      'SELECT * FROM marco_logico WHERE id = ?',
      [id]
    );

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update marco logico progress error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Eliminar elemento del marco lógico
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT id FROM marco_logico WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Verificar si tiene hijos
    const [children] = await pool.query(
      'SELECT COUNT(*) as count FROM marco_logico WHERE padre_id = ?',
      [id]
    );

    if (children[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete item with children' 
      });
    }

    await pool.query('DELETE FROM marco_logico WHERE id = ?', [id]);

    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    logger.error('Delete marco logico error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener niveles del marco lógico
exports.getLevels = async (req, res) => {
  try {
    const [levels] = await pool.query(
      'SELECT * FROM niveles_marco_logico ORDER BY nivel_numero'
    );
    res.json({ success: true, data: levels });
  } catch (error) {
    logger.error('Get levels error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Obtener resumen del marco lógico
exports.getSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const [summary] = await pool.query(`
      SELECT 
        nml.nombre as nivel,
        COUNT(*) as total,
        SUM(CASE WHEN ml.avance_porcentaje = 100 THEN 1 ELSE 0 END) as completados,
        AVG(ml.avance_porcentaje) as avance_promedio
      FROM marco_logico ml
      LEFT JOIN niveles_marco_logico nml ON ml.nivel_id = nml.id
      WHERE ml.proyecto_id = ?
      GROUP BY nml.id, nml.nombre, nml.nivel_numero
      ORDER BY nml.nivel_numero
    `, [id]);

    res.json({ success: true, data: summary });
  } catch (error) {
    logger.error('Get marco logico summary error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
