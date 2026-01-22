from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Cargar variables de entorno (.env en local o configuradas en Render)
load_dotenv()

# Configuración de la conexión a MongoDB
MONGO_URI = os.getenv("MONGO_URI")  # e.g. mongodb+srv://user:pass@cluster.mongodb.net/
DB_NAME = "DemoEducación"
COLLECTION_NAME = "Descuentos_promociones"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

# Inicializar FastAPI
app = FastAPI(title="API Descuentos y Promociones - DemoEducación")

# Configurar CORS (para que pueda ser consultada desde cualquier frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Función para convertir ObjectId a string
def serialize_doc(doc):
    doc["_id"] = str(doc["_id"])
    return doc

@app.get("/")
def root():
    return {"mensaje": "API de Descuentos y Promociones - DemoEducación"}

@app.get("/descuentos")
def get_descuentos():
    descuentos = list(collection.find())
    return [serialize_doc(d) for d in descuentos]

@app.get("/descuentos/{id}")
def get_descuento(id: str):
    try:
        descuento = collection.find_one({"_id": ObjectId(id)})
        if not descuento:
            raise HTTPException(status_code=404, detail="Descuento no encontrado")
        return serialize_doc(descuento)
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido")

