const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();

// Middleware to parse URL-encoded data and JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Store received SMS messages
let receivedMessages = [];

// Endpoint to receive SMS from Textbee
app.post('/receive-sms', (req, res) => {
  const { message } = req.body;

  // Log the received message
  console.log(`Received SMS: ${message}`);

  const referenceNumber = extractReferenceNumber(message);

  // Log the extracted reference number
  console.log(`Extracted Reference Number: ${referenceNumber}`);

  if (referenceNumber) {
    receivedMessages.push({ referenceNumber, message });
    console.log(`Stored SMS with reference number: ${referenceNumber}`);
  } else {
    console.log('No valid reference number found in the SMS.');
  }

  res.sendStatus(200); // Respond with 200 OK
});

// Extract reference number (10-digit) from the SMS message
function extractReferenceNumber(message) {
  const match = message.match(/Utambulisho wa muamala: (\d{10})/);
  return match ? match[1] : null;
}

// Serve the form for users to enter reference number and username
app.get('/verify-transaction', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'verify.html'));
});

// Endpoint to verify the transaction reference number
app.post('/verify-transaction', async (req, res) => {
  const { referenceNumber, username } = req.body;

  // Log the reference number entered by the user
  console.log(`User entered Reference Number: ${referenceNumber}`);

  const matchedMessage = receivedMessages.find(msg => msg.referenceNumber === referenceNumber.trim());

  if (matchedMessage) {
    // Log the matched message
    console.log(`Matched Message: ${matchedMessage.message}`);

    // Add funds to the user's account using SMM panel API
    try {
      const response = await axios.get(`https://socpanel.com/privateApi/incrementUserBalance`, {
        params: {
          login: username,
          amount: 100, // You can parse the amount from the message if needed
          token: 'eHX9Sb58cxKp2JZtaFP41HfeqH9PxrIxSacknzAThhsSFZirkN0SXHKVu2gC',
        },
      });

      if (response.data.ok) {
        res.send(`
          <h1>Transaction Verified!</h1>
          <p>Funds added to user ${username}'s account.</p>
          <a href="/verify-transaction">Verify another transaction</a>
        `);
      } else {
        res.send(`
          <h1>Failed to Add Funds</h1>
          <p>Please try again later.</p>
          <a href="/verify-transaction">Try Again</a>
        `);
      }
    } catch (error) {
      res.send(`
        <h1>Error Processing Transaction</h1>
        <p>${error.message}</p>
        <a href="/verify-transaction">Try Again</a>
      `);
    }
  } else {
    console.log('No matching transaction found.');
    res.send(`
      <h1>Transaction Not Found</h1>
      <p>The reference number ${referenceNumber} does not match any incoming transactions.</p>
      <a href="/verify-transaction">Try Again</a>
    `);
  }
});

// Serve static files (like HTML, CSS, JS) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
