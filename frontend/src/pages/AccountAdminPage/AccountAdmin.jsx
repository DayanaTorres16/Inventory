import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./AccountAdmin.css";
import Footer from "../../components/Footer/Footer";
import Navbar from "../../components/Navbar/Navbar";
import SearchBar from "../../components/SearchBar/SearchBar";
import Pagination from "../../components/Pagination/Pagination"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import EditUserModal from '../../components/EditUserModal/EditUserModal';

const AccountAdmin = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (users.length > 0) {
            const filtered = users.filter(user => 
                user.NOMBRE.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.APELLIDO.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.EMAIL.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/auth/users");
            const data = await response.json();
            setUsers(data);
            setFilteredUsers(data); // Inicialmente, filteredUsers contiene todos los usuarios
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`http://localhost:5000/api/auth/users/${id}`, { method: "DELETE" });
            setUsers(users.filter(user => user.ID_USUARIO !== id));
            setFilteredUsers(filteredUsers.filter(user => user.ID_USUARIO !== id));
            setShowDeletePopup(false);
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
        }
    };

    const handleEdit = async () => {
        try {
            await fetch(`http://localhost:5000/api/auth/users/${selectedUser.ID_USUARIO}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selectedUser)
            });
            fetchUsers();
            setShowEditModal(false);
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="account-admin-container">
                <div className="admin-header">
                    <h2>Administrar Cuentas</h2>
                    <Link to='/register'>
                        <button className="add-user-button">
                            <FontAwesomeIcon icon={faUserPlus} style={{ marginRight: '5px' }} />
                            Registrar Nuevo Usuario
                        </button>
                    </Link>
                </div>
                <SearchBar 
                    searchTerm={searchTerm} 
                    onSearch={setSearchTerm}
                />

                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <tr key={user.ID_USUARIO}>
                                    <td>{user.NOMBRE}</td>
                                    <td>{user.APELLIDO}</td>
                                    <td>{user.EMAIL}</td>
                                    <td>{user.ROL}</td>
                                    <td className="actions-cell">
                                        <button className="edit-button" onClick={() => { setSelectedUser(user); setShowEditModal(true); }}>
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button className="delete-button" onClick={() => { setSelectedUser(user); setShowDeletePopup(true); }}>
                                            <FontAwesomeIcon icon={faTrashAlt} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">No se encontraron usuarios con ese criterio de búsqueda.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <Pagination/>
                <Footer />
            </div>

            {showDeletePopup && (
                <div className="modal-overlay-delete-user">
                    <div className="popup">
                        <p>¿Estás seguro de que deseas eliminar a {selectedUser.NOMBRE}?</p>
                        <button className="button-delete-modal" onClick={() => handleDelete(selectedUser.ID_USUARIO)}>Eliminar</button>
                        <button className="button-cancel-modal" onClick={() => setShowDeletePopup(false)}>Cancelar</button>
                    </div>
                </div>
            )}

            {showEditModal && (
                <EditUserModal
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                    handleEdit={handleEdit}
                    setShowEditModal={setShowEditModal}
                />
            )}
        </div>
    );
};

export default AccountAdmin;