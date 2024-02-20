import {
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
    Transaction,
    TransactionInstruction,
} from "@solana/web3.js";
import fs from 'fs';
import { solanaConfig } from "./config";

const keypairFilePath = './keypair.json';
const fromKeypair = loadKeypairFromJson(keypairFilePath);

const SOLANA_CONNECTION = new Connection(solanaConfig.rpcUrl);

/**
 * Load Keypair from JSON file.
 * If the file does not exist, generate a new keypair and save it to the file.
 * @param filePath The path to the keypair JSON file.
 * @returns The keypair.
 */
function loadKeypairFromJson(filePath: string): Keypair {
    try {
        const keypairData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return new Keypair({
            secretKey: Uint8Array.from(keypairData.secretKey),
            publicKey: new PublicKey(keypairData.publicKey),
        });
    } catch (error) {
        // If the file does not exist, generate a new keypair and save it to the file
        const newKeypair = Keypair.generate();
        const newKeypairData = {
            secretKey: Array.from(newKeypair.secretKey),
            publicKey: newKeypair.publicKey.toBase58(),
        };
        fs.writeFileSync(filePath, JSON.stringify(newKeypairData, null, 2));
        console.log(`New keypair generated and saved to ${filePath}`);
        return newKeypair;
    }
}

/**
 * Logs a memo to the Solana blockchain.
 * @param message The memo message to be logged.
 * @param programId The program ID for the memo instruction.
 * @returns The result of the transaction.
 */
async function logMemo(message: string, programId: PublicKey = new PublicKey(solanaConfig.memoProgramId)) {
    try {
        // 1. Create Solana Transaction
        const tx = new Transaction();

        // 2. Add Memo Instruction
        tx.add(
            new TransactionInstruction({
                keys: [{ pubkey: fromKeypair.publicKey, isSigner: true, isWritable: true }],
                data: Buffer.from(message, "utf-8"),
                programId,
            })
        );

        // 3. Send Transaction
        const result = await sendAndConfirmTransaction(SOLANA_CONNECTION, tx, [fromKeypair]);

        // 4. Log Transaction Details
        console.log("Transaction confirmed!");
        console.log("Transaction Result:", result);
        console.log("Transaction URL:", `https://explorer.solana.com/tx/${result}?cluster=devnet`);

        return result;
    } catch (error) {
        console.error("Transaction failed:", error);
        throw new Error("Transaction failed");
    }
}

// Example usage
logMemo("Hello from BARK memo program!").then((result) => {
    // Handle the result if needed
    console.log("Example: Transaction Result:", result);
});

export { logMemo };
