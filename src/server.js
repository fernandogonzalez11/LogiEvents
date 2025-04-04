const express = require('express');
const path = require('path');
require('dotenv').config();
const crypto = require('crypto');
const session = require('express-session');
const { User } = require('./models/User');
const { validatePassword, validatePhone, validateEmail } = require('./controller/validation');
const { sendTwilioMessage } = require('./controller/sendTwilio');
const { enviarCorreoConfirmacion } = require('./controller/sendEmail');
const Constants = require('./models/Constants');
const { Queries } = require('./controller/dbQueries');
const db = require('./controller/dbQueries');
const Redis = require('redis');
const { RedisStore } = require('connect-redis');
const cors = require('cors');
const randomWords = require('random-word-slugs');

const PASSWORD_ERROR = "Contraseña inválida (al menos 4 letras y 4 números)";

const app = express();
app.use(express.json());

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

/**
 * Create the verification codes in the Verification SQL table
 * @param {int} userID 
 * @param {int} id 
 */
async function createVerificationCodes(userID, id) {
    try {
        // first step: no verification done yet
        const code = getRandomInt(100000, 1000000);
        const word = randomWords.generateSlug(1);

        const result = await db.query(Queries.ADD_VERIFICATION, [userID, id, code, word]);
        setTimeout(() => {
            db.query(Queries.DELETE_VERIFICATION, [result.lastID]);
        }, Constants.VERIFICATION_EXPIRATION_MINUTES * 60 * 1000);

        return result.lastID;
    } catch (error) {
        handleError(error, res);
    }
};

app.get('/favicon.ico', (req, res) => res.sendFile(path.join(htmlPath, 'favicon.ico')));
app.get('/', (req, res) => sendHTML(res, "login"));
app.get('/login/', (req, res) => sendHTML(res, "login"));
app.get('/admin/', (req, res) => sendHTML(res, "admin-panel"));
app.get('/createevent1/', (req, res) => sendHTML(res, "create-event/page1"));
app.get('/createevent2/', (req, res) => sendHTML(res, "create-event/page2"));
app.get('/event/edit/', (req, res) => sendHTML(res, "edit-event"));
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
            console.error(err);
            return res.status(500).json({ message: "Error logging out" });
        }
        let redirectURI = '/login';
        if (req.query["error"]) redirectURI += `?error=${req.query["error"]}`
        res.redirect(redirectURI); // Redirect to login page after logout
    });
});
app.get('/statistics', (req, res) => sendHTML(res, "statistics"));


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
        let dupUser = await db.query(Queries.GET_USER_BY_USERNAME, [user.username]);
        if (dupUser.length) return res.redirect(`/signup/user?error=${encodeURIComponent(`¡Ya existe un usuario \"${user.username}\"!`)}`)

        let result = await db.query(
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
            rol: q["role"],
            id_empleado: q["employee-id"],
            type: "administrador",
        });
    } catch (error) {
        return res.redirect(`/signup/user?error=${encodeURIComponent(error.message)}`);
    }

    try {
        const result = await db.query(
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

function isFloat(num) {
    return Number.isFinite(num) || Number.isInteger(num);
}

app.get('/api/getEvents', async (req, res) => {
    try {
        const eventsList = await db.query(Queries.GET_EVENTS_FOR_ADMIN, []);
        res.json(eventsList);
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).json({ error: 'Error al obtener eventos' });
    }
});


app.post('/api/createAevent', async (req, res) => {
    try {
        // Obtener el ID del empleado/organizador
        const user = await getCurrentUser(req, res);
        if (!user) return;
        if (user.type != 'administrador') return res.status(403).json({ "error": "Usuario actual no es administrador" });
        
        // Extraer datos del evento
        let {name, description, date, time, location, 
            capacity, price, status, category, imageData, imageType, 
            cupo} = req.body;
        
        // Validaciones...
        if (!imageData || !imageType) {
            return res.json({ success: false, message: 'La imagen es requerida' });
        }

        if (Number.isInteger(capacity) === false || isFloat(price) === false) {
            return res.json({ success: false, message: 'Verifique que precio y capacidad tengan el formato requerido ' });
        }
        // Verificar si el evento ya existe
        const existingEvents = await db.query(Queries.GET_EVENT_BY_NAME, [name]);
        if (existingEvents.length > 0) {
            return res.json({ success: false, message: 'El evento ya existe' });
        }
       
        if (status === "Agotado") {
            cupo = 0;
        }

        // Crear el evento
        await db.query(Queries.ADD_NEW_EVENT, [
            name, 
            user.id_empleado,
            description,
            date,
            time,
            location,
            capacity,
            price,
            status,
            category,
            imageData,
            imageType,
            cupo
        ]);
        
        res.json({ success: true });
        
    } catch (err) {
        console.error('Error al crear evento:', err);
        res.json({ success: false, message: 'Error del servidor' });
    }
});

app.get('/api/event/image/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const row = await db.query(
            Queries.GET_IMAGE_BY_EVENT_ID,
            [eventId]
        );

        if (!row || row.length === 0) {
            return res.status(404).send('Imagen no encontrada');
        }

        const imageData = row[0].image_data;
        const imageType = row[0].image_type;

        res.set('Content-Type', imageType);
        res.send(Buffer.from(imageData, 'base64'));

    } catch (err) {
        console.error('Error fetching image:', err);
        res.status(500).send('Error al recuperar la imagen');
    }
}); 

app.get('/api/send_message', async (req, res) => {
    const q = req.query;
    const id = q["id"];
    let phoneNumber = q["phone"];

    if (!validatePhone(phoneNumber))
        return res.status(400).json({ "error": "Teléfono inválido" });

    let row = await db.query(Queries.GET_VERIFICATION, [id]);
    if (!row.length) return res.status(500).json({ "error": "Verificación no encontrada o expirada" });
    row = row[0];
    const r_code = row["word"];

    try {
        phoneNumber = "+" + Constants.COUNTRY_CODE + phoneNumber;
        const result = await sendTwilioMessage(phoneNumber, r_code);

        return res.status(200).json({ success: true, body: result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ "error": "Error del servidor al enviar mensaje" });
    }
});

app.get('/api/send_email', async (req, res) => {
    const q = req.query;
    const id = q["id"];
    let email = q["email"];

    if (!validateEmail(email))
        return res.status(400).json({ "error": "Correo electrónico inválido" });

    let row = await db.query(Queries.GET_VERIFICATION, [id]);
    if (!row.length) return res.status(500).json({ "error": "Verificación no encontrada o expirada" });
    row = row[0];
    const r_code = row["code"];

    try {
        const result = await enviarCorreoConfirmacion(email, r_code);

        return res.status(200).json({ success: result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ "error": "Error del servidor al enviar correo" });
    }
});

app.get('/api/check_sms_code', async (req, res) => {
    try {
        const user = await getCurrentUser(req, res);
        if (!user) return res.status(500).json({ "error": "El usuario es inexistente" });

        const q = req.query;
        // verification row ID
        const id = q["id"];
        const q_code = q["code"];

        let row = await db.query(Queries.GET_VERIFICATION, [id]);
        if (!row.length) return res.status(500).json({ "error": "Verificación no encontrada o expirada" });
        row = row[0];
        const r_code = row["word"];

        return res.status(200).json({ "correct": q_code == r_code });
    } catch (error) {
        res.status(500).json({ "error": "Problema de servidor al revisar el código de SMS" })
    }
});

app.get('/api/check_email_code', async (req, res) => {
    try {
        const user = await getCurrentUser(req, res);
        if (!user) return res.status(500).json({ "error": "El usuario es inexistente" });

        const q = req.query;
        // verification row ID
        const id = q["id"];
        const q_code = q["code"];

        let row = await db.query(Queries.GET_VERIFICATION, [id]);
        if (!row.length) return res.status(500).json({ "error": "Verificación no encontrada o expirada" });
        row = row[0];
        const r_code = row["code"];

        console.log(q_code, r_code);

        return res.status(200).json({ "correct": q_code == r_code });
    } catch (error) {
        res.status(500).json({ "error": "Problema de servidor al revisar el código de correo" })
    }
});

app.get('/api/event/delete', async (req, res) => {
    try {
        const user = await getCurrentUser(req, res);
        if (!user) return;
        if (user.type != 'administrador') return res.status(403).json({ "error": "Usuario actual no es administrador" });

        const q = req.query;
        // verification ID
        const id = q["id"];

        let verification = await db.query(Queries.GET_VERIFICATION, [id]);
        if (!verification.length) return res.status(404).json({ "error": "Verificación no existe o expiró" });
        verification = verification[0];

        // get the event from here
        const eventID = verification["event_id"];
        console.log("Deleting event " + eventID.toString());
        const result = await db.query(Queries.DELETE_EVENT, [eventID]);
        console.log(result);
        
        return res.status(200).json({ "success": true });
    } catch (error) {
        handleError(error, res);
    }
});

// the API route called when pressing the trash icon
app.get('/event/delete', async (req, res) => {
    const user = await getCurrentUser(req, res);
    if (!user) return;
    if (user.type != 'administrador') throw new Error("Usuario no es administrador");

    const q = req.query;
    // verification ID
    const id = q["id"];

    let event = await db.query(Queries.GET_EVENT_AND_CAPACITY, [id]);
    if (!event.length) return res.status(404).json({ "error": "Evento no existe" });
    event = event[0];

    const resultID = await createVerificationCodes(user.id, id);

    if (event["cupo"] == 0) return res.status(200).json({ "verify_sms": true, "id": resultID });
    else return res.status(200).json({ "verify_sms": false, "id": resultID });
});

app.get('/api/getEventsByReserves', async (req, res) => {
    try {
        rows = await db.query(db.Queries.GET_EVENTS_SORTED_BY_RESERVES,[]);
        if (!rows) return;

        return res.json(rows);
    } catch (err) {
        console.log("Error al obtener eventos!")
        return handleError(err, res);
    }
});

app.get('/api/getEventsToDisplay', async (req, res) => {
    try {
        rows = await db.query(db.Queries.GET_EVENTS_SORTED_BY_DATE,[]);
        if (!rows) return;

        return res.json(rows);
    } catch (err) {
        console.log("Error al obtener eventos!")
        return handleError(err, res);
    }
});

// receives event ID
app.get('/event/reserve', async (req, res) => {
    // returns verification row ID
    const user = await getCurrentUser(req, res);
    if (!user) return;
    
    const q = req.query;
    // verification ID
    const id = q["id"];
    let amount = q["amount"];
    const email = q["email"];
    const phone = q["phone"];

    try {
        amount = parseInt(amount)
    } catch (error) {
        return res.status(400).json({ "error": "Cantidad de reservas no numérica" })
    }

    let event = await db.query(Queries.GET_EVENT_AND_CAPACITY, [id]);
    if (!event.length) return res.status(404).json({ "error": "Evento no existe" });
    event = event[0];

    if (event.cupo < amount) return res.status(400).json({ "error": "Exceso de reservas" });
    if (!validateEmail(email))return res.status(400).json({ "error": "Email inválido (formato: usuario@pagina.com)" });
    if (!validatePhone(phone)) return res.status(400).json({ "error": "Número de teléfono inválido (formato: 12345678)" });
    

    const resultID = await createVerificationCodes(user.id, id);
    req.session.eventReservationAmount = amount;

    return res.status(200).json({ "id": resultID });
});

// receives verification row ID
app.get('/api/event/reserve', async (req, res) => {
    try {
        const q = req.query;
        // verification ID
        const id = q["id"];
        const amount = req.session.eventReservationAmount;

        let verification = await db.query(Queries.GET_VERIFICATION, [id]);
        if (!verification.length) return res.status(404).json({ "error": "Verificación no existe o expiró" });
        verification = verification[0];

        // get the event and user IDs from here
        const eventID = verification["event_id"];
        const userID = verification["user_id"];

        console.log("Reserving event " + eventID.toString() + " for user " + userID.toString());
        // make the transaction queries
        await db.query(Queries.DECREASE_AVAILABILITY, [amount, eventID]);
        await db.query(Queries.INSERT_RESERVATION, [eventID, userID, amount]);
        delete req.session.eventReservationAmount;
        return res.status(200).json({ "success": true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ "error": "Error del servidor al procesar la reserva" });
    }
}); 

const htmlPath = path.join(__dirname, 'view');
// Set the "html" folder as the location for templates/static files
app.use(express.static(htmlPath));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;