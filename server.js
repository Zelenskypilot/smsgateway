const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// API details
const BASE_URL = 'https://api.textbee.dev/api/v1';
const API_KEY = '22233e1c-2993-4215-b610-2890bee18af0';
const DEVICE_ID = '66b5ff663d552f1613992a2d';

// Serve the HTML form
app.get('/', (req, res) => {
    res.send(`
        <form action="/check-message" method="post">
            <label for="searchText">Enter text to search in received messages:</label><br>
            <input type="text" id="searchText" name="searchText" required><br><br>
            <button type="submit">Check Message</button>
        </form>
    `);
});

// Endpoint to check for a specific message
app.post('/check-message', async (req, res) => {
    const { searchText } = req.body;

    try {
        // Fetch all messages from Textbee
        const response = await axios.get(`${BASE_URL}/gateway/devices/${DEVICE_ID}/messages`, {
            headers: {
                'x-api-key': API_KEY,
            },
        });

        console.log('Received Messages:', response.data); // Debugging: log all received messages

        // Check if any message contains the search text
        const foundMessage = response.data.messages.find(message => message.message.includes(searchText));

        if (foundMessage) {
            res.send(`
                <h1>Message Found!</h1>
                <p>The text "${searchText}" was found in the received messages.</p>
                <p>Message: ${foundMessage.message}</p>
                <a href="/">Check Another Message</a>
            `);
        } else {
            res.send(`
                <h1>Message Not Found</h1>
                <p>The text "${searchText}" was not found in any received messages.</p>
                <a href="/">Try Again</a>
            `);
        }
    } catch (error) {
        console.error('Error checking messages:', error); // Log the error for debugging
        res.send(`
            <h1>Error Occurred</h1>
            <p>There was an error checking messages: ${error.message}</p>
            <a href="/">Try Again</a>
        `);
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
