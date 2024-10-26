// Import necessary dependencies
import { keccak256 } from 'js-sha3';
import BN from 'bn.js';



// Listener for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log("Content script received message:", message);
  
	if (message.action === 'startMining') {
	  console.log("Content script: startMining action received");
	  const { serializedInitialHash, serializedDifficulty, serializedSignerPublicKey } = message;
  
	  // Create a worker to perform the mining task
	  const worker = new Worker(chrome.runtime.getURL('mineWorker.js'));
  
	  worker.onmessage = (event) => {
		console.log("Content script: Received result from worker", event.data);
		sendResponse(event.data);
		worker.terminate();
	  };
  
	  worker.onerror = (error) => {
		console.error("Content script: Worker error", error);
		sendResponse({ error: error.message });
		worker.terminate();
	  };
  
	  // Post the message to the worker with the mining parameters
	  worker.postMessage({
		initialHash: serializedInitialHash,
		difficulty: serializedDifficulty,
		signerPublicKey: serializedSignerPublicKey,
	  });
  
	  // Returning true to indicate that the response will be sent asynchronously
	  return true;
	}
  });
  


