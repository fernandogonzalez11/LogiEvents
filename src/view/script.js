function goToAdminPanel() {
    window.location.href='/admin-panel/';
}
function goToCreateEvent() {
    window.location.href='/create-event/page1/';
}
function goToCreateEvent2() {
    window.location.href='/create-event/page2/';
}
function goToEditEvent() {
    window.location.href='/edit-event/';
}
function goToEditProfile() {
    //CHECK ROL IN DB
    window.location.href='/edit-profile/admin/';
    //else: window.location.href='/edit-profile/user/'
}

function goToEvents() {
    window.location.href='/events/';
}
function goToLogin() {
    window.location.href='/login/';
}
function goToReserveEvent() {
    window.location.href='/reserve-event/';
}
