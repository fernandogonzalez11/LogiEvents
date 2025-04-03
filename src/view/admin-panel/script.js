let currentVerificationID = -1;

function deleteEvent(id) {
    fetch(`/event/delete?id=${id}`)
        .then(res => res.json())
        .then(data => {
            if (data["error"]) {
                alert(data["error"]);
                return;
            }

            if (data["verify_sms"])
                document.getElementById("sms-verification").style.display = "block";
            else
                document.getElementById("email-verification").style.display = "block";

            currentVerificationID = data["id"];
            console.log(currentVerificationID);
        })
        .catch(err => alert(err)
    );
}

function verifyEmailCode() {
    const code = document.getElementById("email-code").value;
    console.log(code);
    fetch(`/api/check_email_code?id=${currentVerificationID}&code=${code}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("email-verification").style.display = "none";

            if (data["error"]) {
                alert(data["error"]);
                return;
            }

            if (data["correct"]) {
                document.getElementById("last-confirm").style.display = "block";
            } else {
                alert("Código de verificación por correo incorrecto");
            }
        })
        .catch(err => alert(err));
}

function verifySMSCode() {
    const code = document.getElementById("sms-code").value;
    console.log(code);
    fetch(`/api/check_sms_code?id=${currentVerificationID}&code=${code}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("sms-verification").style.display = "none";

            if (data["error"]) {
                alert(data["error"]);
                return;
            }

            if (data["correct"]) {
                document.getElementById("email-verification").style.display = "block";
            } else {
                alert("Código de verificación por SMS incorrecto");
            }
        })
        .catch(err => alert(err));
}

function finalDeleteEvent() {
    fetch(`/api/event/delete?id=${currentVerificationID}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("last-confirm").style.display = "none";

            if (data["error"]) {
                alert(data["error"]);
                return;
            } else if (data["success"]) {
                alert("Evento borrado exitosamente");
                window.location.reload();
                return;
            }
        })
        .catch(err => alert(err));
}

function cancel() {
    document.getElementById("email-verification").style.display = "none";
    document.getElementById("sms-verification").style.display = "none";
    document.getElementById("last-confirm").style.display = "none";
}

function sendEmail() {
    const email = document.getElementById("input-email").value;
    fetch(`/api/send_email?id=${currentVerificationID}&email=${email}`)
        .then(res => res.json())
        .then(data => {
            if (data["error"]) {
                alert(data["error"]);
                return;
            }

            alert("Código enviado, por favor revise su correo");
        })
        .catch(err => alert(err));
}

function sendMessage() {
    const phone = document.getElementById("input-phone").value;
    fetch(`/api/send_message?id=${currentVerificationID}&phone=${phone}`)
        .then(res => res.json())
        .then(data => {
            if (data["error"]) {
                alert(data["error"]);
                return;
            }

            alert("Código enviado, por favor revise su teléfono");
        })
        .catch(err => alert(err));
}