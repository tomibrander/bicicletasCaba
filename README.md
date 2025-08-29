# 🚲 Sistema de Administración de Bicicletas CABA

Un sistema web completo para la gestión de estaciones de bicicletas en la Ciudad Autónoma de Buenos Aires. Permite administrar estaciones, visualizar ubicaciones en un mapa interactivo y gestionar el inventario de bicicletas.

## ✨ Características

- **Mapa Interactivo**: Visualización de estaciones en un mapa de CABA usando OpenStreetMap
- **ABM de Estaciones**: Crear, editar y eliminar estaciones de bicicletas
- **Gestión de Inventario**: Controlar la cantidad de bicicletas disponibles en cada estación
- **Interfaz Moderna**: Diseño responsive y amigable al usuario
- **API REST**: Backend completo con endpoints para todas las operaciones
- **Almacenamiento Local**: Base de datos JSON para persistencia de datos

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **CORS** - Middleware para permitir peticiones cross-origin
- **Body-parser** - Middleware para parsear JSON

### Frontend
- **HTML5** - Estructura de la aplicación
- **CSS3** - Estilos modernos con gradientes y animaciones
- **JavaScript ES6+** - Lógica del cliente
- **Leaflet.js** - Biblioteca para mapas interactivos
- **OpenStreetMap** - Proveedor de mapas
- **Google Maps Geocoding API** - Validación y geocodificación de direcciones

## 📋 Requisitos Previos

- **Node.js** (versión 14 o superior)
- **npm** (incluido con Node.js)
- **Google Maps API Key** (opcional, para validación de direcciones)

## 🚀 Instalación

1. **Clonar o descargar el proyecto**
   ```bash
   git clone <url-del-repositorio>
   cd sistema-bicicletas-caba
   ```

2. **Configurar Google Maps API (opcional)**
   - Obtén una API key gratuita en [Google Cloud Console](https://console.cloud.google.com/)
   - Habilita la API de Geocoding
   - Edita el archivo `config.js` y reemplaza `YOUR_GOOGLE_MAPS_API_KEY` con tu clave

3. **Instalar dependencias**
   ```bash
   npm install
   ```

4. **Iniciar el servidor**
   ```bash
   npm start
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📖 Uso del Sistema

### 1. Visualización del Mapa
- **Ver Mapa**: Muestra todas las estaciones activas en el mapa de CABA
- **Agregar Estación**: Haz clic en cualquier punto del mapa para crear una nueva estación (se obtiene la dirección automáticamente)
- **Ver Detalles**: Haz clic en un marcador para ver información detallada de la estación

### 2. Gestión de Estaciones
- **Crear Estación**: Completa el formulario con los datos de la nueva estación
- **Editar Estación**: Haz clic en "Editar" en la lista de estaciones
- **Eliminar Estación**: Haz clic en "Eliminar" para remover una estación
- **Campos del Formulario**:
  - Nombre de la estación
  - Dirección (se valida automáticamente con Google Maps)
  - Coordenadas (se llenan automáticamente al validar la dirección)
  - Capacidad máxima
  - Cantidad de bicicletas disponibles
  - Estado (activa/inactiva)

### 3. Gestión de Bicicletas
- **Ver Inventario**: Lista todas las estaciones con su cantidad actual de bicicletas
- **Actualizar Cantidad**: Modifica la cantidad de bicicletas disponibles en cada estación
- **Validación**: El sistema previene que se exceda la capacidad de cada estación

## 🔧 Estructura del Proyecto

```
sistema-bicicletas-caba/
├── server.js              # Servidor Express principal
├── package.json           # Dependencias y scripts
├── README.md             # Documentación
├── public/               # Archivos del frontend
│   ├── index.html        # Página principal
│   ├── styles.css        # Estilos CSS
│   └── script.js         # Lógica JavaScript
└── data/                 # Almacenamiento de datos
    └── estaciones.json   # Base de datos JSON
```

## 🌐 API Endpoints

### Estaciones
- `GET /api/estaciones` - Obtener todas las estaciones
- `POST /api/estaciones` - Crear nueva estación
- `PUT /api/estaciones/:id` - Actualizar estación existente
- `DELETE /api/estaciones/:id` - Eliminar estación

### Bicicletas
- `PUT /api/estaciones/:id/bicicletas` - Actualizar cantidad de bicicletas

## 📊 Estructura de Datos

### Estación
```json
{
  "id": "string",
  "nombre": "string",
  "direccion": "string",
  "lat": "number",
  "lng": "number",
  "capacidad": "number",
  "bicicletasDisponibles": "number",
  "activa": "boolean"
}
```

## 🎨 Características de la Interfaz

- **Diseño Responsive**: Se adapta a diferentes tamaños de pantalla
- **Navegación Intuitiva**: Pestañas para cambiar entre funcionalidades
- **Feedback Visual**: Mensajes de confirmación y error
- **Animaciones**: Transiciones suaves entre secciones
- **Modal de Detalles**: Ventana emergente con información completa

## 🔒 Validaciones

- Campos obligatorios completos
- Dirección válida en CABA (validada con Google Maps)
- Cantidad de bicicletas no puede exceder la capacidad
- Coordenadas válidas (generadas automáticamente)
- Confirmación antes de eliminar estaciones

## 🚀 Desarrollo

Para desarrollo con recarga automática:
```bash
npm run dev
```

## 📝 Notas Técnicas

- **Almacenamiento**: Los datos se guardan en un archivo JSON local
- **Mapa**: Centrado en CABA con zoom inicial apropiado
- **Marcadores**: Solo se muestran estaciones activas en el mapa
- **CORS**: Configurado para permitir peticiones desde cualquier origen

## 🤝 Contribuciones

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

Desarrollado para el curso de DAPP2 - UADE

---

**¡Disfruta gestionando tu sistema de bicicletas! 🚴‍♂️** 