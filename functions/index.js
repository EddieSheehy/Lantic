/* eslint-disable */
const functions = require("firebase-functions");
const fastify = require("fastify")({
  logger: true
});

// Register CORS plugin
fastify.register(require("fastify-cors"), { 
  origin: true // Reflect the request origin, or consider a specific origin to enhance security
});
// eslint-disable-next-line
fastify.post("/echoString", async (request, reply) => {
  const inputString = request.body.message;
  console.log("Received message:", inputString);

  // Return the input string with lowercase conversion
  reply.send({ message: inputString.toLowerCase() });
});

// Adapt Fastify for Firebase Functions
const startFastify = (req, res) => {
  fastify.ready(err => {
    if (err) throw err;
    fastify.server.emit("request", req, res);
  });
};

exports.echoString = functions.https.onRequest((req, res) => {
  startFastify(req, res);
});
