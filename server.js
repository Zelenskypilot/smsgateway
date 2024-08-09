const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();

// Middleware to parse URL-encoded data from the form
app.use(express.urlencoded({ extended: true }));

// Serve the static HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'verify.html'));
});

// API details
const BASE_URL = 'https://api.textbee.dev/api/v1';
const API_KEY = '22233e1c-2993-4215-b610-2890bee18af0';
const DEVICE_ID = '66b5ff663d552f1613992a2d';

// Endpoint to verify transaction
app.post('/verify-transaction', async (req, res) => {
    const { referenceNumber, username } = req.body;

    try {
        // Fetch all messages from Textbee
        const response = await axios.get(`${BASE_URL}/gateway/devices/${DEVICE_ID}/messages`, {
            headers: {
                'x-api-key': API_KEY,
            },
        });

        console.log('API Response:', response.data); // Log the response data for debugging

        // Check if any message contains the reference number
        const transactionMessage = response.data.find(message => message.includes(referenceNumber));

        if (transactionMessage) {
            // If the reference number matches, call the SMM Panel API to add funds
            await axios.post(`https://socpanel.com/privateApi/incrementUserBalance`, {
                user_id: username,
                amount: 100, // Or whatever amount you are adding
                token: 'eHX9Sb58cxKp2JZtaFP41HfeqH9PxrIxSacknzAThhsSFZirkN0SXHKVu2gC',
            });

            res.send(`
                <h1>Transaction Verified Successfully!</h1>
                <p>Reference Number: ${referenceNumber}</p>
                <p>Username: ${username}</p>
                <a href="/">Go back</a>
            `);
        } else {
            res.send(`
                <h1>Transaction Not Found</h1>
                <p>The reference number does not match any incoming transaction.</p>
                <a href="/">Try Again</a>
            `);
        }
    } catch (error) {
        console.error('Verification Error:', error); // Log the error for debugging

        res.send(`
            <h1>Failed to Verify Transaction</h1>
            <p>${error.message}</p>
            <a href="/">Try Again</a>
        `);
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
