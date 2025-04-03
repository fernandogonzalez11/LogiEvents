let currentVerificationID = -1;
// const eventID = sessionStorage.getItem("currentEvent").id;
const eventID = 1;

function reserveEvent() {
  fetch(`/event/reserve?id=${eventID}`)
    .then((res) => res.json())
    .then((data) => {
      if (data["error"]) {
        Swal.fire({ icon: "error", text: data["error"] });
        return;
      }

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

function sendMessage() {
  const phone = document.getElementById("input-phone").value;
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
