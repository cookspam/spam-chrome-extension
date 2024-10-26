console.log('This is the background page.');
console.log('Put the background scripts here.');

// solanaMiningService.js

import {
  Connection,
  Keypair,
  Transaction,
  PublicKey,
  sendAndConfirmTransaction,
  SYSVAR_SLOT_HASHES_PUBKEY,
  TransactionInstruction,
  ComputeBudgetProgram,
  SystemProgram,
  SendTransactionError,
} from '@solana/web3.js';
import { keccak256 } from 'js-sha3';
import BN from 'bn.js';
import { struct, blob, nu64 } from '@solana/buffer-layout';
import { publicKey } from '@solana/buffer-layout-utils';
import bs58 from 'bs58';

const ProofLayout = struct([
  publicKey('authority'),        // 32 bytes
  nu64('claimable_rewards'),     // 8 bytes
  blob(32, 'hash'),              // 32 bytes
  nu64('total_hashes'),          // 8 bytes
  nu64('total_rewards')          // 8 bytes
  // Total should be 88 bytes if everything matches.
]);

const CU_LIMIT_MINE = 500 + (2300 * 5);

const programId = new PublicKey('cookr8CThnfEQZvvrB6zhh5K4X8XNkPjJi4uUDtkBuG');
const BUS_ADDRESSES = [
  'DzLpPA3uYgTzSnCJDamwKhKzYyKKPraN1SJdv3hboBMB',
  '2Zn77yZspohsPkLP9zcWX3dxuQ69dTRNyJciVEDENJh3',
  '4p8nEz7XMayiAkHYCrgs5WPWv4DUAxzcKpzX4X1Lyf61',
  '5g6DanqLyEwEm2zrbJCR67g4NwGMNwPcF6gB9AqbxncJ',
  '8ktdXVusqMvNHkZmUnSoRy2kjQEsVsGC387K9vXL2Q6',
  'DrKC38wdpumpkJwPLEa7yky9su1v82Ng2kNPy7UMt5fa',
  'CM6ergyxwT2kKaGD2EMXwgi8KBKDa5sCZESWRhhqRT1z',
  'F9kpy13nmNkxGUA5riGbAkLkR6Ky62LgiydUD5AfTEKm',
];
const TREASURY_ADDRESS = new PublicKey(
  '3amHhT6cLgvfjKWbka6DYjs9zS5pLFnmYw1g8C6DPa4x'
);
const MINT_ADDRESS = new PublicKey(
  'spamwgqKEBE2BtsfE2QesxpmYZZKp3LfHsEdF1MLpfU'
);
const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
); //given
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
); //given

let connection;

const initializeConnection = async () => {
  const storedRpcUrl = await chrome.storage.local.get('rpcUrl');
  const rpcUrl = storedRpcUrl.rpcUrl || 'https://api.testnet.solana.com';
  console.log('RPC set', rpcUrl);
  connection = new Connection(rpcUrl, { disableRetryOnRateLimit: false });
};

const checkAndDistribute = async (mainPublicKey, mainPrivateKey) => {
  // Retrieve 'solDistributed' from chrome storage
  const storageData = await chrome.storage.local.get('solDistributed');
  
  // Ensure 'solDistributed' is initialized as an array
  let solDistributed = storageData.solDistributed || [];
  if (!Array.isArray(solDistributed)) {
    solDistributed = [];
  }

  console.log("Current 'solDistributed' list:", solDistributed);

  // Check the main address balance
  const balance = await connection.getBalance(mainPublicKey);
  console.log(`Main address balance: ${balance / 1e9} SOL`);

  // Ensure the main balance is above 0.05 SOL before attempting distribution
  if (balance < 0.02 * 1e9) {
    console.log("Insufficient balance for distribution.");
    return;
  }

  // Collect all recipient public keys that haven't received SOL
  let recipientAddresses = [];
  for (let i = 2; i <= 5; i++) {
    const key = `pubKey${i}`;

    // Skip addresses that have already received SOL
    if (solDistributed.includes(key)) {
      console.log(`${key} already received SOL, skipping...`);
      continue;
    }

    const { [key]: pubKeyString } = await chrome.storage.local.get(key);
    console.log(`Checking local storage for ${key}: ${pubKeyString}`);

    if (!pubKeyString) {
      console.error(`Public key for ${key} not found in local storage.`);
      continue;
    }

    recipientAddresses.push(pubKeyString);
  }

  if (recipientAddresses.length === 0) {
    console.log("No addresses left to distribute to.");
    return;
  }

  console.log("Recipient addresses for distribution:", recipientAddresses);

  // Send SOL to all collected recipient addresses at once
  await sendSOLToAll(mainPrivateKey, recipientAddresses, 0.001);

  // Update 'solDistributed' with the successfully distributed addresses
  solDistributed.push(...recipientAddresses.map((_, idx) => `pubKey${idx + 2}`));

  // Store the updated solDistributed array
  await chrome.storage.local.set({ solDistributed });
  console.log("Updated 'solDistributed' list:", solDistributed);

  if (solDistributed.length === 4) {
    console.log('Distribution to all addresses completed.');
  }
};

// Function to send SOL to all collected recipient addresses
const sendSOLToAll = async (privateKey, recipientAddresses, amount) => {
  const connection = new Connection('https://api.testnet.solana.com');

  // Decode the main private key
  const mainPrivateKey = bs58.decode(privateKey);
  const sender = Keypair.fromSecretKey(mainPrivateKey);

  const transaction = new Transaction();

  for (const recipient of recipientAddresses) {
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: sender.publicKey,
      toPubkey: new PublicKey(recipient),
      lamports: amount * 1e9, // Convert SOL to lamports
    });
    transaction.add(transferInstruction);
  }

  // Setting up the latest blockhash and fee payer
  const latestBlockhash = await connection.getLatestBlockhash();
  transaction.recentBlockhash = latestBlockhash.blockhash;
  transaction.feePayer = sender.publicKey;

  try {
    // Signing and sending the transaction
    const signature = await sendAndConfirmTransaction(
      connection, 
      transaction, 
      [sender]
    );
    console.log(`Transaction successful with signature: ${signature}`);
  } catch (error) {
    console.error("Error sending SOL:", error);
    // Handle the rate limit error or other issues, possibly retry if needed
  }
};

// Start the balance check and distribution logic
const startBalanceCheck = async (mainPubKey, mainPrivateKey) => {
  console.log(`Starting balance check for: ${mainPubKey}`);
  const intervalId = setInterval(async () => {
    const storageData = await chrome.storage.local.get('solDistributed');
    
    // Ensure 'solDistributed' is initialized as an array
    let solDistributed = storageData.solDistributed || [];
    
    if (!Array.isArray(solDistributed)) {
      solDistributed = [];
    }

    console.log("Current 'solDistributed' list during interval:", solDistributed);

    if (solDistributed.length === 4) {
      console.log('SOL already distributed to all addresses. Stopping further checks.');
      clearInterval(intervalId); // Stop checking once all addresses have been distributed to
      return;
    }

    await checkAndDistribute(new PublicKey(mainPubKey), mainPrivateKey); // Call the check and distribution function
  }, 10000); // Check every 10 seconds
};


initializeConnection();


const getProofAccount = (signerPublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('proof'), signerPublicKey.toBuffer()],
    programId
  );
}; //5

const getTreasuryAccountInfo = async () => {
  console.log("in get treasury account info")
  const accountInfo = await connection.getAccountInfo(TREASURY_ADDRESS);

  if (!accountInfo) {
    throw new Error(`Treasury account does not exist`);
  }

  // Assuming the data structure matches your Rust code's structure, decode the treasury information
  const data = accountInfo.data;
  const bufferData = Buffer.from(data);

  // Adjust the buffer slicing if necessary to match the data structure (replace with appropriate decoding logic)
  const treasury = {
    difficulty: bufferData.readBigUInt64BE(0), // Assuming difficulty is stored as u64 at offset 0, adjust this if necessary
    reward_rate: bufferData.readBigUInt64BE(8), // Adjust if stored differently
    //last_reset_at: bufferData.readBigUInt64BE(16),
    //total_claimed_rewards: bufferData.readBigUInt64BE(24)
  };

  console.log(`Difficulty: ${treasury.difficulty}`);
  return treasury;
};

// Register Proof Accounts
const registerAllSigners = async (mainSigner) => {
  try {
    for (let i = 1; i <= 5; i++) {
      const signer = await signerByIndex(i);
      const [proofAccount] = getProofAccount(signer.publicKey);
      const minRent = await connection.getMinimumBalanceForRentExemption(ProofLayout.span);
      const balance = await connection.getBalance(proofAccount);
      
      // Fund the proof account if balance is insufficient
      if (balance < minRent) {
        const fundTx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: mainSigner.publicKey,
            toPubkey: proofAccount,
            lamports: minRent - balance,
          })
        );
        await sendAndConfirmTransaction(connection, fundTx, [mainSigner]);
        console.log(`Funded proof account ${i} successfully`);
      }
      
      // Register the proof account
      await callRegister(signer);
      console.log(`Registered signer ${i}: ${signer.publicKey.toBase58()}`);
    }
  } catch (error) {
    console.error('Error registering signers:', error);
  }
};


async function callRegister(signer) {
  const [proofAccount, bumpSeed] = getProofAccount(signer.publicKey);
  const discriminant = Buffer.from([1]);

  const data = Buffer.concat([discriminant, Buffer.from([bumpSeed])]);
  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: signer.publicKey, isSigner: true, isWritable: false },
      { pubkey: proofAccount, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: programId,
    data,
  }); 

  const transaction = new Transaction().add(instruction);

  transaction.feePayer = signer.publicKey;
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;

  try {
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      signer,
    ]);
    console.log('Registration Transaction signature', signature);
  } catch (error) {
    console.error('Registration Transaction failed', error);
  }
} //5

// Mine Hash for each account using workers
const startMiningAllAccounts = async () => {
  const treasuryInfo = await getTreasuryAccountInfo();
  const miningResults = [];
  //const difficulty = treasuryInfo.difficulty;
  const difficulty = Buffer.from([0, ...new Array(31).fill(255)]);

  for (let i = 1; i <= 5; i++) {
    try {
      const signer = await signerByIndex(i);
      const [proofAccount] = getProofAccount(signer.publicKey);
      const initialHash = await fetchInitialHash(proofAccount);
      //console.log("INITIAL HASH EARNED", initialHash)

      console.log(`Mining for signer ${signer.publicKey.toBase58()}`);
      const result = findNextHash(initialHash, difficulty, signer.publicKey);
      //console.log("Mining result for signer:", result);
      miningResults.push(result);
    } catch (error) {
      console.error(`Error mining for account ${i}:`, error)
    } 
  }
  console.log("MINING RESULT->arg of submitMineHashes", miningResults)
  return miningResults;
};

// Function to find the next valid hash
const findNextHash = (hash, difficulty, signer) => {
  let nextHash;
  let nonce = 0;

  while (true) {
    const input = Buffer.concat([
      hash,
      signer.toBuffer(),
      new BN(nonce).toArrayLike(Buffer, 'le', 8),
    ]);
    nextHash = Buffer.from(keccak256.arrayBuffer(input));
    if (nextHash.compare(difficulty) <= 0) {
      console.log(
        'Found valid hash:',
        nextHash.toString('hex'),
        'Nonce:',
        nonce
      );
      break;
    }
    nonce += 1;
    if (nonce % 1000000 === 0) {
      console.log('Current nonce:', nonce);
    }
  }
  return { nextHash, nonce };
};

// Submit mined hashes
const submitMinedHashes = async (miningResults) => {
  console.log("IN: submitMiniedHashes")
  try {
    let instructions = [];
    //const mainSigner = await signerByIndex(1);
    let signers = []
    const priorityFee = 2000;

    // Add compute budget instructions for CU limit and price
    const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({ units: CU_LIMIT_MINE });
    const computePriceIx = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: priorityFee });
    instructions.push(computeBudgetIx, computePriceIx);

    for (let i = 0; i < miningResults.length; i++) {
      const signer = await signerByIndex(i + 1);
      console.log("singer (line 377)", signer, signers)
      signers.push(signer);

      const { nextHash, nonce } = miningResults[i];
      const busAccount = new PublicKey(BUS_ADDRESSES[i % BUS_ADDRESSES.length]);
      const treasuryAccount = TREASURY_ADDRESS;
     
      // Convert nextHash to Buffer if it's a Uint8Array
      const nonceBuffer = new BN(nonce).toArrayLike(Buffer, 'le', 8);
      const data = Buffer.concat([Buffer.from([2]), nextHash, nonceBuffer]);

      // Create a transaction instruction
      instructions.push(new TransactionInstruction({
        keys: [
          { pubkey: signer.publicKey, isSigner: true, isWritable: true },
          { pubkey: busAccount, isSigner: false, isWritable: true },
          { pubkey: getProofAccount(signer.publicKey)[0], isSigner: false, isWritable: true },
          { pubkey: treasuryAccount, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_SLOT_HASHES_PUBKEY, isSigner: false, isWritable: false },
        ],
        programId,
        data,
      }));
    //   // Check if the transaction is getting too large
    //  if (instructions.length >= 5) { // Adjust this based on testing
    //   // Send the current batch of instructions
    //   await sendTransactionBatch(instructions, signers);
    //   instructions = [computeBudgetIx, computePriceIx]; // Reset with budget instructions
    //   signers = [];
    // }
  }
  // Send any remaining instructions
 
    console.log("INSTRUCTION remaining", instructions)
    await sendTransactionBatch(instructions, signers);
  

  console.log('Mined hashes submitted successfully');
  } catch (error) {
    console.error('Error submitting mined hashes:', error);
    throw error;
  }
};

// Helper function to send the transaction batch
const sendTransactionBatch = async (instructions, signers) => {
  const transaction = new Transaction().add(...instructions);
  transaction.feePayer = signers[0].publicKey;
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  // Log the transaction details
  console.log('Transaction details:', transaction);

  try {
    const simulationResult = await connection.simulateTransaction(transaction);
    console.log('Simulation logs:', simulationResult.value.logs);
    // Sign the transaction with all signers
    transaction.sign(...signers);
    // Log the transaction details after signing
    console.log("Transaction details after signing:", transaction);
    await sendAndConfirmTransaction(connection, transaction, signers);
  } catch (error) {
    if (error instanceof SendTransactionError) {
      console.error("Transaction failed with logs:", error.logs);
    } else {
      console.error("Unexpected error:", error);
    }
  }
};


const fetchInitialHash = async (proofAccount) => {
  try {
    console.log("Fetching account info for:", proofAccount.toBase58());

    const accountInfo = await connection.getAccountInfo(proofAccount);
    console.log("ACCOUNT INFO", proofAccount.toBase58(), accountInfo)

    if (accountInfo === null) {
      throw new Error(`Account ${proofAccount.toBase58()} does not exist`);
    }

    const data = accountInfo.data;
    
    // Check if buffer length matches expectations
    if (data.length < ProofLayout.span) {
      console.warn(`Unexpected buffer length: ${data.length}. Expected at least ${ProofLayout.span}.`);
      throw new Error("Buffer is too short to decode.");
    }

    const bufferData = Buffer.from(data);
    const adjustedData = Uint8Array.prototype.slice.call(bufferData, 8);

    const proof = ProofLayout.decode(Buffer.from(adjustedData));
   // const proof = ProofLayout.decode(Buffer.from(data));
    console.log("Decoded proof:", proof);

    return Buffer.from(proof.hash);
  } catch (error) {
    console.error("Error fetching account info:", error);
    throw error;
  }
};

const signerByIndex = async (index) => {
  // Retrieve the keypair from chrome storage
  const { [`pubKey${index}`]: pubKeyString, [`privateKey${index}`]: privateKeyString } = await chrome.storage.local.get([`pubKey${index}`, `privateKey${index}`]);

  if (!pubKeyString || !privateKeyString) {
    throw new Error(`Keypair for index ${index} not found.`);
  }

  // Decode the private key and return the signer
  const privateKey = bs58.decode(privateKeyString);
  const signer = Keypair.fromSecretKey(privateKey);

  // Verify if the loaded public key matches
  console.log(`Loaded public key for index ${index}: ${signer.publicKey.toBase58()}`);
  if (signer.publicKey.toBase58() !== pubKeyString) {
    throw new Error(`Mismatch between stored public key and generated keypair for index ${index}`);
  }

  return signer;
};

// New functions to get balances
export const getSolanaBalance = async (pubKey) => {
  try {
    const publicKey = new PublicKey(pubKey);
    const balance = await connection.getBalance(publicKey);
   // console.log('get SOL balance', balance);
    return balance / 1e9; // Convert lamports to SOL
  } catch (error) {
    console.error('Error getting Solana balance:', error);
    return 0;
  }
};

function spam_token_account_address(publicKey) {
  const [address] = PublicKey.findProgramAddressSync(
    [
      publicKey.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      MINT_ADDRESS.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return address;
}
export const getSpamBalance = async (pubKey) => {
  try {
    const publicKey = new PublicKey(pubKey);
    const tokenAccountAddress = spam_token_account_address(publicKey);
    const balanceInfo = await connection.getTokenAccountBalance(
      tokenAccountAddress
    );
    return parseFloat(balanceInfo.value.uiAmountString);
  } catch (error) {
    console.error('Error getting Spam balance:', error);
    return 0;
  }
};

export const getClaimableSpamBalance = async (pubKey) => {
  try {
    console.log('Fetching claimable rewards for:', pubKey); // Debugging line
    const publicKey = new PublicKey(pubKey);
    const [proofAccount] = getProofAccount(publicKey);
   // console.log('Proof account address:', proofAccount.toBase58()); // Debugging line
    const accountInfo = await connection.getAccountInfo(proofAccount);
    if (accountInfo === null) {
      throw new Error(`Account ${proofAccount.toBase58()} does not exist`);
    }
    const data = accountInfo.data;
    // console.log('Proof account data:', data); // Log the data for debugging
    const bufferData = Buffer.from(data);
    const adjustedData = Uint8Array.prototype.slice.call(bufferData, 8);
    // console.log('Proof account adjusted data:', adjustedData); // Log the data for debugging

    const proof = ProofLayout.decode(Buffer.from(adjustedData));
    // console.log('Decoded proof:', proof); // Log the decoded proof for debugging
    // console.log('Proof claimable rewards:', proof.claimable_rewards); // Log the data for debugging

    return proof.claimable_rewards / 1e9;
  } catch (error) {
    console.error('Error getting Spam balance:', error);
    return 0;
  }
};

// // Move the function call to your component or app initialization
// const sendBackgroundRequests = async (signer) => {
//   try {
//     //const { pubkeyString, signer } = initializeKeys();
//     console.log('Initialized keys');

//     await callMineProgram(signer);
//   } catch (error) {
//     console.error('Error during mining process:', error);
//   }
// };

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("Background script received message: ", message);

  if (message.message === 'Start') {
    console.log("Start received")
    try {
      //Register all signer once
      await registerAllSigners(await signerByIndex(1)); // Main signer
      // Set up an interval to continuously mine
      const intervalId = setInterval(async () => {
        try {
          console.log("Starting mining process...");
          const miningResults = await startMiningAllAccounts();
          await submitMinedHashes(miningResults);
        } catch (error) {
          console.error("Error during mining process:", error);
        }
      }, 10000); // Adjust the interval (in milliseconds) as needed
    // Save the interval ID if needed to clear later
      sendResponse({ success: true, intervalId });
    } catch (error) {
      console.error("Error during register signers:", error);
      sendResponse({ success: false, error: error.message });
    }
  } else if (message.message === 'StartBalanceCheck') {
    const { pubKey, privateKey } = message;
    console.log("balance check starting...")
    startBalanceCheck(pubKey, privateKey);
  }
  
  return true;
});

const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();
