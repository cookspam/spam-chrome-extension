import React from 'react';
import './Onboarding.css';
import logo from '../../assets/img/spam_character1.png';
import groupImage from '../../assets/img/Group.png';
import singleStar from '../../assets/img/Vector.png';

const Onboarding = ({ onCreateAddress, onImportAddress }) => {
	return (
		<div className="onboarding-container">
		  <img src={logo} className="onboarding-logo" alt="Spam Character" />
		  <img src={groupImage} className="onboarding-groupImage" alt="Group" />
		  <img src={singleStar} className="onboarding-singleStarLeft" alt="Star Left" />
		  <img src={singleStar} className="onboarding-singleStarRight" alt="Star Right" />
		  <h1 className="onboarding-title">SPAM</h1>
		  <p className="onboarding-subtitle">
			To get started, create a new address or import an existing one.
		  </p>
		  <button
			className="onboarding-button onboarding-buttonNormal"
			onClick={onCreateAddress}
		  >
			Create a new address
		  </button>
		  <button
			className="onboarding-button onboarding-importButton onboarding-buttonNormal"
			onClick={onImportAddress}
		  >
			Import an existing address
		  </button>
		</div>
	  );
};

export default Onboarding;
