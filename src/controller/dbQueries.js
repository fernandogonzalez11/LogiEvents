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
    ADD_NEW_EVENT: 'INSERT INTO Event (name, organizador_id, descripcion, fecha, hora, ubicacion, capacidad, precio, estado, categoria, imageFile, cupo) ' + 
                'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    DELETE_EVENT: 'DELETE FROM Event WHERE id = ?',
    ADD_VERIFICATION: 'INSERT INTO Verification(user_id, event_id, code, word) ' + 
                      'VALUES(?, ?, ?, ?)',
    DELETE_VERIFICATION: 'DELETE FROM Verification WHERE id = ?',
}

const db = new Database(process.env.SQLITE_CONNECTION, (err) => {
    if(err) {
        return console.log(err.message);
    }
    console.log("Connected to database!");
});

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
    return await db.sql(sql, ...values);
}

module.exports = { Queries, query }