import sqlite3
from datetime import datetime

conn = sqlite3.connect('logievents.db')
cursor = conn.cursor()
#-----------------------------------------------------------------------
def CreateTable_Users(): 
    query = """CREATE TABLE User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cedula TEXT NOT NULL,
    name TEXT NOT NULL,
    mail TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('administrador', 'usuario')),
    rol TEXT,
    id_empleado TEXT UNIQUE
    );"""
    
    cursor.execute(query)

def CreateTable_Events():    
    
    #TODO: Organizador [ref. a un Usuario], imagen TEXT, Categoria TEXT, 

    query = """CREATE TABLE Event (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    descripcion TEXT,
    fecha TEXT NOT NULL,  -- formato DD/MM/AAAA
    hora TEXT NOT NULL,   -- formato HH:MM
    ubicacion TEXT NOT NULL,
    capacidad INTEGER NOT NULL,
    precio REAL NOT NULL,
    estado TEXT NOT NULL CHECK (estado IN ('Agotado', 'Activo', 'Próximamente'))
    );"""
    
    cursor.execute(query)
    return 0
    
def CreateTable_Reservation(): 
        
    query = """CREATE TABLE reservation (
    event_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (event_id) REFERENCES Event(id),
    FOREIGN KEY (user_id) REFERENCES User(id)
    );"""
    
    cursor.execute(query)
#-----------------------------------------------------------------------
def PrintUsers():
    query = """
    SELECT id, name, mail
    FROM User
    ORDER BY name ASC;
    """
    cursor.execute(query)
    eventos = cursor.fetchall()

    for evento in eventos:
        print(f"Nombre: {evento[1]} -- {evento[0]}")
        print(f"Mail: {evento[2]}")
        print("-" * 40)

def PrintEvents():
    query = """
    SELECT name, descripcion, fecha, hora, ubicacion, capacidad, precio, estado
    FROM Event
    WHERE estado = 'Activo'
    ORDER BY fecha ASC;
    """
    cursor.execute(query)
    eventos = cursor.fetchall()

    for evento in eventos:
        print(f"Nombre: {evento[0]}")
        print(f"Descripción: {evento[1]}")
        print(f"Fecha: {evento[2]} - Hora: {evento[3]}")
        print(f"Ubicación: {evento[4]}")
        print(f"Capacidad: {evento[5]}")
        print(f"Precio: ${evento[6]:.2f}")
        print(f"Estado: {evento[7]}")
        print("-" * 40)

def UsersInEvent(EventsName):
    query = """
    SELECT u.name, u.mail
    FROM reservation r
    JOIN User u ON r.user_id = u.id
    JOIN Event e ON r.event_id = e.id
    WHERE e.name = ?;
    """

    cursor.execute(query, (EventsName,))
    registros = cursor.fetchall()

    if registros:
        print(f"\nUsuarios registrados al evento '{EventsName}':\n")
        for row in registros:
            print(f"Nombre: {row[0]}")
            print(f"Correo: {row[1]}")
            print("-" * 40)
    else:
        print(f"No hay usuarios registrados al evento '{EventsName}'.")
#-----------------------------------------------------------------------
CreateTable_Users()
#CreateTable_Events()
#CreateTable_Reservation()

# usuarios = [
#     ("Ana López", "ana@gmail.com", "88889999","usuario"),
#     ("Carlos Rojas", "carlos@gmail.com", "88880000", "usuario"),
#     ("Lucía Méndez", "lucia@gmail.com", "88881111", "administrador")
# ]
# cursor.executemany("""
# INSERT INTO User (name, mail, password, rol)
# VALUES (?, ?, ?, ?)
# """, usuarios)

# eventos = [
#     ("Expo Tecnología 2025", "Exposición de innovación", "2025-05-01", "10:00", "Centro de Convenciones", 100, 25.00, "Activo"),
#     ("Concierto Primavera", "Música en vivo con bandas locales", "2025-04-20", "18:30", "Parque Central", 300, 15.00, "Activo"),
#     ("Feria del Libro", "Presentación de editoriales y autores", "2025-06-10", "09:00", "Biblioteca Nacional", 200, 0.00, "Próximamente")
# ]
# cursor.executemany("""
# INSERT INTO Event (name, descripcion, fecha, hora, ubicacion, capacidad, precio, estado)
# VALUES (?, ?, ?, ?, ?, ?, ?, ?)
# """, eventos)

# reservas = [
#     (1, 1),
#     (2, 1),
#     (3, 2),
# ]
# cursor.executemany("""
# INSERT INTO reservation (event_id, user_id)
# VALUES (?, ?)
# """, reservas)

PrintUsers()
# PrintEvents()
# UsersInEvent("Feria del Libro")

conn.commit()

conn.close()