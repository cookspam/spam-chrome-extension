import React, { useEffect, useState } from 'react';

const UserInfo = ({ address }) => {
  const [solanaBalance, setSolanaBalance] = useState(0);
  const [spamAmount, setSpamAmount] = useState(0);

  useEffect(() => {
    const mineSpam = () => {
      // Replace this with your actual mining logic
      console.log('Mining spam...');
      setSpamAmount(prev => prev + 1);
    };

    if (address) {
      const intervalId = setInterval(mineSpam, 5000);
      return () => clearInterval(intervalId);
    }
  }, [address]);

  return (
	<div>
	<h1>User Info</h1>
	<p>Public Key: {address}</p>
	<p>Solana Balance: {solanaBalance} SOL</p>
	<p>Spam Mined: {spamAmount} SPAM</p>
	<img src="../../assets/images/spam_character1.png" alt="Spam Character" />
  </div>
);
};

export default UserInfo;
