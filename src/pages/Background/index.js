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
  SendTransactionError,
} from '@solana/web3.js';
import { keccak256 } from 'js-sha3';
import BN from 'bn.js';
import { struct, blob, nu64 } from '@solana/buffer-layout';
import { publicKey } from '@solana/buffer-layout-utils';
import bs58 from 'bs58';

const ProofLayout = struct([
  publicKey('authority'),
  nu64('claimable_rewards'),
  blob(32, 'hash'),
  nu64('total_hashes'),
  nu64('total_rewards'),
  // Add other fields with appropriate types
]);

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

const connection = new Connection(
  'https://capable-icy-star.solana-testnet.quiknode.pro/02604b029a8773c1ebc9e1933bdff5800f18e986'
);
///proofAccount.claimable_rewards ->component/balance.rs
// balance: pub fn use_ore_balance_user-> hooks/use_ore_balance.rs

const getProofAccount = (signerPublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('proof'), signerPublicKey.toBuffer()],
    programId
  );
};
const findAccounts = async (signerPublicKey, programId) => {
  try {
    const busAccount = new PublicKey(BUS_ADDRESSES[0]); // Use the first bus address for this example

    // Deriving the proof account
    const [proofAccount] = getProofAccount(signerPublicKey);

    const treasuryAccount = TREASURY_ADDRESS;

    // Function to log account details
    const logAccountDetails = async (programId) => {
      const accountInfo = await connection.getAccountInfo(programId);
      if (accountInfo === null) {
        throw new Error(`Account ${programId.toBase58()} does not exist`);
      }
      //console.log(`Account ${programId.toBase58()}:`, accountInfo);
    };
    console.log('Checking account owners...');
    await logAccountDetails(busAccount);
    await logAccountDetails(proofAccount);
    await logAccountDetails(treasuryAccount);

    return {
      busAccount,
      proofAccount,
      treasuryAccount,
    };
  } catch (error) {
    console.error('Error finding accounts:', error);
    throw error;
  }
};

const findNextHash = (hash, difficulty, signer) => {
  let nextHash;
  let nonce = 0;

  // console.log("Starting to find next hash...");
  // console.log("Initial hash:", hash);
  // console.log("Difficulty:", difficulty);
  // console.log("Signer:", signer.toBase58());
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

const callResetProgram = async (signer) => {
  try {
    console.log('Calling reset program...');
    const resetInstruction = new TransactionInstruction({
      keys: [
        { pubkey: signer.publicKey, isSigner: true, isWritable: true },
        {
          pubkey: new PublicKey('DzLpPA3uYgTzSnCJDamwKhKzYyKKPraN1SJdv3hboBMB'),
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

    console.log('Sending reset transaction...');
    const resetSignature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [signer]
    );
    console.log(
      'Reset program call successful with signature:',
      resetSignature
    );
  } catch (error) {
    console.error('Error calling reset program:', error);
  }
};

const fetchInitialHash = async (proofAccount) => {
  const accountInfo = await connection.getAccountInfo(proofAccount);
  if (accountInfo === null) {
    throw new Error(`Account ${proofAccount.toBase58()} does not exist`);
  }
  const data = accountInfo.data;
  //console.log("Proof account data:", data); // Log the data for debugging
  const bufferData = Buffer.from(data);
  const adjustedData = Uint8Array.prototype.slice.call(bufferData, 8);
  //console.log("Proof account adjData:", adjustedData); // Log the data for debugging

  const proof = ProofLayout.decode(Buffer.from(adjustedData));
  // console.log("Decoded proof:", proof); // Log the decoded proof for debugging
  // console.log("Proof initial hash:", proof.hash); // Log the data for debugging
  return Buffer.from(proof.hash);
};

const callMineProgram = async (signer) => {
  try {
    console.log(
      'Calling mine program...signer:',
      programId,
      signer,
      signer.publicKey
    );
    const { busAccount, proofAccount, treasuryAccount } = await findAccounts(
      signer.publicKey, 
	  programId
    );
    // Discriminant for the Mine instruction
    //console.log("Mine discriminant:", mineDiscriminant);
    const mineDiscriminant = Buffer.from([2]);
    //console.log("Mine discriminant after assignment:", mineDiscriminant);

    // Example difficulty (replace with your actual difficulty)
    const difficulty = Buffer.from([0, ...new Array(31).fill(255)]);
    //console.log("Difficulty:", difficulty);

    // Initial hash (replace with your actual initial hash)
    const initialHash = await fetchInitialHash(proofAccount);
    //console.log("Initial hash:", initialHash);

    // Compute next hash and nonce
    console.log('Computing next hash and nonce...');
    const { nextHash, nonce } = findNextHash(
      initialHash,
      difficulty,
      signer.publicKey
    );

    // Convert nonce to 8 bytes using bn.js
    const nonceBuffer = new BN(nonce).toArrayLike(Buffer, 'le', 8);
    console.log('Nonce buffer:', nonceBuffer);

    // Construct the data for the Mine instruction
    const data = Buffer.concat([mineDiscriminant, nextHash, nonceBuffer]);
   // console.log('Constructed data:', data);

    console.log('Creating transaction instruction...');
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

    console.log('Sending mine transaction...');
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      signer,
    ]);
    console.log('Mine program call successful with signature:', signature);
  } catch (error) {
    console.error('Error calling mine program:', error);
  }
};

// New functions to get balances
export const getSolanaBalance = async (pubKey) => {
  try {
    const publicKey = new PublicKey(pubKey);
    const balance = await connection.getBalance(publicKey);
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
	  console.log("Fetching claimable rewards for:", pubKey); // Debugging line
	  const publicKey = new PublicKey(pubKey);
	  const [proofAccount] = getProofAccount(publicKey);
	  console.log("Proof account address:", proofAccount.toBase58()); // Debugging line
	  const accountInfo = await connection.getAccountInfo(proofAccount);
	  if (accountInfo === null) {
		throw new Error(`Account ${proofAccount.toBase58()} does not exist`);
	  }
	  const data = accountInfo.data;
	  console.log("Proof account data:", data); // Log the data for debugging
	  const bufferData = Buffer.from(data);
	  const adjustedData = Uint8Array.prototype.slice.call(bufferData, 8);
	  console.log("Proof account adjusted data:", adjustedData); // Log the data for debugging
  
	  const proof = ProofLayout.decode(Buffer.from(adjustedData));
	  console.log("Decoded proof:", proof); // Log the decoded proof for debugging
	  console.log("Proof claimable rewards:", proof.claimable_rewards); // Log the data for debugging
	  
	  return proof.claimable_rewards / 1e9;
	} catch (error) {     
	  console.error('Error getting Spam balance:', error);
	  return 0;
	}
  };
  
// Move the function call to your component or app initialization
const sendBackgroundRequests = async (signer) => {
  try {
    //const { pubkeyString, signer } = initializeKeys();
    console.log('Initialized keys');
    await callMineProgram(signer);
  } catch (error) {
    console.error('Error during mining process:', error);
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 2. A page requested user data, respond with a copy of `user`
  if (message.message === 'Start') {
    const mineSpam = () => {
      //console.log('Mining spam...', message.privateKey);
      const signer = Keypair.fromSecretKey(
        bs58.decode(message.privateKey.privateKey)
      );
      console.log('Signer: ', signer)
	  console.log('Signer.publicKey: ', signer.publicKey)
	  
      try {
        sendBackgroundRequests(signer);
      } catch (error) {
        console.error('Error sending background request:', error.message);
      }
    };

    const intervalId = setInterval(mineSpam, 12000);
    return () => clearInterval(intervalId);
  }
  sendResponse('sendResponse');
  return true;
});
const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();
