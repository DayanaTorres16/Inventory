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

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setError("Token inválido o expirado.");
                return;
            }
            try {
                const response = await fetch(`http://localhost:5000/api/auth/password-reset/${token}`);
                const data = await response.json();
                if (!response.ok) {
                    setError(data.message || "Token inválido o expirado.");
                }
            } catch (err) {
                setError("Error de conexión con el servidor.");
            }
        };
        verifyToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/auth/password-reset/${token}`, {
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
        } catch (err) {
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
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
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
                                <button type="submit" className="password-button">Restablecer</button>
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

