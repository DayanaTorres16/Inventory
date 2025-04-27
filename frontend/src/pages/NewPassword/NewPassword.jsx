// En NewPassword.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import anchetaLogin from "../../assets/anchetaLogin.jpg";
import "../PasswordReset/PasswordReset.css";

const NewPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setError("Token inválido o expirado.");
                return;
            }
            try {
                const response = await fetch(`https://inventorybackend-cv1q.onrender.com/api/auth/password-reset/${token}`);
                const data = await response.json();
                if (!response.ok) {
                    setError(data.message || "Token inválido o expirado.");
                }
            } catch{
                setError("Error de conexión con el servidor.");
            }
        };
        verifyToken();
    }, [token]);

    // Función para validar la contraseña
    const validatePassword = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password);
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

    const handleNewPasswordChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);
        const error = validatePassword(value);
        setPasswordError(error);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        // Validar la contraseña
        const passwordValidation = validatePassword(newPassword);
        if (passwordValidation) {
            setPasswordError(passwordValidation);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        try {
            const response = await fetch(`https://inventorybackend-cv1q.onrender.com/api/auth/password-reset/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage("Contraseña restablecida con éxito. Redirigiendo...");
                setTimeout(() => navigate("/login"), 3000);
            } else {
                setError(data.message || "Error al restablecer la contraseña.");
            }
        } catch{
            setError("Error de conexión con el servidor.");
        }
    };

    return (
        <div>
            <Header />
            <div className="password-screen">
                <div className="left-password">
                    <img src={anchetaLogin} alt="Ancheta" />
                </div>
                <div className="right-password-container">
                    <div className="right-password">
                        <h3>Cambio de Contraseña</h3>
                        {error && <p className="error-message">{error}</p>}
                        {message && <p className="success-message">{message}</p>}
                        {!message && !error && (
                            <form onSubmit={handleSubmit} className="password-reset-form">
                                <div className="form-group">
                                    <label htmlFor="newPassword">Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={handleNewPasswordChange}
                                        required
                                    />
                                    {passwordError && (
                                        <p className="error-message">{passwordError}</p>
                                    )}
                                    {!passwordError && (
                                        <h4 className="password-requirements">
                                            La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial
                                        </h4>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="password-button"
                                    disabled={!!passwordError}
                                >
                                    Restablecer
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default NewPassword;

