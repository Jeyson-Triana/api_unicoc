require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// 📦 Modelos
const Lead = require("./models/Lead");
const Estudiante = require("./models/Estudiante");
const Matricula = require("./models/Matricula");
const ReciboPago = require("./models/ReciboPago");
const Credito = require("./models/Credito");
const DescuentoPromocion = require("./models/DescuentoPromocion");

const app = express();

// 🧱 Middlewares
app.use(cors());
app.use(express.json());

// 🔐 Validar variable de entorno
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI no está definida en las variables de entorno");
  process.exit(1);
}

// 🔗 Conexión a MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI, { dbName: "DemoEducación" })
  .then(() => console.log("✅ MongoDB Atlas conectado"))
  .catch((err) => console.error("❌ Error conectando a MongoDB:", err.message));

/* =====================================================
   👤 MODELO USUARIO (colección existente en Atlas)
===================================================== */
const usuarioSchema = new mongoose.Schema(
  {
    nombres: String,
    apellidos: String,
    documento: String,
    correo: String,
    telefono: String,
    rol: String,
    estado: Number,
  },
  { collection: "gestion_usuarios_db" }
);

const Usuario = mongoose.model("Usuario", usuarioSchema);

/* =====================================================
   🌍 RUTA RAÍZ
===================================================== */
app.get("/", (req, res) => {
  res.send("API Demo Educación funcionando ✔");
});

/* =====================================================
   👥 USUARIOS
===================================================== */
app.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch {
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
});

app.get("/api/usuarios/get-user", async (req, res) => {
  try {
    const { documento } = req.query;
    if (!documento) return res.status(400).json({ error: "Debe enviar 'documento'" });

    const usuario = await Usuario.findOne({ documento });
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      documento: usuario.documento,
      correo: usuario.correo,
      telefono: usuario.telefono,
      rol: usuario.rol,
      rol_id: usuario.estado,
    });
  } catch {
    res.status(500).json({ error: "Error consultando usuario" });
  }
});

/* =====================================================
   🎯 LEADS
===================================================== */
app.get("/api/leads/get-user", async (req, res) => {
  try {
    const { documento } = req.query;
    if (!documento) return res.status(400).json({ error: "Falta documento" });

    const lead = await Lead.findOne({ documento: documento.toString() });
    if (!lead) return res.json({ error: "Lead no encontrado" });

    res.json(lead);
  } catch {
    res.status(500).json({ error: "Error interno" });
  }
});

/* =====================================================
   🎓 ESTUDIANTES
===================================================== */
app.get("/api/estudiantes/get-user", async (req, res) => {
  try {
    const { documento } = req.query;
    if (!documento) return res.status(400).json({ error: "Falta documento" });

    const estudiante = await Estudiante.findOne({ documento: documento.toString() });
    if (!estudiante) return res.json({ error: "Estudiante no encontrado" });

    res.json(estudiante);
  } catch {
    res.status(500).json({ error: "Error interno" });
  }
});

/* =====================================================
   🗓 MATRÍCULAS
===================================================== */
app.get("/api/matriculas/get-current-info", async (req, res) => {
  try {
    const { programa_id, programa } = req.query;
    if (!programa_id && !programa)
      return res.status(400).json({ error: "Falta programa_id o programa" });

    const query = { activo: true };
    if (programa_id) query.programa_id = Number(programa_id);
    if (programa) query.programa = new RegExp(`^${programa}$`, "i");

    const info = await Matricula.findOne(query);
    if (!info) return res.json({ error: "No hay matrículas activas" });

    res.json(info);
  } catch {
    res.status(500).json({ error: "Error interno" });
  }
});

/* =====================================================
   💰 PAGOS
===================================================== */
app.get("/api/pagos/get-receipt", async (req, res) => {
  try {
    const { documento, periodo, tipo } = req.query;
    if (!documento) return res.status(400).json({ error: "Falta documento" });

    const recibo = await ReciboPago.findOne({ documento }).sort({ _id: -1 });
    if (!recibo) return res.json({ error: "Recibo no encontrado" });

    res.json(recibo);
  } catch {
    res.status(500).json({ error: "Error interno" });
  }
});

app.get("/api/pagos/get-banking", async (req, res) => {
  try {
    const opciones = await Credito.find({ habilitado: true })
      .sort({ orden: 1 })
      .select("codigo nombre url -_id");

    res.json({ opciones });
  } catch {
    res.status(500).json({ opciones: [] });
  }
});

// Promociones y Descuentos
app.get("/api/promociones/chatbot", async (req, res) => {
  try {
    const promociones = await DescuentoPromocion.find({ estado: "activo" })
      .sort({ fecha_inicio: 1 });

    if (!promociones || promociones.length === 0) {
      return res.json({
        mensaje: "😕 En este momento no hay descuentos ni convenios activos."
      });
    }

    let texto = "🎓 *Promociones y Convenios UNICOC*\n\n";

    promociones.forEach((p, i) => {
      texto += `*${i + 1}. ${p.nombre}* (${p.tipo})\n`;
      texto += `📌 ${p.descripcion}\n`;
      texto += `🎁 Beneficio: ${p.beneficios?.join(", ") || "No especificado"}\n`;
      texto += `📅 Vigencia: ${p.fecha_inicio} a ${p.fecha_fin}\n\n`;
    });

    res.json({ mensaje: texto.trim() });

  } catch (error) {
    res.status(500).json({ mensaje: "Error obteniendo promociones" });
  }
});

// Decanaturas
const Decanatura = require("./models/Decanatura");

app.get("/api/decanaturas/chatbot", async (req, res) => {
  try {
    const { programa_id, programa } = req.query;

    if (!programa_id && !programa) {
      return res.json({ mensaje: "No se pudo identificar el programa académico." });
    }

    const query = { activo: true };

    if (programa_id) query.programa_id = Number(programa_id);
    if (programa) query.programa = new RegExp(`^${programa}$`, "i");

    const info = await Decanatura.findOne(query);

    if (!info) {
      return res.json({
        mensaje: "No encontramos datos de decanatura para tu programa. Comunícate con atención al estudiante."
      });
    }

    const texto =
`🎓 *Decanatura de ${info.programa}*

🏛️ ${info.decanatura}
📧 Correo: ${info.correo}
📞 Teléfono: ${info.telefono}`;

    res.json({ mensaje: texto });

  } catch (error) {
    res.status(500).json({ mensaje: "Error consultando decanatura" });
  }
});

/* =====================================================
   🚀 SERVIDOR
===================================================== */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
