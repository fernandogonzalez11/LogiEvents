let currentVerificationID = -1;
// const eventID = sessionStorage.getItem("currentEvent").id;
const eventID = 1;

function reserveEvent() {
  fetch(`/event/reserve?id=${eventID}`)
    .then((res) => res.json())
    .then((data) => {
      if (data["error"]) {
        alert(data["error"]);
        return;
      }

      document.getElementById("sms-verification").style.display = "block";
      currentVerificationID = data["id"];
      console.log(currentVerificationID);
    })
    .catch((err) => alert(err));
}

function verifySMSCode() {
  const code = document.getElementById("sms-code").value;
  console.log(code);
  fetch(`/api/check_sms_code?id=${currentVerificationID}&code=${code}`)
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("sms-verification").style.display = "none";

      if (data["error"]) {
        alert(data["error"]);
        return false;
      }

      if (!data["correct"]) alert("Código de verificación por SMS incorrecto");

      return data["correct"];
    })
    .catch((err) => alert(err));
}

function sendMessage() {
  const phone = document.getElementById("input-phone").value;
  fetch(`/api/send_message?id=${currentVerificationID}&phone=${phone}`)
    .then((res) => res.json())
    .then((data) => {
      if (data["error"]) {
        alert(data["error"]);
        return;
      }

      alert("Código enviado, por favor revise su teléfono");
    })
    .catch((err) => alert(err));
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
          alert(data["error"]);
          return;
        } else if (data["success"]) {
          alert("Evento reservado exitosamente");
          window.location.reload();
          return;
        }
      });
  }
}
