import React from 'react';
import './EditUserModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons';

const EditUserModal = ({ selectedUser, setSelectedUser, handleEdit, setShowEditModal }) => {
    return (
        <div className="modal-overlay-edit-user">
            <div className="modal-edit-user">
                <div className="modal-header">
                    <h3>Editar Información de Usuario</h3>
                    <button className="close-button" onClick={() => setShowEditModal(false)}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <p className='text-edit-user'>Actualice los datos personales del usuario aquí.</p>

                <div className="input-group">
                    <label>Nombre</label>
                    <input type="text" value={selectedUser.NOMBRE} onChange={(e) => setSelectedUser({ ...selectedUser, NOMBRE: e.target.value })} />
                </div>

                <div className="input-group">
                    <label>Apellido</label>
                    <input type="text" value={selectedUser.APELLIDO} onChange={(e) => setSelectedUser({ ...selectedUser, APELLIDO: e.target.value })} />
                </div>

                <div className="input-group">
                    <label>Correo Electrónico</label>
                    <input type="email" value={selectedUser.EMAIL} onChange={(e) => setSelectedUser({ ...selectedUser, EMAIL: e.target.value })} />
                </div>

                <div className="modal-footer">
                    <button className="cancel-button" onClick={() => setShowEditModal(false)}>
                        <FontAwesomeIcon icon={faTimes} /> Cancelar
                    </button>
                    <button className="save-button" onClick={handleEdit}>
                        <FontAwesomeIcon icon={faSave} /> Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;