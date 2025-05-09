require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const db = require("./db");

const authRoutes = require("./routes/authRoutes");
const productsRoutes = require("./routes/products");
const atributesRoutes = require("./routes/attributes");
const salesReportRoutes = require("./routes/salesReport");
const inventoryReportRoutes = require("./routes/inventoryReport");
const productsReportRoutes = require("./routes/productsReport");
const storesRouter = require('./routes/stores');
const { sanitizeMiddleware } = require('./middleware/sanitize');

const app = express();

// Implementación de helmet para seguridad 
app.use(helmet());

// Configuración personalizada de Content Security Policy 
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://gestiondeinventarios.vercel.app"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://gestiondeinventarios.vercel.app"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https://gestiondeinventarios.vercel.app", "https://inventorybackend-cv1q.onrender.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  })
);

// Configuración de CORS 
const corsOptions = {
    origin: "https://gestiondeinventarios.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(sanitizeMiddleware);

app.use((req, res, next) => {
    console.log(`📡 Petición recibida: ${req.method} ${req.path}`);
    console.log("🔍 Headers:", req.headers);
    next();
});

app.get("/", (req, res) => {
    res.send("Servidor funcionando en Alfa y Omega");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/attributes", atributesRoutes);
app.use("/api/salesReport", salesReportRoutes);
app.use("/api/inventoryReport", inventoryReportRoutes);
app.use("/api/productsReport", productsReportRoutes);
app.use('/api/stores', storesRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
