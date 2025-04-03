-- User
CREATE TABLE User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cedula TEXT NOT NULL,
    name TEXT NOT NULL,
    mail TEXT NOT NULL,
    phone TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('administrador', 'usuario')),
    rol TEXT,
    id_empleado TEXT
);

-- Event
CREATE TABLE Event (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    organizador_id TEXT NOT NULL,
    descripcion TEXT,
    fecha TEXT NOT NULL,  -- formato DD/MM/AAAA
    hora TEXT NOT NULL,   -- formato HH:MM
    ubicacion TEXT NOT NULL,
    capacidad INTEGER NOT NULL,
    precio REAL NOT NULL,
    estado TEXT NOT NULL,
    categoria TEXT NOT NULL,
    image_data BLOB NOT NULL,
    image_type TEXT NOT NULL,
    cupo INTEGER NOT NULL,
    CONSTRAINT Verification_estado CHECK(estado IN ('Agotado', 'Activo', 'Próximamente')),
    CONSTRAINT Verification_event_id_User_id_fk FOREIGN KEY (organizador_id) REFERENCES User(id_empleado)
);

-- Reservation
CREATE TABLE Reservation (
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (event_id) REFERENCES Event(id),
    FOREIGN KEY (user_id) REFERENCES User(id)
);

-- Verifications
CREATE TABLE Verification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    code INTEGER,
    word TEXT,
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (event_id) REFERENCES Event(id)
);