const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

exports.getAll = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, nombre, email, rol, activo, ultimo_acceso, creado_en FROM usuarios ORDER BY nombre'
    );
    res.json({ success: true, data: users });
  } catch (error) {
    logger.error('Get users error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await pool.query(
      'SELECT id, nombre, email, rol, activo, ultimo_acceso, creado_en FROM usuarios WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
      [nombre, email, password_hash, rol]
    );

    const [newUser] = await pool.query(
      'SELECT id, nombre, email, rol, activo, creado_en FROM usuarios WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ success: true, data: newUser[0] });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, activo } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM usuarios WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await pool.query(
      'UPDATE usuarios SET nombre = ?, email = ?, rol = ?, activo = ?, actualizado_en = NOW() WHERE id = ?',
      [nombre, email, rol, activo, id]
    );

    const [updated] = await pool.query(
      'SELECT id, nombre, email, rol, activo, creado_en FROM usuarios WHERE id = ?',
      [id]
    );

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT id FROM usuarios WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);

    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
