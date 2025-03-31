const express = require('express');
const path = require('path');
const crypto = require('crypto');
const session = require('express-session');
const { User } = require('./models/User');
const { validatePassword, validatePhone } = require('./controller/validation');
const { sendTwilioMessage } = require('./controller/sendTwilio');
const Constants = require('./models/Constants');
const { Queries } = require('./controller/dbQueries');
const db = require('./controller/dbQueries');

const app = express();

const PASSWORD_ERROR = "Contraseña inválida (al menos 4 letras y 4 números)";

// use session for login
app.use(session({
    secret: '7c99a61d6f20728111dc01e56ef4faf1', // 'reques' in MD5, lol
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * Constants.LOGIN_EXPIRATION_MINUTES  } // Set to true if using HTTPS
}));
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

function sendHTML(res, folder) {
    res.sendFile(path.join(htmlPath, folder, 'index.html'));
}

/**
 * Get a random integer between min (included) and max (excluded)
 * Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 * @param {int} min 
 * @param {int} max 
 * @returns
 */
function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}
  

app.get('/', (req, res) => sendHTML(res, "login"));
app.get('/login/', (req, res) => sendHTML(res, "login"));
app.get('/admin/', (req, res) => sendHTML(res, "admin-panel"));
app.get('/createevent1/', (req, res) => sendHTML(res, "create-event/page1"));
app.get('/createevent2/', (req, res) => sendHTML(res, "create-event/page2"));
app.get('/editevent/', (req, res) => sendHTML(res, "edit-event"));
app.get('/event/', (req, res) => sendHTML(res, "event-detail"));
app.get('/events/', (req, res) => {
    if (!req.session.userId) return res.redirect("/login/");
    return sendHTML(res, "events");
});
app.get('/reserve/', (req, res) => sendHTML(res, "reserve-event"));
app.get('/signup/admin/', (req, res) => sendHTML(res, "signup/admin"));
app.get('/signup/user/', (req, res) => sendHTML(res, "signup/user"));
app.get('/logout/', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Error logging out" });
        }
        res.redirect('/login/'); // Redirect to login page after logout
    });
});


app.get('/api/login/', async (req, res) => {
    const q = req.query;
    const pw_hash = crypto.createHash('md5').update(q["password"]).digest("hex");
    
    try {
        rows = await db.query(
            Queries.LOGIN,
            [q["user"], pw_hash]
        );

        if (rows.length == 1) {
            console.log("login successful!");
            req.session.userId = rows[0].id;
            res.redirect("/events/");
        } else {
            res.redirect("/login?error=invalid")
        }
    } catch (err) {
        console.error(err.message);
        return res.redirect("/login?error=server");
    }
});

app.get('/api/signup/user/', async (req, res) => {
    const q = req.query;
    const passwordText = q["password"];
    if (!validatePassword(passwordText))
        return res.redirect(`/signup/user?error=${encodeURIComponent(PASSWORD_ERROR)}`);
        

    const pw_hash = crypto.createHash('md5').update(passwordText).digest("hex");

    let user = null;
    try {
        user = new User({
            cedula: q["cedula"],
            name: q["name"],
            mail: q["email"],
            phone: q["phone"],
            username: q["username"],
            password: pw_hash,
            type: "usuario"
        });
    } catch (error) {
        return res.redirect(`/signup/user?error=${encodeURIComponent(error.message)}`);
    }

    try {
        await db.query(
            Queries.SIGNUP_USER,
            [
                user.cedula,
                user.name,
                user.mail,
                user.phone,
                user.username,
                user.password,
                user.type
            ]
        );
        console.log(`Row was added to the table: ${this.lastID}`);
        res.redirect('/');
    } catch (error) {
        return console.log(error);
    }    
});

app.get('/api/signup/admin', async (req, res) => {
    const q = req.query;

    const passwordText = q["password"];
    if (!validatePassword(passwordText))
        return res.redirect(`/signup/user?error=${encodeURIComponent(PASSWORD_ERROR)}`);

    const pw_hash = crypto.createHash('md5').update(q["password"]).digest("hex");

    let user = null;
    try {
        user = new User({
            cedula: q["cedula"],
            name: q["name"],
            mail: q["email"],
            phone: q["phone"],
            username: q["username"],
            password: pw_hash,
            type: "usuario"
        });
    } catch (error) {
        return res.redirect(`/signup/user?error=${encodeURIComponent(error.message)}`);
    }

    try {
        const result = db.query(
            Queries.SIGNUP_ADMIN,
            [
                user.cedula,
                user.name,
                user.mail,
                user.phone,
                user.username,
                user.password,
                user.rol,
                user.id_empleado,
                user.type
            ]
        );
        console.log(`Row was added to the table: ${result.lastID}`);
        res.redirect('/');
    } catch (error) {
        return console.log(error);
    } 
});

app.get('/api/send_message', async (req, res) => {
    const q = req.query;
    let phoneNumber = q["phone"];
    const redirectURI = q["from"];

    // TODO: validate if there is existing code

    if (!redirectURI)
        return res.json({ "error": "No redirect URI" });

    if (!validatePhone(phoneNumber))
        return res.redirect(`${redirectURI}?error=phone`)

    const code = getRandomInt(100000, 1000000);

    try {
        phoneNumber = "+" + Constants.COUNTRY_CODE + phoneNumber;
        await sendTwilioMessage(phoneNumber, code.toString());
        // TODO: stay on the confirmation dialog
        // TODO: set 2FA code in database temporarily
    } catch (error) {
        console.log(error);
        res.redirect(`${redirectURI}?error=twilio`)
    }
});

app.get('/profile', async (req, res) => {
    try {
        const userId = req.session.userId;
        console.log(userId);
        rows = await db.query(db.Queries.GET_USER, [userId]);

        if (rows.length != 1) return console.log("[ERROR] 0 or >1 users fetched for ID " + userId);
        
        const type = rows[0].type;
        if (type == Constants.USER_TYPES.user) sendHTML(res, "edit-profile/user");
        else if (type == Constants.USER_TYPES.admin) sendHTML(res, "edit-profile/admin");
        else return console.log("[ERROR] Invalid user type: " + type);
    } catch (err) {
        return console.log(err);
    }
});

const htmlPath = path.join(__dirname, 'view');
// Set the "html" folder as the location for templates/static files
app.use(express.static(htmlPath));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;