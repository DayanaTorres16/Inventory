const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator'); // Nuevo paquete

const nodemailer = require("nodemailer");
const crypto = require("crypto");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta_super_segura";

//validar que la contraseña cumple con los requisitos de seguridad
const validatePassword = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
  const hasMinLength = password.length >= 8;
  
  if (!hasMinLength || !hasUpperCase || !hasSpecialChar) {
    return false;
  }
  return true;
};

// Función para formatear el tiempo restante
const formatTimeRemaining = (timeInMs) => {
  const minutes = Math.floor(timeInMs / 60000);
  const seconds = Math.floor((timeInMs % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  } else {
    return `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
  }
};

// Configuración de rate limiters con mensajes dinámicos y envío de tiempo restante
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const timeRemainingMs = options.windowMs - (Date.now() % options.windowMs);
    res.status(429).json({
      message: `Demasiados intentos de inicio de sesión. No se permiten más intentos hasta dentro de ${formatTimeRemaining(timeRemainingMs)}.`,
      retryAfterMs: timeRemainingMs 
    });
  }
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 3, 
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const timeRemainingMs = options.windowMs - (Date.now() % options.windowMs);
    res.status(429).json({
      message: `Demasiadas solicitudes de recuperación. No se permiten más intentos hasta dentro de ${formatTimeRemaining(timeRemainingMs)}.`,
      retryAfterMs: timeRemainingMs 
    });
  }
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, 
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    const timeRemainingMs = options.windowMs - (Date.now() % options.windowMs);
    res.status(429).json({
      message: `Demasiados intentos de registro. No se permiten más intentos hasta dentro de ${formatTimeRemaining(timeRemainingMs)}.`,
      retryAfterMs: timeRemainingMs // Envía el tiempo restante en milisegundos
    });
  }
});

// Validaciones para registro
const registerValidations = [
  body('email').isEmail().withMessage('El correo electrónico no es válido'),
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('lastName').trim().notEmpty().withMessage('El apellido es requerido'),
  body('role').isIn(['admin', 'empleado']).withMessage('Rol no válido')
];

// Validaciones para login
const loginValidations = [
  body('email').isEmail().withMessage('El correo electrónico no es válido'),
  body('password').notEmpty().withMessage('La contraseña es requerida')
];

// Validaciones para reset de contraseña
const resetValidations = [
  body('email').isEmail().withMessage('El correo electrónico no es válido')
];

// Validaciones para nueva contraseña
const newPasswordValidations = [
  body('newPassword').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
];

//Registrar usuario con limitación y validación
router.post("/register", registerLimiter, registerValidations, async (req, res) => {
  // Verificar errores de validación
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Datos de registro inválidos", errors: errors.array() });
  }

  const { name, lastName, email, password, role } = req.body;

  // Validar que la contraseña cumpla con los requisitos de seguridad
  if (!validatePassword(password)) {
    return res.status(400).json({ 
      message: "La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un carácter especial" 
    });
  }

  try {
    const [existingUser] = await db.promise().query(
      "SELECT * FROM usuarios WHERE EMAIL = ?",
      [email]
    );

    // Mensaje genérico para evitar revelar si el email ya existe
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "No se pudo completar el registro" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.promise().query(
      "INSERT INTO usuarios (NOMBRE, APELLIDO, EMAIL, CONTRASEÑA, ROL) VALUES (?, ?, ?, ?, ?)",
      [name, lastName, email, hashedPassword, role]
    );

    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({ message: "Error en el registro" });
  }
});

//Iniciar sesión con limitación y validación
router.post("/login", loginLimiter, loginValidations, async (req, res) => {
  // Verificar errores de validación
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Credenciales inválidas" });
  }

  const { email, password } = req.body;

  try {
    const [users] = await db.promise().query(
      "SELECT ID_USUARIO, NOMBRE, APELLIDO, EMAIL, CONTRASEÑA, ROL FROM usuarios WHERE EMAIL = ?",
      [email]
    );

    // Mensaje para error de autenticación
    if (users.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.CONTRASEÑA);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user.ID_USUARIO, email: user.EMAIL, role: user.ROL },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user.ID_USUARIO,
        nombre: user.NOMBRE,
        apellido: user.APELLIDO,
        rol: user.ROL,
      },
    });
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: "Error en la autenticación" });
  }
});

//Obtener todos los usuarios
router.get("/users", async (req, res) => {
  try {
    const [users] = await db.promise().query(
      "SELECT ID_USUARIO, NOMBRE, APELLIDO, EMAIL, ROL FROM usuarios"
    );
    res.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error al procesar la solicitud" });
  }
});

//Eliminar usuario
router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.promise().query("DELETE FROM usuarios WHERE ID_USUARIO = ?", [id]);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error al procesar la solicitud" });
  }
});

//Actualizar usuario
router.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { NOMBRE, APELLIDO, EMAIL, ROL } = req.body;

  // Validar rol
  const allowedRoles = ['admin', 'empleado'];
  if (!allowedRoles.includes(ROL)) {
    return res.status(400).json({ message: "Rol no válido" });
  }

  try {
    await db.promise().query(
      "UPDATE usuarios SET NOMBRE = ?, APELLIDO = ?, EMAIL = ?, ROL = ? WHERE ID_USUARIO = ?",
      [NOMBRE, APELLIDO, EMAIL, ROL, id]
    );
    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error al procesar la solicitud" });
  }
});

//Ruta para solicitar recuperación de contraseña con limitación y validación
router.post("/password-reset", passwordResetLimiter, resetValidations, async (req, res) => {
  // Verificar errores de validación
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(200).json({ message: "Si el correo está registrado, recibirás un correo con las instrucciones para restablecer tu contraseña." });
  }

  const { email } = req.body;

  try {
    const [users] = await db.promise().query("SELECT ID_USUARIO FROM usuarios WHERE EMAIL = ?", [email]);

    if (users.length === 0) {
      return res.json({ message: "Si el correo está registrado, recibirás un correo con las instrucciones para restablecer tu contraseña." });
    }

    const user = users[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000);

    await db.promise().query(
      "UPDATE usuarios SET reset_token = ?, reset_token_expiration = ? WHERE ID_USUARIO = ?",
      [token, expires, user.ID_USUARIO]
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Crear enlace seguro (usando https en producción)
    const resetLink = `http://localhost:5174/reset-password?token=${encodeURIComponent(token)}`;

    await transporter.sendMail({
      from: "no-reply@tuapp.com",
      to: email,
      subject: "Recuperación de contraseña",
      html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><a href="${resetLink}">${resetLink}</a><p>Este enlace es válido por 1 hora.</p>`,
    });

    res.json({ message: "Si el correo existe, recibirás instrucciones para restablecer tu contraseña." });
  } catch (error) {
    console.error("Error en la recuperación de contraseña:", error);
    res.status(500).json({ message: "Error al procesar la solicitud." });
  }
});

//Ruta para verificar si el token es válido
router.get("/password-reset/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const [users] = await db.promise().query(
      "SELECT ID_USUARIO FROM usuarios WHERE reset_token = ? AND reset_token_expiration > NOW()",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Enlace inválido o expirado." });
    }

    res.json({ message: "Token válido.", userId: users[0].ID_USUARIO });
  } catch (error) {
    console.error("Error al verificar token:", error);
    res.status(500).json({ message: "Error al procesar la solicitud." });
  }
});

//Ruta para restablecer la contraseña
router.post("/password-reset/:token", passwordResetLimiter, newPasswordValidations, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Formato de contraseña inválido" });
  }

  const { token } = req.params;
  const { newPassword } = req.body;

  // Validar que la nueva contraseña cumpla con los requisitos de seguridad
  if (!validatePassword(newPassword)) {
    return res.status(400).json({ 
      message: "La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un carácter especial" 
    });
  }

  try {
    const [users] = await db.promise().query(
      "SELECT ID_USUARIO FROM usuarios WHERE reset_token = ? AND reset_token_expiration > NOW()",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Enlace inválido o expirado." });
    }

    const userId = users[0].ID_USUARIO;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.promise().query(
      "UPDATE usuarios SET CONTRASEÑA = ?, reset_token = NULL, reset_token_expiration = NULL WHERE ID_USUARIO = ?",
      [hashedPassword, userId]
    );

    res.json({ message: "Contraseña restablecida correctamente." });
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    res.status(500).json({ message: "Error al procesar la solicitud." });
  }
});

module.exports = router;