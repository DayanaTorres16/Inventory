const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/atributos", async (req, res) => {
    try {
        console.log("🔄 Intentando obtener atributos de la base de datos...");

        const [atributos] = await db.promise().query("SELECT * FROM atributos");

        console.log("Resultado de la consulta en API:", atributos);

        res.json(atributos);
    } catch (err) {
        console.error("Error en la consulta SQL:", err);
        res.status(500).json({ message: "Error al obtener atributos.", error: err.message });
    }
});

module.exports = router;
