const {
    COUNTRY_CODE, CEDULA_LENGTH, PHONE_LENGTH, USERNAME_MAX_LENGTH,
    PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH
} = require('../models/Constants');

/**
 * In plain language:
 * Start at beginning of string or line
 * Include all characters except @ until the @ sign
 * Include the @ sign
 * Include all characters except @ after the @ sign until the full stop
 * Include all characters except @ after the full stop
 * Stop at the end of the string or line
 * 
 * Source: https://stackoverflow.com/questions/50330109/simple-regex-pattern-for-email
 */
const EMAIL_REGEX = /^[^@]+@[^@]+\.[^@]+$/;
// EMP-001
const EMPLOYEE_ID_REGEX = /[A-Za-z]{2}\d{4}/;
// 4 letras y 4 números
const PASSWORD_REGEX = /^(?=(.*[A-Za-z]){4,})(?=(.*\d){4,}).{8,}$/;
// +50612345678
const TWILIO_PHONE_REGEX = new RegExp(`\\+${COUNTRY_CODE}\\d{8}`);
// Rol
const ROLE_REGEX = /^[a-zA-Z()]+$/;

/**
 * 
 * @param {string} cedula 
 * @returns 
 */
function validateCedula(cedula) {
    return !isNaN(cedula) && cedula.length == CEDULA_LENGTH;
}

/**
 * 
 * @param {string} email 
 */
function validateEmail(email) {
    return EMAIL_REGEX.test(email);
}

/**
 * 
 * @param {string} phone 
 * @returns 
 */
function validatePhone(phone) {
    return !isNaN(phone) && phone.length == PHONE_LENGTH; 
}

/**
 * 
 * @param {string} phone 
 */
function validateTwilioPhone(phone) {
    return TWILIO_PHONE_REGEX.test(phone);
}

/**
 * 
 * @param {string} username 
 * @returns 
 */
function validateUsername(username) {
    return username.length > 0 && username.length <= USERNAME_MAX_LENGTH;
}

/**
 * 
 * @param {string} password 
 */
function validatePassword(password) {
    return password.length >= PASSWORD_MIN_LENGTH
        && password.length <= PASSWORD_MAX_LENGTH
        && PASSWORD_REGEX.test(password);
}

/**
 * 
 * @param {string} empID 
 * @returns 
 */
function validateEmployeeID(empID) {
    return EMPLOYEE_ID_REGEX.test(empID);
}

function validateRole(role) {
    return ROLE_REGEX.test(role);
}

// DAVS
/**
 * 
 * @param {string} id 
 * @returns 
 */
function validateEventID(id) {
    return !id || isNaN(id);
}

/**
 * 
 * @param {string} dateString 
 * @returns 
 */
function isValidDate(dateString) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}

/**
 * 
 * @param {string} timeString 
 * @returns 
 */
function isValidTime(timeString) {
    if (timeString.includes('--') || timeString.endsWith(':') || 
    timeString.split(':')[1]?.length !== 2) {  
        return false;
    }

    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(timeString);
}

/**
 * 
 * @param {string} input
 * @param {string} errorElementId
 * @param {string} rules
 * @returns 
 */
function validateField(input, errorElementId, rules) {
    const errorElement = document.getElementById(errorElementId);
    const value = input.value.trim();
    let isValid = true;
    let message = '';

    if (rules.required && !value) {
        isValid = false;
        message = 'Este campo es requerido';
    }

    if (isValid && rules.isInteger && value && !/^\d+$/.test(value)) {
        isValid = false;
        message = 'Debe ser un número entero';
    }

    if (isValid && rules.isDecimal && value) {
        const decimalParts = value.replace(',', '.').split('.');
        if (decimalParts.length > 1 && decimalParts[1].length > (rules.maxDecimals || 2)) {
            isValid = false;
            message = `Máximo ${rules.maxDecimals || 2} decimales permitidos`;
        }
    }

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

/**
 * 
 * @param {} 
 * @returns 
 */
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

/**
 * 
 * @param {}  
 * @returns 
 */
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

/**
 * 
 * @param {string} input 
 * @returns {object} 
 */
function isValidNumber(input, options = {}) {
    const defaults = {
        min: null,
        max: null,
        maxDecimals: 2,
        decimalSeparator: ',',
        fieldName: 'Este campo',
        required: true
    };
    const config = { ...defaults, ...options };

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

    let str = String(input).trim().replace(/\./g, '').replace(',', '.');

    if (isNaN(str) || isNaN(parseFloat(str))) {
        return {
            isValid: false,
            message: `${config.fieldName} debe ser un número válido`,
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

module.exports = {
    validateCedula,
    validateEmail,
    validateEmployeeID,
    validatePhone,
    validateUsername,
    validatePassword,
    validateTwilioPhone,
    validateRole,
    isValidNumber,
    validateEventID,
    isValidDate,
    isValidTime,
    validateAllFields,
    setupValidation
}