import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import './LowStockIndicator.css'

function LowStockIndicator({ stockFinal }) {
  if (stockFinal === undefined || stockFinal === null) return null;

  if (stockFinal <= 3) {
    return (
      <span className="stock-indicator stock-indicator-critical">
        <FontAwesomeIcon icon={faExclamationCircle} />
      </span>
    );
  }

  if (stockFinal <= 10) {
    return (
      <span className="stock-indicator stock-indicator-low">
        <FontAwesomeIcon icon={faExclamationTriangle} />
      </span>
    );
  }

  return null;
}

export default LowStockIndicator;