import React, { useState, useEffect } from "react";
import './Modals.css';

const AddProductModal = ({ isOpen, onClose, storeId }) => {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [precio, setPrecio] = useState("");
    const [atributos, setAtributos] = useState([]);
    const [atributoSeleccionado, setAtributoSeleccionado] = useState("");
    const [nuevoAtributo, setNuevoAtributo] = useState("");
    const [nuevoValorAtributo, setNuevoValorAtributo] = useState("");
    const [cantidadAtributo, setCantidadAtributo] = useState("");
    const [listaAtributos, setListaAtributos] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setNombre("");
            setDescripcion("");
            setPrecio("");
            setAtributos([]);
            setAtributoSeleccionado("");
            setNuevoAtributo("");
            setNuevoValorAtributo("");
            setCantidadAtributo("");

            const fetchAtributos = async () => {
                try {
                    const response = await fetch("http://localhost:5000/api/attributes/atributos");
                    if (!response.ok) throw new Error("Error al obtener atributos");
                    const data = await response.json();
                    setListaAtributos(data);
                } catch (error) {
                    console.error("Error al obtener atributos:", error);
                }
            };

            fetchAtributos();
        }
    }, [isOpen]);

    const handleAgregarAtributo = () => {
        // Validar entrada
        if ((atributoSeleccionado === "nuevo" && !nuevoAtributo) || !nuevoValorAtributo || !cantidadAtributo) {
            return; // No proceder si faltan datos
        }
        
        const stock = parseInt(cantidadAtributo, 10);
        if (isNaN(stock) || stock <= 0) return;
        
        if (atributoSeleccionado === "nuevo" && nuevoAtributo) {
            setAtributos([...atributos, { 
                nombre: nuevoAtributo, 
                valor: nuevoValorAtributo, 
                stock,
                esNuevo: true // Marca para saber que es un atributo nuevo
            }]);
        } else {
            const atributoExistente = listaAtributos.find(attr => attr.ID_ATRIBUTO === parseInt(atributoSeleccionado, 10));
            if (atributoExistente) {
                setAtributos([...atributos, { 
                    nombre: atributoExistente.NOMBRE_ATRIBUTO, 
                    valor: nuevoValorAtributo, 
                    stock 
                }]);
            }
        }
        
        // Reset inputs
        setAtributoSeleccionado("");
        setNuevoAtributo("");
        setNuevoValorAtributo("");
        setCantidadAtributo("");
    };

    const handleAgregarProducto = async () => {
        try {
            const producto = {
                nombre,
                descripcion,
                precio: parseFloat(precio),
                id_tienda: parseInt(storeId, 10),
                atributos,
            };

            const response = await fetch("http://localhost:5000/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(producto),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error al agregar producto: ${errorData.message}`);
            }

            console.log("Producto agregado con éxito");
            onClose();
        } catch (error) {
            console.error("Error al agregar producto:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content add-product-modal">
                <h3>Agregar Nuevo Producto</h3>
                <input type="text" placeholder="Nombre del Producto *" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                <textarea placeholder="Descripción del Producto" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                <div className="price-quantity">
                    <input type="number" placeholder="Precio *" value={precio} onChange={(e) => setPrecio(e.target.value)} />
                </div>

                <div className="attributes-section">
                    <h4>Atributos del Producto</h4>
                    <div className="attribute-inputs">
                        <select value={atributoSeleccionado} onChange={(e) => setAtributoSeleccionado(e.target.value)}>
                            <option value="">Seleccione un atributo...</option>
                            {listaAtributos.map(attr => (
                                <option key={attr.ID_ATRIBUTO} value={attr.ID_ATRIBUTO}>{attr.NOMBRE_ATRIBUTO}</option>
                            ))}
                            <option value="nuevo">Nuevo atributo</option>
                        </select>
                        
                        {atributoSeleccionado === "nuevo" && (
                            <input 
                                type="text" 
                                placeholder="Nombre del Nuevo Atributo" 
                                value={nuevoAtributo} 
                                onChange={(e) => setNuevoAtributo(e.target.value)} 
                            />
                        )}
                        
                        <input type="text" placeholder="Valor del Atributo" value={nuevoValorAtributo} onChange={(e) => setNuevoValorAtributo(e.target.value)} />
                        <input type="number" placeholder="Cantidad *" value={cantidadAtributo} onChange={(e) => setCantidadAtributo(e.target.value)} />
                        <button className="button-add" onClick={handleAgregarAtributo}>Agregar</button>
                    </div>

                    {atributos.length > 0 && (
                        <ul className="attribute-list">
                            {atributos.map((atributo, index) => (
                                <li key={index}>{atributo.nombre}: {atributo.valor} (Cantidad: {atributo.stock})</li>
                            ))}
                        </ul>
                    )}
                    {atributos.length === 0 && <p>No hay atributos agregados.</p>}
                    
                </div>

                <div className="modal-actions">
                    <button className="button-cancel" onClick={onClose}>Cancelar</button>
                    <button className="button-add" onClick={handleAgregarProducto}>Agregar Producto</button>
                </div>
            </div>
        </div>
    );
};

export default AddProductModal;
