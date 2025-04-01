import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import anchetaFirstPage from '../../assets/anchetaFirstPage.jpg';
import anchetaHome1 from '../../assets/imagenTransicion1.jpg';
import anchetaHome2 from '../../assets/imagenTransicion2.jpg';
import anchetaHome3 from '../../assets/imagenTransicion3.jpg';
import anchetaHome4 from '../../assets/imagenTransicion4.jpg';
import './Dashboard.css';
import LowStockAlerts from '../../components/Alerts/LowStockAlerts/LowStockAlerts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoice } from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
    const images = [anchetaFirstPage, anchetaHome1, anchetaHome2, anchetaHome3, anchetaHome4];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [user, setUser] = useState(null);
    const manualUrl = "/manual-usuario";

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 2000);

        const storedUser = {
            id: localStorage.getItem("userId"),
            nombre: localStorage.getItem("userName"),
            apellido: localStorage.getItem("userLastName"),
            rol: localStorage.getItem("userRole"),
        };

        if (storedUser.id) {
            setUser(storedUser);
        }

        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <div>
            <Navbar />
            <LowStockAlerts />
            <div className='dashboard-container'>
                <div className='image-container'>
                    <img
                        src={images[currentImageIndex]}
                        alt={`Ancheta ${currentImageIndex + 1}`}
                        className='image-transition'
                    />
                </div>
                <div className='content-container'>
                    {user && <h1>Bienvenido, {user.nombre} {user.apellido}</h1>}
                    <div className='panel-container'>
                        <div className='panel-header'>
                            <h2>Panel Principal</h2>
                        </div>
                        <div className='panel-content'>
                            {user && <p>Bienvenido {user.nombre} {user.apellido} al Sistema Empresarial de su compañía.</p>}
                            <p>Alfa y Omega es tu destino ideal para detalles únicos y personalizados. Nos especializamos en la creación de anchetas que sorprenden y alegran, perfectas para cualquier ocasión. Además, ofrecemos una amplia variedad de artículos inspirados en tus animes y series favoritas.</p>
                            <p>¡Encuentra el regalo perfecto o ese detalle especial que buscas!</p>
                        </div>
                    </div>
                    <div className='manual-container'>
                        <a href={manualUrl} className="manual-box">
                            <div className="manual-text">
                                <h2 className="manual-title"><FontAwesomeIcon icon={faFileInvoice} /> Manual de Usuario</h2>
                                <p className="manual-subtitle">Guía completa de uso del sistema</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Dashboard;