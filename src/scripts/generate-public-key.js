// generate-public-key.js
const { Keypair } = require('@solana/web3.js');
const fs = require('fs');
const { solanaConfig } = require('@src/config');

// Generate a Solana keypair
const keypair = Keypair.generate();

// Save the public key to the configured JSON file
fs.writeFileSync(solanaConfig.generatedPublicKeyPath, JSON.stringify(keypair.publicKey.toBase58()));

console.log('Generated Public Key:', keypair.publicKey.toBase58());
