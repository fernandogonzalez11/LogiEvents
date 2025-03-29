const botResponses = {
    option1: "This is the detailed answer for Option 1. The solution involves...",
    option2: "For Option 2, you'll need to consider these factors...",
    option3: "Option 3 requires special handling. Here's why...",
    default: "I'm not sure how to answer that question. Please try another option."
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
      typingCell.textContent = 'Thinking' + '.'.repeat(dots % 4);
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
