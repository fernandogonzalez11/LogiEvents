let currentVerificationID = -1;
const eventData = sessionStorage.getItem("currentEvent");
const eventJSON = JSON.parse(eventData);

document.getElementById("event-name").textContent = eventJSON.name;

function reserveEvent() {
  amountOfReservations = document.getElementById("spaces-selection").value;
  email = document.getElementById("email").value;
  phone = document.getElementById("phone").value;
  fetch(
    `/event/reserve?id=${eventJSON.id}&amount=${amountOfReservations}&email=${email}&phone=${phone}`
  )
    .then((res) => res.json())
    .then(async (data) => {
      if (data["error"]) {
        Swal.fire({ icon: "error", text: data["error"] });
        return;
      }

      currentVerificationID = data["id"];
      const sent = await sendMessage(phone);
      if (sent)
        document.getElementById("sms-verification").style.display = "block";
    })
    .catch((err) => Swal.fire({ icon: "error", text: err }));
}

function verifySMSCode() {
  const code = document.getElementById("sms-code").value;
  return fetch(`/api/check_sms_code?id=${currentVerificationID}&code=${code}`)
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("sms-verification").style.display = "none";

      if (data["error"]) {
        Swal.fire({ icon: "error", text: data["error"] });
        return false;
      }

      if (!data["correct"])
        Swal.fire({
          icon: "error",
          text: "Código de verificación por SMS incorrecto",
        });
      return data["correct"];
    })
    .catch((err) => {
      Swal.fire({ icon: "error", text: err });
      return false;
    });
}

function sendMessage(phone) {
  fetch(`/api/send_message?id=${currentVerificationID}&phone=${phone}`)
    .then((res) => res.json())
    .then((data) => {
      if (data["error"]) {
        Swal.fire({ icon: "error", text: data["error"] });
        return false;
      }

      Swal.fire({ icon: "info", text: "Código enviado, por favor revise su teléfono" });
    })
    .catch((err) => Swal.fire({ icon: "error", text: err }));
}

async function sendEventEmail(email) {
  return fetch(`/api/send_event_email?email=${email}&event_id=${eventJSON.id}`)
    .then((res) => res.json())
    .then((data) => {
      if (data["error"]) {
        Swal.fire({ icon: "error", text: data["error"] });
        return false;
      }

      Swal.fire({
        icon: "success",
        text: `Detalles del evento enviados a ${email}`
      });
      return true;
    })
    .catch((err) => {
      Swal.fire({ icon: "error", text: "Error de conexión" });
      return false;
    });
}


function cancel() {
  document.getElementById("sms-verification").style.display = "none";
}

async function finalReserveEvent() {
  const correct = await verifySMSCode();
  email = document.getElementById("email").value;
  if (correct) {
    fetch(`/api/event/reserve?id=${currentVerificationID}`)
      .then((res) => res.json())
      .then((data) => {
        if (data["error"]) {
          Swal.fire({ icon: "error", text: data["error"] });
          return;
        } else if (data["success"]) {
          sendEventEmail(email);
          Swal.fire({
            icon: "success",
            text: "Evento reservado exitosamente",
          }).then(() => {
            goToEvents();
          });
        }
      });
  };
}

