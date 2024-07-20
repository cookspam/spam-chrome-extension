import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Buffer } from 'buffer';
import { Keypair } from '@solana/web3.js'; // Import Keypair from Solana web3 library
import bs58 from 'bs58'; // Import bs58 for encoding the private key
import './ImportRecoveryPhrase.css';

const { toUtf8Bytes, pbkdf2 } = ethers;

class Mnemonic {
  constructor(phrase, password = '') {
    this.phrase = phrase;
    this.password = password;
  }

  async computeSeed() {
    const salt = toUtf8Bytes('mnemonic' + this.password, 'NFKD');
    const seed = await pbkdf2(
      toUtf8Bytes(this.phrase, 'NFKD'),
      salt,
      2048,
      64,
      'sha512'
    );
    return Buffer.from(seed).toString('hex'); // Convert seed to hex string
  }
}

const ImportRecoveryPhrase = ({ onImport }) => {
  const [recoveryPhrase, setRecoveryPhrase] = useState(Array(12).fill(''));
  const [is24Words, setIs24Words] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (text, index) => {
    const newPhrase = [...recoveryPhrase];
    newPhrase[index] = text;
    setRecoveryPhrase(newPhrase);
  };

  const handleImport = async () => {
    const filledWords = recoveryPhrase.filter((word) => word.trim() !== '');
    if (filledWords.length !== 12 && filledWords.length !== 24) {
      setErrorMessage('Please fill in all 12 or 24 words.');
      return;
    }
    const phrase = filledWords.join(' ');
    try {
      const mnemonic = new Mnemonic(phrase);
      const seedHex = await mnemonic.computeSeed(); // Ensure it's awaited

      console.log('Computed seed:', seedHex); // Debugging line

      const keyPair = accountFromSeed(seedHex);
      const pubKey = keyPair.publicKey.toBase58();
      const privateKey = bs58.encode(keyPair.secretKey);

      localStorage.setItem('pubKey', pubKey);
      localStorage.setItem('privateKey', privateKey);

      console.log('Imported Keypair:', {
        pubKey,
        privateKey: privateKey,
      });
      onImport({ pubKey, privateKey: privateKey });
    } catch (error) {
      console.error('Error importing recovery phrase:', error);
      setErrorMessage('Invalid recovery phrase.');
    }
  };

  const accountFromSeed = (seed) => {
    try {
      // Convert the seed hex string to a Buffer, then to Uint8Array
      const seedBuffer = Buffer.from(seed, 'hex');
      if (seedBuffer.length < 32) {
        throw new Error('Seed must be at least 32 bytes long.');
      }

      // Slice to the first 32 bytes
      const seedArray = new Uint8Array(seedBuffer.slice(0, 32));

      console.log('Seed Array for Keypair:', seedArray); // Debugging line

      // Generate the key pair from the seed
      const keyPair = Keypair.fromSeed(seedArray);

      return keyPair;
    } catch (error) {
      console.error('Error generating key pair:', error);
      throw error;
    }
  };

  const toggleWordCount = () => {
    if (is24Words) {
      setRecoveryPhrase(recoveryPhrase.slice(0, 12));
    } else {
      setRecoveryPhrase([...recoveryPhrase, ...Array(12).fill('')]);
    }
    setIs24Words(!is24Words);
  };

  return (
    <div className="import-recovery-phrase-container">
      <h1 className="title">Secret Recovery Phrase</h1>
      <p className="recovery-subtitle">
        Import an existing wallet with your 12 or 24-word secret recovery
        phrase.
      </p>
      <div className="mnemonic-container">
        {recoveryPhrase.map((word, index) => (
          <input
            key={index}
            className="mnemonic-input"
            value={word}
            onChange={(e) => handleInputChange(e.target.value, index)}
          />
        ))}
      </div>
      <a href="#" onClick={toggleWordCount} className="toggle-button">
        {is24Words
          ? 'I have a 12-word recovery phrase'
          : 'I have a 24-word recovery phrase'}
      </a>

      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <button onClick={handleImport} className="import-button">
        Import Address
      </button>
    </div>
  );
};

export default ImportRecoveryPhrase;
