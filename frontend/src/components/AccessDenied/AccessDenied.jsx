import React from 'react';
import { Link } from 'react-router-dom';
import './AccessDenied.css'; // Estilos personalizados
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'; // Importa el icono

const AccessDenied = () => {
  return (
    <div className="acceso-denegado-container">
      <div className="acceso-denegado-card">
        <FontAwesomeIcon icon={faTimesCircle} className="acceso-denegado-icon" />
        <h2>Acceso Denegado</h2>
        <p>Lo sentimos, no tienes permisos para acceder a esta página.</p>
        <p>Por favor, verifica tus credenciales o contacta al administrador del sistema si crees que esto es un error.</p>
        <Link to="/login" className="acceso-denegado-button">Volver al inicio de sesión</Link>
      </div>
    </div>
  );
};

export default AccessDenied;