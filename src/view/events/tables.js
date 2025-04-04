window.onload = async () =>{
    events = await getEventsOrdered();
    setEventsTable(events);

    events = await getMyEventsOrdered();
    setMyEventsTable(events);

    await checkForRole();
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

async function getMyEventsOrdered() {
    
    fetch('/api/getMyEventsToDisplay')
        .then(response => response.text()) 
        .then(html => {
        console.log(html); 
    })
    .catch(error => console.error('Error:', error));

    const response = await fetch('/api/getMyEventsToDisplay');
    const events = await response.json();

    return events;
}

function setMyEventsTable(events) {
    const table = document.getElementById("stats-table-my-events");
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

async function checkForRole(){
    const response = await fetch("/api/current_user")
    const user = await response.json();
    console.log(user);
    console.log(user.type!="administrador");
    if(user.type == "administrador") {
        const adminButton = document.getElementById("adminbutton");
        adminButton.style.display="flex";
    }
}