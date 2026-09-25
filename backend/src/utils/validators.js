/**
 * Utilidades de validación
 */

/**
 * Valida que un ID sea un número entero positivo
 * @param {*} id - ID a validar
 * @returns {number|null} - ID validado o null si es inválido
 */
const validateId = (id) => {
  const parsed = parseInt(id);
  if (isNaN(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

/**
 * Valida que un email tenga formato correcto
 * @param {string} email - Email a validar
 * @returns {boolean} - true si es válido
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitiza un string para prevenir XSS
 * @param {string} str - String a sanitizar
 * @returns {string} - String sanitizado
 */
const sanitizeString = (str) => {
  if (!str) return str;
  return str.replace(/[<>&"']/g, (char) => {
    const entities = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;' };
    return entities[char] || char;
  });
};

module.exports = { validateId, isValidEmail, sanitizeString };
