import React, { useEffect, useState } from 'react';
import headerImage from '../../assets/img/headerbackground.png';
import middleImage from '../../assets/img/mountain.png';
import spamCharacter1 from '../../assets/img/spam_character1.png';
import spamCharacter2 from '../../assets/img/spam_character2.png';
import openDashboardIcon from '../../assets/img/desktop_icon.png';
import coin from '../../assets/img/coin_icon.png';
import minetool from '../../assets/img/minetool.png';
import shadow from '../../assets/img/shadow.png';
import settingsIcon from '../../assets/img/person.png';
import { getSolanaBalance, getSpamBalance, getClaimableSpamBalance } from '../Background/index';
import './Main.css';

const UserInfo = ({ pubKey, setPage }) => {
  const [solanaBalance, setSolanaBalance] = useState(0);
  const [spamAmount, setSpamAmount] = useState(0);
  const [claimableRewards, setClaimableRewards] = useState(0);
  const [privateKey, setPrivateKey] = useState('');

  useEffect(() => {
    async function getPK() {
      const privateKey = await chrome.storage.local.get('privateKey');
      if (!pubKey || !privateKey) {
        throw new Error('pubkey or privatekey is missing from local storage');
      }
      setPrivateKey(privateKey)
    }
    getPK();
  }, [pubKey]);

  useEffect(() => {
    if (privateKey) {
      chrome.runtime.sendMessage({ message: 'Start', privateKey: privateKey });
      console.log('Mining spam...');
    } else {
      console.log('no privateKey.');
    }
  }, [pubKey, privateKey]);

  useEffect(() => {
    const fetchBalances = async () => {
      if (pubKey) {
        try {
          const solanaBalance = await getSolanaBalance(pubKey);
          setSolanaBalance(parseFloat(solanaBalance).toFixed(2));

          const spamBalance = await getSpamBalance(pubKey);
          setSpamAmount(parseFloat(spamBalance).toFixed(2));

          const claimableRewards = await getClaimableSpamBalance(pubKey);
          setClaimableRewards(parseFloat(claimableRewards).toFixed(2));
        } catch (error) {
          console.error('Error fetching balances:', error);
        }
      }
    };

    fetchBalances();
  }, [pubKey]);

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
          <span>{spamAmount} + {claimableRewards}</span>
        </div>
        <img src={middleImage} className="middle-image" alt="Middle" />
        <div className="character-container">
          <img src={shadow} className="shadow" alt="Shadow" />
          <img src={coin} className="coin" alt="Coin" />
          <img
            src={spamCharacter2}
            className="spam-character2"
            alt="Spam Character"
          />
        </div>

        <p className="testnet-solana">Testnet Solana: {solanaBalance} SOL</p>
      </div>
      <div className="footer">
        <a href="https://spam.supply/settings" target="_blank" rel="noopener noreferrer">
          <button className="dashboard-button">
            <img
              src={openDashboardIcon}
              className="dashboard-icon"
              alt="Open Dashboard"
            />
            Dashboard
          </button>
        </a>
        <button
          className="settings-button"
          onClick={() => setPage('mypage')}
        >
          <img
            src={settingsIcon}
            className="settings-icon"
            alt="My Page"
          />
          My Page
        </button>

      </div>
    </div>
  );
};

export default UserInfo;
