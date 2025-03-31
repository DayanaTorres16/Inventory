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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch("http://localhost:5000/api/auth/register", {
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
                        <p className="password-requirements">
                            La contraseña debe tener al menos 8 caracteres
                        </p>

                        <label>Seleccione el rol:</label>
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="admin">Administrador</option>
                            <option value="empleado">Empleado</option>
                        </select>

                        <button type="submit" className="register-button">
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
