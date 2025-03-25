const express = require('express');
const path = require('path');

const app = express();

const htmlPath = path.join(__dirname, 'html')

// Set the "html" folder as the location for templates/static files
app.use(express.static(htmlPath));

function sendHTML(res, folder) {
    res.sendFile(path.join(htmlPath, folder, 'index.html'));
}

app.get('/', (req, res) => sendHTML(res, "login"));
app.get('/login/', (req, res) => sendHTML(res, "login"));
app.get('/admin/', (req, res) => sendHTML(res, "admin-panel"));
app.get('/createevent1/', (req, res) => sendHTML(res, "create-event/page1"));
app.get('/createevent2/', (req, res) => sendHTML(res, "create-event/page2"));
app.get('/editevent/', (req, res) => sendHTML(res, "edit-event"));
app.get('/profileadmin/', (req, res) => sendHTML(res, "edit-profile/admin"));
app.get('/profileuser/', (req, res) => sendHTML(res, "edit-profile/user"));
app.get('/event/', (req, res) => sendHTML(res, "event-detail"));
app.get('/events/', (req, res) => sendHTML(res, "events"));
app.get('/reserve/', (req, res) => sendHTML(res, "reserve-event"));
app.get('/signupadmin/', (req, res) => sendHTML(res, "signup/admin"));
app.get('/signupuser/', (req, res) => sendHTML(res, "signup/user"));

app.get('/trylogin/', (req, res) => {
    if (true) {
        console.log("login successful")
        res.redirect('/events/')
    }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
