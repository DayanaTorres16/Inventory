import React, { useState, useEffect } from "react";
import "./Modals.css";

const UpdateStockModal = ({ isOpen, onClose, product, setProductos }) => {
    const [stock, setStock] = useState(product?.stock || 0);
    const [nombre, setNombre] = useState(product?.NOMBRE || "");
    const [precio, setPrecio] = useState(product?.PRECIO || 0);
    const [attributeStocks, setAttributeStocks] = useState({});
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    
    // Estados para el nuevo atributo
    const [isAddingNewAttribute, setIsAddingNewAttribute] = useState(false);
    const [newAttributeName, setNewAttributeName] = useState("");
    const [newAttributeValue, setNewAttributeValue] = useState("");
    const [newAttributeStock, setNewAttributeStock] = useState(0);

    useEffect(() => {
        if (product) {
            setStock(product.stock || 0);
            setNombre(product.NOMBRE || "");
            setPrecio(product.PRECIO || 0);
            if (product.atributos) {
                const initialStocks = {};
                const initialSelected = {};
                product.atributos.forEach(attr => {
                    initialStocks[attr.ID_PRODUCTO_ATRIBUTO] = attr.stock || 0;
                    initialSelected[attr.ID_PRODUCTO_ATRIBUTO] = false;
                });
                setAttributeStocks(initialStocks);
                setSelectedAttributes(initialSelected);
            }
            
            // Reset nuevo atributo cuando cambia el producto
            setIsAddingNewAttribute(false);
            setNewAttributeName("");
            setNewAttributeValue("");
            setNewAttributeStock(0);
        }
    }, [product]);

    const handleUpdateProduct = async () => {
        try {
            const updateData = {};
            
            // Solo incluir campos que se van a actualizar
            if (isEditingDetails) {
                updateData.nombre = nombre;
                updateData.precio = precio;
            }
            
            // Incluir stock 
            if (!product.atributos || Object.keys(attributeStocks).length === 0 || 
                !Object.values(selectedAttributes).some(selected => selected)) {
                updateData.stock = stock;
            }
            
            if (Object.keys(updateData).length > 0) {
                const response = await fetch(`http://localhost:5000/api/products/${product.ID_PRODUCTO}/update`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updateData),
                });

                if (!response.ok) {
                    throw new Error(`Error al actualizar el producto (Código: ${response.status})`);
                }
            }

            // Actualizar stocks de atributos seleccionados
            if (product.atributos && Object.keys(attributeStocks).length > 0) {
                for (const id_producto_atributo in attributeStocks) {
                    if (selectedAttributes[id_producto_atributo]) { 
                        const newStock = attributeStocks[id_producto_atributo];
                        const response = await fetch(`http://localhost:5000/api/products/producto_atributos/${id_producto_atributo}/stock`, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ stock: newStock }),
                        });

                        if (!response.ok) {
                            throw new Error(`Error al actualizar stock del atributo ${id_producto_atributo} (Código: ${response.status})`);
                        }
                    }
                }
            }
            
            // Agregar nuevo atributo si está seleccionado
            if (isAddingNewAttribute && newAttributeName && newAttributeValue) {
                const newAttributeData = {
                    nombre: newAttributeName,
                    valor: newAttributeValue,
                    stock: newAttributeStock
                };
                
                const response = await fetch(`http://localhost:5000/api/products/${product.ID_PRODUCTO}/attributes`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newAttributeData),
                });

                if (!response.ok) {
                    throw new Error(`Error al agregar nuevo atributo (Código: ${response.status})`);
                }
                
                const result = await response.json();
                
                // Actualizar el estado con el nuevo atributo
                if (result.newAttribute) {
                    const newAttributeObj = {
                        ID_PRODUCTO_ATRIBUTO: result.newAttribute.ID_PRODUCTO_ATRIBUTO,
                        NOMBRE_ATRIBUTO: newAttributeName,
                        VALOR_ATRIBUTO: newAttributeValue,
                        stock: newAttributeStock
                    };
                    
                    // Actualizar el estado de productos en el componente padre
                    setProductos(prevProductos =>
                        prevProductos.map(p => {
                            if (p.ID_PRODUCTO === product.ID_PRODUCTO) {
                                return {
                                    ...p,
                                    atributos: [...(p.atributos || []), newAttributeObj]
                                };
                            }
                            return p;
                        })
                    );
                }
            }

            // Actualizar el estado de los productos en el componente padre para otras modificaciones
            setProductos(prevProductos =>
                prevProductos.map(p => {
                    if (p.ID_PRODUCTO === product.ID_PRODUCTO) {
                        const updatedProduct = { ...p };
                        
                        // Actualizar nombre y precio si se editaron detalles
                        if (isEditingDetails) {
                            updatedProduct.NOMBRE = nombre;
                            updatedProduct.PRECIO = precio;
                        }
                        
                        // Actualizar atributos existentes
                        if (p.atributos && Object.keys(attributeStocks).length > 0) {
                            updatedProduct.atributos = p.atributos.map(attr => ({
                                ...attr,
                                stock: selectedAttributes[attr.ID_PRODUCTO_ATRIBUTO] ? 
                                       attr.stock + attributeStocks[attr.ID_PRODUCTO_ATRIBUTO] : 
                                       attr.stock,
                            }));
                        } else {
                            updatedProduct.stock = stock;
                        }
                        
                        return updatedProduct;
                    }
                    return p;
                })
            );

            onClose();
        } catch (error) {
            console.error("Error al actualizar el producto:", error);
            alert("Error al actualizar el producto. Por favor, inténtalo de nuevo.");
        }
    };

    const handleAttributeStockChange = (id_producto_atributo, newStock) => {
        setAttributeStocks({ ...attributeStocks, [id_producto_atributo]: newStock });
    };

    const handleAttributeSelect = (id_producto_atributo) => {
        setSelectedAttributes({ ...selectedAttributes, [id_producto_atributo]: !selectedAttributes[id_producto_atributo] });
    };

    if (!isOpen || !product) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Actualizar Producto: {product.NOMBRE}</h3>
                
                <div className="edit-options">
                    <label>
                        <input
                            type="checkbox"
                            checked={isEditingDetails}
                            onChange={() => setIsEditingDetails(!isEditingDetails)}
                        />
                        Editar nombre y precio
                    </label>
                </div>
                
                {isEditingDetails && (
                    <div className="product-details">
                        <div className="detail-field">
                            <label>Nombre:</label>
                            <input 
                                type="text" 
                                value={nombre} 
                                onChange={(e) => setNombre(e.target.value)} 
                            />
                        </div>
                        <div className="detail-field">
                            <label>Precio:</label>
                            <input 
                                type="number" 
                                value={precio} 
                                onChange={(e) => setPrecio(parseFloat(e.target.value))} 
                                step="0.01"
                            />
                        </div>
                    </div>
                )}
                
                <h4>Actualizar Stock</h4>
                {product.atributos && product.atributos.length > 0 ? (
                    <div className="attribute-stocks">
                        {product.atributos.map((atributo) => (
                            <div key={atributo.ID_PRODUCTO_ATRIBUTO} className="attribute-item">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedAttributes[atributo.ID_PRODUCTO_ATRIBUTO] || false}
                                        onChange={() => handleAttributeSelect(atributo.ID_PRODUCTO_ATRIBUTO)}
                                    />
                                    {atributo.NOMBRE_ATRIBUTO}: {atributo.VALOR_ATRIBUTO}
                                </label>
                                <input
                                    type="number"
                                    value={attributeStocks[atributo.ID_PRODUCTO_ATRIBUTO] || 0}
                                    onChange={(e) => handleAttributeStockChange(atributo.ID_PRODUCTO_ATRIBUTO, parseInt(e.target.value))}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="general-stock">
                        <label>Nuevo Stock:</label>
                        <input type="number" value={stock} onChange={(e) => setStock(parseInt(e.target.value))} />
                    </div>
                )}
                
                <div className="modal-actions">
                    <button className="buttonCancel" onClick={onClose}>Cancelar</button>
                    <button className="buttonConfirm" onClick={handleUpdateProduct}>Actualizar</button>
                </div>
            </div>
        </div>
    );
};

export default UpdateStockModal;