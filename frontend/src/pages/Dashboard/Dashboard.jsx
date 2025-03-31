import React from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import anchetaFirstPage from '../../assets/anchetaFirstPage.jpg';
import './Dashboard.css';
import LowStockAlerts from '../../components/Alerts/LowStockAlerts/LowStockAlerts';

const Dashboard = () => {
    return (
        <div>
            <Navbar />
            <LowStockAlerts />
            <div className='dashboard-container'>
                <div>
                    <img src={anchetaFirstPage} alt="Ancheta" />
                </div>
                <div>
                    <h2>Bienvenidos a Sistema de Gestión de inventario para Alfa y Omega</h2>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Dashboard;