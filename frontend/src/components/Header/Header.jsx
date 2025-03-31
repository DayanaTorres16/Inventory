import React from 'react'
import './Header.css'
import logo from '../../assets/logo.jpg'

const Header = () => {
  return (
    <div>
        <header>
            <nav className='header'>
                <img src={logo} alt="Logo" />
                <h2>Alfa y Omega</h2>
            </nav>
        </header>
    </div>
  )
}

export default Header