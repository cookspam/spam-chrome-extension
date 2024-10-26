import { keccak256 } from 'js-sha3';
import BN from 'bn.js';

self.onmessage = function (event) {
	console.log("mineWorker - Received message:", event.data);
	const { initialHash, difficulty, signerPublicKey } = event.data;
	// Parse the difficulty back to BigInt if necessary
	const parsedDifficulty = BigInt(difficulty);
	const parsedInitialHash = Buffer.from(initialHash, 'hex');
	const parsedSignerPublicKey = signerPublicKey;
  
	const result = findNextHash(parsedInitialHash, parsedDifficulty, parsedSignerPublicKey);
	console.log("mineWorker - Mining result:", result);
	self.postMessage(result);
};
  
function findNextHash(initialHash, difficulty, signerPublicKey) {
	console.log("findNextHash IN")
	let nextHash;
	let nonce = 0;

	while (true) {
		const input = Buffer.concat([
			initialHash,
			Buffer.from(signerPublicKey),
			new BN(nonce).toArrayLike(Buffer, 'le', 8),
		]);
		nextHash = Buffer.from(keccak256.arrayBuffer(input));
		if (nextHash.compare(difficulty) <= 0) {
			break;
		}
		nonce++;
	}
	console.log("findNextHash - Found valid hash:", nextHash.toString('hex'), "Nonce:", nonce);
	return { nextHash: nextHash.toString('hex'), nonce };
}
  