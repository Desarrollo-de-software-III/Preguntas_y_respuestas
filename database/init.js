db = db.getSiblingDB('preguntas');
db.createCollection('preguntas');

db.tareas.insertMany([
    {
        _id: ObjectId(),
        titulo: "Pregunta 1",
        description: "Esta es la descripción de la pregunta 1"
    }]);