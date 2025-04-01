import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.jpg";
import userIcon from "../../assets/userIcon.png";
import signOutIcon from "../../assets/iconSignOut.png";
import "./Navbar.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faTable, faFileWaveform } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const menuRefs = useRef({});
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = {
      id: localStorage.getItem("userId"),
      nombre: localStorage.getItem("userName"),
      apellido: localStorage.getItem("userLastName"),
      rol: localStorage.getItem("userRole"),
    };

    if (storedUser.id) {
      setUser(storedUser);
    }

    const handleClickOutside = (event) => {
      if (
        openMenu &&
        menuRefs.current[openMenu] &&
        !menuRefs.current[openMenu].contains(event.target)
      ) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} alt="Logo de la empresa" className="navbar-logo" />
        <h1 className="navbar-title">Alfa y Omega</h1>
      </div>

      <div className="navbar-center">
        <Link to="/dashboard" className="navbar-link">Inicio</Link>

        <div className="navbar-dropdown" ref={(el) => (menuRefs.current.inventory = el)}>
          <button
            onClick={() => setOpenMenu(openMenu === "inventory" ? null : "inventory")}
            className="navbar-link"
          >
            Inventario <FontAwesomeIcon icon={faChevronDown} />
          </button>
          {openMenu === "inventory" && (
            <div className="dropdown-menu">
              <Link to="/inventory/1" className="dropdown-item">
                <FontAwesomeIcon icon={faTable} /> Inventario Local
              </Link>
              <Link to="/inventory/2" className="dropdown-item">
                <FontAwesomeIcon icon={faTable} /> Inventario Segundo Punto
              </Link>
            </div>
          )}
        </div>

        {/* Solo mostrar Reportes si el usuario es admin */}
        {user?.rol === "admin" && (
          <div className="navbar-dropdown" ref={(el) => (menuRefs.current.reports = el)}>
            <button
              onClick={() => setOpenMenu(openMenu === "reports" ? null : "reports")}
              className="navbar-link"
            >
              Reportes <FontAwesomeIcon icon={faChevronDown} />
            </button>
            {openMenu === "reports" && (
              <div className="dropdown-menu">
                <Link to="/report/1" className="dropdown-item">
                  <FontAwesomeIcon icon={faFileWaveform} /> Reporte Local
                </Link>
                <Link to="/report/2" className="dropdown-item">
                  <FontAwesomeIcon icon={faFileWaveform} /> Reporte Segundo Punto
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Solo mostrar Admin Cuentas si el usuario es admin */}
        {user?.rol === "admin" && <Link to="/accountadmin" className="navbar-link">Admin Cuentas</Link>}
      </div>

      <div className="navbar-right" ref={(el) => (menuRefs.current.user = el)}>
        <button
          onClick={() => setOpenMenu(openMenu === "user" ? null : "user")}
          className="navbar-button"
        >
          <img src={signOutIcon} alt="Usuario" />
        </button>
        {openMenu === "user" && user && (
          <div className="user-menu">
            <img src={userIcon} alt="Usuario" className="user-icon" />
            <p className="user-name">{user.nombre} {user.apellido}</p>
            <p className="user-role">Rol: {user.rol}</p>
            <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
