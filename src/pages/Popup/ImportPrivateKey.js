import React, { useState } from 'react';
import './ImportPrivateKey.css';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const generateSolanaKeypair = () => {
  const keypair = Keypair.generate();
  const pubKey = keypair.publicKey.toBase58();
  const privateKey = bs58.encode(keypair.secretKey);
  return { pubKey, privateKey, keypair };
};

const ImportPrivateKey = ({ onImport }) => {
  const [privateKey, setPrivateKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleImport = async () => {
    if (privateKey.trim() === '') {
      alert('Please enter your private key.');
      return;
    }
    try {
      const decodedPrivateKey = bs58.decode(privateKey);
      console.log('Decoded Private Key:', decodedPrivateKey);

      if (decodedPrivateKey.length !== 64) {
        throw new Error('Invalid private key length');
      }

      const importedKeypair = Keypair.fromSecretKey(decodedPrivateKey);
      const pubKey = importedKeypair.publicKey.toBase58();
      const privateKeyEncoded = bs58.encode(importedKeypair.secretKey);

      // Store the imported keypair in local storage
      await chrome.storage.local.set({ 'pubKey': pubKey });
      await chrome.storage.local.set({ 'privateKey': privateKeyEncoded });

      console.log('Imported Keypair:', { pubKey, privateKey: privateKeyEncoded });
      onImport({ pubKey, privateKey: privateKeyEncoded });

      // Generate 4 additional addresses and store them
      const newKeypairs = [];
      for (let i = 0; i < 4; i++) {
        const newKeypair = generateSolanaKeypair();
        newKeypairs.push(newKeypair);
        console.log(`Generated address ${i + 1}:`, newKeypair.pubKey);

        // Store new keypairs in local storage
        await chrome.storage.local.set({
          [`pubKey${i + 2}`]: newKeypair.pubKey, // Using i+2 to ensure the index starts from 2
          [`privateKey${i + 2}`]: newKeypair.privateKey
        });
      }

      // After addresses are created, send a message to the background script to start balance check
      chrome.runtime.sendMessage({
        message: 'StartBalanceCheck',
        pubKey,
        privateKey: privateKeyEncoded
      });

    } catch (error) {
      console.error('Error importing private key:', error);
      setErrorMessage('Invalid private key.');
    }
  };

  return (
    <div className="import-private-key-container">
      <h1 className="title">Import a Private Key</h1>
      <textarea
        className="private-key-input"
        placeholder="Private Key"
        value={privateKey}
        onChange={(e) => setPrivateKey(e.target.value)}
      />
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <button onClick={handleImport} className="import-button">Import Address</button>
    </div>
  );
};

export default ImportPrivateKey;
