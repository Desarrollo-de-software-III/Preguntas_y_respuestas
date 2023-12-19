import express from 'express';
import {mongoose, Schema} from 'mongoose';
import cors from 'cors';

const app = express();
const port = 4000;

app.use(express.json());
const allowedOrigins = ['http://localhost:' + port, 'http://localhost:5500', 'http://localhost:8080', 'http://127.0.0.1:5500', 'http://localhost:3000'];
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
};

app.use(cors(corsOptions));

mongoose.connect('mongodb://mongo-db:27017/preguntas');
const db = mongoose.connection;

const preguntaSchema = new Schema({
    _id: Schema.Types.ObjectId,
    titulo: String,
    description: String
})

const Pregunta = mongoose.model('Pregunta', preguntaSchema);

db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
    console.log('Conexión exitosa a MongoDB');
});

// Obtener todas las preguntas
app.get('/preguntas', async (req, res) => {
    try {
        res.send(await Pregunta.find());
    } catch (error) {
        res.status(400).send('Error al obtener las preguntas');
    }
});

// Obtener una pregunta por id
app.get('/preguntas/:id',async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send(`ID ${req.params.id} de pregunta inválido`);
    }
    const pregunta = await Pregunta.findById(req.params.id);
    if (!pregunta) return res.status(404).send(`La pregunta con el ID: ${req.params.id} especificado no existe`);
    res.send(pregunta);
});

// Crear una pregunta
app.post('/preguntas', async (req, res) => {
    const {titulo, description} = req.body;
    if (!titulo || !description) {
        return res.status(400).send('Faltan datos para crear la pregunta');
    }
    const pregunta = await Pregunta.create({
        _id: new mongoose.Types.ObjectId(),
        titulo,
        description
    });
    res.status(201).send(pregunta);
});
// Actualizar una pregunta
app.put('/preguntas/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send(`ID ${req.params.id} de pregunta inválido`);
    }
    const {titulo, description} = req.body;
    if (!titulo || !description) {
        return res.status(400).send('Faltan datos para actualizar la pregunta');
    }
    const pregunta = await Pregunta.findByIdAndUpdate(req.params.id, {
        titulo,
        description
    });
    if (!pregunta) return res.status(404).send(`La pregunta con el ID: ${req.params.id} especificado no existe`);
    res.send(req.body);
});

// Eliminar una pregunta
app.delete('/preguntas/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send(`ID ${req.params.id} de pregunta inválido`);
    }
    const pregunta = await Pregunta.findByIdAndDelete(req.params.id);
    if (!pregunta) return res.status(404).send(`La pregunta con el ID: ${req.params.id} especificado no existe`);
    res.send(pregunta);
});

// Controlador de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(400).send('Algo salió mal');
});
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
