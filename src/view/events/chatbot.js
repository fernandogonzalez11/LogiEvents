const botResponses = {
    option1: "Para cambiar la información de tu usuario, simplemente accede al icono del perfil en esta misma página y cambia los campos que desees con información válida.",
    option2: "Para reservar espacios en un evento, haz click sobre el nombre de un evento en esta misma página, posteriormente ingresa a \"Reservar Entrada\" y llena el formulario con la información de la reserva que desees realizar.",
    option3: "Esto es una función reservada para administradores. Ingresa al panel de administrador y dirígete al botón de \"Crear Evento\", desde ahí puedes rellenar la información que aplica para el evento que desees agragar.",
    option4: "Esto es una función reservada para administradores. Ingresa al panel de administrador y busca el evento que quieras modificar. Al seleccionar el símbolo del lápiz será trasladado a la página con información del evento y puede modificar la información que desee.",
    option5: "Esto es una función reservada para administradores. Ingresa al panel de administrador y busca el evento que quieras eliminar. Debe presionar el símbolo del basurero.\n Se desplegará una solicitud por un correo electrónico de validación. Ingrese su dirección de correo y espere que le llegue un correo de nosotros con el código de verificación que debe ingresar.\n Adicionalmente, si el evento está agotado, se le pedirá un proceso similar con su número de teléfono.",
    
    
    default: "No estoy seguro cómo responder esa pregunta. Por favor intenta otra opción."
  };




// Function to highlight non-empty cells in the chatbot table
function highlightNonEmptyChatbotCells() {
    const cells = document.querySelectorAll('.tabla-mensajes td');
    
    cells.forEach(cell => {
      // Check if cell has visible content (ignoring whitespace)
      if (cell.textContent.trim() !== '') {
        cell.style.backgroundColor = '#8BBAE0'; // Light blue background
        cell.style.borderRadius = '500px';
      } else {
        // Reset empty cells
        cell.style.backgroundColor = '';
      }
    });
}
  
  // Run this whenever new messages are added to the table
  highlightNonEmptyChatbotCells();

  // Example function to add new messages
function addChatbotMessage(sender, message) {
    const table = document.querySelector('.tabla-mensajes');
    const newRow = table.insertRow();
    
    newRow.insertCell(0).textContent = sender;
    newRow.insertCell(1).textContent = message;
    
    // Re-apply highlighting
    highlightNonEmptyChatbotCells();
}
async function showTypingIndicator() {
    const table = document.querySelector('.tabla-mensajes');
    const typingRow = table.insertRow();
    const typingCell = typingRow.insertCell(0);
    
    let dots = 0;
    const interval = setInterval(() => {
      typingCell.textContent = 'Pensando' + '.'.repeat(dots % 4);
      dots++;
    }, 300);
    
    return {
      stop: () => {
        clearInterval(interval);
        table.deleteRow(typingRow.rowIndex);
      }
    };
  }
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function scrollToBottom() {
    const container = document.querySelector('.chatbot-messages-container');
    container.scrollTop = container.scrollHeight;
  }

document.querySelector('.chatbot-send-button').addEventListener('click', sendChatbotQuestion);
async function sendChatbotQuestion() {
    const select = document.getElementById('chatbot-prompt');
    const selectedValue = select.value;
    
    if (!selectedValue) return;
    

    addChatbotMessage("", select.options[select.selectedIndex].text);
    
    const typing = await showTypingIndicator();
    
    await sleep(500 + Math.random() * 1000);
    typing.stop();
    
    const response = botResponses[selectedValue] || botResponses.default;
    addChatbotMessage(response,"" );
    
    select.value = "";
    scrollToBottom();
  }
    //Allow Enter key to send
document.getElementById('chatbot-prompt').addEventListener('keypress', (e) => {
if (e.key === 'Enter') sendChatbotQuestion();
});
  

  addChatbotMessage('¿En qué lo puedo ayudar hoy?', '');
