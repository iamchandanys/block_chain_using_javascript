const { BlockChain, Transactions } = require('./block-chain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('f80352b55249eef9a48737452734041e80c47ec1c2d0cb514ea87a2e902bcd89');
const myWalletAddress = myKey.getPublic('hex');

let blockChain = new BlockChain();

const tx1 = new Transactions(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);

blockChain.addTransaction(tx1);

blockChain.minePendingTransactions(myWalletAddress);

const myBalance = blockChain.getBalanceOfAddress(myWalletAddress);

console.log("My Balance: " + myBalance);
