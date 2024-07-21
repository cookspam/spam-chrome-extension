import React, { useEffect, useState } from 'react';
import logo from '../../assets/img/spam_character1.png';
import { sendBackgroundRequests } from '../../../service/solanaMiningService';

const UserInfo = ({ pubKey }) => {
  const [solanaBalance, setSolanaBalance] = useState(0);
  const [spamAmount, setSpamAmount] = useState(0);

  useEffect(() => {
    if (pubKey) {
      try {
          //sendBackgroundRequests(); // Ensure that pubKey and privateKey are available in localStorage
      } catch (error) {
        console.error('Error sending background request:', error.message);
      }

      const mineSpam = () => {
        console.log('Mining spam...');
        setSpamAmount((prev) => prev + 1);
      };

      const intervalId = setInterval(mineSpam, 5000);
      return () => clearInterval(intervalId);
    } else {
      console.log('Public key not available.');
    }
  }, [pubKey]);

  return (
    <div>
      <h1>User Info</h1>
      <p>Public Key: {pubKey}</p>
      <p>Solana Balance: {solanaBalance} SOL</p>
      <p>Spam Mined: {spamAmount} SPAM</p>
      <img src={logo} alt="Spam Character" />
    </div>
  );
};

export default UserInfo;
