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
            lblUser.textContent = `@${data["username"]}`;
            lblCedula.textContent = data["cedula"];
            inputEmail.value = data["mail"];
            inputPhone.value = data["phone"];
        }).catch((err) => {
            console.log(err);
            window.location.href='/logout?error=server';
        })
})();

async function saveData(redirectType) {
    const inputEmail = document.getElementById("input-email");
    const inputPhone = document.getElementById("input-phone");

    try {
        const response = await fetch('/api/update_user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: inputEmail.value, phone: inputPhone.value })
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        if (redirectType == 1) goToEvents();
        else if (redirectType == 3) goToLogout();
    } catch (error) {
        console.error("Fetch error:", error);
        window.location.href = '/logout?error=server';
    }
}
