const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();

// Middleware to parse URL-encoded data from the form
app.use(express.urlencoded({ extended: true }));

// Serve the static HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API details - Hardcoded directly into the script
const BASE_URL = 'https://api.textbee.dev/api/v1';
const API_KEY = '22233e1c-2993-4215-b610-2890bee18af0';
const DEVICE_ID = '66b5ff663d552f1613992a2d';

// Endpoint to send SMS
app.post('/send-sms', async (req, res) => {
  const { phoneNumber, message } = req.body;

  // Split the phone numbers by comma and trim any whitespace
  const phoneNumbers = phoneNumber.split(',').map(num => num.trim());

  try {
    const response = await axios.post(`${BASE_URL}/gateway/devices/${DEVICE_ID}/sendSMS`, {
      recipients: phoneNumbers,
      message: message,
    }, {
      headers: {
        'x-api-key': API_KEY,
      },
    });

    res.send(`
      <h1>SMS Sent Successfully!</h1>
      <p>Phone Numbers: ${phoneNumbers.join(', ')}</p>
      <p>Message: ${message}</p>
      <a href="/">Send another SMS</a>
    `);
  } catch (error) {
    res.send(`
      <h1>Failed to Send SMS</h1>
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
