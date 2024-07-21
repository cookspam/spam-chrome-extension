import React, { useState } from 'react';
import './ImportPrivateKey.css';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const ImportPrivateKey = ({ onImport }) => {
  const [privateKey, setPrivateKey] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [page, setPage] = useState('import-private-key');

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

      chrome.storage.local.set({'pubKey': pubKey});
      chrome.storage.local.set({'privateKey': privateKeyEncoded});

      console.log('Imported Keypair:', { pubKey, privateKey: privateKeyEncoded });
      onImport({ pubKey, privateKey: privateKeyEncoded });
	

      
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
