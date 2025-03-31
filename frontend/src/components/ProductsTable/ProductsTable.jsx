import React, { useState, useRef, useEffect } from "react";
import "./ProductsTable.css";
import UpdateStockModal from "../Modals/UpdateStockModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import LowStockIndicator from '../Alerts/LowStockIndicator/LowStockIndicator';

const ProductsTable = ({ productos, setProductos }) => {
    const [menuOpen, setMenuOpen] = useState({
        show: false,
        product: null,
        position: { x: 0, y: 0 },
        atributo: null,
    });

    const [deleteModal, setDeleteModal] = useState({ show: false, product: null });
    const [selectedAttributeId, setSelectedAttributeId] = useState(null);
    const menuRef = useRef(null);

    const onOpenMenu = (producto, position, atributo) => {
        console.log("atributo en onOpenMenu:", atributo);
        setMenuOpen({ show: true, product: producto, position: position, atributo: atributo });
    };

    const onCloseMenu = () => {
        setMenuOpen({ show: false, product: null, position: { x: 0, y: 0 }, atributo: null });
        setSelectedAttributeId(null);
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`Error al eliminar el producto (Código: ${response.status})`);
            }

            setProductos(productos.filter((producto) => producto.ID_PRODUCTO !== id));
            setDeleteModal({ show: false, product: null });
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("Error al eliminar el producto. Por favor, inténtalo de nuevo.");
        }
    };

    const handleActualDeleteAttribute = () => {
        console.log("handleActualDeleteAttribute called");
        console.log("selectedAttributeId:", selectedAttributeId);

        if (selectedAttributeId) {
            handleDeleteAttribute(selectedAttributeId);
            onCloseMenu();
            setSelectedAttributeId(null);
        } else {
            console.error("Error: selectedAttributeId es null o undefined.");
        }
    };

    const handleDeleteAttribute = async (id_producto_atributo) => {
        console.log("id_producto_atributo:", id_producto_atributo);

        if (!id_producto_atributo) {
            console.error("Error: id_producto_atributo es null o undefined.");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/products/producto_atributos/${id_producto_atributo}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error(`Error al eliminar el atributo (Código: ${response.status})`);
            }

            setProductos((prevProductos) =>
                prevProductos.map((producto) => {
                    if (producto.atributos) {
                        return {
                            ...producto,
                            atributos: producto.atributos.filter(
                                (atributo) => atributo.ID_PRODUCTO_ATRIBUTO !== id_producto_atributo
                            ),
                        };
                    }
                    return producto;
                })
            );

            setMenuOpen({ show: false, product: null, position: { x: 0, y: 0 }, atributo: null });
        } catch (error) {
            console.error("Error al eliminar atributo:", error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onCloseMenu();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleUpdateClick = (producto) => {
        setMenuOpen({ show: true, product: producto, position: { x: 0, y: 0 }, atributo: null });
    };

    const handleContextMenu = (event, producto, atributo) => {
        event.preventDefault();
        console.log("atributo en handleContextMenu:", atributo);
        onOpenMenu(producto, { x: event.clientX, y: event.clientY }, atributo);
        setSelectedAttributeId(atributo.ID_PRODUCTO_ATRIBUTO);
    };

    return (
        <div className="inventory-table-container">
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Precio</th>
                        <th>Atributos</th>
                        <th>Stock</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.length > 0 ? (
                        productos.map((producto) => (
                            <tr key={producto.ID_PRODUCTO}>
                                <td>{producto.NOMBRE}</td>
                                <td>{producto.DESCRIPCION}</td>
                                <td>${producto.PRECIO}</td>
                                <td>
                                    {producto.atributos && Array.isArray(producto.atributos) ? (
                                        producto.atributos.map((atributo) => (
                                            <div
                                                key={`${producto.ID_PRODUCTO}-${atributo.ID_PRODUCTO_ATRIBUTO}`}
                                                onContextMenu={(event) => handleContextMenu(event, producto, atributo)}
                                            >
                                                {console.log("atributo en map:", atributo)}
                                                {atributo.NOMBRE_ATRIBUTO}: {atributo.VALOR_ATRIBUTO}
                                            </div>
                                        ))
                                    ) : (
                                        "Sin Atributos"
                                    )}
                                </td>
                                <td>
                                    {producto.atributos && Array.isArray(producto.atributos) ? (
                                        producto.atributos.map((atributo) => (
                                            <div
                                                key={atributo.ID_PRODUCTO_ATRIBUTO}
                                                className="stock-container"
                                            >
                                                {atributo.stock} unidades
                                                <LowStockIndicator stockFinal={atributo.stock} storeName={producto.NOMBRE_TIENDA} />
                                            </div>
                                        ))
                                    ) : (
                                        "Sin Stock"
                                    )}
                                </td>
                                <td>
                                    <button className="delete-table-button" onClick={() => setDeleteModal({ show: true, product: producto })}>
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </button>
                                    <button className="update-table-button" onClick={() => handleUpdateClick(producto)}>
                                        <FontAwesomeIcon icon={faPencilAlt} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">No hay productos disponibles</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <UpdateStockModal
                isOpen={menuOpen.show && !menuOpen.atributo}
                onClose={onCloseMenu}
                product={menuOpen.product}
                setProductos={setProductos}
            />

            {deleteModal.show && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>¿Estás seguro de eliminar {deleteModal.product.NOMBRE_PRODUCTO}?</h3>
                        <div className="modal-actions">
                            <button className="confirm-button" onClick={() => handleDelete(deleteModal.product.ID_PRODUCTO)}>
                                Confirmar
                            </button>
                            <button className="cancel-button" onClick={() => setDeleteModal({ show: false, product: null })}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {menuOpen.show && menuOpen.atributo && (
                <div
                    ref={menuRef}
                    className="action-menu"
                    style={{ position: "fixed", left: menuOpen.position.x, top: menuOpen.position.y }}
                >
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <input
                            type="checkbox"
                            checked={selectedAttributeId === menuOpen.atributo.ID_PRODUCTO_ATRIBUTO}
                            onChange={() => setSelectedAttributeId(menuOpen.atributo.ID_PRODUCTO_ATRIBUTO)}
                            style={{ marginRight: "8px" }}
                        />
                        {menuOpen.atributo.NOMBRE_ATRIBUTO}: {menuOpen.atributo.VALOR_ATRIBUTO}
                    </div>
                    {selectedAttributeId !== null && <button onClick={handleActualDeleteAttribute}>Eliminar Atributo</button>}
                </div>
            )}
        </div>
    );
};

export default ProductsTable;