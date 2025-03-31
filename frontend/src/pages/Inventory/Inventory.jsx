import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import ProductsTable from "../../components/ProductsTable/ProductsTable";
import Footer from "../../components/Footer/Footer";
import ActionButtons from "../../components/ActionButtonsInventory/ActionsButtons";
import AddProductModal from "../../components/Modals/AddProductModal";
import Pagination from "../../components/Pagination/Pagination";
import SearchBar from "../../components/SearchBar/SearchBar";
import "./Inventory.css";
import LowStockAlerts from "../../components/Alerts/LowStockAlerts/LowStockAlerts";

const Inventory = () => {
    const { storeId } = useParams();
    const [productos, setProductos] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        if (!storeId) {
            console.error("storeId no está definido en la URL");
            setError("No se encontró el ID de la tienda.");
            setLoading(false);
            return;
        }

        setLoading(true);
        fetch(`http://localhost:5000/api/products/${storeId}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("Datos recibidos del backend:", data);
                setProductos(data);
                setFilteredProducts(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error al cargar productos:", error);
                setError("Hubo un problema al cargar los productos.");
                setLoading(false);
            });
    }, [storeId]);

    const handleSearch = (term) => {
        setSearchTerm(term);
        const filtered = productos.filter((producto) => {
            return (
                producto.NOMBRE && producto.NOMBRE.toLowerCase().includes(term.toLowerCase()) ||
                producto.DESCRIPCION && producto.DESCRIPCION.toLowerCase().includes(term.toLowerCase()) ||
                (producto.atributos && producto.atributos.some((atributo) => atributo.NOMBRE_ATRIBUTO.toLowerCase().includes(term.toLowerCase())))
            );
        });
        setFilteredProducts(filtered);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="inventory-page">
            <Navbar />
            <LowStockAlerts />
            <main className="inventory-content">
                <div className="inventory-header">
                    <h1>Inventario {storeId === "1" ? "Local" : "Segundo Punto"}</h1>
                    <div className="inventory-actions">
                        <ActionButtons
                            onAddProduct={() => setIsModalOpen(true)}
                            onAddSale={() => console.log("Agregar venta")}
                        />
                    </div>
                </div>

                <SearchBar searchTerm={searchTerm} onSearch={handleSearch} />

                {loading ? (
                    <p>Cargando productos...</p>
                ) : error ? (
                    <p className="error-message">{error}</p>
                ) : (
                    <>
                        <ProductsTable
                            productos={paginatedProducts}
                            setProductos={setProductos}
                            setFilteredProducts={setFilteredProducts}
                        />
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </main>
            <Footer />
            <AddProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                storeId={storeId}
                onAddProduct={(newProduct) => console.log("Producto agregado:", newProduct)}
            />
        </div>
    );
};

export default Inventory;
