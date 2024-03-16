const functions = require('firebase-functions');

exports.echoString = functions.https.onRequest((req, res) => {
  // Check for valid request method (e.g., POST)
  if (req.method !== 'POST') {
    return res.status(400).send('Please send a POST request');
  }

  // Extract text content from request body
  const text = req.body.text;

  // Validate text (optional)

  // Return the received text
  return res.status(200).send(text);
});