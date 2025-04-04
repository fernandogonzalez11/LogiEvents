class Reservation {
    constructor({
        id,
        eventId,
        userId,
        attendeeName,
        attendeeEmail,
        tickets,
        reservationDate,
        status = 'pending', // 'pending', 'confirmed', 'cancelled'
    }) {
        this.id = id;
        this.eventId = eventId;
        this.userId = userId; // ID del usuario que reserva
        this.attendeeName = attendeeName;
        this.attendeeEmail = attendeeEmail;
        this.tickets = parseInt(tickets);
        this.reservationDate = reservationDate || new Date().toISOString();
        this.status = status;
    }

    validate() {
        if (!this.eventId || !this.userId || !this.tickets || this.tickets < 1) {
            throw new Error("Datos de reserva inválidos: faltan evento, usuario o número de entradas");
        }
    }
}

module.exports = {Reservation}