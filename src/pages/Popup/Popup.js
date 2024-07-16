import React, { useState, useEffect } from 'react';
import './Popup.css';
import Onboarding from './Onboarding';
import CreateAddress from './CreateAddress';
import ImportAddress from './ImportAddress';
import UserInfo from './Main';
import './Popup.css';

const Popup = () => {
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [page, setPage] = useState('onboarding');
  const [address, setAddress] = useState('');

  const [pubKey, setPubKey] = useState('');
  const [solanaBalance, setSolanaBalance] = useState(0);
  const [spamAmount, setSpamAmount] = useState(0);

  useEffect(() => {
    const firstTime = localStorage.getItem('isFirstTimeUser');
    if (firstTime === 'false') {
      setIsFirstTimeUser(false);
      setPage('userInfo');
      const storedAddress = localStorage.getItem('address');
      setAddress(storedAddress || '');
    }
  }, []);

  const handleAddressCreation = (newAddress) => {
   setAddress(newAddress);
    localStorage.setItem('isFirstTimeUser', 'false');
    localStorage.setItem('address', newAddress);
    setPage('userInfo');
  };
  const handleImportAddress = (importedAddress) => {
    setAddress(importedAddress);
    localStorage.setItem('isFirstTimeUser', 'false');
    localStorage.setItem('address', importedAddress);
    setPage('userInfo');
  };

  return (
    <div className="App">
     {page === 'onboarding' && (
        <Onboarding
          onCreateWallet={() => setPage('createAddress')}
          onImportWallet={() => setPage('importAddress')}
        />
      )}
      {page === 'createAddress' && <CreateAddress onCreate={handleCreateAddress} />}
      {page === 'importAddress' && <ImportAddress onImport={handleImportAddress} />}
      {page === 'userInfo' && <UserInfo address={address} />}
    </div>
  );
};

export default Popup;
