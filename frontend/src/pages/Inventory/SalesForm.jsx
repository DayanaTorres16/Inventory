import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faPlus, faDollarSign, faUserTag, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import "./SalesForm.css";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

const SalesForm = () => {
    const { storeId } = useParams();
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedAttribute, setSelectedAttribute] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [discount, setDiscount] = useState(false);
    const [discountedPrice, setDiscountedPrice] = useState(0);
    const [cartItems, setCartItems] = useState([]);
    const [userId, setUserId] = useState(null);
    const [stockError, setStockError] = useState("");
    const [availableStock, setAvailableStock] = useState(0);

    useEffect(() => {
        const apiUrl = `http://localhost:5000/api/products/${storeId}`;
        fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => {
                setProducts(Array.isArray(data) ? data : []);
            })
            .catch((error) => console.error("Error al cargar productos:", error));

        const storedUserId = localStorage.getItem("userId");
        if (storedUserId) {
            setUserId(parseInt(storedUserId, 10));
        } else {
            console.error("userId no encontrado en localStorage");
        }
    }, [storeId]);

    useEffect(() => {
        if (selectedProduct && selectedAttribute) {
            const product = products.find((p) => p.ID_PRODUCTO === selectedProduct.value);
            const attribute = product?.atributos?.find((attr) => attr.ID_PRODUCTO_ATRIBUTO === selectedAttribute.value);

            if (attribute) {
                const stock = attribute.stock || 0;
                const itemsInCart = cartItems.filter(item =>
                    item.productId === selectedProduct.value &&
                    item.productAttributeId === selectedAttribute.value
                );
                const reservedQuantity = itemsInCart.reduce((total, item) => total + item.quantity, 0);
                const available = stock - reservedQuantity;

                setAvailableStock(available);

                if (available <= 0) {
                    setStockError("Este producto no cuenta con unidades disponibles para vender.");
                } else {
                    setStockError("");
                }
            }
        } else {
            setAvailableStock(0);
            setStockError("");
        }
    }, [selectedProduct, selectedAttribute, cartItems, products]);

    useEffect(() => {
        if (quantity > availableStock && availableStock > 0) {
            setStockError(`No hay suficientes unidades disponibles. Stock actual: ${availableStock}`);
        } else if (availableStock > 0) {
            setStockError("");
        }
    }, [quantity, availableStock]);

    const handleAddProduct = () => {
        if (!selectedProduct || !selectedAttribute) {
            alert("Selecciona un producto y un atributo.");
            return;
        }

        const product = products.find((p) => p.ID_PRODUCTO === selectedProduct.value);
        const attribute = product?.atributos?.find((attr) => attr.ID_PRODUCTO_ATRIBUTO === selectedAttribute.value);

        if (!product || !attribute) {
            alert("Error al encontrar el producto o atributo seleccionado.");
            return;
        }

        if (availableStock <= 0) {
            setStockError("Este producto no cuenta con unidades disponibles para vender.");
            return;
        }

        if (quantity > availableStock) {
            setStockError(`No hay suficientes unidades disponibles. Stock actual: ${availableStock}`);
            return;
        }

        const item = {
            productId: product.ID_PRODUCTO,
            productName: product.NOMBRE,
            productAttributeId: attribute.ID_PRODUCTO_ATRIBUTO,
            attributeName: attribute.NOMBRE_ATRIBUTO,
            attributeValue: attribute.VALOR_ATRIBUTO,
            quantity,
            price: discount ? parseFloat(discountedPrice) : parseFloat(product.PRECIO),
        };

        setCartItems((prevCart) => [...prevCart, item]);
        setSelectedProduct(null);
        setSelectedAttribute(null);
        setQuantity(1);
        setDiscount(false);
        setDiscountedPrice(0);
        setStockError("");
    };

    const handleSaveSale = async (event) => {
        event.preventDefault();

        if (cartItems.length === 0) {
            alert("Agrega al menos un producto a la venta.");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/products/sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    storeId: parseInt(storeId, 10),
                    userId: userId,
                    items: cartItems.map(item => ({
                        productoId: item.productId,
                        atributoId: item.productAttributeId,
                        cantidad: item.quantity,
                        precioUnitario: item.price,
                    })),
                }),
            });

            const responseData = await response.json();

            if (response.ok) {
                alert('Venta registrada con éxito');
                setCartItems([]);
            } else {
                if (responseData.stockError) {
                    alert(`Error de stock: ${responseData.stockError}`);
                } else {
                    alert(`Error al registrar la venta: ${responseData.message || 'Error desconocido'}`);
                }
            }
        } catch (error) {
            console.error('Error al guardar la venta:', error);
            alert('Error al guardar la venta');
        }
    };

    const productOptions = products.map((product) => ({
        value: product.ID_PRODUCTO,
        label: product.NOMBRE,
    }));

    const attributeOptions = selectedProduct
        ? products
            .find((p) => p.ID_PRODUCTO === selectedProduct.value)
            ?.atributos.map((attr) => ({
                value: attr.ID_PRODUCTO_ATRIBUTO,
                label: `${attr.NOMBRE_ATRIBUTO}: ${attr.VALOR_ATRIBUTO}`,
            })) || []
        : [];

    return (
        <div>
            <Navbar />
            <div className="header-container">
                <h2>Registrar Venta</h2>
                <FontAwesomeIcon icon={faShoppingCart} size="2x" />
            </div>
            <hr className="divider" />
            <div className="sales-form-container">
                <form onSubmit={handleSaveSale}>
                    <div className="product-container">
                        <h3>Producto</h3>
                        <label>
                            Seleccionar Producto:
                            <Select
                                value={selectedProduct}
                                onChange={setSelectedProduct}
                                options={productOptions}
                                placeholder="Seleccionar producto..."
                                classNamePrefix="react-select"
                            />
                        </label>

                        {selectedProduct && (
                            <label>
                                Seleccionar Atributo:
                                <Select
                                    value={selectedAttribute}
                                    onChange={setSelectedAttribute}
                                    options={attributeOptions}
                                    placeholder="Seleccionar atributo..."
                                    classNamePrefix="react-select"
                                    isOptionDisabled={(option) => {
                                        const attr = products
                                            .find(p => p.ID_PRODUCTO === selectedProduct.value)
                                            ?.atributos.find(a => a.ID_PRODUCTO_ATRIBUTO === option.value);
                                        return attr && attr.stock <= 0;
                                    }}
                                />
                            </label>
                        )}

                        <div className="quantity-discount-container">
                            <div className="quantity-container">
                                <label>
                                    Cantidad:
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 0))}
                                        min="1"
                                        max={availableStock > 0 ? availableStock : 1}
                                    />
                                </label>
                            </div>

                            <div className="discount-container">
                                <label>
                                    <input type="checkbox" checked={discount} onChange={(e) => setDiscount(e.target.checked)} />
                                    Aplicar descuento
                                </label>
                            </div>

                            {discount && (
                                <div className="discounted-price-container">
                                    <label>
                                        Precio con descuento:
                                        <input
                                            type="number"
                                            value={discountedPrice}
                                            onChange={(e) => setDiscountedPrice(parseFloat(e.target.value) || 0)}
                                            min="0"
                                        />
                                    </label>
                                </div>
                            )}
                        </div>

                        {stockError && (
                            <div className="stock-error">
                                <FontAwesomeIcon icon={faExclamationTriangle} /> {stockError}
                            </div>
                        )}

                        <p>Subtotal: ${selectedProduct ? products.find(p => p.ID_PRODUCTO === selectedProduct.value)?.PRECIO : 0}</p>
                    </div>

                    <button
                        type="button"
                        className="button-add-sale"
                        onClick={handleAddProduct}
                        disabled={!selectedProduct || !selectedAttribute || stockError !== "" || availableStock <= 0}
                    >
                        <FontAwesomeIcon icon={faPlus} /> Agregar producto
                    </button>

                    <div className="cart-items-container">
                        <ul>
                            {cartItems.map((item, index) => (
                                <li key={`${item.productAttributeId}-${index}`}>
                                    {item.productName} - {item.attributeName}: {item.attributeValue} - Cantidad: {item.quantity} - Precio: ${item.price.toFixed(3)}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="total-container">
                        <div className="total-label">
                            <FontAwesomeIcon icon={faUserTag} /> Total de la Venta:
                        </div>
                        <div className="total-amount">
                            ${cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0).toFixed(3)}
                        </div>
                    </div>
                    <button className="button-save-sale" type="submit">
                        <FontAwesomeIcon icon={faDollarSign} /> Guardar Venta
                    </button>
                </form>
            </div>
            <Footer />
        </div>
    );
};
export default SalesForm;