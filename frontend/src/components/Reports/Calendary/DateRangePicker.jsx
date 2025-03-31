import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DateRangePicker.css";

const DateRangePicker = ({ onFilterChange }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const applyFilter = () => {
    if (startDate && endDate) {
      onFilterChange(startDate, endDate);
    }
  };

  return (
    <div className="date-range-container">
      <div className="date-picker-group">
        <label className="date-label">Fecha de Inicio:</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          dateFormat="dd/MM/yyyy" 
          className="date-input"
          placeholderText="Selecciona la fecha de inicio" 
        />
      </div>

      <div className="date-picker-group">
        <label className="date-label">Fecha de Fin:</label>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          dateFormat="dd/MM/yyyy" 
          className="date-input"
          placeholderText="Selecciona la fecha de fin" 
        />
      </div>

      <button
        className="filter-button"
        onClick={applyFilter}
        disabled={!startDate || !endDate}
      >
        Aplicar Filtro
      </button>
    </div>
  );
};

export default DateRangePicker;



