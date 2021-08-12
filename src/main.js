const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(index, timeStamp, data, previousHash = '') {
        this.index = index;
        this.timeStamp = timeStamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.createHash();
    }

    createHash() {
        return SHA256(this.index + this.timeStamp + JSON.stringify(this.data) + this.previousHash).toString();
    }
}

class BlockChain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        return new Block(0, '10/08/2021', 'Genesis Block', '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addNewBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.createHash();
        this.chain.push(newBlock);
    }

    isChainVaild() {

        //i = 1 because we don't need to loop through Genesis Block.

        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

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

let blockChain = new BlockChain();
blockChain.addNewBlock(new Block(1, '11/08/2021', { amount: 100 }));
blockChain.addNewBlock(new Block(2, '12/08/2021', { amount: 200 }));

console.log(JSON.stringify(blockChain, null, 4));
console.log('Is block chain valid? ' + blockChain.isChainVaild());