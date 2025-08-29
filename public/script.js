// Variables globales
let mapa;
let marcadores = [];
let estaciones = [];
let bicicletas = [];
let modoEdicion = false;
let estacionEditando = null;
let bicicletaEditando = null;
let geocoder;
let direccionValida = false;

// Inicialización
function inicializarAplicacion() {
    console.log('Inicializando aplicación...');
    
    // Esperar un poco para asegurar que el DOM esté listo
    setTimeout(() => {
        inicializarGoogleMaps();
        inicializarMapa();
        inicializarNavegacion();
        inicializarFormularios();
        cargarEstaciones();
        cargarBicicletas();
        
        // Activar modo de creación por defecto
        modoEdicion = false;
        
        console.log('Aplicación inicializada completamente');
    }, 100);
}

// Inicializar cuando Google Maps se carga
window.inicializarAplicacion = inicializarAplicacion;

// También inicializar si Google Maps ya está disponible
if (typeof google !== 'undefined' && google.maps) {
    inicializarAplicacion();
}

// Inicializar cuando el DOM esté listo (fallback)
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado');
    if (typeof google !== 'undefined' && google.maps) {
        inicializarAplicacion();
    }
});

// Inicializar Google Maps
function inicializarGoogleMaps() {
    try {
        if (typeof google !== 'undefined' && google.maps) {
            geocoder = new google.maps.Geocoder();
            console.log('Google Maps inicializado correctamente');
        } else {
            console.warn('Google Maps no está disponible - funcionalidad de geocodificación limitada');
            geocoder = null;
        }
    } catch (error) {
        console.error('Error al inicializar Google Maps:', error);
        geocoder = null;
    }
}

// Actualizar estado del mapa
function actualizarEstadoMapa(mensaje, tipo = 'info') {
    const statusElement = document.getElementById('mapa-status-text');
    if (statusElement) {
        statusElement.textContent = mensaje;
        statusElement.style.color = tipo === 'error' ? '#e74c3c' : tipo === 'success' ? '#27ae60' : '#3498db';
    }
}

// Inicializar el mapa de Leaflet
function inicializarMapa() {
    try {
        console.log('Inicializando mapa Leaflet...');
        actualizarEstadoMapa('Inicializando mapa...', 'info');
        
        // Verificar que el elemento del mapa existe
        const mapaElement = document.getElementById('mapa');
        if (!mapaElement) {
            console.error('Elemento del mapa no encontrado');
            actualizarEstadoMapa('Error: Elemento del mapa no encontrado', 'error');
            return;
        }
        
        // Coordenadas centradas en CABA
        const centroCABA = [-34.6037, -58.3816];
        
        // Crear el mapa
        mapa = L.map('mapa').setView(centroCABA, 12);
        console.log('Mapa creado:', mapa);
        
        // Agregar capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapa);
        
        console.log('Capa de OpenStreetMap agregada');
        
        // Evento para agregar nueva estación al hacer clic en el mapa
        mapa.on('click', function(e) {
            console.log('Clic en el mapa:', e.latlng);
            if (!modoEdicion) {
                obtenerDireccionDesdeCoordenadas(e.latlng);
            }
        });
        
        // Evento cuando el mapa se carga completamente
        mapa.whenReady(function() {
            console.log('Mapa cargado completamente');
            actualizarEstadoMapa('Mapa cargado correctamente', 'success');
        });
        
        console.log('Mapa inicializado correctamente');
        
    } catch (error) {
        console.error('Error al inicializar el mapa:', error);
        actualizarEstadoMapa('Error al cargar el mapa: ' + error.message, 'error');
    }
}

// Inicializar navegación entre secciones
function inicializarNavegacion() {
    const botones = document.querySelectorAll('.nav-btn');
    const secciones = document.querySelectorAll('.seccion');
    
    botones.forEach(boton => {
        boton.addEventListener('click', function() {
            let seccionObjetivo;
            
            // Mapear IDs de botones a IDs de secciones
            switch(this.id) {
                case 'btnMapa':
                    seccionObjetivo = 'seccionMapa';
                    break;
                case 'btnEstaciones':
                    seccionObjetivo = 'seccionEstaciones';
                    break;
                case 'btnBicicletas':
                    seccionObjetivo = 'seccionBicicletas';
                    break;
                default:
                    seccionObjetivo = 'seccionMapa';
            }
            
            // Actualizar botones activos
            botones.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar sección correspondiente
            secciones.forEach(seccion => {
                seccion.classList.remove('activa');
                if (seccion.id === seccionObjetivo) {
                    seccion.classList.add('activa');
                }
            });
            
            // Redimensionar mapa si es necesario
            if (seccionObjetivo === 'seccionMapa') {
                setTimeout(() => {
                    mapa.invalidateSize();
                }, 100);
            }
        });
    });
}

// Inicializar formularios
function inicializarFormularios() {
    const formEstacion = document.getElementById('formEstacion');
    const btnCancelar = document.getElementById('btnCancelar');
    const btnNuevaEstacion = document.getElementById('btnNuevaEstacion');
    const btnNuevaBicicleta = document.getElementById('btnNuevaBicicleta');
    const inputDireccion = document.getElementById('direccion');
    
    // Formulario de estaciones
    formEstacion.addEventListener('submit', function(e) {
        e.preventDefault();
        guardarEstacion();
    });
    
    btnCancelar.addEventListener('click', function() {
        limpiarFormulario();
    });
    
    // Botón para crear nueva estación
    btnNuevaEstacion.addEventListener('click', function() {
        activarModoCreacion();
    });
    
    // Botón para crear nueva bicicleta
    if (btnNuevaBicicleta) {
        btnNuevaBicicleta.addEventListener('click', function() {
            abrirModalBicicleta();
        });
    }
    
    // Validar dirección al escribir
    inputDireccion.addEventListener('input', function() {
        const direccion = this.value.trim();
        if (direccion.length > 5) {
            validarDireccion(direccion);
        } else {
            limpiarValidacionDireccion();
        }
    });
    
    // Validar dirección al presionar Enter
    inputDireccion.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const direccion = this.value.trim();
            if (direccion) {
                validarDireccion(direccion);
            }
        }
    });
    
    // Filtros de bicicletas
    const filtroEstado = document.getElementById('filtroEstado');
    const filtroEstacion = document.getElementById('filtroEstacion');
    const buscarBicicleta = document.getElementById('buscarBicicleta');
    
    if (filtroEstado) {
        filtroEstado.addEventListener('change', actualizarListaBicicletas);
    }
    if (filtroEstacion) {
        filtroEstacion.addEventListener('change', actualizarListaBicicletas);
    }
    if (buscarBicicleta) {
        buscarBicicleta.addEventListener('input', actualizarListaBicicletas);
    }
    
    // Formulario de bicicletas
    const formBicicleta = document.getElementById('formBicicleta');
    const btnGuardarBicicleta = document.getElementById('btnGuardarBicicleta');
    const btnCancelarBicicleta = document.getElementById('btnCancelarBicicleta');
    
    if (formBicicleta) {
        formBicicleta.addEventListener('submit', function(e) {
            e.preventDefault();
            guardarBicicleta();
        });
    }
    
    if (btnCancelarBicicleta) {
        btnCancelarBicicleta.addEventListener('click', function() {
            cerrarModalBicicleta();
        });
    }
    
    // Formulario de arreglos
    const formArreglo = document.getElementById('formArreglo');
    const btnGuardarArreglo = document.getElementById('btnGuardarArreglo');
    const btnCancelarArreglo = document.getElementById('btnCancelarArreglo');
    
    if (formArreglo) {
        formArreglo.addEventListener('submit', function(e) {
            e.preventDefault();
            guardarArreglo();
        });
    }
    
    if (btnCancelarArreglo) {
        btnCancelarArreglo.addEventListener('click', function() {
            cerrarModalArreglo();
        });
    }
}

// Cargar estaciones desde la API
async function cargarEstaciones() {
    try {
        const response = await fetch('/api/estaciones');
        const data = await response.json();
        estaciones = data.estaciones;
        
        actualizarMapa();
        actualizarListaEstaciones();
    } catch (error) {
        console.error('Error al cargar estaciones:', error);
        mostrarMensaje('Error al cargar las estaciones', 'error');
    }
}

// Cargar bicicletas desde la API
async function cargarBicicletas() {
    try {
        const response = await fetch('/api/bicicletas');
        const data = await response.json();
        bicicletas = data.bicicletas;
        
        actualizarListaBicicletas();
        actualizarFiltrosEstaciones();
    } catch (error) {
        console.error('Error al cargar bicicletas:', error);
        mostrarMensaje('Error al cargar las bicicletas', 'error');
    }
}

// Actualizar marcadores en el mapa
function actualizarMapa() {
    // Limpiar marcadores existentes
    marcadores.forEach(marcador => mapa.removeLayer(marcador));
    marcadores = [];
    
    // Agregar nuevos marcadores
    estaciones.forEach(estacion => {
        if (estacion.activa) {
            const marcador = L.marker([estacion.lat, estacion.lng])
                .addTo(mapa)
                .bindPopup(crearPopupEstacion(estacion));
            
            marcador.on('click', function() {
                mostrarDetallesEstacion(estacion);
            });
            
            marcadores.push(marcador);
        }
    });
}

// Crear contenido del popup del marcador
function crearPopupEstacion(estacion) {
    return `
        <div class="popup-estacion">
            <h4>${estacion.nombre}</h4>
            <p><strong>Dirección:</strong> ${estacion.direccion}</p>
            <p><strong>Bicicletas:</strong> ${estacion.bicicletasDisponibles}/${estacion.capacidad}</p>
            <p><strong>Estado:</strong> ${estacion.activa ? 'Activa' : 'Inactiva'}</p>
        </div>
    `;
}

// Obtener dirección desde coordenadas (reverse geocoding)
function obtenerDireccionDesdeCoordenadas(latlng) {
    if (!geocoder) {
        // Si no hay geocoder, agregar estación sin dirección
        agregarNuevaEstacionDesdeMapa(latlng, '');
        return;
    }
    
    const latlngObj = {
        lat: latlng.lat,
        lng: latlng.lng
    };
    
    geocoder.geocode({ location: latlngObj }, function(results, status) {
        if (status === 'OK' && results[0]) {
            const direccion = results[0].formatted_address;
            agregarNuevaEstacionDesdeMapa(latlng, direccion);
        } else {
            mostrarMensaje('No se pudo obtener la dirección para esta ubicación', 'error');
            agregarNuevaEstacionDesdeMapa(latlng, '');
        }
    });
}

// Agregar nueva estación desde el mapa
function agregarNuevaEstacionDesdeMapa(latlng, direccion = '') {
    // Cambiar a modo edición
    modoEdicion = true;
    
    // Cambiar a sección de estaciones
    document.getElementById('btnEstaciones').click();
    
    // Llenar coordenadas en el formulario
    document.getElementById('lat').value = latlng.lat.toFixed(6);
    document.getElementById('lng').value = latlng.lng.toFixed(6);
    
    // Llenar dirección si se obtuvo
    if (direccion) {
        document.getElementById('direccion').value = direccion;
        validarDireccion(direccion);
    }
    
    // Centrar mapa en la nueva ubicación
    if (mapa) {
        mapa.setView(latlng, 16);
    }
    
    mostrarMensaje('Completa los datos de la nueva estación. Haz clic en "Cancelar" para crear otra estación.', 'info');
}

// Guardar estación (crear o actualizar)
async function guardarEstacion() {
    const formData = obtenerDatosFormulario();
    
    if (!validarFormulario(formData)) {
        return;
    }
    
    try {
        let response;
        
        if (estacionEditando) {
            // Actualizar estación existente
            response = await fetch(`/api/estaciones/${estacionEditando.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        } else {
            // Crear nueva estación
            response = await fetch('/api/estaciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
        }
        
        if (response.ok) {
            const estacionGuardada = await response.json();
            mostrarMensaje('Estación guardada correctamente', 'success');
            limpiarFormulario();
            await cargarEstaciones();
            
            // Volver al modo de creación para permitir crear más estaciones
            modoEdicion = false;
        } else {
            const error = await response.json();
            mostrarMensaje(error.error || 'Error al guardar la estación', 'error');
        }
    } catch (error) {
        console.error('Error al guardar estación:', error);
        mostrarMensaje('Error al guardar la estación', 'error');
    }
}

// Obtener datos del formulario
function obtenerDatosFormulario() {
    return {
        nombre: document.getElementById('nombre').value,
        direccion: document.getElementById('direccion').value,
        lat: parseFloat(document.getElementById('lat').value),
        lng: parseFloat(document.getElementById('lng').value),
        capacidad: parseInt(document.getElementById('capacidad').value),
        bicicletasDisponibles: parseInt(document.getElementById('bicicletasDisponibles').value),
        activa: document.getElementById('activa').checked
    };
}

// Validar dirección usando Google Maps Geocoding
function validarDireccion(direccion) {
    const inputDireccion = document.getElementById('direccion');
    
    if (!geocoder) {
        // Si no hay geocoder, marcar como válida sin validar
        inputDireccion.classList.remove('loading-direccion');
        inputDireccion.classList.add('direccion-valida');
        inputDireccion.classList.remove('direccion-invalida');
        direccionValida = true;
        mostrarMensaje('Google Maps no disponible - dirección aceptada sin validar', 'info');
        return;
    }
    
    // Mostrar estado de carga
    inputDireccion.classList.add('loading-direccion');
    inputDireccion.classList.remove('direccion-valida', 'direccion-invalida');
    
    geocoder.geocode({ address: direccion + ', CABA, Argentina' }, function(results, status) {
        inputDireccion.classList.remove('loading-direccion');
        
        if (status === 'OK' && results[0]) {
            const result = results[0];
            const lat = result.geometry.location.lat();
            const lng = result.geometry.location.lng();
            
            // Verificar que esté en CABA
            let estaEnCABA = false;
            for (let component of result.address_components) {
                if (component.types.includes('administrative_area_level_1') && 
                    component.long_name === 'Ciudad Autónoma de Buenos Aires') {
                    estaEnCABA = true;
                    break;
                }
            }
            
            if (estaEnCABA) {
                // Dirección válida
                inputDireccion.classList.add('direccion-valida');
                inputDireccion.classList.remove('direccion-invalida');
                direccionValida = true;
                
                // Llenar coordenadas
                document.getElementById('lat').value = lat.toFixed(6);
                document.getElementById('lng').value = lng.toFixed(6);
                
                // Centrar mapa en la ubicación
                if (mapa) {
                    mapa.setView([lat, lng], 16);
                }
                
                mostrarMensaje('Dirección válida encontrada en CABA', 'success');
            } else {
                // Dirección fuera de CABA
                inputDireccion.classList.add('direccion-invalida');
                inputDireccion.classList.remove('direccion-valida');
                direccionValida = false;
                limpiarCoordenadas();
                mostrarMensaje('La dirección debe estar en CABA', 'error');
            }
        } else {
            // Dirección no encontrada
            inputDireccion.classList.add('direccion-invalida');
            inputDireccion.classList.remove('direccion-valida');
            direccionValida = false;
            limpiarCoordenadas();
            mostrarMensaje('Dirección no encontrada', 'error');
        }
    });
}

// Limpiar validación de dirección
function limpiarValidacionDireccion() {
    const inputDireccion = document.getElementById('direccion');
    inputDireccion.classList.remove('direccion-valida', 'direccion-invalida', 'loading-direccion');
    direccionValida = false;
}

// Limpiar coordenadas
function limpiarCoordenadas() {
    document.getElementById('lat').value = '';
    document.getElementById('lng').value = '';
}

// Validar formulario
function validarFormulario(data) {
    if (!data.nombre || !data.direccion) {
        mostrarMensaje('Por favor completa todos los campos obligatorios', 'error');
        return false;
    }
    
    if (!direccionValida) {
        mostrarMensaje('Por favor ingresa una dirección válida en CABA', 'error');
        return false;
    }
    
    if (data.bicicletasDisponibles > data.capacidad) {
        mostrarMensaje('La cantidad de bicicletas no puede exceder la capacidad', 'error');
        return false;
    }
    
    return true;
}

// Activar modo de creación
function activarModoCreacion() {
    modoEdicion = false;
    estacionEditando = null;
    limpiarFormulario();
    mostrarMensaje('Modo de creación activado. Haz clic en el mapa para agregar una nueva estación.', 'info');
}

// Limpiar formulario
function limpiarFormulario() {
    document.getElementById('formEstacion').reset();
    document.getElementById('estacionId').value = '';
    estacionEditando = null;
    modoEdicion = false;
    document.getElementById('btnGuardar').textContent = 'Guardar';
    limpiarValidacionDireccion();
    limpiarCoordenadas();
}

// Editar estación
function editarEstacion(estacionId) {
    const estacion = estaciones.find(e => e.id === estacionId);
    if (!estacion) {
        mostrarMensaje('Estación no encontrada', 'error');
        return;
    }
    
    estacionEditando = estacion;
    modoEdicion = true;
    
    // Llenar formulario con datos de la estación
    document.getElementById('estacionId').value = estacion.id;
    document.getElementById('nombre').value = estacion.nombre;
    document.getElementById('direccion').value = estacion.direccion;
    document.getElementById('lat').value = estacion.lat;
    document.getElementById('lng').value = estacion.lng;
    document.getElementById('capacidad').value = estacion.capacidad;
    document.getElementById('bicicletasDisponibles').value = estacion.bicicletasDisponibles;
    document.getElementById('activa').checked = estacion.activa;
    
    // Marcar dirección como válida (ya existe)
    direccionValida = true;
    document.getElementById('direccion').classList.add('direccion-valida');
    
    document.getElementById('btnGuardar').textContent = 'Actualizar';
    
    // Cambiar a sección de estaciones
    document.getElementById('btnEstaciones').click();
    
    // Centrar mapa en la estación
    if (mapa) {
        mapa.setView([estacion.lat, estacion.lng], 16);
    }
    
    mostrarMensaje('Editando estación. Haz clic en "Cancelar" para volver al modo de creación.', 'info');
}

// Eliminar estación
async function eliminarEstacion(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta estación?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/estaciones/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            mostrarMensaje('Estación eliminada correctamente', 'success');
            await cargarEstaciones();
        } else {
            const error = await response.json();
            mostrarMensaje(error.error || 'Error al eliminar la estación', 'error');
        }
    } catch (error) {
        console.error('Error al eliminar estación:', error);
        mostrarMensaje('Error al eliminar la estación', 'error');
    }
}

// Actualizar cantidad de bicicletas
async function actualizarBicicletas(estacionId, nuevaCantidad) {
    try {
        const response = await fetch(`/api/estaciones/${estacionId}/bicicletas`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cantidad: nuevaCantidad })
        });
        
        if (response.ok) {
            mostrarMensaje('Cantidad de bicicletas actualizada', 'success');
            await cargarEstaciones();
        } else {
            const error = await response.json();
            mostrarMensaje(error.error || 'Error al actualizar bicicletas', 'error');
        }
    } catch (error) {
        console.error('Error al actualizar bicicletas:', error);
        mostrarMensaje('Error al actualizar bicicletas', 'error');
    }
}

// Actualizar lista de estaciones
function actualizarListaEstaciones() {
    const listaEstaciones = document.getElementById('listaEstaciones');
    
    if (estaciones.length === 0) {
        listaEstaciones.innerHTML = '<p class="loading">No hay estaciones registradas</p>';
        return;
    }
    
    listaEstaciones.innerHTML = estaciones.map(estacion => {
        // Obtener bicicletas de esta estación
        const bicicletasEnEstacion = bicicletas.filter(b => b.estacionActual === estacion.id);
        const bicicletasEnCirculacion = bicicletasEnEstacion.filter(b => b.estado === 'en_circulacion').length;
        const bicicletasParadas = bicicletasEnEstacion.filter(b => b.estado === 'parada').length;
        const bicicletasEnMecanico = bicicletasEnEstacion.filter(b => b.estado === 'en_mecanico').length;
        
        return `
            <div class="estacion-item">
                <h4>${estacion.nombre}</h4>
                <p><strong>Dirección:</strong> ${estacion.direccion}</p>
                <p><strong>Capacidad:</strong> ${estacion.capacidad} bicicletas</p>
                <p><strong>Bicicletas en estación:</strong> ${bicicletasEnEstacion.length}/${estacion.capacidad}</p>
                <div class="bicicletas-estado">
                    <span class="estado-badge circulacion">🟢 ${bicicletasEnCirculacion} en circulación</span>
                    <span class="estado-badge parada">🟡 ${bicicletasParadas} paradas</span>
                    <span class="estado-badge mecanico">🔴 ${bicicletasEnMecanico} en mecánico</span>
                </div>
                <span class="estado ${estacion.activa ? 'activa' : 'inactiva'}">
                    ${estacion.activa ? 'Activa' : 'Inactiva'}
                </span>
                <div class="estacion-acciones">
                    <button class="btn-accion btn-editar" onclick="editarEstacion('${estacion.id}')">
                        Editar
                    </button>
                    <button class="btn-accion btn-eliminar" onclick="eliminarEstacion('${estacion.id}')">
                        Eliminar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Actualizar filtros de estaciones
function actualizarFiltrosEstaciones() {
    const filtroEstacion = document.getElementById('filtroEstacion');
    if (filtroEstacion) {
        const opciones = ['<option value="">Todas las estaciones</option>'];
        estaciones.forEach(estacion => {
            opciones.push(`<option value="${estacion.id}">${estacion.nombre}</option>`);
        });
        filtroEstacion.innerHTML = opciones.join('');
    }
    
    // También actualizar el select de estaciones en el modal de bicicletas
    const selectEstacion = document.getElementById('bicicletaEstacion');
    if (selectEstacion) {
        const opciones = ['<option value="">Sin estación</option>'];
        estaciones.forEach(estacion => {
            opciones.push(`<option value="${estacion.id}">${estacion.nombre}</option>`);
        });
        selectEstacion.innerHTML = opciones.join('');
    }
}

// Actualizar lista de bicicletas
function actualizarListaBicicletas() {
    const listaBicicletas = document.getElementById('listaBicicletas');
    
    if (!listaBicicletas) return;
    
    if (bicicletas.length === 0) {
        listaBicicletas.innerHTML = '<p class="loading">No hay bicicletas registradas</p>';
        return;
    }
    
    // Aplicar filtros
    const filtroEstado = document.getElementById('filtroEstado')?.value || '';
    const filtroEstacion = document.getElementById('filtroEstacion')?.value || '';
    const busqueda = document.getElementById('buscarBicicleta')?.value.toLowerCase() || '';
    
    let bicicletasFiltradas = bicicletas;
    
    if (filtroEstado) {
        bicicletasFiltradas = bicicletasFiltradas.filter(b => b.estado === filtroEstado);
    }
    
    if (filtroEstacion) {
        bicicletasFiltradas = bicicletasFiltradas.filter(b => b.estacionActual === filtroEstacion);
    }
    
    if (busqueda) {
        bicicletasFiltradas = bicicletasFiltradas.filter(b => 
            b.id.toLowerCase().includes(busqueda) || 
            b.numero.toLowerCase().includes(busqueda)
        );
    }
    
    if (bicicletasFiltradas.length === 0) {
        listaBicicletas.innerHTML = '<p class="loading">No se encontraron bicicletas con los filtros aplicados</p>';
        return;
    }
    
    listaBicicletas.innerHTML = bicicletasFiltradas.map(bicicleta => {
        const estacion = estaciones.find(e => e.id === bicicleta.estacionActual);
        const estacionNombre = estacion ? estacion.nombre : 'Sin estación';
        
        return `
            <div class="bicicleta-card">
                <div class="bicicleta-header">
                    <div class="bicicleta-id">${bicicleta.id} - ${bicicleta.numero}</div>
                    <span class="bicicleta-estado ${bicicleta.estado}">
                        ${bicicleta.estado.replace('_', ' ')}
                    </span>
                </div>
                <div class="bicicleta-info">
                    <p><strong>Estación:</strong> ${estacionNombre}</p>
                    <p><strong>Kilómetros:</strong> ${bicicleta.kilometrosRecorridos} km</p>
                    <p><strong>Último mantenimiento:</strong> ${bicicleta.ultimoMantenimiento}</p>
                    <p><strong>Arreglos:</strong> ${bicicleta.historialArreglos.length} registros</p>
                </div>
                <div class="bicicleta-acciones">
                    <button class="btn-accion-bicicleta btn-editar-bicicleta" onclick="editarBicicleta('${bicicleta.id}')">
                        ✏️ Editar
                    </button>
                    <button class="btn-accion-bicicleta btn-arreglo-bicicleta" onclick="agregarArreglo('${bicicleta.id}')">
                        🔧 Arreglo
                    </button>
                    <button class="btn-accion-bicicleta btn-mover-bicicleta" onclick="moverBicicleta('${bicicleta.id}')">
                        🚚 Mover
                    </button>
                    <button class="btn-accion-bicicleta btn-eliminar-bicicleta" onclick="eliminarBicicleta('${bicicleta.id}')">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Mostrar detalles de estación en modal
function mostrarDetallesEstacion(estacion) {
    const modal = document.getElementById('modalEstacion');
    const modalTitulo = document.getElementById('modalTitulo');
    const modalContenido = document.getElementById('modalContenido');
    
    modalTitulo.textContent = estacion.nombre;
    modalContenido.innerHTML = `
        <p><strong>Dirección:</strong> ${estacion.direccion}</p>
        <p><strong>Coordenadas:</strong> ${estacion.lat}, ${estacion.lng}</p>
        <p><strong>Capacidad:</strong> ${estacion.capacidad} bicicletas</p>
        <p><strong>Bicicletas disponibles:</strong> ${estacion.bicicletasDisponibles}</p>
        <p><strong>Estado:</strong> ${estacion.activa ? 'Activa' : 'Inactiva'}</p>
        <p><strong>ID:</strong> ${estacion.id}</p>
    `;
    
    modal.style.display = 'block';
}

// Cerrar modal
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('modalEstacion').style.display = 'none';
});

window.addEventListener('click', function(event) {
    const modal = document.getElementById('modalEstacion');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Función para mostrar mensajes
function mostrarMensaje(mensaje, tipo) {
    // Crear elemento de mensaje
    const mensajeElement = document.createElement('div');
    mensajeElement.className = `mensaje mensaje-${tipo}`;
    mensajeElement.textContent = mensaje;
    
    // Estilos del mensaje
    mensajeElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    
    // Colores según tipo
    switch(tipo) {
        case 'success':
            mensajeElement.style.backgroundColor = '#27ae60';
            break;
        case 'error':
            mensajeElement.style.backgroundColor = '#e74c3c';
            break;
        case 'info':
            mensajeElement.style.backgroundColor = '#3498db';
            break;
        default:
            mensajeElement.style.backgroundColor = '#95a5a6';
    }
    
    // Agregar al DOM
    document.body.appendChild(mensajeElement);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        mensajeElement.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (mensajeElement.parentNode) {
                mensajeElement.parentNode.removeChild(mensajeElement);
            }
        }, 300);
    }, 3000);
}

// ===== FUNCIONES PARA BICICLETAS =====

// Abrir modal de bicicleta
function abrirModalBicicleta(bicicleta = null) {
    const modal = document.getElementById('modalBicicleta');
    const titulo = document.getElementById('modalBicicletaTitulo');
    const form = document.getElementById('formBicicleta');
    
    if (bicicleta) {
        // Modo edición
        titulo.textContent = 'Editar Bicicleta';
        bicicletaEditando = bicicleta;
        
        // Llenar formulario
        document.getElementById('bicicletaId').value = bicicleta.id;
        document.getElementById('bicicletaNumero').value = bicicleta.numero;
        document.getElementById('bicicletaEstado').value = bicicleta.estado;
        document.getElementById('bicicletaEstacion').value = bicicleta.estacionActual || '';
        document.getElementById('bicicletaFechaAdquisicion').value = bicicleta.fechaAdquisicion;
        document.getElementById('bicicletaKilometros').value = bicicleta.kilometrosRecorridos;
        
        document.getElementById('btnGuardarBicicleta').textContent = 'Actualizar';
    } else {
        // Modo creación
        titulo.textContent = 'Nueva Bicicleta';
        bicicletaEditando = null;
        
        // Limpiar formulario
        form.reset();
        document.getElementById('bicicletaFechaAdquisicion').value = new Date().toISOString().split('T')[0];
        document.getElementById('bicicletaKilometros').value = 0;
        
        document.getElementById('btnGuardarBicicleta').textContent = 'Guardar';
    }
    
    modal.style.display = 'block';
}

// Cerrar modal de bicicleta
function cerrarModalBicicleta() {
    document.getElementById('modalBicicleta').style.display = 'none';
    bicicletaEditando = null;
}

// Guardar bicicleta
async function guardarBicicleta() {
    const formData = {
        id: document.getElementById('bicicletaId').value,
        numero: document.getElementById('bicicletaNumero').value,
        estado: document.getElementById('bicicletaEstado').value,
        estacionActual: document.getElementById('bicicletaEstacion').value || null,
        fechaAdquisicion: document.getElementById('bicicletaFechaAdquisicion').value,
        kilometrosRecorridos: parseInt(document.getElementById('bicicletaKilometros').value)
    };
    
    try {
        let response;
        
        if (bicicletaEditando) {
            // Actualizar
            response = await fetch(`/api/bicicletas/${bicicletaEditando.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        } else {
            // Crear
            response = await fetch('/api/bicicletas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        }
        
        if (response.ok) {
            mostrarMensaje('Bicicleta guardada correctamente', 'success');
            cerrarModalBicicleta();
            await cargarBicicletas();
        } else {
            const error = await response.json();
            mostrarMensaje(error.error || 'Error al guardar la bicicleta', 'error');
        }
    } catch (error) {
        console.error('Error al guardar bicicleta:', error);
        mostrarMensaje('Error al guardar la bicicleta', 'error');
    }
}

// Editar bicicleta
function editarBicicleta(id) {
    const bicicleta = bicicletas.find(b => b.id === id);
    if (bicicleta) {
        abrirModalBicicleta(bicicleta);
    }
}

// Eliminar bicicleta
async function eliminarBicicleta(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta bicicleta?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/bicicletas/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            mostrarMensaje('Bicicleta eliminada correctamente', 'success');
            await cargarBicicletas();
        } else {
            const error = await response.json();
            mostrarMensaje(error.error || 'Error al eliminar la bicicleta', 'error');
        }
    } catch (error) {
        console.error('Error al eliminar bicicleta:', error);
        mostrarMensaje('Error al eliminar la bicicleta', 'error');
    }
}

// Abrir modal de arreglo
function agregarArreglo(bicicletaId) {
    const modal = document.getElementById('modalArreglo');
    const titulo = document.getElementById('modalArregloTitulo');
    
    titulo.textContent = `Agregar Arreglo - ${bicicletaId}`;
    document.getElementById('arregloFecha').value = new Date().toISOString().split('T')[0];
    document.getElementById('arregloDescripcion').value = '';
    document.getElementById('arregloCosto').value = 0;
    document.getElementById('arregloMecanico').value = '';
    
    // Guardar ID de la bicicleta para usar en guardarArreglo
    modal.dataset.bicicletaId = bicicletaId;
    
    modal.style.display = 'block';
}

// Cerrar modal de arreglo
function cerrarModalArreglo() {
    document.getElementById('modalArreglo').style.display = 'none';
}

// Guardar arreglo
async function guardarArreglo() {
    const modal = document.getElementById('modalArreglo');
    const bicicletaId = modal.dataset.bicicletaId;
    
    const formData = {
        fecha: document.getElementById('arregloFecha').value,
        descripcion: document.getElementById('arregloDescripcion').value,
        costo: parseInt(document.getElementById('arregloCosto').value),
        mecanico: document.getElementById('arregloMecanico').value
    };
    
    try {
        const response = await fetch(`/api/bicicletas/${bicicletaId}/arreglos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            mostrarMensaje('Arreglo agregado correctamente', 'success');
            cerrarModalArreglo();
            await cargarBicicletas();
        } else {
            const error = await response.json();
            mostrarMensaje(error.error || 'Error al agregar el arreglo', 'error');
        }
    } catch (error) {
        console.error('Error al agregar arreglo:', error);
        mostrarMensaje('Error al agregar el arreglo', 'error');
    }
}

// Mover bicicleta
async function moverBicicleta(bicicletaId) {
    const bicicleta = bicicletas.find(b => b.id === bicicletaId);
    if (!bicicleta) return;
    
    const nuevaEstacionId = prompt(
        `Mover bicicleta ${bicicletaId} a otra estación.\n\n` +
        `Estaciones disponibles:\n` +
        estaciones.map(e => `${e.id}: ${e.nombre}`).join('\n') +
        `\n\nIngresa el ID de la estación (o deja vacío para quitar de estación):`
    );
    
    if (nuevaEstacionId === null) return; // Usuario canceló
    
    try {
        const response = await fetch(`/api/bicicletas/${bicicletaId}/mover`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estacionId: nuevaEstacionId || null })
        });
        
        if (response.ok) {
            mostrarMensaje('Bicicleta movida correctamente', 'success');
            await cargarEstaciones();
            await cargarBicicletas();
        } else {
            const error = await response.json();
            mostrarMensaje(error.error || 'Error al mover la bicicleta', 'error');
        }
    } catch (error) {
        console.error('Error al mover bicicleta:', error);
        mostrarMensaje('Error al mover la bicicleta', 'error');
    }
}

// Agregar estilos de animación para mensajes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style); 