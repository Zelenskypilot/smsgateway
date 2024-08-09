const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let messages = [];

// Serve the main HTML form
app.get('/', (req, res) => {
    res.send(`
        <h1>Send and Receive SMS Simulation</h1>
        <div class="form-container">
            <form action="/send-message" method="post">
                <label for="messageText">Enter your message:</label><br>
                <input type="text" id="messageText" name="messageText" required><br><br>
                <button type="submit">Send Message</button>
            </form>
        </div>
        
        <div class="messages-container">
            <h2>Received Messages:</h2>
            <div id="messageDiv">
                ${messages.map(msg => `<p>${msg}</p>`).join('')}
            </div>
        </div>
        
        <div class="form-container">
            <form action="/check-message" method="post">
                <label for="searchText">Enter text to search in received messages:</label><br>
                <input type="text" id="searchText" name="searchText" required><br><br>
                <button type="submit">Check Message</button>
            </form>
        </div>
    `);
});

// Endpoint to send a message
app.post('/send-message', (req, res) => {
    const { messageText } = req.body;
    messages.push(messageText);
    res.redirect('/');
});

// Endpoint to check if the message exists
app.post('/check-message', (req, res) => {
    const { searchText } = req.body;
    const foundMessage = messages.find(msg => msg.includes(searchText));

    if (foundMessage) {
        res.send(`
            <h1>Message Found!</h1>
            <p>The text "${searchText}" was found in the received messages.</p>
            <p>Message: ${foundMessage}</p>
            <a href="/">Check Another Message</a>
        `);
    } else {
        res.send(`
            <h1>Message Not Found</h1>
            <p>The text "${searchText}" was not found in any received messages.</p>
            <a href="/">Try Again</a>
        `);
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
