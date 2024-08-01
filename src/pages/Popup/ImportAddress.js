import React, { useState, useEffect } from 'react';
import mnemonicIcon from '../../assets/img/mnemonic.png';
import keyIcon from '../../assets/img/key.png';
import './ImportAddress.css';
import ImportRecoveryPhrase from './ImportRecoveryPhrase';
import ImportPrivateKey from './ImportPrivateKey';

const ImportAddress = ({ onImportRecoveryPhrase, onImportPrivateKey }) => {
  const [page, setPage] = useState('import-address');

  const handleImportPrivateKey = () => {
    console.log('Click Import Private Key');
    onImportPrivateKey(); 
    setPage('import-private-key');  
  };
  const handleImportRecovery = () => {
    console.log('Click Import Private Key');
    onImportRecoveryPhrase();  
    setPage('import-recovery-phase'); 
  };
  const renderPage = () => {
    switch (page) {
      case 'import-recovery-phrase':
        return <ImportRecoveryPhrase onImport={onImportRecoveryPhrase} />;
      case 'import-private-key':
        return <ImportPrivateKey onImport={() => setPage('import-success')} />;
      default:
        return (
          <div className="importAddress-container">
            <h1 className="importAddress-title">Import an Address</h1>
            <p className="importAddress-subtitle">
              Import an existing address with your secret recovery phrase or private key.
            </p>
            <div className="importAddress-box" onClick={ handleImportRecovery}>
              <img src={mnemonicIcon} className="importAddress-icon" alt="Mnemonic Icon" />
              <div className="importAddress-boxText">
                <h2 className="importAddress-boxTitle">Import Secret Recovery Phrase</h2>
              
              </div>
            </div>
            <div className="importAddress-box" onClick={handleImportPrivateKey}>
              <img src={keyIcon} className="importAddress-icon" alt="Key Icon" />
              <div className="importAddress-boxText">
                <h2 className="importAddress-boxTitle">Import Private Key</h2>
              </div>
            </div>
          </div>
        );
    }
  };

  return <div className="App">{renderPage()}</div>;
};

export default ImportAddress;
