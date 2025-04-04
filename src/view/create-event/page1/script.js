function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

function isValidTime(timeString) {
    if (timeString.includes('--') || timeString.endsWith(':') || 
    timeString.split(':')[1]?.length !== 2) {  
        return false;
    }

    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(timeString);
}

function saveEventData() {
    const eventData = {
        date: document.querySelector('.date-input').value,
        time: document.querySelector('.time-input').value,
        name: document.querySelector('.name-group .input-field').value,
        description: document.querySelector('.description-group .input-field').value,
        location: document.querySelector('.location-group .input-field').value
    };

    if (eventData.name === "" || !eventData.time  === "" || eventData.date  === "" || eventData.date  === "" || eventData.location === "") {
        Swal.fire({ icon: "error", text: 'Por favor, complete todos los campos.' });
        return;
    }

    // Validación específica de fecha
    if (!isValidDate(eventData.date)) {
        Swal.fire({ 
            icon: "error", 
            text: 'Formato de fecha inválido. Use DD-MM-YYYY' 
        });
        return;
    }

    // Validación específica de hora
    if (!isValidTime(eventData.time)) {
        Swal.fire({ 
            icon: "error", 
            text: 'Formato de hora inválido/incompleto. Use HH:MM en formato 24 horas' 
        });
        return;
    }

    localStorage.setItem('eventData', JSON.stringify(eventData));
    window.location.href = '/createevent2/';
}