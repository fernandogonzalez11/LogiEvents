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
                return;
            }
        });
}

function cancel() {
    document.getElementById("email-verification").style.display = "none";
    document.getElementById("sms-verification").style.display = "none";
    document.getElementById("last-confirm").style.display = "none";
}