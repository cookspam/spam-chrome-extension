import React, { useState, useEffect } from 'react';
import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import './CreateAddress.css';
import copyIcon from '../../assets/img/copy.png';


const generateSolanaKeypair = () => {
  const keypair = Keypair.generate();
  const pubKey = keypair.publicKey.toBase58();
  const privateKey = bs58.encode(keypair.secretKey);
  return { pubKey, privateKey };
};

const CreateAddress = ({ onCreate }) => {
  const [pubKey, setPubKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [isPrivateKeyVisible, setPrivateKeyVisible] = useState(false);
  const [isChecked, setChecked] = useState(false);
  
  useEffect(() => {
    const keypairs = Array.from({ length: 5 }, () => generateSolanaKeypair());
    
    // Store the first keypair for the UI
    setPubKey(keypairs[0].pubKey);
    setPrivateKey(keypairs[0].privateKey);

    // Store all keypairs in local storage
    keypairs.forEach((keypair, index) => {
      chrome.storage.local.set({
        [`pubKey${index + 1}`]: keypair.pubKey,
        [`privateKey${index + 1}`]: keypair.privateKey
      });
    });
    
    // Log the keypairs to the console
    keypairs.forEach((keypair, index) => {
      console.log(`Generated Keypair ${index + 1}:`);
      console.log(`Public Key: ${keypair.pubKey}`);
      console.log(`Private Key: ${keypair.privateKey}`);
    });
    // Send a message to the background script to start balance check
    chrome.runtime.sendMessage({
      message: 'StartBalanceCheck',
      pubKey: keypairs[0].pubKey,
      privateKey: keypairs[0].privateKey
    });
    
    
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to Clipboard: ' + text);
    });
  };
  
  return (
    <div className="createAddress-container">
      <h1 className="createAddress-title">Public Key (Solana Address)</h1>
      <div className="createAddress-subtitleContainer" onClick={() => copyToClipboard(pubKey)}>
        <span className="createAddress-subtitle">{pubKey}</span>
        <img src={copyIcon} className="createAddress-copyIcon" alt="Copy" />
      </div>
      <div className="createAddress-space"></div>
      <h2 className="createAddress-title">Private Key</h2>
      <div
        className="createAddress-warningBox"
        onClick={() => setPrivateKeyVisible(!isPrivateKeyVisible)}
      >
        <p className="createAddress-warning">This is your password. </p>
        <p className="createAddress-warning"> Save it and DO NOT share it with anyone! </p>
        {isPrivateKeyVisible && (
          <div
            className="createAddress-copyContainer"
            onClick={() => copyToClipboard(privateKey)}
          >
            <div className="createAddress-subtitle">
              {privateKey}
              <img
                src={copyIcon}
                className="createAddress-copyIcon"
                alt="Copy"
              />
            </div>
          </div>
        )}
      </div>
      <div className="createAddress-checkboxContainer">
        <input
          type="checkbox"
          className="createAddress-checkbox"
          checked={isChecked}
          onChange={() => setChecked(!isChecked)}
        />
        <label className="createAddress-checkboxText">
          I saved my Secret Recovery Phrase
        </label>
        <a href="https://solfaucet.com/" target="_blank" rel="noopener noreferrer">
        Get Testnet SOL from SolFaucet
      </a>

      </div>
      <button
        className={`createAddress-button ${
          isChecked
            ? 'createAddress-buttonEnabled'
            : 'createAddress-buttonDisabled'
        }`}
        onClick={() => isChecked && onCreate(pubKey, privateKey)}
        disabled={!isChecked}
      >
        <span
          className={`createAddress-buttonText ${
            !isChecked && 'createAddress-buttonTextDisabled'
          }`}
        >
          Continue
        </span>
      </button>
    </div>
  );
};

export default CreateAddress;
