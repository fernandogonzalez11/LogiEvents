const CEDULA_LENGTH = 9;
const PHONE_LENGTH = 8;
const USERNAME_MAX_LENGTH = 30;

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
/**
 * EMP-001
 */
const EMPLOYEE_ID_REGEX = /EMP-\d{3}/;
/**
 * 4 letras y 4 números
 */
const PASSWORD_REGEX = /^[A-Za-z]{4}\d{4}$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 60;

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
    console.log(EMAIL_REGEX.test(email));
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

module.exports = {
    validateCedula,
    validateEmail,
    validateEmployeeID,
    validatePhone,
    validateUsername,
    validatePassword
}