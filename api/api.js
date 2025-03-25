const express = require('express');
const path = require('path');

const app = express();

// Set the "html" folder as the location for templates/static files
app.use(express.static(path.join(__dirname, 'html')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'login', 'index.html'));
});

app.get('/test/', (req, res) => {
    res.send('works');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
