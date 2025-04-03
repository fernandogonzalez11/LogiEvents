window.onload = async () =>{
    events = await getEventsOrdered();
    setEventsTable(events);
}

async function getEventsOrdered() {
    
    fetch('/api/getEventsToDisplay')
        .then(response => response.text()) 
        .then(html => {
        console.log(html); 
    })
    .catch(error => console.error('Error:', error));

    const response = await fetch('/api/getEventsToDisplay');
    const events = await response.json();

    return events;
}

function setEventsTable(events) {
    const table = document.getElementById("stats-table-events");
    table.innerHTML = "";
    
    events.forEach(event => {
        let row = table.insertRow();
        
        const nameCell = row.insertCell(0);
        nameCell.innerHTML = `<a href="javascript:void(0)" class="event-link">${event.name}</a>`;
        nameCell.addEventListener('click', () => {
            sessionStorage.setItem('currentEvent', JSON.stringify(event));
            window.location.href = '/event-detail';
        });
        
        row.dataset.event = JSON.stringify(event);

        row.insertCell(1).innerText = event.capacidad;
        
        row.insertCell(2).innerText = event.fecha;
        
        const statusCell = row.insertCell(3);
        const icon = document.createElement('i');
        icon.className = 'status-icon';
        
        if (event.estado === 'Activo') {
            icon.innerHTML = '✓'; 
            icon.style.color = 'green';
        } else {
            icon.innerHTML = '✗';
            icon.style.color = 'red';
        }
        
        statusCell.appendChild(icon);
    });
}