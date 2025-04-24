const db = require('./db');

/**
 * Ejecuta una consulta SQL parametrizada de forma segura
 * @param {string} sql - Consulta SQL con placeholders '?'
 * @param {Array} params - Array de parámetros para la consulta
 * @returns {Promise} - Promesa con los resultados
 */
const executeQuery = async (sql, params = []) => {
  try {
    const [results] = await db.promise().query(sql, params);
    return results;
  } catch (error) {
    console.error('Error ejecutando consulta SQL:', error);
    throw new Error('Error en la base de datos');
  }
};

/**
 * Encuentra un usuario por email de forma segura
 * @param {string} email - Email del usuario
 * @returns {Promise} - Promesa con el usuario o null
 */
const findUserByEmail = async (email) => {
  const sql = "SELECT * FROM usuarios WHERE EMAIL = ?";
  const users = await executeQuery(sql, [email]);
  return users.length > 0 ? users[0] : null;
};

/**
 * Verifica si existe un usuario por ID
 * @param {number} id - ID del usuario
 * @returns {Promise<boolean>} - Promesa con true o false
 */
const userExists = async (id) => {
  const sql = "SELECT 1 FROM usuarios WHERE ID_USUARIO = ? LIMIT 1";
  const result = await executeQuery(sql, [id]);
  return result.length > 0;
};

/**
 * Insertar un nuevo usuario de forma segura
 * @param {Object} userData - Datos del usuario
 * @returns {Promise} - Promesa con el resultado
 */
const insertUser = async (userData) => {
  const { nombre, apellido, email, password, rol } = userData;
  const sql = "INSERT INTO usuarios (NOMBRE, APELLIDO, EMAIL, CONTRASEÑA, ROL) VALUES (?, ?, ?, ?, ?)";
  return await executeQuery(sql, [nombre, apellido, email, password, rol]);
};

/**
 * Actualizar datos de usuario de forma segura
 * @param {number} id - ID del usuario
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise} - Promesa con el resultado
 */
const updateUser = async (id, userData) => {
  // Construir consulta dinámica pero segura
  const allowedFields = ['NOMBRE', 'APELLIDO', 'EMAIL', 'ROL'];
  const fields = [];
  const values = [];
  
  for (const key in userData) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = ?`);
      values.push(userData[key]);
    }
  }
  
  if (fields.length === 0) return null;
  
  values.push(id); // Añadir ID al final para el WHERE
  const sql = `UPDATE usuarios SET ${fields.join(', ')} WHERE ID_USUARIO = ?`;
  
  return await executeQuery(sql, values);
};

module.exports = {
  executeQuery,
  findUserByEmail,
  userExists,
  insertUser,
  updateUser
};