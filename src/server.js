const express = require('express');
const { Database } = require("@sqlitecloud/drivers");
const path = require('path');
const crypto = require('crypto');
const session = require('express-session');
const { User } = require('./models/User');
const { validatePassword } = require('./controller/validation');

const app = express();

const PASSWORD_ERROR = "Contraseña inválida (al menos 4 letras y 4 números)";

// use session for login
app.use(session({
    secret: '7c99a61d6f20728111dc01e56ef4faf1', // 'reques' in MD5, lol
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 1000 * 60 * 1  } // Set to true if using HTTPS
}));
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

const db = new Database(process.env.SQLITE_CONNECTION, (err) => {
	if(err) {
		return console.log(err.message);
	}
	console.log("Connected to database!");
});

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
app.get('/events/', (req, res) => {
    console.log("test");
    if (!req.session.userId) return res.redirect("/login/");
    console.log(`my id is ${req.session.userId}`);
    return sendHTML(res, "events");
});
app.get('/events2/', (req, res) => {
    console.log("test");
    // if (!req.session.userId) return res.redirect("/login/");
    console.log(`my id is ${req.session.userId}`);
    // return sendHTML(res, "events");
    return res.send(`Welcome to events page, User ID: ${req.session.userId}`);
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


app.get('/api/login/', (req, res) => {
    console.log("Before login:", req.session.userId);
    console.log(req.query);

    const q = req.query;
    const pw_hash = crypto.createHash('md5').update(q["password"]).digest("hex");

    db.get(
        "USE DATABASE logievents; SELECT id FROM User WHERE username = ? AND password = ?",
        [q["user"], pw_hash],
        (err, row) => {
            if (err) {
                console.error(err.message);
                return res.redirect("/login?error=server");
            }
            if (row) {
                console.log("login successful!");
                req.session.userId = row.id;
                res.redirect("/events/");
            } else {
                res.redirect("/login?error=invalid")
            }
        }
    )
})

app.get('/api/signup/user/', (req, res) => {
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
    

    db.run(
        'USE DATABASE logievents; INSERT INTO User(cedula, name, mail, phone, username, password, type) ' +
        'VALUES(?, ?, ?, ?, ?, ?, ?)',
        [
            user.cedula,
            user.name,
            user.mail,
            user.phone,
            user.username,
            user.password,
            user.type
        ],
        function (err) {
            if(err) {
                return console.log(err.message); 
            }
            console.log(`Row was added to the table: ${this.lastID}`);
            res.redirect('/')
        }
    )
})

app.get('/api/signup/admin', (req, res) => {
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

    db.run(
        'USE DATABASE logievents; INSERT INTO User(cedula, name, mail, phone, username, password, rol, id_empleado, type) ' +
        'VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
        ],
        function (err) {
            if(err) {
                return console.log(err.message); 
            }
            console.log(`Row was added to the table: ${this.lastID}`);
            res.redirect('/')
        }
    )
})

const htmlPath = path.join(__dirname, 'view');
// Set the "html" folder as the location for templates/static files
app.use(express.static(htmlPath));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;