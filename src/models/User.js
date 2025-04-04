const { validateCedula, validateEmail, validateEmployeeID, validatePhone, validateUsername, validateRole } = require("../controller/validation");
const { USERNAME_MAX_LENGTH, USER_TYPES } = require('./Constants');

class User {
    constructor({ id = null, cedula, name, mail, phone, username, password, type, rol = null, id_empleado = null }) {
      if (!name.length) throw new Error("Nombre inválido");
      if (!validateCedula(cedula)) throw new Error("Cédula inválida (formato: 102340567)");
      if (!validateEmail(mail)) throw new Error("Email inválido (formato: usuario@pagina.com)");
      if (!validatePhone(phone)) throw new Error("Número de teléfono inválido (formato: 12345678)");
      if (!validateUsername(username)) throw new Error(`Usuario inválido (debe ser máximo ${USERNAME_MAX_LENGTH} carácteres)`);
      if (type == USER_TYPES.admin && !validateRole(rol)) throw new Error("Rol inválido (formato: sin números ni símbolos)");
      if (type == USER_TYPES.admin && !validateEmployeeID(id_empleado)) throw new Error("ID de empleado inválido (formato: 2 letras y 4 números)");
  
      this.id = id;
      this.cedula = cedula;
      this.name = name;
      this.mail = mail;
      this.phone = phone;
      this.username = username;
      this.password = password;
      this.type = type;
      this.rol = rol;
      this.id_empleado = id_empleado;
    }
  
    toJSON() {
      return {
        id: this.id,
        cedula: this.cedula,
        name: this.name,
        mail: this.mail,
        phone: this.phone,
        username: this.username,
        type: this.type,
        rol: this.rol,
        id_empleado: this.id_empleado
      };
    }
}
  
module.exports = { User }