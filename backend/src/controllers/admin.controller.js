const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

// ==================== USUARIOS ====================

exports.getUsuarios = async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT id, nombre, email, rol, activo, ultimo_acceso, creado_en
      FROM usuarios ORDER BY nombre
    `);
    res.json({ success: true, data: items });
  } catch (error) {
    logger.error('Get usuarios error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: 'Email ya registrado' });

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query('INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)', [nombre, email, password_hash, rol || 'equipo']);
    const [newItem] = await pool.query('SELECT id, nombre, email, rol, activo, creado_en FROM usuarios WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    logger.error('Create usuario error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, activo, password } = req.body;

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query('UPDATE usuarios SET nombre=?, email=?, rol=?, activo=?, password_hash=? WHERE id=?', [nombre, email, rol, activo, hash, id]);
    } else {
      await pool.query('UPDATE usuarios SET nombre=?, email=?, rol=?, activo=? WHERE id=?', [nombre, email, rol, activo, id]);
    }

    const [updated] = await pool.query('SELECT id, nombre, email, rol, activo, creado_en FROM usuarios WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update usuario error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    if (id == 1) return res.status(400).json({ success: false, message: 'No se puede eliminar admin' });
    await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    logger.error('Delete usuario error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== ÁREAS ====================

exports.getAreas = async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT a.*, u.nombre as director_nombre
      FROM areas a LEFT JOIN usuarios u ON a.director_id = u.id
      ORDER BY a.nombre
    `);
    res.json({ success: true, data: items });
  } catch (error) {
    logger.error('Get areas error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createArea = async (req, res) => {
  try {
    const { nombre, descripcion, director_id } = req.body;
    const [result] = await pool.query('INSERT INTO areas (nombre, descripcion, director_id) VALUES (?, ?, ?)', [nombre, descripcion, director_id || null]);
    const [newItem] = await pool.query('SELECT * FROM areas WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    logger.error('Create area error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, director_id } = req.body;
    await pool.query('UPDATE areas SET nombre=?, descripcion=?, director_id=? WHERE id=?', [nombre, descripcion, director_id || null, id]);
    const [updated] = await pool.query('SELECT * FROM areas WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    logger.error('Update area error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteArea = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM areas WHERE id = ?', [id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    logger.error('Delete area error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==================== CATÁLOGOS ====================

// Tipos de Proyecto
exports.getTiposProyecto = async (req, res) => {
  try {
    const [items] = await pool.query('SELECT * FROM tipos_proyecto ORDER BY nombre');
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createTipoProyecto = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const [result] = await pool.query('INSERT INTO tipos_proyecto (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion]);
    const [newItem] = await pool.query('SELECT * FROM tipos_proyecto WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateTipoProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;
    await pool.query('UPDATE tipos_proyecto SET nombre=?, descripcion=?, activo=? WHERE id=?', [nombre, descripcion, activo, id]);
    const [updated] = await pool.query('SELECT * FROM tipos_proyecto WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteTipoProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM tipos_proyecto WHERE id = ?', [id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Categorías de Costo
exports.getCategoriasCosto = async (req, res) => {
  try {
    const [items] = await pool.query('SELECT * FROM categorias_costo ORDER BY nombre');
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createCategoriaCosto = async (req, res) => {
  try {
    const { nombre, tipo } = req.body;
    const [result] = await pool.query('INSERT INTO categorias_costo (nombre, tipo) VALUES (?, ?)', [nombre, tipo]);
    const [newItem] = await pool.query('SELECT * FROM categorias_costo WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateCategoriaCosto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo, activo } = req.body;
    await pool.query('UPDATE categorias_costo SET nombre=?, tipo=?, activo=? WHERE id=?', [nombre, tipo, activo, id]);
    const [updated] = await pool.query('SELECT * FROM categorias_costo WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteCategoriaCosto = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categorias_costo WHERE id = ?', [id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Roles de Proyecto
exports.getRolesProyecto = async (req, res) => {
  try {
    const [items] = await pool.query('SELECT * FROM roles_proyecto ORDER BY nombre');
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createRolProyecto = async (req, res) => {
  try {
    const { nombre, tarifa_hora } = req.body;
    const [result] = await pool.query('INSERT INTO roles_proyecto (nombre, tarifa_hora) VALUES (?, ?)', [nombre, tarifa_hora || 0]);
    const [newItem] = await pool.query('SELECT * FROM roles_proyecto WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateRolProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tarifa_hora, activo } = req.body;
    await pool.query('UPDATE roles_proyecto SET nombre=?, tarifa_hora=?, activo=? WHERE id=?', [nombre, tarifa_hora, activo, id]);
    const [updated] = await pool.query('SELECT * FROM roles_proyecto WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteRolProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM roles_proyecto WHERE id = ?', [id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Estados de Proyecto
exports.getEstadosProyecto = async (req, res) => {
  try {
    const [items] = await pool.query('SELECT * FROM estados_proyecto ORDER BY orden');
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createEstadoProyecto = async (req, res) => {
  try {
    const { nombre, color, orden, es_estado_final } = req.body;
    const [result] = await pool.query(
      'INSERT INTO estados_proyecto (nombre, color, orden, es_estado_final) VALUES (?, ?, ?, ?)',
      [nombre, color || '#3B82F6', orden || 0, es_estado_final || false]
    );
    const [newItem] = await pool.query('SELECT * FROM estados_proyecto WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, data: newItem[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateEstadoProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, color, orden, es_estado_final } = req.body;
    await pool.query(
      'UPDATE estados_proyecto SET nombre=?, color=?, orden=?, es_estado_final=? WHERE id=?',
      [nombre, color, orden, es_estado_final, id]
    );
    const [updated] = await pool.query('SELECT * FROM estados_proyecto WHERE id = ?', [id]);
    res.json({ success: true, data: updated[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteEstadoProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM estados_proyecto WHERE id = ?', [id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
