const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const nodemailer = require("nodemailer");
const crypto = require("crypto");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "clave_secreta_super_segura";

//Registrar usuario
router.post("/register", async (req, res) => {
    const { name, lastName, email, password, role } = req.body;

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

//Iniciar sesión
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.promise().query(
            "SELECT ID_USUARIO, NOMBRE, APELLIDO, EMAIL, CONTRASEÑA, ROL FROM usuarios WHERE EMAIL = ?",
            [email]
        );

        // Mensaje genérico para error de autenticación
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

//Ruta para solicitar recuperación de contraseña
router.post("/password-reset", async (req, res) => {
    const { email } = req.body;

    try {
        const [users] = await db.promise().query("SELECT ID_USUARIO FROM usuarios WHERE EMAIL = ?", [email]);

        if (users.length === 0) {
            return res.json({ message: "Si el correo esta registrado, recibirás un correo con las instrucciones para restablecer tu contraseña." });
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
        });

        const resetLink = `http://localhost:5174/reset-password?token=${token}`;

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
router.post("/password-reset/:token", async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

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