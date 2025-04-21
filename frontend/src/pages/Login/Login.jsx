import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import anchetaLogin from "../../assets/anchetaLogin.jpg";
import "./Login.css";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userId", data.user.id);
                localStorage.setItem("userName", data.user.nombre);
                localStorage.setItem("userLastName", data.user.apellido);
                localStorage.setItem("userRole", data.user.rol);

                alert(`Bienvenido ${data.user.nombre} ${data.user.apellido}`);
                navigate("/dashboard");
            } else {
                // Mensaje genérico de error
                setErrorMessage("Error de autenticación. Por favor, verifica tus credenciales.");
            }
        } catch{
            setErrorMessage("Error al conectar con el servidor. Inténtalo más tarde.");
        }
    };

    return (
        <div>
            <Header />
            <div className="login-screen">
                <div className="left-login">
                    <img src={anchetaLogin} alt="Ancheta" />
                </div>
                <div className="right-login-container">
                    <div className="right-login">
                        <h3>Iniciar Sesión</h3>
                        <p>¡Bienvenido! Inicia sesión para continuar</p>

                        {errorMessage && <p className="error-message">{errorMessage}</p>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Correo</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password" className="password-label">Contraseña</label>
                                <input
                                    type="password"
                                    id="password-login"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <button type="submit" className="login-button">Iniciar Sesión</button>
                        </form>

                        <Link to="/passwordreset">
                            <p className="forgot-password">¿Olvidaste tu contraseña?</p>
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Login;