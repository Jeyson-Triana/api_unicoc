require('dotenv').config();
// console.log("ENV:", process.env.MONGO_URI);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Lead = require('./models/Lead'); // NUEVO
const Estudiante = require('./models/Estudiante');
const Matricula = require('./models/Matricula');
const ReciboPago = require('./models/ReciboPago');
const Credito = require("./models/Credito");
const DescuentoPromocion = require('./models/DescuentoPromociones');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 🔹 Cadena de conexión (Render / .env)
const mongoUri = process.env.MONGO_URI;

// 🔹 Conectar a MongoDB Atlas usando SIEMPRE la BD "DemoEducación"
mongoose
  .connect(mongoUri, { dbName: "DemoEducación" })
  .then(() => console.log("✅ MongoDB Atlas conectado"))
  .catch((err) => console.error("❌ Error conectando a MongoDB:", err.message));

// 🔹 Esquema de usuarios (colección: gestion_usuarios_db)
const usuarioSchema = new mongoose.Schema(
  {
    nombres: String,
    apellidos: String,
    documento: String,
    correo: String,
    telefono: String,
    rol: String,
    estado: Number // 1–5
  },
  { collection: "gestion_usuarios_db" } // nombre EXACTO de la colección en Atlas
);

// Modelo
const Usuario = mongoose.model("Usuario", usuarioSchema);

// 🔹 Ruta raíz de prueba
app.get("/", (req, res) => {
  res.send("API Demo Educación funcionando ✔");
});

// 🔹 Ruta: obtener todos los usuarios
app.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (err) {
    console.error("Error obteniendo usuarios:", err);
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
});

// 🔹 NUEVO: endpoint tipo brains.XXX.edu.co
// GET https://demoeducacion.onrender.com/api/usuarios/get-user?documento=XXXX
app.get("/api/usuarios/get-user", async (req, res) => {
  try {
    const { documento } = req.query;

    if (!documento) {
      return res.status(400).json({
        error: "Debe enviar el parámetro 'documento'"
      });
    }

    // Buscar usuario por documento
    const usuario = await Usuario.findOne({ documento });

    if (!usuario) {
      return res.status(404).json({
        error: "Usuario no encontrado"
      });
    }

    // Respuesta similar al endpoint del cliente
    return res.json({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      documento: usuario.documento,
      correo: usuario.correo,
      telefono: usuario.telefono,
      rol: usuario.rol,      // texto
      rol_id: usuario.estado // número (1–5)
    });
  } catch (err) {
    console.error("Error en /api/usuarios/get-user:", err);
    res.status(500).json({ error: "Error consultando usuario" });
  }
});

// Puerto (Render usa process.env.PORT)
const PORT = process.env.PORT || 3000;

// NUEVO: endpoint para consultar leads por documento
app.get('/api/leads/get-user', async (req, res) => {
  try {
    const { documento } = req.query;

    if (!documento) {
      return res.status(400).json({ error: 'Falta documento' });
    }

    // Buscamos el lead en la colección leads
    const lead = await Lead.findOne({ documento: documento.toString() });

    if (!lead) {
      // Caso: no hay lead para ese documento
      return res.json({ error: 'Lead no encontrado' });
    }

    // Caso OK: devolvemos solo lo que necesita el bot
    return res.json({
      documento: lead.documento,
      nombres: lead.nombres,
      apellidos: lead.apellidos,
      programa_id: lead.programa_id,
      programa_nombre: lead.programa_nombre,
      etapa_id: lead.etapa_id,
      etapa_nombre: lead.etapa_nombre
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno en el servidor' });
  }
});

app.get('/api/estudiantes/get-user', async (req, res) => {
  try {
    const { documento } = req.query;

    if (!documento) {
      return res.status(400).json({ error: 'Falta documento' });
    }

    const estudiante = await Estudiante.findOne({ documento: documento.toString() });

    if (!estudiante) {
      return res.json({ error: 'Estudiante no encontrado' });
    }

    return res.json({
      documento: estudiante.documento,
      nombres: estudiante.nombres,
      apellidos: estudiante.apellidos,
      programa: estudiante.programa,
      programa_id: estudiante.programa_id ?? null,
      semestre: estudiante.semestre ?? null,
      estado_academico: estudiante.estado_academico ?? null
    });

  } catch (err) {
    console.error('Error en /api/estudiantes/get-user:', err);
    return res.status(500).json({ error: 'Error interno en el servidor' });
  }
});

app.get('/api/matriculas/get-current-info', async (req, res) => {
  try {
    const { programa_id, programa } = req.query;

    // Debe venir al menos uno
    if (!programa_id && !programa) {
      return res.status(400).json({ error: 'Falta programa_id o programa' });
    }

    const query = { activo: true };

    // Buscar por ID si viene
    if (programa_id) query.programa_id = Number(programa_id);

    // Buscar por nombre si viene (insensible a mayúsculas)
    if (programa) query.programa = new RegExp(`^${programa}$`, 'i');

    const info = await Matricula.findOne(query);

    if (!info) {
      return res.json({ error: 'No hay fechas de matrícula activas para ese programa' });
    }

    return res.json({
      periodo: info.periodo,
      programa_id: info.programa_id ?? null,
      programa: info.programa,
      fechas: info.fechas_texto,
      fecha_inicio: info.fecha_inicio ?? null,
      fecha_fin: info.fecha_fin ?? null,
      observaciones: info.observaciones ?? null
    });

  } catch (err) {
    console.error('Error en /api/matriculas/get-current-info:', err);
    return res.status(500).json({ error: 'Error interno en el servidor' });
  }
});

app.get('/api/pagos/get-receipt', async (req, res) => {
  try {
    const { documento, periodo, tipo } = req.query;

    if (!documento) {
      return res.status(400).json({ error: 'Falta documento' });
    }

    const query = { documento: String(documento) };

    // opcional: si lo mandas, filtra por periodo y tipo
    if (periodo) query.periodo = String(periodo);
    if (tipo) query.tipo = String(tipo);

    const recibo = await ReciboPago.findOne(query).sort({ _id: -1 });

    if (!recibo) {
      return res.json({ error: 'Recibo no encontrado' });
    }

    return res.json({
      documento: recibo.documento,
      periodo: recibo.periodo ?? null,
      tipo: recibo.tipo ?? null,
      receipt_url: recibo.receipt_url,
      error: null
    });

  } catch (err) {
    console.error('Error /api/pagos/get-receipt:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
});

app.get("/api/pagos/get-banking", async (req, res) => {
  try {
    const opciones = await Credito.find({ habilitado: true })
      .sort({ orden: 1 })
      .select("codigo nombre url -_id");

    if (!opciones || opciones.length === 0) {
      return res.json({ opciones: [] });
    }

    res.json({ opciones });
  } catch (error) {
    res.status(500).json({
      opciones: [],
      error: "Error obteniendo opciones de financiación"
    });
  }
});

// Obtener todos los descuentos y convenios
app.get("/api/promociones/get-all", async (req, res) => {
  try {
    const promociones = await DescuentoPromocion.find().sort({ fecha_inicio: 1 });
    res.json({ promociones });
  } catch (error) {
    console.error("Error al obtener promociones:", error);
    res.status(500).json({ error: "Error interno al listar promociones" });
  }
});

// Obtener solo los activos
app.get("/api/promociones/get-active", async (req, res) => {
  try {
    const promociones = await DescuentoPromocion.find({ estado: "activo" }).sort({ fecha_inicio: 1 });

    if (!promociones || promociones.length === 0) {
      return res.json({ mensaje: "😕 No hay descuentos ni convenios activos actualmente.", promociones: [] });
    }

    res.json({ promociones });
  } catch (error) {
    console.error("Error al obtener promociones activas:", error);
    res.status(500).json({ error: "Error interno al listar promociones activas" });
  }
});

// Opción especial para Infobip (formato texto)
app.get("/api/promociones/get-text", async (req, res) => {
  try {
    const promociones = await DescuentoPromocion.find({ estado: "activo" }).sort({ fecha_inicio: 1 });

    if (!promociones || promociones.length === 0) {
      return res.json({ mensaje: "😕 No hay descuentos ni convenios activos actualmente." });
    }

    let texto = "🎓 *Promociones y Convenios UNICOC*\n\n";
    for (const p of promociones) {
      texto += `🔹 *${p.nombre}* (${p.tipo})\n`;
      texto += `${p.descripcion}\n`;
      texto += `📅 Vigencia: ${p.fecha_inicio} a ${p.fecha_fin}\n\n`;
    }

    res.json({ mensaje: texto.trim() });
  } catch (error) {
    console.error("Error al obtener promociones (texto):", error);
    res.status(500).json({ error: "Error interno al listar promociones" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
