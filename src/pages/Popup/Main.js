import React, { useEffect, useState } from 'react';
import headerImage from '../../assets/img/headerbackground.png';
import middleImage from '../../assets/img/mountain.png';
import spamCharacter1 from '../../assets/img/spam_character1.png';
import spamCharacter2 from '../../assets/img/spam_character2.png';
import openDashboardIcon from '../../assets/img/desktop_icon.png';
import coin from '../../assets/img/coin_icon.png';
import minetool from '../../assets/img/minetool.png';
import shadow from '../../assets/img/shadow.png';
import sendBackgroundRequests from '../../service/solanaMiningService';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import './Main.css';

const UserInfo = ({ pubKey }) => {
  const [solanaBalance, setSolanaBalance] = useState(0);
  const [spamAmount, setSpamAmount] = useState(1000.11);
  const [signer, setSigner] = useState('');

  useEffect(() => {
    async function getPK() {
      const privateKey = await chrome.storage.local.get('privateKey');
      if (!pubKey || !privateKey) {
        throw new Error('pubkey or privatekey is missing from local storage');
      }
      const signer = Keypair.fromSecretKey(bs58.decode(privateKey.privateKey));
      setSigner(signer);
    }
    getPK();
  }, [pubKey]);

  // useEffect(() => {
  //   if (signer) {
  //     const mineSpam = () => {
  //       console.log('Mining spam...');
  //       try {
  //         sendBackgroundRequests(signer);
  //       } catch (error) {
  //         console.error('Error sending background request:', error.message);
  //       }
  //     };

  //     const intervalId = setInterval(mineSpam, 5000);
  //     return () => clearInterval(intervalId);
  //   } else {
  //     console.log('Private key not available.');
  //   }
  // }, [pubKey, signer]);

  return (
    <div className="main-container">
      <div className="header-container">
        <img src={headerImage} className="header-image" alt="Header" />
        <h1 className="main-title">SPAM</h1>
        <img
          src={spamCharacter1}
          className="spam-character-header"
          alt="Spam Character"
        />
      </div>
      <div className="middle-section">
        <p className="spam-line">
          Let's <span className="spam-highlight">SPAM</span> Solana!
        </p>

        <div className="spam-amount">
          <img src={minetool} alt="Mine Tool" className="mine-tool-icon" />
          <span>{spamAmount}</span>
        </div>
        <img src={middleImage} className="middle-image" alt="Middle" />
        <div className="character-container">
        <img
    src={shadow}
    className="shadow"
    alt="Shadow"
  />
  <img
    src={coin}
    className="coin"
    alt="Coin"
  /> 
  <img
    src={spamCharacter2}
    className="spam-character2"
    alt="Spam Character"
  />
 
  
</div>


        <p className="testnet-solana">Testnet Solana: 10,000</p>
      </div>
      <div className="footer">
        <button className="dashboard-button">
          <img
            src={openDashboardIcon}
            className="dashboard-icon"
            alt="Open Dashboard"
          />
          Open Dashboard
        </button>
      </div>
    </div>
  );
};

export default UserInfo;
