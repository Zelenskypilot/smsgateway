const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

const app = express();

// Middleware to parse URL-encoded data from the form
app.use(express.urlencoded({ extended: true }));

// Serve the static HTML file
app.use(express.static('public'));

// Use environment variables
const BASE_URL = process.env.BASE_URL;
const API_KEY = process.env.API_KEY;
const DEVICE_ID = process.env.DEVICE_ID;

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
