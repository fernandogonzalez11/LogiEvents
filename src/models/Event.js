class Event {
    constructor({
        id,
        name,
        organizerId,
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
        availableSlots,
    }) {
        this.id = id;
        this.name = name;
        this.organizerId = organizerId; 
        this.description = description;
        this.date = date; 
        this.time = time; 
        this.location = location;
        this.capacity = parseInt(capacity);
        this.price = parseFloat(price);
        this.status = status; 
        this.category = category;
        this.imageData = imageData; 
        this.imageType = imageType; 
        this.availableSlots = parseInt(availableSlots || capacity);
    }


    validate() {
        if (!this.name || !this.date || !this.location || !this.capacity) {
            throw new Error("Faltan campos requeridos: nombre, fecha, ubicación o capacidad");
        }
        if (this.availableSlots > this.capacity) {
            throw new Error("Los cupos disponibles no pueden superar la capacidad");
        }
    }
}

module.exports = { Event }