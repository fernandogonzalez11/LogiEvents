window.addEventListener('DOMContentLoaded', () => {
    const eventData = sessionStorage.getItem('currentEvent');
    const event = JSON.parse(eventData);
    displayEvent(event);
    sessionStorage.removeItem('currentEvent');
    
});

async function displayEvent(event) {

    if (!event) {
        document.getElementById('event-title').textContent = 'Evento no encontrado';
        return;
    }
    
    // Update page title
    document.title = event.name || 'Detalles del Evento';
    
    // Fill in event data
    document.getElementById('event-title').textContent = event.name;
    document.getElementById('event-name').textContent = event.name;
    document.getElementById('event-date').textContent = event.fecha || 'No especificada';
    document.getElementById('organizer').textContent = event.organizador_id || 'No especificado';
    document.getElementById('available-seats').textContent = `${event.cupo || 0} / ${event.capacidad || 0}`;
    document.getElementById('category').textContent = event.categoria || 'No especificada';
    document.getElementById('status').textContent = event.estado || 'No especificado';
    document.getElementById('time').textContent = event.hora || 'No especificada';
    document.getElementById('description').textContent = event.descripcion || 'No hay descripción disponible';
    
    // Set image if available
    if (event.image_url) {
        document.getElementById('event-image').src = event.image_url;
    } else if (event.image_data) {
        document.getElementById('event-image').src = `/api/event/image/${event.id}`;
    }
}