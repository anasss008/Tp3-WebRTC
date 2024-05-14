function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const id = generateRandomNumber(1, 10);
function envoyerMessage() {
  const message = document.getElementById('messageInput').value;
  const xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://127.0.0.1:3000/envoyer', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({ message: 'Client ' + id + ' : ' + message }));

  xhr.onload = function () {
    if (xhr.status === 200) {
      console.log('Message envoyé');
    } else {
      console.error("Erreur lors de l'envoi du message");
    }
  };
  messageInput.value = '';
}

function recevoirNouveauMessage() {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://127.0.0.1:3000/recevoir', true);
  xhr.onload = function () {
    if (xhr.status === 200) {
      const messages = JSON.parse(xhr.responseText);
      const messagesDiv = document.getElementById('messages');
      messages.forEach((msg) => {
        const p = document.createElement('p');
        p.textContent = msg;
        messagesDiv.appendChild(p);
      });
    } else {
      console.error('Erreur lors de la réception des messages');
    }
  };
  xhr.send();
}
