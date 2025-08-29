const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Rutas para archivos estáticos
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rutas de la API

// GET - Obtener todas las estaciones
app.get('/api/estaciones', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync('data/estaciones.json', 'utf8'));
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer las estaciones' });
    }
});

// POST - Crear nueva estación
app.post('/api/estaciones', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync('data/estaciones.json', 'utf8'));
        const nuevaEstacion = {
            id: Date.now().toString(),
            nombre: req.body.nombre,
            direccion: req.body.direccion,
            lat: req.body.lat,
            lng: req.body.lng,
            capacidad: req.body.capacidad,
            bicicletasDisponibles: req.body.bicicletasDisponibles || 0,
            activa: req.body.activa !== undefined ? req.body.activa : true
        };
        
        data.estaciones.push(nuevaEstacion);
        fs.writeFileSync('data/estaciones.json', JSON.stringify(data, null, 2));
        res.status(201).json(nuevaEstacion);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la estación' });
    }
});

// PUT - Actualizar estación
app.put('/api/estaciones/:id', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync('data/estaciones.json', 'utf8'));
        const index = data.estaciones.findIndex(est => est.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Estación no encontrada' });
        }
        
        data.estaciones[index] = {
            ...data.estaciones[index],
            ...req.body,
            id: req.params.id
        };
        
        fs.writeFileSync('data/estaciones.json', JSON.stringify(data, null, 2));
        res.json(data.estaciones[index]);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la estación' });
    }
});

// DELETE - Eliminar estación
app.delete('/api/estaciones/:id', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync('data/estaciones.json', 'utf8'));
        const index = data.estaciones.findIndex(est => est.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Estación no encontrada' });
        }
        
        data.estaciones.splice(index, 1);
        fs.writeFileSync('data/estaciones.json', JSON.stringify(data, null, 2));
        res.json({ message: 'Estación eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la estación' });
    }
});

// Rutas para bicicletas

// GET - Obtener todas las bicicletas
app.get('/api/bicicletas', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync('data/bicicletas.json', 'utf8'));
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer las bicicletas' });
    }
});

// GET - Obtener bicicleta por ID
app.get('/api/bicicletas/:id', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync('data/bicicletas.json', 'utf8'));
        const bicicleta = data.bicicletas.find(b => b.id === req.params.id);
        
        if (!bicicleta) {
            return res.status(404).json({ error: 'Bicicleta no encontrada' });
        }
        
        res.json(bicicleta);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer la bicicleta' });
    }
});

// POST - Crear nueva bicicleta
app.post('/api/bicicletas', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync('data/bicicletas.json', 'utf8'));
        const nuevaBicicleta = {
            id: req.body.id || `B${String(data.bicicletas.length + 1).padStart(3, '0')}`,
            numero: req.body.numero,
            estado: req.body.estado || 'en_circulacion',
            estacionActual: req.body.estacionActual || null,
            fechaAdquisicion: req.body.fechaAdquisicion || new Date().toISOString().split('T')[0],
            historialArreglos: req.body.historialArreglos || [],
            kilometrosRecorridos: req.body.kilometrosRecorridos || 0,
            ultimoMantenimiento: req.body.ultimoMantenimiento || new Date().toISOString().split('T')[0]
        };
        
        data.bicicletas.push(nuevaBicicleta);
        fs.writeFileSync('data/bicicletas.json', JSON.stringify(data, null, 2));
        res.status(201).json(nuevaBicicleta);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la bicicleta' });
    }
});

// PUT - Actualizar bicicleta
app.put('/api/bicicletas/:id', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync('data/bicicletas.json', 'utf8'));
        const index = data.bicicletas.findIndex(b => b.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Bicicleta no encontrada' });
        }
        
        data.bicicletas[index] = {
            ...data.bicicletas[index],
            ...req.body,
            id: req.params.id
        };
        
        fs.writeFileSync('data/bicicletas.json', JSON.stringify(data, null, 2));
        res.json(data.bicicletas[index]);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la bicicleta' });
    }
});

// DELETE - Eliminar bicicleta
app.delete('/api/bicicletas/:id', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync('data/bicicletas.json', 'utf8'));
        const index = data.bicicletas.findIndex(b => b.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Bicicleta no encontrada' });
        }
        
        data.bicicletas.splice(index, 1);
        fs.writeFileSync('data/bicicletas.json', JSON.stringify(data, null, 2));
        res.json({ message: 'Bicicleta eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la bicicleta' });
    }
});

// POST - Agregar arreglo a bicicleta
app.post('/api/bicicletas/:id/arreglos', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync('data/bicicletas.json', 'utf8'));
        const index = data.bicicletas.findIndex(b => b.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Bicicleta no encontrada' });
        }
        
        const nuevoArreglo = {
            fecha: req.body.fecha || new Date().toISOString().split('T')[0],
            descripcion: req.body.descripcion,
            costo: req.body.costo || 0,
            mecanico: req.body.mecanico || 'Sin especificar'
        };
        
        data.bicicletas[index].historialArreglos.push(nuevoArreglo);
        data.bicicletas[index].ultimoMantenimiento = nuevoArreglo.fecha;
        
        fs.writeFileSync('data/bicicletas.json', JSON.stringify(data, null, 2));
        res.json(data.bicicletas[index]);
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el arreglo' });
    }
});

// PUT - Mover bicicleta entre estaciones
app.put('/api/bicicletas/:id/mover', (req, res) => {
    try {
        const bicicletasData = JSON.parse(fs.readFileSync('data/bicicletas.json', 'utf8'));
        const estacionesData = JSON.parse(fs.readFileSync('data/estaciones.json', 'utf8'));
        
        const bicicletaIndex = bicicletasData.bicicletas.findIndex(b => b.id === req.params.id);
        if (bicicletaIndex === -1) {
            return res.status(404).json({ error: 'Bicicleta no encontrada' });
        }
        
        const nuevaEstacionId = req.body.estacionId;
        const estacionIndex = estacionesData.estaciones.findIndex(e => e.id === nuevaEstacionId);
        
        if (nuevaEstacionId && estacionIndex === -1) {
            return res.status(404).json({ error: 'Estación no encontrada' });
        }
        
        // Remover de estación anterior
        const estacionAnteriorId = bicicletasData.bicicletas[bicicletaIndex].estacionActual;
        if (estacionAnteriorId) {
            const estacionAnteriorIndex = estacionesData.estaciones.findIndex(e => e.id === estacionAnteriorId);
            if (estacionAnteriorIndex !== -1) {
                estacionesData.estaciones[estacionAnteriorIndex].bicicletasIds = 
                    estacionesData.estaciones[estacionAnteriorIndex].bicicletasIds.filter(id => id !== req.params.id);
            }
        }
        
        // Agregar a nueva estación
        if (nuevaEstacionId) {
            estacionesData.estaciones[estacionIndex].bicicletasIds.push(req.params.id);
        }
        
        // Actualizar bicicleta
        bicicletasData.bicicletas[bicicletaIndex].estacionActual = nuevaEstacionId;
        
        fs.writeFileSync('data/bicicletas.json', JSON.stringify(bicicletasData, null, 2));
        fs.writeFileSync('data/estaciones.json', JSON.stringify(estacionesData, null, 2));
        
        res.json(bicicletasData.bicicletas[bicicletaIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Error al mover la bicicleta' });
    }
});

// Inicializar datos si no existen
function inicializarDatos() {
    const dataDir = 'data';
    const estacionesFile = 'data/estaciones.json';
    const bicicletasFile = 'data/bicicletas.json';
    
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }
    
    // Inicializar estaciones
    if (!fs.existsSync(estacionesFile)) {
        const datosIniciales = {
            estaciones: [
                {
                    id: "1",
                    nombre: "Estación Plaza de Mayo",
                    direccion: "Av. de Mayo 500",
                    lat: -34.6084,
                    lng: -58.3731,
                    capacidad: 20,
                    activa: true,
                    bicicletasIds: ["B001", "B002", "B003", "B004", "B005"]
                },
                {
                    id: "2",
                    nombre: "Estación Recoleta",
                    direccion: "Av. Alvear 1800",
                    lat: -34.5895,
                    lng: -58.3924,
                    capacidad: 15,
                    activa: true,
                    bicicletasIds: ["B006", "B007", "B008"]
                },
                {
                    id: "3",
                    nombre: "Estación Palermo",
                    direccion: "Av. Sarmiento 4000",
                    lat: -34.5736,
                    lng: -58.4084,
                    capacidad: 25,
                    activa: true,
                    bicicletasIds: ["B009", "B010", "B011", "B012", "B013", "B014"]
                }
            ]
        };
        fs.writeFileSync(estacionesFile, JSON.stringify(datosIniciales, null, 2));
    }
    
    // Inicializar bicicletas
    if (!fs.existsSync(bicicletasFile)) {
        const bicicletasIniciales = {
            bicicletas: [
                {
                    id: "B001",
                    numero: "001",
                    estado: "en_circulacion",
                    estacionActual: "1",
                    fechaAdquisicion: "2024-01-15",
                    historialArreglos: [
                        {
                            fecha: "2024-02-10",
                            descripcion: "Cambio de neumático trasero",
                            costo: 15000,
                            mecanico: "Juan Pérez"
                        }
                    ],
                    kilometrosRecorridos: 1250,
                    ultimoMantenimiento: "2024-03-01"
                },
                {
                    id: "B002",
                    numero: "002",
                    estado: "en_circulacion",
                    estacionActual: "1",
                    fechaAdquisicion: "2024-01-15",
                    historialArreglos: [],
                    kilometrosRecorridos: 890,
                    ultimoMantenimiento: "2024-02-15"
                },
                {
                    id: "B003",
                    numero: "003",
                    estado: "en_mecanico",
                    estacionActual: null,
                    fechaAdquisicion: "2024-01-15",
                    historialArreglos: [
                        {
                            fecha: "2024-03-05",
                            descripcion: "Reparación de frenos",
                            costo: 25000,
                            mecanico: "María González"
                        }
                    ],
                    kilometrosRecorridos: 2100,
                    ultimoMantenimiento: "2024-03-05"
                },
                {
                    id: "B004",
                    numero: "004",
                    estado: "parada",
                    estacionActual: "1",
                    fechaAdquisicion: "2024-01-15",
                    historialArreglos: [],
                    kilometrosRecorridos: 450,
                    ultimoMantenimiento: "2024-01-20"
                },
                {
                    id: "B005",
                    numero: "005",
                    estado: "en_circulacion",
                    estacionActual: "1",
                    fechaAdquisicion: "2024-01-15",
                    historialArreglos: [],
                    kilometrosRecorridos: 750,
                    ultimoMantenimiento: "2024-02-28"
                },
                {
                    id: "B006",
                    numero: "006",
                    estado: "en_circulacion",
                    estacionActual: "2",
                    fechaAdquisicion: "2024-01-20",
                    historialArreglos: [],
                    kilometrosRecorridos: 680,
                    ultimoMantenimiento: "2024-02-20"
                },
                {
                    id: "B007",
                    numero: "007",
                    estado: "en_circulacion",
                    estacionActual: "2",
                    fechaAdquisicion: "2024-01-20",
                    historialArreglos: [],
                    kilometrosRecorridos: 920,
                    ultimoMantenimiento: "2024-03-05"
                },
                {
                    id: "B008",
                    numero: "008",
                    estado: "parada",
                    estacionActual: "2",
                    fechaAdquisicion: "2024-01-20",
                    historialArreglos: [],
                    kilometrosRecorridos: 320,
                    ultimoMantenimiento: "2024-01-25"
                },
                {
                    id: "B009",
                    numero: "009",
                    estado: "en_circulacion",
                    estacionActual: "3",
                    fechaAdquisicion: "2024-01-25",
                    historialArreglos: [],
                    kilometrosRecorridos: 1100,
                    ultimoMantenimiento: "2024-03-01"
                },
                {
                    id: "B010",
                    numero: "010",
                    estado: "en_circulacion",
                    estacionActual: "3",
                    fechaAdquisicion: "2024-01-25",
                    historialArreglos: [],
                    kilometrosRecorridos: 850,
                    ultimoMantenimiento: "2024-02-25"
                },
                {
                    id: "B011",
                    numero: "011",
                    estado: "en_circulacion",
                    estacionActual: "3",
                    fechaAdquisicion: "2024-01-25",
                    historialArreglos: [],
                    kilometrosRecorridos: 1200,
                    ultimoMantenimiento: "2024-03-03"
                },
                {
                    id: "B012",
                    numero: "012",
                    estado: "en_circulacion",
                    estacionActual: "3",
                    fechaAdquisicion: "2024-01-25",
                    historialArreglos: [],
                    kilometrosRecorridos: 950,
                    ultimoMantenimiento: "2024-02-28"
                },
                {
                    id: "B013",
                    numero: "013",
                    estado: "en_circulacion",
                    estacionActual: "3",
                    fechaAdquisicion: "2024-01-25",
                    historialArreglos: [],
                    kilometrosRecorridos: 780,
                    ultimoMantenimiento: "2024-02-22"
                },
                {
                    id: "B014",
                    numero: "014",
                    estado: "en_circulacion",
                    estacionActual: "3",
                    fechaAdquisicion: "2024-01-25",
                    historialArreglos: [],
                    kilometrosRecorridos: 650,
                    ultimoMantenimiento: "2024-02-18"
                }
            ]
        };
        fs.writeFileSync(bicicletasFile, JSON.stringify(bicicletasIniciales, null, 2));
    }
}

// Inicializar y arrancar el servidor
inicializarDatos();

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
}); 