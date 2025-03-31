(function setUserInfo() {
    const lblName = document.getElementById("lbl-name");
    const lblUser = document.getElementById("lbl-username");
    const inputEmail = document.getElementById("input-email");
    const inputPhone = document.getElementById("input-phone");
    const lblCedula = document.getElementById("lbl-cedula");

    fetch('/api/current_user')
        .then(res => res.json())
        .then(data => {
            lblName.textContent = data["name"];
            lblUser.textContent = data["username"];
            lblCedula.textContent = data["cedula"];
            inputEmail.value = data["mail"];
            inputPhone.value = data["phone"];
        }).catch((err) => {
            console.log(err);
            window.location.href='/logout?error=server';
        })
})();