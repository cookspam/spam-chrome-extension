import React, { useEffect, useState } from 'react';
import logo from '../../assets/img/spam_character1.png';

const UserInfo = ({ pubKey }) => {
  const [solanaBalance, setSolanaBalance] = useState(0);
  const [spamAmount, setSpamAmount] = useState(0);

  useEffect(() => {
    const mineSpam = () => {
      // Replace this with your actual mining logic
      console.log('Mining spam...');
      setSpamAmount(prev => prev + 1);
    };

    if (pubKey) {
      const intervalId = setInterval(mineSpam, 5000);
      return () => clearInterval(intervalId);
    }
  }, [pubKey]);

  return (
	<div>
	<h1>User Info</h1>
	<p>Public Key: {pubKey}</p>
	<p>Solana Balance: {solanaBalance} SOL</p>
	<p>Spam Mined: {spamAmount} SPAM</p>
	<img src = {logo} alt="Spam Character" />
  </div>
);
};

export default UserInfo;
