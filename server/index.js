const express = require('express');
const app = express();
const cors = require('cors');
const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
const ec = new EC('secp256k1');
const port = 3042;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const balances = {};
const accounts = {};

for (let i = 0; i < 3; i++) {
  let generatedKey = ec.genKeyPair();
  balances[generatedKey.getPublic().encode('hex')] = 100;
  accounts[generatedKey.getPublic().encode('hex')] = generatedKey.getPrivate().toString(16);
};

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.get('/users', (req, res) => {
  res.send({ users: Object.keys(accounts) });
});

app.post('/send', (req, res) => {
  const {sender, signature, recipient, amount} = req.body;
  const tmpKey = ec.keyFromPublic(sender, 'hex');
  const msg = "I verify this transaction";
  const msgHash = SHA256(msg).toString();

  if (tmpKey.verify(msgHash, signature)) {
    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + +amount;
    res.send({ balance: balances[sender] });
  };
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  for (let i = 0; i < Object.keys(balances).length; i++) {
    if (i === 0) {
      console.log('\n Available accounts \n');
    }
    let pubKey = Object.keys(balances)[i];
    let balance = balances[Object.keys(balances)[i]];
    console.log(`${i + 1}: ${pubKey} (${balance}ETH)`);
  };
  for (let i = 0; i < Object.keys(balances).length; i++) {
    if (i === 0) {
      console.log('\n Private keys\n');
    }
    let pubKey = Object.keys(balances)[i];
    let privKey = accounts[Object.keys(balances)[i]];
    console.log(`${i + 1}: ${privKey}`);
  };
});
