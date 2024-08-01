import React, { useState, useEffect } from 'react';
import './Popup.css';
import Onboarding from './Onboarding';
import CreateAddress from './CreateAddress';
import ImportAddress from './ImportAddress';
import ImportRecoveryPhrase from './ImportRecoveryPhrase';
import ImportPrivateKey from './ImportPrivateKey';
import ImportSuccess from './ImportSuccess';
import UserInfo from './Main';
import MyPage from './MyPage'; 

const Popup = () => {
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [page, setPage] = useState('onboarding');
  const [pubKey, setPubKey] = useState('');

  useEffect(() => {
    chrome.storage.local.get(['isFirstTimeUser', 'pubKey'], (result) => {
      const { isFirstTimeUser: firstTime, pubKey: storedPubKey } = result;
      if (!firstTime && storedPubKey) {
        setPubKey(result.pubKey);
        setPage('userInfo');
      } else {
        setIsFirstTimeUser(true);
        setPage('onboarding');
      }
    });
  }, []);


  useEffect(() => {
    console.log('Current page:', page);
  }, [page]);

  const handleCreateAddress = async (pubKey, privateKey) => {
    console.log('handleCreateAddress called with:', pubKey, privateKey);
    setPubKey(pubKey);
    chrome.storage.local.set({'isFirstTimeUser': false});
    chrome.storage.local.set({'pubKey': pubKey});
    chrome.storage.local.set({'privateKey': privateKey});
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
        return <UserInfo pubKey={pubKey} setPage={setPage} />;
      case 'mypage': // Add case for MyPage
        console.log('Rendering MyPage component');
        return <MyPage pubKey={pubKey} setPage={setPage} />;
      default:
        return <Onboarding />;
    }
  };

  return <div className="App">{renderPage()}</div>;
};

export default Popup;
