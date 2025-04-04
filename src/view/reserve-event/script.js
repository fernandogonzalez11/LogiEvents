let currentVerificationID = -1;
const eventData = sessionStorage.getItem("currentEvent");
const evento = JSON.parse(eventData);

function reserveEvent() {
  amountOfReservations = document.getElementById("spaces-selection").value;
  email = document.getElementById("email").value;
  phone = document.getElementById("phone").value;
  fetch(`/event/reserve?id=${evento.id}&amount=${amountOfReservations}&correo=${email}&phone=${phone}`)
    .then((res) => res.json())
    .then((data) => {
      if (data["error"]) {
        Swal.fire({ icon: "error", text: data["error"] });
        return;
      }

      sendMessage(phone);

      document.getElementById("sms-verification").style.display = "block";
      currentVerificationID = data["id"];
      console.log(currentVerificationID);
    })
    .catch((err) => Swal.fire({ icon: "error", text: err }));
}

function verifySMSCode() {
  const code = document.getElementById("sms-code").value;
  console.log(code);
  fetch(`/api/check_sms_code?id=${currentVerificationID}&code=${code}`)
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("sms-verification").style.display = "none";

      if (data["error"]) {
        Swal.fire({ icon: "error", text: data["error"] });
        return false;
      }

      if (!data["correct"]) Swal.fire({ icon: "error", text: "Código de verificación por SMS incorrecto" });

      return data["correct"];
    })
    .catch((err) => Swal.fire({ icon: "error", text: err }));
}

function sendMessage(phone) {
  fetch(`/api/send_message?id=${currentVerificationID}&phone=${phone}`)
    .then((res) => res.json())
    .then((data) => {
      if (data["error"]) {
        Swal.fire({ icon: "error", text: data["error"] });
        return;
      }

      Swal.fire({ icon: "info", text: "Código enviado, por favor revise su teléfono" });
    })
    .catch((err) => Swal.fire({ icon: "error", text: err }));
}

function cancel() {
  document.getElementById("sms-verification").style.display = "none";
}

function finalReserveEvent() {
  if (verifySMSCode()) {
    fetch(`/api/event/reserve?id=${currentVerificationID}`)
      .then((res) => res.json())
      .then((data) => {
        if (data["error"]) {
          Swal.fire({ icon: "error", text: data["error"] });
          return;
        } else if (data["success"]) {
          Swal.fire({ icon: "success", text: "Evento reservado exitosamente" });
          
          window.location.reload();
          return;
        }
      });
  }
}
