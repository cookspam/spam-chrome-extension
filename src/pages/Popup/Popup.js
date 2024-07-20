import React, { useState, useEffect } from 'react';
import './Popup.css';
import Onboarding from './Onboarding';
import CreateAddress from './CreateAddress';
import ImportAddress from './ImportAddress';
import ImportRecoveryPhrase from './ImportRecoveryPhrase';
import ImportPrivateKey from './ImportPrivateKey';
import ImportSuccess from './ImportSuccess';
import UserInfo from './Main';

const Popup = () => {
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [page, setPage] = useState('onboarding');
  const [address, setAddress] = useState('');
  const [pubKey, setPubKey] = useState('');

  useEffect(() => {
    console.log('Current page:', page);
  }, [page]);

  const handleCreateAddress = (pubKey, privateKey) => {
    console.log('handleCreateAddress called with:', pubKey, privateKey);
    setAddress(pubKey); // Assuming pubKey is the address to be stored
    setPubKey(pubKey);
    localStorage.setItem('isFirstTimeUser', 'false');
    localStorage.setItem('address', pubKey);
    setPage('userInfo');
    console.log('pubKey set to:', pubKey);
  };

  const handleImportPrivateKey = ({ pubKey }) => {
    console.log('Handling import of private key with pubKey:', pubKey);
    setPubKey(pubKey);
    setPage('import-success');
  };
  
  const handleImportRecovery = ({ pubKey }) => {
    console.log('Handling import of Recovery Phrase with pubKey:', pubKey);
    setPubKey(pubKey);
    setPage('import-success');
  };

  const renderPage = () => {
    console.log('Rendering page:', page);
    switch (page) {
      case 'onboarding':
        return (
          <Onboarding
            onCreateAddress={() => setPage('create-address')}
            onImportAddress={() => setPage('import-address')}
          />
        );
      case 'create-address':
        return <CreateAddress onCreate={handleCreateAddress} />;
      case 'import-address':
        return (
          <ImportAddress
            onImportRecoveryPhrase={() => setPage('import-recovery-phrase')}
            onImportPrivateKey={() => setPage('import-private-key')}
          />
        );
      case 'import-recovery-phrase':
        return <ImportRecoveryPhrase onImport={handleImportRecovery} />;
      case 'import-private-key':
        return <ImportPrivateKey onImport={handleImportPrivateKey} />;
      case 'import-success':
        console.log('Rendering ImportSuccess component', pubKey);
        return (
          <ImportSuccess pubKey={pubKey} onGoMain={() => setPage('userInfo')} />
        );
      case 'userInfo':
        console.log('Rendering UserInfo with pubKey:', pubKey);
        return <UserInfo pubKey={pubKey} />;
      default:
        return <Onboarding />;
    }
  };

  return <div className="App">{renderPage()}</div>;
};

export default Popup;
