const express = require('express');
const app = express();
const PORT = 3000;
let messages = []; // Stocker les messages

const cors = require('cors');
app.use(cors());
app.use(express.json()); // Middleware pour parser le JSON

// Route pour recevoir et stocker un message
app.post('/envoyer', (req, res) => {
  const message = req.body.message;
  if (message) {
    messages.push(message);
    res.status(200).send({ success: true });
  } else {
    res.status(400).send({ success: false, message: 'Aucun message fourni' });
  }
});

// Route pour envoyer les messages non lus
app.get('/recevoir', (req, res) => {
  if (messages.length > 0) {
    res.status(200).send(messages);
    // Vider la liste après l'envoi
    messages = [];
  } else {
    res.status(200).send([]);
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
