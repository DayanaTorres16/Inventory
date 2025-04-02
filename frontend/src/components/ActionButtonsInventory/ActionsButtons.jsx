import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ActionButtons.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

const ActionButtons = ({ onAddProduct }) => {
    const navigate = useNavigate();
    const { storeId } = useParams();
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const role = localStorage.getItem("userRole");
        setUserRole(role);
    }, []);

    const handleSaleClick = () => {
        navigate(`/sales/new/${storeId}`);
    };

    return (
        <div className="action-buttons">
            {userRole === "admin" && (
                <button className="button-Add-Product" onClick={onAddProduct}>
                    <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} /> Agregar Producto
                </button>
            )}
            
            <button className="button-Add-Sale" onClick={handleSaleClick}>
                <FontAwesomeIcon icon={faShoppingCart} style={{ marginRight: '8px' }} /> Agregar Venta
            </button>
        </div>
    );
};

export default ActionButtons;