
window.onload = async () =>{
    events = await getEventsOrdered();
    setEventsTable(events);
    initializeChart();
    updateChart(countEventsByState(events));

}
// Chart configuration
const chartConfig = {
    categories: [
        { label: "Activos", color: "#2fa849" },
        { label: "Agotados", color: "#9d5451" },
        { label: "Próximos", color: "#68b7cd" }
    ],
    values: [0, 0, 0],
    maxHeight: 300
};

async function getEventsOrdered() {
    
    fetch('/api/getEventsByReserves')
        .then(response => response.text()) // Parse as text instead of .json()
        .then(html => {
        console.log(html); 
    })
    .catch(error => console.error('Error:', error));

    const response = await fetch('/api/getEventsByReserves');
    const events = await response.json();

    return events;
}

function setEventsTable(events){
    const table = document.getElementById("stats-table");
    table.innerHTML = "";
    events.forEach(event => {
        let row = table.insertRow();
        row.insertCell(0).innerText = event.name;
        row.insertCell(1).innerText = event.capacidad;
        row.insertCell(2).innerText = Number(event.capacidad)-Number(event.cupo);
        row.insertCell(3).innerText = event.estado;
    });

}

function countEventsByState(events){
    var activos=0;
    var agotados=0;
    var proximos=0;
    events.forEach(event => {
        if (event.estado=="Activo") activos++; 
        if (event.estado=="Agotado") agotados++; 
        if (event.estado=="Próximamente") proximos++; 
    })
    return [activos,agotados,proximos]
}
// More robust element finding with error recovery
function getChartElements() {
    const elements = {
        chartBars: document.querySelector('.chart-bars'),
        chartValues: document.querySelector('.chart-values')
    };
    
    if (!elements.chartBars || !elements.chartValues) {
        console.error('Chart elements missing! Verify these classes exist:',
            '\n- .chart-bars',
            '\n- .chart-values'
        );
        return null;
    }
    return elements;
}

function initChart() {
    const elements = getChartElements();
    if (!elements) return;
    
    const { chartBars, chartValues } = elements;
    
    // Clear existing
    chartBars.innerHTML = '';
    chartValues.innerHTML = '';
    
    const maxValue = Math.max(...chartConfig.values);
    
    chartConfig.categories.forEach((category, index) => {
        const value = chartConfig.values[index];
        const height = (value / maxValue) * chartConfig.maxHeight;
        
        // Create bar
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = `${height}px`;
        bar.style.backgroundColor = category.color;
        chartBars.appendChild(bar);
        
        // Create value
        const valueElement = document.createElement('div');
        valueElement.className = 'chart-value';
        valueElement.textContent = value;
        chartValues.appendChild(valueElement);
    });
}

function updateChart(newValues) {
    if (!Array.isArray(newValues) || newValues.length !== chartConfig.categories.length) {
        console.error(`Expected ${chartConfig.categories.length} values, got`, newValues);
        return;
    }
    chartConfig.values = newValues;
    initChart();
}

// More reliable initialization
function initializeChart() {
    if (document.readyState === 'complete') {
        initChart();
    } else {
        document.addEventListener('DOMContentLoaded', initChart);
        // Fallback timeout in case DOMContentLoaded fails
        setTimeout(initChart, 500);
    }
}


