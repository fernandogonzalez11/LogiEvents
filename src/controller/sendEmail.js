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
            <p>Este es tu código para confirmar el borrado de evento:</p>
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



// Correo con información de evento
async function enviarCorreoEvento(destinatario, evento, amount) {
  try {
    const mensaje = {
      from: "LogiEvents Manager <logievents.manager@gmail.com>",
      to: destinatario,
      subject: `Detalles del evento: ${evento.name}`,
      html: `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
              .details { margin: 20px 0; border-collapse: collapse; width: 100%; }
              .details th { background-color: #f2f2f2; text-align: left; padding: 8px; }
              .details td { padding: 8px; border-bottom: 1px solid #ddd; }
              .footer { margin-top: 20px; font-size: 0.9em; color: #777; }
              .highlight { background-color: #f8f9fa; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>${evento.name}</h1>
              </div>
              
              <table class="details">
                <tr>
                  <th>Fecha:</th>
                  <td>${evento.fecha || 'No especificada'}</td>
                </tr>
                <tr>
                  <th>Hora:</th>
                  <td>${evento.hora || 'No especificada'}</td>
                </tr>
                <tr>
                  <th>Categoría:</th>
                  <td>${evento.categoria || 'No especificada'}</td>
                </tr>
                <tr class="highlight">
                  <th>Reservaciones:</th>
                  <td>${amount}</td>
                </tr>
                ${evento.ubicacion ? `
                <tr>
                  <th>Ubicación:</th>
                  <td>${evento.ubicacion}</td>
                </tr>
                ` : ''}
                ${evento.descripcion ? `
                <tr>
                  <th>Descripción:</th>
                  <td>${evento.descripcion}</td>
                </tr>
                ` : ''}
              </table>
              
              <div class="footer">
                <p>Atentamente,<br>Equipo LogiEvents Manager</p>
                <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `Detalles del evento:
Nombre: ${evento.name}
Fecha: ${evento.fecha || 'No especificada'}
Hora: ${evento.hora || 'No especificada'}
Categoría: ${evento.categoria || 'No especificada'}
Reservaciones: ${amount}
${evento.ubicacion ? `Ubicación: ${evento.ubicacion}\n` : ''}
${evento.descripcion ? `Descripción: ${evento.descripcion}\n` : ''}
`
    };
    
    await transporter.sendMail(mensaje);
    console.log(`✔ Correo de evento enviado a ${destinatario}`);
    return true;
  } catch (error) {
    console.error(`✖ Error al enviar correo de evento: ${error.message}`);
    return false;
  }
}


module.exports = { enviarCorreoEvento}
module.exports = { enviarCorreoConfirmacion }
