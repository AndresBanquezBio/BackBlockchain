const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(data){
        this.hash = null;
        this.height = 0;
        this.body = Buffer.from(JSON.stringify(data).toString('hex'));
        this.time = 0;
        this.previusBlockHash = '';
    }
    validate(){
        const self = this;
        return new Promise((resolve, reject) => {
            let currentHash = self.hash;

            self.hash = SHA256(JSON.stringify({ ...self, hash: null})).toString();

            if (currentHash !== self.hash) {
                return resolve(false);
            }

            resolve(true)
        });
    }
    getBlockdata() {
        const self = this;
        return new Promise((resolve, reject) => {
            let encodeddata = self.body;
            let decodeddata = hex2ascii(encodeddata);
            let dataObject = JSON.parse(decodeddata);

            if (dataObject === 'Genesis Block'){
                reject(new Error("This is the genesis block"))
            }

            resolve(dataObject)
        })
    }

    toString() {
        const { hash, height, body, time, previusBlockHash } = this;
        return `Block -
            hash: ${hash}
            height: ${height}
            body: ${body}
            time: ${time}
            previusBlockHash: ${previusBlockHash}
            -----------------------------------`;
    }

}

module.exports = Block;