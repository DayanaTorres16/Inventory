import React from 'react';
import './Home.css';
import anchetaHome from '../../assets/anchetaHome.jpg';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div>
            <Header />
            <main className='home-container'>
                <div className='home-content'>
                    <h1>Bienvenidos</h1>
                    <Link to="/login">
                        <button>Iniciar Sesión</button>
                    </Link>
                </div>
                <div>
                    <img src={anchetaHome} alt="Ancheta" />
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Home;