require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const authRoutes = require("./routes/authRoutes");
const productsRoutes = require("./routes/products");
const atributesRoutes = require("./routes/attributes"); 
const salesReportRoutes = require("./routes/salesReport");
const inventoryReportRoutes = require("./routes/inventoryReport");
const productsReportRoutes = require("./routes/productsReport");
const storesRouter = require('./routes/stores');

const app = express();

app.use(cors({
    origin: "http://localhost:5175",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

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
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
