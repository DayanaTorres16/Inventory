import React from 'react';
import { Link, useParams } from 'react-router-dom'; // Importa useParams
import './Navegacion.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faClipboardList, faBoxes } from '@fortawesome/free-solid-svg-icons';

function Navegacion() {
  const { storeId } = useParams(); // Obtiene storeId de los parámetros de la URL

  return (
    <div className="navegacion-container">
      <Link to={`/salesreport/${storeId}`} className="navegacion-card card-purple">
        <div className="card-content">
          <FontAwesomeIcon icon={faChartLine} className="card-icon" />
          <span className="card-text">Ventas</span>
        </div>
      </Link>
      <Link to={`/inventoryreport/${storeId}`} className="navegacion-card card-blue">
        <div className="card-content">
          <FontAwesomeIcon icon={faClipboardList} className="card-icon" />
          <span className="card-text">Inventario</span>
        </div>
      </Link>
      <Link to={`/productsreport/${storeId}`} className="navegacion-card card-red">
        <div className="card-content">
          <FontAwesomeIcon icon={faBoxes} className="card-icon" />
          <span className="card-text">Productos</span>
        </div>
      </Link>
    </div>
  );
}

export default Navegacion;