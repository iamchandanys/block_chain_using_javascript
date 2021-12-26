const SHA256 = require('crypto-js/sha256');

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transactions {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('You cannot sign transactions for other wallets');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');

        this.signature = sig.toDER('hex');
    }

    isValid() {
        if (this.fromAddress === null)
            return true;

        if (!this.signature || this.signature.length === 0) {
            throw new Error("No signature in this transaction");
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block {
    constructor(timeStamp, transactions, previousHash = '') {
        this.timeStamp = timeStamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.createHash();
        this.nonce = 0;
    }

    createHash() {
        return SHA256(this.timeStamp + JSON.stringify(this.transactions) + this.previousHash + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.createHash();
        }

        console.log("Block mined successfully. " + this.hash);
    }

    hasValidTransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }

        return true;
    }
}

class BlockChain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.DefautAddress = "CYS_Coin_26011996";
        this.miningReward = 100;
    }

    createGenesisBlock() {
        return new Block(Date.now(), 'Genesis Block', '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress)
            throw new Error('Transaction must include from and to address.');

        if (transaction.isValid())
            throw new Error('Cannot add invalid transaction');

        this.pendingTransactions.push(transaction);
    }

    minePendingTransactions(miningRewardAddress) {

        console.log("Mining pending transaction started...Miner Address - " + miningRewardAddress);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log("Mining pending transaction successfully...Miner Address - " + miningRewardAddress);

        this.chain.push(block);

        this.pendingTransactions = [new Transactions(this.DefautAddress, miningRewardAddress, this.miningReward)];

    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress == address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    isChainVaild() {

        //i = 1 because we don't need to loop through Genesis Block.

        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (!currentBlock.hasValidTransactions()) {
                return false;
            }

            if (currentBlock.hash !== currentBlock.createHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

module.exports.BlockChain = BlockChain;
module.exports.Transactions = Transactions;