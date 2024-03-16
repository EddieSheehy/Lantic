const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

const app = express();

// Automatically allow cross-origin requests
app.use(cors({origin: true}));

app.post("/echoString", (req, res) => {
  const inputString = req.body.message;
  console.log("Received message:", inputString);

  // Return the input string with lowercase conversion
  res.json({message: inputString.toLowerCase()});
});

exports.echoString = functions.https.onRequest(app);
