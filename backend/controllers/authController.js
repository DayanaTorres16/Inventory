const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); 
const { body, validationResult } = require('express-validator');
const xss = require('xss'); // Agregar esta dependencia

// Validaciones para login con sanitización adicional
const loginValidations = [
  body('email')
    .isEmail().withMessage('El correo electrónico no es válido')
    .normalizeEmail() 
    .trim()
    .escape(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .trim()
    .escape()
];

// Controlador de inicio de sesión con seguridad mejorada
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Credenciales inválidas" });
  }

  try {
    // Sanitización adicional
    const email = xss(req.body.email);
    const password = req.body.password; 

    // Consulta segura usando método findOne
    const user = await User.findOne({ email });

    // Mensaje genérico para cualquier error de autenticación
    if (!user || !(await bcrypt.compare(password, user?.password))) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Crear token JWT con expiración de 30 minutos
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: "30m",
        algorithm: "HS256" 
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en la autenticación" });
  }
};

module.exports = { 
  login,
  loginValidations
};
