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

module.exports = {
    validateCedula,
    validateEmail,
    validateEmployeeID,
    validatePhone,
    validateUsername,
    validatePassword,
    validateTwilioPhone,
    validateRole
}