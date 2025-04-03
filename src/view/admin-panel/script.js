let currentVerificationID = -1;

function setupAccordions() {
  const acc = document.getElementsByClassName("accordion");

  for (let i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function () {
      this.classList.toggle("active");
      const panel = this.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  }
}

// Function to setup accordion behavior
async function fetchEvents() {
  try {
    const response = await fetch("/api/getEvents");
    if (!response.ok) throw new Error("Error fetching events");
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

function renderEvents(events) {
  const eventsList = document.getElementById("events-list");
  eventsList.innerHTML = "";
  console.log(events.length);
  events.forEach((event, index) => {
    const eventElement = document.createElement("div");
    eventElement.className = "event-item";

    eventElement.innerHTML = `
          <div class="edit-and-delete">
            <button id="edit" class="edit-btn" onclick="goToEditEvent()">
              <img class="edit" src="/admin-panel/img/edit.svg" />
            </button>

            <button id="trash" class="trash-btn" onclick="deleteEvent(${
              event.id
            })">
              <img class="trash" src="/admin-panel/img/trash.svg" /> 
            </button>
          </div>

          <button class="accordion">${event.name}</button>

          <div class="panel">
              <p>Organizador: ${event.organizador_id || "No especificado"}</p>
              <p>Fecha: ${event.fecha || "No especificada"}</p>
              <p>Ubicación: ${event.ubicacion || "No especificada"}</p>
          </div>`;

    eventsList.appendChild(eventElement);
  });

  // Setup accordions AFTER creating the elements
  setupAccordions();
}

function deleteEvent(id) {
  fetch(`/event/delete?id=${id}`)
    .then((res) => res.json())
    .then((data) => {
      if (data["error"]) {
        
        Swal.fire({ icon: "error", text: data["error"] });
        return;
      }

      if (data["verify_sms"])
        document.getElementById("sms-verification").style.display = "block";
      else
        document.getElementById("email-verification").style.display = "block";

      currentVerificationID = data["id"];
      console.log(currentVerificationID);
    })
    .catch((err) => Swal.fire({ icon: "error", text: err }));
}

function verifyEmailCode() {
  const code = document.getElementById("email-code").value;
  console.log(code);
  fetch(`/api/check_email_code?id=${currentVerificationID}&code=${code}`)
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("email-verification").style.display = "none";

      if (data["error"]) {
        Swal.fire({ icon: "error", text: data["error"] });
        return;
      }

      if (data["correct"]) {
        document.getElementById("last-confirm").style.display = "block";
      } else {
        Swal.fire({ icon: "error", text: "Código de verificación por correo incorrecto" });
      }
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
        return;
      }

      if (data["correct"]) {
        document.getElementById("email-verification").style.display = "block";
      } else {
        Swal.fire({ icon: "error", text: "Código de verificación por SMS incorrecto" });
      }
    })
    .catch((err) => Swal.fire({ icon: "error", text: err }));
}

function finalDeleteEvent() {
  fetch(`/api/event/delete?id=${currentVerificationID}`)
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("last-confirm").style.display = "none";

      if (data["error"]) {
        Swal.fire({ icon: "error", text: data["error"] });
        return;
      } else if (data["success"]) {
        Swal.fire({ icon: "success", text: "Evento borrado exitosamente" });
        window.location.reload();
        return;
      }
    })
    .catch((err) => Swal.fire({ icon: "error", text: err }));
}

function cancel() {
  document.getElementById("email-verification").style.display = "none";
  document.getElementById("sms-verification").style.display = "none";
  document.getElementById("last-confirm").style.display = "none";
}

function sendEmail() {
  const email = document.getElementById("input-email").value;
  fetch(`/api/send_email?id=${currentVerificationID}&email=${email}`)
    .then((res) => res.json())
    .then((data) => {
      if (data["error"]) {
        Swal.fire({ icon: "error", text: data["error"] });
        return;
      }

      Swal.fire({ icon: "info", text: "Código enviado, por favor revise su correo" });
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
