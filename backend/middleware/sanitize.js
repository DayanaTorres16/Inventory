const sanitizeHtml = require('sanitize-html');

const sanitizeOptions = {
  allowedTags: [], // No permitir etiquetas HTML
  allowedAttributes: {}, // No permitir atributos
  disallowedTagsMode: 'recursiveEscape' // Convertir a texto entidades HTML
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
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

module.exports = sanitizeMiddleware;