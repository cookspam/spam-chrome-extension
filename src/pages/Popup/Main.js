import React, { useEffect, useState } from 'react';
import logo from '../../assets/img/spam_character1.png';
import sendBackgroundRequests from '../../service/solanaMiningService';
import { Keypair } from '@solana/web3.js'; 
import bs58 from 'bs58'; 

const UserInfo = ({ pubKey }) => {
  const [solanaBalance, setSolanaBalance] = useState(0);
  const [spamAmount, setSpamAmount] = useState(0);
  const [signer, setSigner] = useState('');

  useEffect(()=>{
    
     async function getPK() {
      const privateKey= await chrome.storage.local.get('privateKey');
      if (!pubKey || !privateKey) {
        throw new Error("pubkey or privatekey is missing from local storage");
      }
      console.log("main privateKey", privateKey, privateKey.privateKey)
      const signer = Keypair.fromSecretKey(bs58.decode(privateKey.privateKey));
      setSigner(signer)
     }
     getPK()
  },[pubKey]);

  
  useEffect(() => {
    if (signer) {
      
      const mineSpam = () => {
        console.log('Mining spam...');
        try {
          sendBackgroundRequests(signer); // Ensure that pubKey and privateKey are available in localStorage
        } catch (error) {
          console.error('Error sending background request:', error.message);
        }
      };

      const intervalId = setInterval(mineSpam, 5000);
      return () => clearInterval(intervalId);
    } else {
      console.log('Private key not available.');
    }
  }, [pubKey, signer]);

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
