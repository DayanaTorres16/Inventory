import React, { useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import anchetaLogin from "../../assets/anchetaLogin.jpg";
import "./PasswordReset.css";

const PasswordReset = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch("https://inventorybackend-cv1q.onrender.com/api/auth/password-reset", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || "Si el correo existe, recibirás instrucciones para restablecer tu contraseña.");
            } else if (response.status === 429) {
                
                // Mensaje específico para rate limiting
                setError(data.message || "Demasiadas solicitudes. Intenta más tarde.");
            } else {
                setError("No se pudo procesar la solicitud. Inténtalo más tarde.");
            }
        } catch{
            setError("Error de conexión con el servidor. Inténtalo más tarde.");
        } finally {
            setIsLoading(false);
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
                        <h3>Recuperar Contraseña</h3>
                        <p>A continuación, digita el correo electrónico</p>

                        <form onSubmit={handleSubmit} className="password-reset-form">
                            <div className="form-group">
                                <label htmlFor="email">Correo</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="password-button" disabled={isLoading}>
                                {isLoading ? "Enviando..." : "Enviar correo"}
                            </button>
                        </form>

                        {message && <p className="success-message">{message}</p>}
                        {error && <p className="error-message">{error}</p>}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PasswordReset;