(function setUserInfo() {
    const lblName = document.getElementById("lbl-name");
    const lblUser = document.getElementById("lbl-username");
    const lblRole = document.getElementById("lbl-role");
    const lblIdEmpleado = document.getElementById("lbl-id-empleado");
    const lblCedula = document.getElementById("lbl-cedula");
    const inputEmail = document.getElementById("input-email");
    const inputPhone = document.getElementById("input-phone");

    fetch('/api/current_user')
        .then(res => res.json())
        .then(data => {
            console.log(data);
            lblName.textContent = data["name"];
            lblUser.textContent = data["username"];
            lblCedula.textContent = data["cedula"];
            lblRole.textContent = data["rol"];
            lblIdEmpleado.textContent = data["id_empleado"];
            inputEmail.value = data["mail"];
            inputPhone.value = data["phone"];
        }).catch((err) => {
            console.log(err);
            window.location.href='/logout?error=server';
        })
})();