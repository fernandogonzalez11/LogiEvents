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
            lblName.textContent = data["name"];
            lblUser.textContent = `@${data["username"]}`;
            lblCedula.textContent = data["cedula"];
            lblRole.textContent = data["rol"];
            lblIdEmpleado.textContent = data["id_empleado"];
            inputEmail.value = data["mail"];
            inputPhone.value = data["phone"];
        }).catch((err) => {
            console.error(err);
            window.location.href='/logout?error=server';
        })
})();

async function saveData(redirectType) {
    const inputEmail = document.getElementById("input-email");
    const inputPhone = document.getElementById("input-phone");

    try {
        let response = await fetch('/api/update_user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: inputEmail.value, phone: inputPhone.value })
        });

        response = await response.json();

        if (response.error) alert(response.error);
        
        if (redirectType == 1) goToEvents();
        else if (redirectType == 3) goToLogout();
    } catch (error) {
        console.error("Fetch error:", error);
        window.location.href = '/logout?error=server';
    }
}