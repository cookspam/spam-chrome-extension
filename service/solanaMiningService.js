// solanaMiningService.js

import {
	Connection,
	Keypair,
	Transaction,
	PublicKey,
	sendAndConfirmTransaction,
	SYSVAR_SLOT_HASHES_PUBKEY,
	TransactionInstruction,
	SendTransactionError,
  } from "@solana/web3.js";
  import { keccak256 } from "js-sha3";
  import BN from "bn.js";
  import { struct, blob, nu64 } from '@solana/buffer-layout';
  import { publicKey } from '@solana/buffer-layout-utils';
  
  const ProofLayout = struct([
	publicKey('authority'),
	nu64('claimable_rewards'),
	blob(32, 'hash'),
	nu64('total_hashes'),
	nu64('total_rewards'),
	// Add other fields with appropriate types
  ]);
  
  const programId = new PublicKey("cookr8CThnfEQZvvrB6zhh5K4X8XNkPjJi4uUDtkBuG");
  const BUS_ADDRESSES = [
	// Your bus addresses here
  ];
  const TREASURY_ADDRESS = new PublicKey("3amHhT6cLgvfjKWbka6DYjs9zS5pLFnmYw1g8C6DPa4x");
  
  const getLocalStorageItem = (key) => {
	const value = localStorage.getItem(key);
	if (!value) {
	  throw new Error(`${key} is missing from local storage`);
	}
	return value;
  };
  
  const initializeKeys = () => {
	const pubkeyString = localStorage.getItem('pubkey');
	const privateKeyString = localStorage.getItem('privatekey');
  
	if (!pubkeyString || !privateKeyString) {
	  throw new Error("pubkey or privatekey is missing from local storage");
	}
  
	const privateKey = JSON.parse(privateKeyString); // Assuming privateKey is stored as a JSON string
	const signer = Keypair.fromSecretKey(Uint8Array.from(privateKey));
  
	return { pubkeyString, signer };
  };
  
  const connection = new Connection(
	"https://solemn-aged-needle.solana-testnet.quiknode.pro/ba4b78ccdd9af06655b1b47671ee187ec49e47ce/"
  );
  
  const findAccounts = async (programId, signerPublicKey) => {
	try {
	  const busAccount = new PublicKey(BUS_ADDRESSES[0]); // Use the first bus address for this example
  
	  // Deriving the proof account
	  const [proofAccount] = PublicKey.findProgramAddressSync(
		[Buffer.from("proof"), signerPublicKey.toBuffer()],
		programId
	  );
  
	  const treasuryAccount = TREASURY_ADDRESS;
  
	  console.log("Found accounts:", {
		busAccount: busAccount.toBase58(),
		proofAccount: proofAccount.toBase58(),
		treasuryAccount: treasuryAccount.toBase58(),
	  });
  
	  // Function to log account details
	  const logAccountDetails = async (pubkey) => {
		const accountInfo = await connection.getAccountInfo(pubkey);
		if (accountInfo === null) {
		  throw new Error(`Account ${pubkey.toBase58()} does not exist`);
		}
		console.log(`Account ${pubkey.toBase58()}:`, accountInfo);
	  };
	  console.log("Checking account owners...");
	  await logAccountDetails(busAccount);
	  await logAccountDetails(proofAccount);
	  await logAccountDetails(treasuryAccount);
  
	  return {
		busAccount,
		proofAccount,
		treasuryAccount,
	  };
	} catch (error) {
	  console.error("Error finding accounts:", error);
	  throw error;
	}
  };
  
  const findNextHash = (hash, difficulty, signer) => {
	let nextHash;
	let nonce = 0;
  
	console.log("Starting to find next hash...");
	console.log("Initial hash:", hash);
	console.log("Difficulty:", difficulty);
	console.log("Signer:", signer.toBase58());
	while (true) {
	  const input = Buffer.concat([
		hash,
		signer.toBuffer(),
		new BN(nonce).toArrayLike(Buffer, 'le', 8),
	  ]);
	  nextHash = Buffer.from(keccak256.arrayBuffer(input));
	  if (nextHash.compare(difficulty) <= 0) {
		console.log(
		  "Found valid hash:",
		  nextHash.toString("hex"),
		  "Nonce:",
		  nonce
		);
		break;
	  }
	  nonce += 1;
	  if (nonce % 1000000 === 0) {
		console.log("Current nonce:", nonce);
	  }
	}
	return { nextHash, nonce };
  };
  
  const callResetProgram = async (signer) => {
	try {
	  console.log("Calling reset program...");
	  const resetInstruction = new TransactionInstruction({
		keys: [
		  { pubkey: signer.publicKey, isSigner: true, isWritable: true },
		  {
			pubkey: new PublicKey("DzLpPA3uYgTzSnCJDamwKhKzYyKKPraN1SJdv3hboBMB"),
			isSigner: false,
			isWritable: true,
		  },
		],
		programId: programId,
		data: Buffer.from([0]), // Assuming 0 is the discriminant for the reset instruction
	  });
  
	  const transaction = new Transaction().add(resetInstruction);
	  transaction.feePayer = signer.publicKey;
	  transaction.recentBlockhash = (
		await connection.getLatestBlockhash()
	  ).blockhash;
  
	  console.log("Sending reset transaction...");
	  const resetSignature = await sendAndConfirmTransaction(
		connection,
		transaction,
		[signer]
	  );
	  console.log(
		"Reset program call successful with signature:",
		resetSignature
	  );
	} catch (error) {
	  console.error("Error calling reset program:", error);
	}
  };
  
  const fetchInitialHash = async (proofAccount) => {
	const accountInfo = await connection.getAccountInfo(proofAccount);
	if (accountInfo === null) {
	  throw new Error(`Account ${proofAccount.toBase58()} does not exist`);
	}
	const data = accountInfo.data;
	console.log("Proof account data:", data); // Log the data for debugging
	const bufferData = Buffer.from(data);
	const adjustedData = Uint8Array.prototype.slice.call(bufferData, 8); 
	console.log("Proof account adjData:", adjustedData); // Log the data for debugging
  
	const proof = ProofLayout.decode(Buffer.from(adjustedData));
	console.log("Decoded proof:", proof); // Log the decoded proof for debugging
	console.log("Proof initial hash:", proof.hash); // Log the data for debugging
	return Buffer.from(proof.hash);
  };
  
  const callMineProgram = async () => {
	try {
	  console.log("Calling mine program...");
	  const { busAccount, proofAccount, treasuryAccount } = await findAccounts(
		programId,
		signer.publicKey
	  );
  
	  // Discriminant for the Mine instruction
	  console.log("Mine discriminant:", mineDiscriminant);
	  const mineDiscriminant = Buffer.from([2]);
	  console.log("Mine discriminant after assignment:", mineDiscriminant);
  
	  // Example difficulty (replace with your actual difficulty)
	  const difficulty = Buffer.from([0, ...new Array(31).fill(255)]);
	  console.log("Difficulty:", difficulty);
  
	  // Initial hash (replace with your actual initial hash)
	  const initialHash = await fetchInitialHash(proofAccount);
	  console.log("Initial hash:", initialHash);
  
	  // Compute next hash and nonce
	  console.log("Computing next hash and nonce...");
	  const { nextHash, nonce } = findNextHash(
		initialHash,
		difficulty,
		signer.publicKey
	  );
  
	  // Convert nonce to 8 bytes using bn.js
	  const nonceBuffer = new BN(nonce).toArrayLike(Buffer, "le", 8);
	  console.log("Nonce buffer:", nonceBuffer);
  
	  // Construct the data for the Mine instruction
	  const data = Buffer.concat([
		mineDiscriminant,
		nextHash,
		nonceBuffer
	  ]);
	  console.log("Constructed data:", data);
  
	  console.log("Creating transaction instruction...");
	  const instruction = new TransactionInstruction({
		keys: [
		  { pubkey: signer.publicKey, isSigner: true, isWritable: true },
		  { pubkey: busAccount, isSigner: false, isWritable: true },
		  { pubkey: proofAccount, isSigner: false, isWritable: true },
		  { pubkey: treasuryAccount, isSigner: false, isWritable: false },
		  {
			pubkey: SYSVAR_SLOT_HASHES_PUBKEY,
			isSigner: false,
			isWritable: false,
		  },
		],
		programId: programId,
		data,
	  });
  
	  const transaction = new Transaction().add(instruction);
	  transaction.feePayer = signer.publicKey;
	  transaction.recentBlockhash = (
		await connection.getLatestBlockhash()
	  ).blockhash;
  
	  console.log("Sending mine transaction...");
	  const signature = await sendAndConfirmTransaction(
		connection,
		transaction,
		[signer]
	  );
	  console.log("Mine program call successful with signature:", signature);
	} catch (error) {
	  console.error("Error calling mine program:", error);
	}
  };
  
  // Move the function call to your component or app initialization
  const handleMining = async () => {
	try {
	  const { pubkeyString, signer } = initializeKeys();
	  console.log("Initialized keys");
	  await callMineProgram();
	} catch (error) {
	  console.error("Error during mining process:", error);
	}
  };
  
  export default handleMining;
  