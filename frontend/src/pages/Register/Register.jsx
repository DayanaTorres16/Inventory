// En Register.jsx
import React, { useState } from "react";
import "./Register.css";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import anchetaLogin from "../../assets/anchetaLogin.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        email: "",
        password: "",
        role: "empleado",
    });

    const [passwordError, setPasswordError] = useState("");

    // Función para validar la contraseña
    const validatePassword = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"|,.<>/?]+/.test(password);
        const hasMinLength = password.length >= 8;

        if (!hasMinLength) {
            return "La contraseña debe tener al menos 8 caracteres";
        }
        if (!hasUpperCase) {
            return "La contraseña debe contener al menos una letra mayúscula";
        }
        if (!hasSpecialChar) {
            return "La contraseña debe contener al menos un carácter especial";
        }

        return "";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Validar la contraseña si se está editando ese campo
        if (name === "password") {
            const error = validatePassword(value);
            setPasswordError(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar la contraseña antes de enviar
        const passwordValidation = validatePassword(formData.password);
        if (passwordValidation) {
            setPasswordError(passwordValidation);
            return;
        }

        try {
            const response = await fetch("https://inventorybackend-cv1q.onrender.com/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Registro exitoso");
            } else {
                alert("Error: " + data.message);
            }
        } catch{
            alert("Error de conexión con el servidor");
        }
    };

    return (
        <div>
            <Navbar />
            <div className="register-container">
                <div>
                    <img src={anchetaLogin} alt="Ancheta" />
                </div>
                <div className="register-form">
                    <h3>Crear su cuenta</h3>
                    <p>Bienvenido! Por favor complete los datos para registrarse.</p>

                    <form onSubmit={handleSubmit}>
                        <div className="name-fields">
                            <label>Nombre</label>
                            <input type="text" name="name" onChange={handleChange} required />

                            <label>Apellido</label>
                            <input type="text" name="lastName" onChange={handleChange} required />
                        </div>

                        <label>Correo</label>
                        <input type="email" name="email" onChange={handleChange} required />

                        <label>Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            onChange={handleChange}
                            required
                        />
                        {passwordError ? (
                            <p className="password-error" style={{ color: "red" }}>
                                {passwordError}
                            </p>
                        ) : (
                            <p className="password-requirements">
                                La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial
                            </p>
                        )}

                        <label>Seleccione el rol:</label>
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="admin">Administrador</option>
                            <option value="empleado">Empleado</option>
                        </select>

                        <button
                            type="submit"
                            className="register-button"
                        >
                            <FontAwesomeIcon icon={faUsers} style={{ marginRight: "8px" }} /> Registrar
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Register;