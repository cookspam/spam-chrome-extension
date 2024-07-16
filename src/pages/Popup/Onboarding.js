import React from 'react';
import './Onboarding.css';
import logo from '../../assets/img/spam_character1.png';
import groupImage from '../../assets/img/Group.png';
import singleStar from '../../assets/img/Vector.png';

const Onboarding = ({ onCreateAddress, onImportAddress }) => {
	return (
	  <div className="onboarding-container">
		<img src={logo} className="logo" alt="Spam Character" />
		<img src={groupImage} className="groupImage" alt="Group" />
		<img src={singleStar} className="singleStarLeft" alt="Star Left" />
		<img src={singleStar} className="singleStarRight" alt="Star Right" />
		<h1 className="title">SPAM</h1>
		<p className="subtitle">
		  To get started, create a new address or import an existing one.
		</p>
		<button
		  className="button buttonNormal"
		  onClick={onCreateAddress}
		>
		  Create a new address
		</button>
		<button
		  className="button importButton buttonNormal"
		  onClick={onImportAddress}
		>
		  Import an existing address
		</button>
	  </div>
	);
  };

  const styles = {
	
  }
  
  export default Onboarding;