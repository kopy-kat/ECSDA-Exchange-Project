import "./index.scss";
const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
const ec = new EC('secp256k1');

const server = "http://localhost:3042";

document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("transfer-amount").addEventListener('click', () => {
  const senderKey = document.getElementById("private-key").value;

  const tmpKey = ec.keyFromPrivate(senderKey);
  const message = "I verify this transaction";
  const msgHash = SHA256(message);
  const signature = tmpKey.sign(msgHash.toString());

  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;

  const body = JSON.stringify({
    sender, signature, amount, recipient
  });

  const request = new Request(`${server}/send`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("lookup-users").addEventListener('click', () => {
  fetch(`${server}/users`).then((response) => {
    return response.json();
  }).then(({ users }) => {
    div = document.getElementById("users");
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
    for (let i = 0; i < users.length; i++) {
      let item = document.createElement("div")
      item.textContent = (i + 1) + ": " + users[i];
      div.append(item);
    }
  });
});
