import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AccessDenied.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const AccessDenied = () => {
    const navigate = useNavigate();

    const handleVolverInicioSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');

        navigate('/login');
    };

    return (
        <div className="access-denied-container">
            <div className="access-denied-card">
                <FontAwesomeIcon icon={faTimesCircle} className="access-denied-icon" />
                <h2>Acceso Denegado</h2>
                <p>Lo sentimos, no tienes permisos para acceder a esta página.</p>
                <p>Por favor, verifica tus credenciales o contacta al administrador del sistema si crees que esto es un error.</p>
                <p>Si necesitas ayuda, contáctanos en <a href="alfayomega@gmail.com">alfayomega@gmail.com</a>.</p>
                <button onClick={handleVolverInicioSesion} className="access-denied-button">
                    Volver al inicio de sesión
                </button>
            </div>
        </div>
    );
};

export default AccessDenied;