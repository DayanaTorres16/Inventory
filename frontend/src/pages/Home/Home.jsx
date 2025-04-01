import React, { useState, useEffect } from 'react';
import './Home.css';
import anchetaHome from '../../assets/anchetaHome.jpg';
import anchetaHome1 from '../../assets/imagenTransicion1.jpg';
import anchetaHome2 from '../../assets/imagenTransicion2.jpg';
import anchetaHome3 from '../../assets/imagenTransicion3.jpg';
import anchetaHome4 from '../../assets/imagenTransicion4.jpg';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import { Link } from 'react-router-dom';

const Home = () => {
    const images = [anchetaHome, anchetaHome1, anchetaHome2, anchetaHome3, anchetaHome4];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 2000); 

        return () => clearInterval(interval);
    }, [images.length]);

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
                <div className='image-container'>
                    <img 
                        src={images[currentImageIndex]} 
                        alt={`Ancheta ${currentImageIndex + 1}`} 
                        className='image-transition'
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
};
export default Home;