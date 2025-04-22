import React, { useState, useEffect } from "react";
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

  const [retryAfter, setRetryAfter] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRetryAfter(null); // Limpiar tiempo de reintento previo

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
      } else if (response.status === 429) {
        setRetryAfter(data.retryAfterMs || 60000); // Fallback a 60 segundos si no se recibe
      } else {
        // Aquí podrías manejar otros errores de autenticación si lo deseas
        // Por ejemplo: setErrorMessage("Credenciales inválidas");
      }
    } catch {
      // Aquí podrías manejar errores de conexión
      // Por ejemplo: setErrorMessage("Error al conectar con el servidor. Inténtalo más tarde.");
    }
  };

  useEffect(() => {
    let timer;
    if (retryAfter > 0) {
      timer = setTimeout(() => {
        setRetryAfter(prevState => Math.max(0, prevState - 1000));
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [retryAfter]);

  const formatTime = (ms) => {
    if (ms <= 0) {
      return "";
    }
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
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

            {retryAfter > 0 && (
              <p className="rate-limit-message">
                Demasiados intentos. Intenta de nuevo en {formatTime(retryAfter)}.
              </p>
            )}

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
                  disabled={retryAfter > 0}
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
                  disabled={retryAfter > 0}
                />
              </div>
              <button type="submit" className="login-button" disabled={retryAfter > 0}>
                Iniciar Sesión
              </button>
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