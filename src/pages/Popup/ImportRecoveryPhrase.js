import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Keypair } from '@solana/web3.js'; // Import Keypair from Solana web3 library
import bs58 from 'bs58'; // Import bs58 for encoding the private key
import './ImportRecoveryPhrase.css';
import { mnemonicToSeedSync } from 'bip39';

const { toUtf8Bytes, pbkdf2 } = ethers;



const ImportRecoveryPhrase = ({ onImport }) => {
  const [recoveryPhrase, setRecoveryPhrase] = useState(Array(12).fill(''));
  const [is24Words, setIs24Words] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (text, index) => {
    const newPhrase = [...recoveryPhrase];
    newPhrase[index] = text;
    setRecoveryPhrase(newPhrase);
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text');
    const words = paste.trim().split(/\s+/);
    if (words.length === 12 || words.length === 24) {
      setIs24Words(words.length === 24);
      setRecoveryPhrase(words.concat(Array((words.length === 24 ? 24 : 12) - words.length).fill('')).slice(0, words.length === 24 ? 24 : 12));
    }
    e.preventDefault();
  };

  const handleImport = async () => {
    const filledWords = recoveryPhrase.filter((word) => word.trim() !== '');
    if (filledWords.length !== 12 && filledWords.length !== 24) {
      setErrorMessage('Please fill in all 12 or 24 words.');
      return;
    }
    const phrase = filledWords.join(' ');
    try {
      const seed = mnemonicToSeedSync(phrase, "");
      console.log('Computed seed:', seed); // Debugging line
      const keyPair = Keypair.fromSeed(seed.slice(0, 32));
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
          onPaste={index === 0 ? handlePaste : undefined}
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
