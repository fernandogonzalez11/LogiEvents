const nodemailer = require("nodemailer");

// Configuración del transporte SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "logievents.manager@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Envía el correo de confirmación
async function enviarCorreoConfirmacion(destinatario, codigo) {
  try {
    const mensaje = {
      from: "LogiEvents Manager <logievents.manager@gmail.com>",
      to: destinatario,
      subject: "Clave de confirmación - LogiEvents Manager",
      html: `
        <html>
          <body>
            <p>¡Hola!</p>
            <p>Este es tu código para confirmar tu reserva:</p>
            <p><strong>${codigo}</strong></p>
            <p>Por favor ingrésalo en la plataforma para completar el proceso.</p>
            <p>Atentamente,<br>Equipo LogiEvents Manager</p>
          </body>
        </html>
      `,
    };
    
    await transporter.sendMail(mensaje);
    console.log(`✔ Correo enviado a ${destinatario}`);
    return true;
  } catch (error) {
    console.error(`✖ Error al enviar correo: ${error.message}`);
    return false;
  }
}

module.exports = { enviarCorreoConfirmacion }
