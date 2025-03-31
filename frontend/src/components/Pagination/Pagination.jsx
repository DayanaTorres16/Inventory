import React from "react";
import "./Pagination.css";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="pagination-container">
      <span className="pagination-text">Pagina {currentPage} de {totalPages}</span>
      <div>
        <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
        >
            Anterior
        </button>
        <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="pagination-button"
        >
            Siguiente
        </button>
      </div>
    </div>
  );
};

export default Pagination;