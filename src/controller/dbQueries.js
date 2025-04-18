const { Database } = require("@sqlitecloud/drivers");
const Constants = require("../models/Constants")

const Queries = {
    LOGIN: 'SELECT id FROM User WHERE username = ? AND password = ?;',
    SIGNUP_USER: 'INSERT INTO User(cedula, name, mail, phone, username, password, type) ' +
                 'VALUES(?, ?, ?, ?, ?, ?, ?);',
    SIGNUP_ADMIN: 'INSERT INTO User(cedula, name, mail, phone, username, password, rol, id_empleado, type) ' +
                  'VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?);',
    GET_USER: 'SELECT id, cedula, name, mail, phone, username, password, type, rol, id_empleado FROM User ' +
              'WHERE id = ?;',
    GET_USER_BY_USERNAME: 'SELECT id FROM User WHERE username = ?',
    UPDATE_USER: 'UPDATE User SET mail = ?, phone = ? WHERE id = ?',
    GET_EVENT_BY_NAME: 'SELECT id FROM Event WHERE name = ?',
    ADD_NEW_EVENT: 'INSERT INTO Event ' +
    '(name, organizador_id, descripcion, fecha, hora, ubicacion,' +
    ' capacidad, precio, estado, categoria, image_data, image_type, cupo)' +
    'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    GET_IMAGE_BY_EVENT_ID: 'SELECT image_data, image_type FROM Event WHERE id = ?',
    DELETE_EVENT: 'DELETE FROM Event WHERE id = ?',
    ADD_VERIFICATION: 'INSERT INTO Verification(user_id, event_id, code, word) ' + 
                      'VALUES(?, ?, ?, ?)',
    DELETE_VERIFICATION: 'DELETE FROM Verification WHERE id = ?',
    GET_VERIFICATION: 'SELECT id, code, word, event_id, user_id FROM Verification WHERE id = ?',
    GET_EVENTS_FOR_ADMIN : 'SELECT id, name, organizador_id, fecha, hora, ubicacion ' + 
                            'FROM Event ORDER BY fecha DESC',
    GET_EVENTS_SORTED_BY_RESERVES: 'SELECT name, capacidad, cupo, estado FROM Event ORDER BY (capacidad - cupo) DESC',
    GET_EVENTS_SORTED_BY_DATE: 'SELECT * FROM Event ORDER BY fecha DESC',
    GET_EVENT_BY_ID: 'SELECT * FROM Event WHERE id = ?',
    GET_EVENT_AND_CAPACITY: 'SELECT id, capacidad, cupo FROM Event WHERE id = ?',
    UPDATE_EVENT: `UPDATE Event SET capacidad = ?, precio = ?, ubicacion = ?, image_data = ?, image_type = ? WHERE id = ?`,
    UPDATE_EVENT_WITHOUT_IMAGE: `UPDATE Event SET capacidad = ?, precio = ?, ubicacion = ? WHERE id = ?`,
    INSERT_RESERVATION: 'INSERT INTO Reservation (event_id, user_id, amount) VALUES (?, ?, ?)',
    GET_RESERVATION: 'SELECT event_id, user_id, amount FROM Reservation WHERE event_id = ? AND user_id = ?',
    DECREASE_AVAILABILITY: 'UPDATE Event SET cupo = cupo - ? WHERE id = ?',
    SET_AS_UNAVAILABLE: 'UPDATE Event SET estado = "Agotado" WHERE id = ?',
    GET_MY_EVENTS: 'SELECT E.* FROM Event E JOIN Reservation R ON E.id = R.event_id WHERE R.user_id = ?;',
}

function getDatabaseConnection() {
    return new Database(process.env.SQLITE_CONNECTION, (err) => {
        if(err) {
            return console.log(err.message);
        }
    try {
        db.run(`USE DATABASE ${Constants.DATABASE}; ` + `PRAGMA encoding = 'UTF-8';`);
        db.run(`USE DATABASE ${Constants.DATABASE}; ` + `PRAGMA page_size = 4096;`);
        db.run(`USE DATABASE ${Constants.DATABASE}; ` + `PRAGMA cache_size = 10000;`);

    } catch (error) {
        
    }

    });
}

function preprocess(sql) {
    if (!Object.values(Queries).includes(sql)) throw new Error("Query not included in Queries enum");
    return `USE DATABASE ${Constants.DATABASE}; ` + sql;
}

/**
 * Send a query to the database
 * Returns metadata for INSERT, UPDATE, DELETE
 *  lastID: ROWID (sqlite3_last_insert_rowid)
 *  changes: CHANGES(sqlite3_changes)
 *  totalChanges: TOTAL_CHANGES (sqlite3_total_changes)
 *  finalized: FINALIZED
 * Returns rows array for SELECT
 * @param {string} sql 
 * @param {any[]} values 
 */
async function query(sql, values) {
    sql = preprocess(sql);
    const db = getDatabaseConnection();
    const result = await db.sql(sql, ...values);
    db.close();
    return result;
}

module.exports = { Queries, query }