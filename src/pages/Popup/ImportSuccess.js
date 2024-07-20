import React from 'react';
import './ImportSuccess.css';

const ImportSuccess = ({ pubKey, onGoMain }) => {
	console.log('Rendering ImportSuccess component with pubKey:', pubKey);
	return (
	  <div className="import-success-container">
		<h1 className="title">Private Key Imported Successfully</h1>
		<p className="subtitle">Your public key is:</p>
		<p className="public-key">{pubKey}</p>
		<button onClick={onGoMain} className="home-button">Go to Main</button>
	  </div>
	);
};

export default ImportSuccess;
