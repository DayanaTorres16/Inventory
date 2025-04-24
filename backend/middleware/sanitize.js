const sanitizeHtml = require('sanitize-html');
const mysql = require('mysql2');

const sanitizeOptions = {
  allowedTags: [], 
  allowedAttributes: {},
  disallowedTagsMode: 'recursiveEscape' 
};

const sanitizeMiddleware = (req, res, next) => {
  // Sanitizar req.body
  if (req.body) {
    sanitizeObject(req.body);
  }
  
  // Sanitizar req.query
  if (req.query) {
    sanitizeObject(req.query);
  }
  
  // Sanitizar req.params
  if (req.params) {
    sanitizeObject(req.params);
  }
  
  next();
};

// Función auxiliar para sanitizar objetos recursivamente
function sanitizeObject(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeHtml(obj[key], sanitizeOptions);
      
      obj[key] = mysql.escape(obj[key]).slice(1, -1); 
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

function escapeIdentifier(identifier) {
  return '`' + identifier.replace(/[^a-zA-Z0-9_]/g, '').replace(/`/g, '') + '`';
}

module.exports = {
  sanitizeMiddleware,
  escapeIdentifier
};