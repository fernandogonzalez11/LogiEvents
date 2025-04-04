function isValidNumber(input, options = {}) {
    const defaults = {
        min: null,
        max: null,
        maxDecimals: 2,
        decimalSeparator: '.',
        fieldName: 'Este campo',
        required: true
    };
    const config = { ...defaults, ...options };

    let str = String(input).trim().replace(',', '.');

    if (isNaN(str) || isNaN(parseFloat(str)) || str.split('.').length >= 3) {
        return {
            isValid: false,
            message: `${config.fieldName} debe ser un número válido (no use comas [,] y que sea un número)`,
            cleanValue: null
        };
    }

    if (config.required && (input === '' || input === null || input === undefined)) {
        return {
            isValid: false,
            message: `${config.fieldName} es requerido`,
            cleanValue: null
        };
    }

    if (!config.required && (input === '' || input === null || input === undefined)) {
        return { 
            isValid: true,
            cleanValue: null
        };
    }

    const num = parseFloat(str);
    let cleanValue = num;

    // Check decimal places
    const decimalPart = str.split('.')[1];
    if (decimalPart && decimalPart.length > config.maxDecimals) {
        return {
            isValid: false,
            message: `${config.fieldName} debe tener máximo ${config.maxDecimals} decimales`,
            cleanValue: null
        };
    }

    // Check minimum value
    if (config.min !== null && num < config.min) {
        return {
            isValid: false,
            message: `${config.fieldName} debe ser mayor o igual a ${config.min}`,
            cleanValue: null
        };
    }

    // Check maximum value
    if (config.max !== null && num > config.max) {
        return {
            isValid: false,
            message: `${config.fieldName} debe ser menor o igual a ${config.max}`,
            cleanValue: null
        };
    }

    return {
        isValid: true,
        cleanValue: config.maxDecimals === 0 ? Math.round(num) : num,
        message: ''
    };
}

async function createEventNEW() {
    // Obtener valores del formulario
    const category = document.getElementById('category').value;
    const capacity = document.getElementById('capacity').value;
    const status = document.getElementById('status').value;
    const price = document.getElementById('price').value;
    const imageFile = document.getElementById('image-file').files[0];



    const eventInfo = JSON.parse(localStorage.getItem('eventData'));
    if (!eventInfo) {
        Swal.fire({ icon: "error", text: 'Datos del evento incompletos' });
        return;
    }

    // Enhanced number validations
    const capacityValidation = isValidNumber(capacity, {
        min: 1,
        max: 100000,
        maxDecimals: 0,
        fieldName: 'Capacidad'
    });

    const priceValidation = isValidNumber(price, {
        min: 0,
        max: 1000000,
        maxDecimals: 2,
        fieldName: 'Precio'
    });

    // Show validation errors if any
    if (!capacityValidation.isValid) {
        Swal.fire({ icon: "error", text: capacityValidation.message });
        return;
    }

    if (!priceValidation.isValid) {
        Swal.fire({ icon: "error", text: priceValidation.message });
        return;
    }

    // Validación text / img
    if (!category || !status || !imageFile || !price || !capacity) {
        Swal.fire({ icon: "error", text: 'Por favor complete todos los campos. Ademas, asegurese de usar el formato adecuado...' });
        return;
    }

    const formData = new FormData();
    formData.append('image', imageFile); // NO TOCAR (Mnnnnn....)
    formData.append('name', eventInfo.name);
    formData.append('description', eventInfo.description);
    formData.append('date', eventInfo.date);
    formData.append('time', eventInfo.time);
    formData.append('location', eventInfo.location);
    formData.append('capacity', capacity);
    formData.append('price', price);
    formData.append('status', status);
    formData.append('category', category);
    formData.append('cupo', capacity);

    try {
        const response = await fetch('/api/createAevent', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success === false) {
            throw new Error(data.message || 'Error en la solicitud');
        }

        Swal.fire({ icon: "success", text: 'Evento creado exitosamente' });
        window.location.href = '/admin/';
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({ 
            icon: "error", 
            text: error.message || 'Error al crear el evento' 
        });
    }
}
