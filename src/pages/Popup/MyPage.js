import React, { useState, useEffect } from 'react';
import { getSolanaBalance, getSpamBalance } from '../Background/index'; 
import copyIcon from '../../assets/img/copy.png';
import homeIcon from '../../assets/img/home.png';
import closeIcon from '../../assets/img/check.png';
import './MyPage.css';

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
  const [isButtonActive, setIsButtonActive] = useState(false);

  useEffect(() => {
    const fetchKeysAndBalances = async () => {
      const storedPubKey = await chrome.storage.local.get('pubKey');
      const storedPrivateKey = await chrome.storage.local.get('privateKey');
      const storedRpcUrl = await chrome.storage.local.get('rpcUrl');
      if (storedPrivateKey.privateKey) setPrivateKey(storedPrivateKey.privateKey);
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

  const handleImportSuccess = async () => {
    const storedPubKey = await chrome.storage.local.get('pubKey');
    if (storedPubKey.pubKey) {
      alert('Success', 'Private key imported successfully!');
    }
    setImportModalVisible(false);
  };

  const handleExport = async () => {
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
  

  return (
    <div className="my-page-container">
      <h2 className="page-title">My Page</h2>
      <div className="section">
        <h3>My Account</h3>
        <div className = "label"><label>Address</label></div>
        <div className="input-group">
          <div
            className="readonly-text"
            onClick={() => copyToClipboard(pubKey)}
          >
            {pubKey}
            <img
              src={copyIcon}
              className="copy-icon"
              alt="Copy"
            />
          </div>
        </div>
        <div className = "label"><label>Solana Balance</label></div>
        <div className="readonly-text">{`${solanaBalance} SOL`}</div>
        <div className = "label"><label>SPAM Balance</label></div>
        <div className="readonly-text">{`${spamBalance} SPAM`}</div>
        <div className = "label"><label>Keypair</label></div>
        <div className="keypair-buttons">
          <button onClick={() => setImportModalVisible(true)}>Import</button>
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
        onClick={() => navigator.clipboard.writeText(privateKey)}
      />
      <img
        src={closeIcon}
        className="close-icon"
        alt="Close"
        onClick={() => setExportModalVisible(false)}
      />
    </div>
  </div>
)}


      </div>
      <div className="section">
        <h3>Display</h3>
        <div className = "label"><label>Explorer</label></div>
        <select value={explorer} onChange={(e) => setExplorer(e.target.value)}>
          <option value="Solana Explorer">Solana Explorer</option>
          <option value="Solscan">Solscan</option>
          <option value="xray">xray</option>
        </select>
      </div>
      <div className="section">
        <h3>Network</h3>
        <div className = "label"><label>RPC</label></div>
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

    </div>
  );
};

export default MyPage;