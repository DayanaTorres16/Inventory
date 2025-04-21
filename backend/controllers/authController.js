const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); 

// Controlador de inicio de sesión
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Mensaje genérico para cualquier error de autenticación
    if (!user || !(await bcrypt.compare(password, user?.password))) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Crear token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Enviar respuesta con datos del usuario
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
    // Evitar revelar detalles específicos del error
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en la autenticación" });
  }
};

module.exports = { login };
