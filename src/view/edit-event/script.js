
function setupValidation() {
    // Number validation for capacity (integer)
    document.getElementById('capacity').addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        validateField(this, 'capacity-error', {
            required: true,
            isInteger: true,
            min: 1,
            max: 100000
        });
    });


    document.getElementById('price').addEventListener('input', function() {
        // Allow numbers and one decimal point or comma
        this.value = this.value.replace(/[^0-9,.]/g, '')
                               .replace(/([,.])(?=.*\1)/g, '');
        
        // Replace comma with period for validation
        const normalized = this.value.replace(',', '.');
        validateField(this, 'price-error', {
            required: true,
            isDecimal: true,
            min: 0,
            max: 1000000,
            maxDecimals: 2
        });
    });

    document.getElementById('location').addEventListener('input', function() {
        validateField(this, 'location-error', { required: true });
    });

    document.getElementById('image-file').addEventListener('change', function() {
        validateField(this, 'image-error', { 
            required: false,
            isImage: true,
            maxSizeMB: 5
        });
    });

}

function validateField(input, errorElementId, rules) {
    const errorElement = document.getElementById(errorElementId);
    const value = input.value.trim();
    let isValid = true;
    let message = '';

    // Required validation
    if (rules.required && !value) {
        isValid = false;
        message = 'Este campo es requerido';
    }

    // Integer validation
    if (isValid && rules.isInteger && value && !/^\d+$/.test(value)) {
        isValid = false;
        message = 'Debe ser un número entero';
    }

    // Decimal validation
    if (isValid && rules.isDecimal && value) {
        const decimalParts = value.replace(',', '.').split('.');
        if (decimalParts.length > 1 && decimalParts[1].length > (rules.maxDecimals || 2)) {
            isValid = false;
            message = `Máximo ${rules.maxDecimals || 2} decimales permitidos`;
        }
    }

    // Range validation
    if (isValid && value) {
        const numValue = parseFloat(value.replace(',', '.'));
        
        if (rules.min !== undefined && numValue < rules.min) {
            isValid = false;
            message = `El valor mínimo es ${rules.min}`;
        }
        
        if (rules.max !== undefined && numValue > rules.max) {
            isValid = false;
            message = `El valor máximo es ${rules.max}`;
        }
    }

    // Image validation
    if (isValid && rules.isImage && input.files && input.files[0]) {
        const file = input.files[0];
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        
        if (!validTypes.includes(file.type)) {
            isValid = false;
            message = 'Solo se permiten imágenes JPEG, PNG o GIF';
        }
        
        if (rules.maxSizeMB && file.size > rules.maxSizeMB * 1024 * 1024) {
            isValid = false;
            message = `La imagen no puede exceder ${rules.maxSizeMB}MB`;
        }
    }

    // Update UI
    if (isValid) {
        input.classList.remove('error-border');
        errorElement.style.display = 'none';
    } else {
        input.classList.add('error-border');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    return isValid;
}

function validateAllFields() {
    const validations = [
        validateField(document.getElementById('capacity'), 'capacity-error', {
            required: true,
            isInteger: true,
            min: 1,
            max: 100000
        }),
        validateField(document.getElementById('price'), 'price-error', {
            required: true,
            isDecimal: true,
            min: 0,
            max: 1000000,
            maxDecimals: 2
        }),
        validateField(document.getElementById('location'), 'location-error', { 
            required: true 
        })
    ];

    return validations.every(v => v);
}

async function updateEvent() {
    if (!validateAllFields()) {
        Swal.fire({ icon: 'error', text: 'Por favor corrija los errores en el formulario' });
        return;
    }

    const eventData = JSON.parse(sessionStorage.getItem('currentEvent'));
    if (!eventData) {
        Swal.fire({ icon: 'error', text: 'No se encontraron datos del evento' });
        return;
    }

    const formData = new FormData();
    formData.append('id', eventData.id);
    formData.append('capacity', document.getElementById('capacity').value);
    formData.append('price', document.getElementById('price').value.replace(',', '.'));
    formData.append('location', document.getElementById('location').value);

    const imageFile = document.getElementById('image-file').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const response = await fetch('/api/updateEvent', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar el evento');
        }

        const data = await response.json();
        if (data.success) {
            Swal.fire({ 
                icon: 'success', 
                text: 'Evento actualizado exitosamente',
            });
            goToEvents();
        } else {
            throw new Error(data.message || 'Error al actualizar el evento');
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({ 
            icon: 'error', 
            text: error.message || 'Error al actualizar el evento' 
        });
    }
}