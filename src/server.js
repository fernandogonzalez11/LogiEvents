const express = require('express');
const path = require('path');
require('dotenv').config();
const crypto = require('crypto');
const session = require('express-session');
const { User } = require('./models/User');
const { validatePassword, validatePhone, validateEmail } = require('./controller/validation');
const { sendTwilioMessage } = require('./controller/sendTwilio');
const Constants = require('./models/Constants');
const { Queries } = require('./controller/dbQueries');
const db = require('./controller/dbQueries');
const Redis = require('redis');
const { RedisStore } = require('connect-redis');
const cors = require('cors');

const PASSWORD_ERROR = "Contraseña inválida (al menos 4 letras y 4 números)";

const app = express();
const redisClient = Redis.createClient({
    url: process.env.REDIS_URL,
});
redisClient.connect().catch(console.error);

// session object
const sess = {
    // store to redis so that vercel can use sessions
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 1000 * 60 * Constants.LOGIN_EXPIRATION_MINUTES 
    }
}

// if deployment is in vercel, set secure parameters
if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}

// use session for login
app.use(session(sess));
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});
// enable middleware to parse body of Content-type: application/json
app.use(express.json());
// allow post requests from frontend with CORS
app.use(cors());

/**
 * Serve an HTML file statically
 * @param {Response} res 
 * @param {string} folder 
 */
function sendHTML(res, folder) {
    res.sendFile(path.join(htmlPath, folder, 'index.html'));
}

/**
 * Handle an error server side by fallbacking to logout
 * @param {Error} err
 * @param {Response} res 
 */
function handleError(err, res) {
    console.error(err);
    res.status(500).redirect('/logout?error=server');
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
  

/**
 * Get current user information from the session cookie
 * @param {Request} req 
 */
async function getCurrentUser(req, res) {
    const userId = req.session.userId;
    rows = await db.query(db.Queries.GET_USER, [userId]);

    if (rows.length != 1) {
        handleError(new Error("0 or >1 users fetched for ID " + userId), res);
        return null;
    }
        
    return rows[0];
}

app.get('/favicon.ico', (req, res) => res.sendFile(path.join(htmlPath, 'favicon.ico')));
app.get('/', (req, res) => sendHTML(res, "login"));
app.get('/login/', (req, res) => sendHTML(res, "login"));
app.get('/admin/', (req, res) => sendHTML(res, "admin-panel"));
app.get('/createevent1/', (req, res) => sendHTML(res, "create-event/page1"));
app.get('/createevent2/', (req, res) => sendHTML(res, "create-event/page2"));
app.get('/editevent/', (req, res) => sendHTML(res, "edit-event"));
app.get('/event/', (req, res) => sendHTML(res, "event-detail"));
app.get('/events/', (req, res) => {
    if (!req.session.userId) return res.status(403).redirect("/login/");
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
        const redirectURI = '/login';
        if (req.query["error"]) redirectURI += `"?error=${req.query["error"]}`
        res.redirect(redirectURI); // Redirect to login page after logout
    });
});


app.get('/api/login/', async (req, res) => {
    const q = req.query;
    const pw_hash = crypto.createHash('md5').update(q["password"]).digest("hex");

    try {
        if (req.session.userId)
            delete req.session.userId;

        rows = await db.query(
            Queries.LOGIN,
            [q["user"], pw_hash]
        );

        if (rows.length == 1) {
            req.session.userId = rows[0].id;
            res.redirect("/events/");
        } else {
            res.redirect("/login?error=invalid")
        }
    } catch (err) {
        return handleError(err, res);
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
        result = await db.query(
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
        console.log(`Row was added to the table: ${result.lastID}`);
        res.redirect('/');
    } catch (err) {
        return handleError(err, res);
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
    } catch (err) {
        return handleError(err, res);
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
        console.error(error);
        res.redirect(`${redirectURI}?error=twilio`)
    }
});

app.get('/profile', async (req, res) => {
    try {
        const user = await getCurrentUser(req, res);
        if (!user) return handleError("User not found", res);

        const type = user.type;
        if (type == Constants.USER_TYPES.user) sendHTML(res, "edit-profile/user");
        else if (type == Constants.USER_TYPES.admin) sendHTML(res, "edit-profile/admin");
        else return handleError(new Error("Invalid user type: " + type), res);
    } catch (err) {
        return console.error(err);
    }
});

app.get('/api/current_user', async (req, res) => {
    try {
        const user = await getCurrentUser(req, res);
        if (!user) return;

        return res.json(user);
    } catch (err) {
        return handleError(err, res);
    }
});

app.post('/api/update_user', async (req, res) => {
    const email = req.body.email;
    const phone = req.body.phone;
    const id = req.session.userId;

    if (!id) return handleError(new Error("User ID is missing in update user request"), res);

    if (!validateEmail(email))
        return res.status(400).json({ "error": "Formato de email incorrecto" });
    else if (!validatePhone(phone)) 
        return res.status(400).json({ "error": "Formato de teléfono incorrecto" });

    await db.query(Queries.UPDATE_USER, [email, phone, id]);

    return res.status(200).json({ "success": true });
});

const htmlPath = path.join(__dirname, 'view');
// Set the "html" folder as the location for templates/static files
app.use(express.static(htmlPath));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;