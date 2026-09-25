const { pool } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Crea un módulo CRUD genérico para una tabla
 * @param {string} tableName - Nombre de la tabla
 * @param {string} primaryKey - Nombre de la columna primaria (default: 'id')
 * @returns {Object} - Objeto con métodos CRUD
 */
const createCrud = (tableName, primaryKey = 'id') => ({
  /**
   * Obtener todos los registros
   * @param {string} where - Cláusula WHERE opcional
   * @param {Array} params - Parámetros para la consulta
   */
  getAll: async (where = '', params = []) => {
    try {
      const query = `SELECT * FROM ${tableName} ${where}`;
      const [items] = await pool.query(query, params);
      return items;
    } catch (error) {
      logger.error(`Get all ${tableName} error`, { error: error.message });
      throw error;
    }
  },

  /**
   * Obtener un registro por ID
   * @param {number} id - ID del registro
   */
  getById: async (id) => {
    try {
      const [items] = await pool.query(
        `SELECT * FROM ${tableName} WHERE ${primaryKey} = ?`,
        [id]
      );
      return items[0] || null;
    } catch (error) {
      logger.error(`Get ${tableName} by id error`, { error: error.message });
      throw error;
    }
  },

  /**
   * Crear un registro
   * @param {Object} data - Datos a insertar
   */
  create: async (data) => {
    try {
      const [result] = await pool.query(`INSERT INTO ${tableName} SET ?`, [data]);
      return result.insertId;
    } catch (error) {
      logger.error(`Create ${tableName} error`, { error: error.message });
      throw error;
    }
  },

  /**
   * Actualizar un registro
   * @param {number} id - ID del registro
   * @param {Object} data - Datos a actualizar
   */
  update: async (id, data) => {
    try {
      await pool.query(`UPDATE ${tableName} SET ? WHERE ${primaryKey} = ?`, [data, id]);
      return true;
    } catch (error) {
      logger.error(`Update ${tableName} error`, { error: error.message });
      throw error;
    }
  },

  /**
   * Eliminar un registro
   * @param {number} id - ID del registro
   */
  delete: async (id) => {
    try {
      await pool.query(`DELETE FROM ${tableName} WHERE ${primaryKey} = ?`, [id]);
      return true;
    } catch (error) {
      logger.error(`Delete ${tableName} error`, { error: error.message });
      throw error;
    }
  },

  /**
   * Contar registros
   * @param {string} where - Cláusula WHERE opcional
   * @param {Array} params - Parámetros para la consulta
   */
  count: async (where = '', params = []) => {
    try {
      const [result] = await pool.query(
        `SELECT COUNT(*) as total FROM ${tableName} ${where}`,
        params
      );
      return result[0].total;
    } catch (error) {
      logger.error(`Count ${tableName} error`, { error: error.message });
      throw error;
    }
  }
});

module.exports = createCrud;
