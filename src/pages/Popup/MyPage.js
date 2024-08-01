import React, { useState, useEffect } from 'react';
import { getSolanaBalance, getSpamBalance } from '../Background/index';
import copyIcon from '../../assets/img/copy.png';
import homeIcon from '../../assets/img/back.png';

import './MyPage.css';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';

const defaultRpcUrl = 'https://api.testnet.solana.com';

const MyPage = ({ pubKey, setPage }) => {
  const [explorer, setExplorer] = useState('Solana Explorer');
  const [rpcUrl, setRpcUrl] = useState('https://api.testnet.solana.com');
  const [isFocused, setIsFocused] = useState(false);
  const [tempRpcUrl, setTempRpcUrl] = useState(rpcUrl);
  const [spamBalance, setSpamBalance] = useState('0.00');
  const [solanaBalance, setSolanaBalance] = useState('0.00');
  const [privateKey, setPrivateKey] = useState('');
  const [isImportModalVisible, setImportModalVisible] = useState(false);
  const [isExportModalVisible, setExportModalVisible] = useState(false);
  const [newPrivateKey, setNewPrivateKey] = useState('');
  const [importErrorMessage, setImportErrorMessage] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const fetchKeysAndBalances = async () => {
      const storedPubKey = await chrome.storage.local.get('pubKey');
      const storedPrivateKey = await chrome.storage.local.get('privateKey');
      const storedRpcUrl = await chrome.storage.local.get('rpcUrl');
      if (storedPrivateKey.privateKey)
        setPrivateKey(storedPrivateKey.privateKey);
      if (storedRpcUrl.rpcUrl) setRpcUrl(storedRpcUrl.rpcUrl);
      if (pubKey) {
        const solBalance = await getSolanaBalance(pubKey);
        setSolanaBalance(parseFloat(solBalance).toFixed(2));
        const spBalance = await getSpamBalance(pubKey);
        setSpamBalance(parseFloat(spBalance).toFixed(2));
      }
    };
    fetchKeysAndBalances();
  }, [pubKey]);

  useEffect(() => {
    setTempRpcUrl(rpcUrl);
  }, [rpcUrl]);

  const handleSaveRpc = () => {
    const finalRpcUrl = tempRpcUrl.trim() === '' ? defaultRpcUrl : tempRpcUrl;
    setRpcUrl(finalRpcUrl);
    chrome.storage.local.set({ rpcUrl: finalRpcUrl });
    setIsFocused(false);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleInputBlur = () => {
    if (!isFocused) {
      setTempRpcUrl(rpcUrl);
    }
  };

  const handleImport = async () => {
    if (newPrivateKey.trim() === '') {
      alert('Please enter your private key.');
      return;
    }
    try {
      const decodedPrivateKey = bs58.decode(newPrivateKey);
      console.log('Decoded Private Key:', decodedPrivateKey);

      if (decodedPrivateKey.length !== 64) {
        throw new Error('Invalid private key length');
      }

      const importedKeypair = Keypair.fromSecretKey(decodedPrivateKey);
      const pubKey = importedKeypair.publicKey.toBase58();
      const privateKeyEncoded = bs58.encode(importedKeypair.secretKey);

      await chrome.storage.local.set({ pubKey: pubKey });
      await chrome.storage.local.set({ privateKey: privateKeyEncoded });

      console.log('Imported Keypair:', {
        pubKey,
        privateKey: privateKeyEncoded,
      });
      // setPubKey(pubKey);
      setPrivateKey(privateKeyEncoded);
      setImportModalVisible(false);
      setAlertMessage('Your key is successfully updated');
    } catch (error) {
      console.error('Error importing private key:', error);
      setImportErrorMessage('Invalid private key.');
    }
  };

  const handleExport = async () => {
    if (isExportModalVisible) {
      setExportModalVisible(false);
      return;
    }

    try {
      const storedPrivateKey = await chrome.storage.local.get('privateKey');
      if (storedPrivateKey.privateKey) {
        setPrivateKey(storedPrivateKey.privateKey);
        setExportModalVisible(true);
      } else {
        alert('Error', 'No private key found.');
      }
    } catch (error) {
      alert('Error', 'Failed to retrieve the private key.');
      console.error('Error:', error);
    }
  };

  const copyPrivateKeyAndClose = () => {
    navigator.clipboard.writeText(privateKey);
    setExportModalVisible(false);
  };
  const handleImportButtonClick = () => {
    if (isImportModalVisible) {
      setImportModalVisible(false);
      setImportMessage('');
    } else {
      setImportModalVisible(true);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const closeAlert = () => {
    setAlertMessage('');
    window.location.reload();
  };

  return (
    <div className="my-page-container">
      {/* Overlay for blurring the background when alert is active */}
      {alertMessage && <div className="overlay"></div>}
      <h2 className="page-title">My Page</h2>
      <div className="section">
        <h3>My Account</h3>
        <div className="label">
          <label>Address</label>
        </div>
        <div className="input-group">
          <div
            className="readonly-text"
            onClick={() => copyToClipboard(pubKey)}
          >
            {pubKey}
            <img src={copyIcon} className="copy-icon" alt="Copy" />
          </div>
        </div>
        <div className="label">
          <label>Solana Balance</label>
        </div>
        <div className="readonly-text">{`${solanaBalance} SOL`}</div>
        <div className="label">
          <label>SPAM Balance</label>
        </div>
        <div className="readonly-text">{`${spamBalance} SPAM`}</div>
        <div className="label">
          <label>Keypair</label>
        </div>
        <div className="keypair-buttons">
          <button onClick={handleImportButtonClick}>Import</button>
          <button onClick={handleExport}>Export</button>
        </div>
        {isExportModalVisible && (
          <div className="export-modal">
            <h3>Your Private Key</h3>
            <div className="readonly-text">
              {privateKey}
              <img
                src={copyIcon}
                className="copy-icon"
                alt="Copy"
                onClick={copyPrivateKeyAndClose}
              />
            </div>
          </div>
        )}
        {isImportModalVisible && (
          <div className="import-modal">
            <h3>Import Private Key</h3>
            <div className="input-group">
              <input
                type="text"
                value={newPrivateKey}
                onChange={(e) => setNewPrivateKey(e.target.value)}
                placeholder="Enter your private key"
                className="import-input"
              />
              <button onClick={handleImport}>Save</button>
            </div>
            {importErrorMessage && (
              <p className="error-message">{importErrorMessage}</p>
            )}
            {importMessage && (
              <p className="success-message">{importMessage}</p>
            )}
          </div>
        )}
      </div>
      <div className="section">
        <h3>Network</h3>
        <div className="label">
          <label>RPC</label>
        </div>
        <div className="input-group">
          <input
            type="text"
            value={tempRpcUrl}
            onChange={(e) => setTempRpcUrl(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          <button onClick={handleSaveRpc}>Save</button>
        </div>
      </div>
      <button className="back-button" onClick={() => setPage('userInfo')}>
        <img src={homeIcon} className="back-icon" alt="Back" />
      </button>
      {alertMessage && (
        <div className="alert">
          <p>{alertMessage}</p>
          <button onClick={closeAlert}>Close</button>
        </div>
      )}
    </div>
  );
};

export default MyPage;
