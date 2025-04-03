import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr
from email.header import Header

# Config / No need to touch
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_FROM = "logievents.manager@gmail.com"
EMAIL_PASSWORD = "c"  

def generar_codigo_6_digitos():
    return str(random.randint(100000, 999999))

def enviar_correo_confirmacion(destinatario, codigo):
    try:
        mensaje = MIMEMultipart()
        
        # Headers
        nombre_remitente = "LogiEvents Manager"
        mensaje['From'] = formataddr((nombre_remitente, EMAIL_FROM))
        mensaje['To'] = destinatario
        mensaje['Subject'] = Header("Clave de confirmación - LogiEvents Manager", 'utf-8')

        # Body
        cuerpo = f"""\
        <html>
          <body>
            <p>¡Hola!</p>
            <p>Este es tu código para confirmar tu reserva:</p>
            <p><strong>{codigo}</strong></p>
            <p>Por favor ingrésalo en la plataforma para completar el proceso.</p>
            <p>Atentamente,<br>Equipo LogiEvents Manager</p>
          </body>
        </html>
        """

        parte_html = MIMEText(cuerpo, 'html', 'utf-8')
        mensaje.attach(parte_html)

        # This bit sends it
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(EMAIL_FROM, EMAIL_PASSWORD)
            server.send_message(mensaje)  # This sends it encoded
            
        print(f"✔ Correo enviado a {destinatario}")
        return True

    except Exception as e:
        print(f"✖ Error al enviar correo: {str(e)}")
        return False

# Ejemplo de uso
if __name__ == "__main__":
    destinatario= input("Ingrese el correo destino: ")
    codigo=generar_codigo_6_digitos()
    enviar_correo_confirmacion(destinatario, codigo)