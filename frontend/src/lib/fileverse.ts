

import { secp256k1 } from "@noble/curves/secp256k1";
import { gcm } from "@noble/ciphers/aes";
import { sha256 } from "@noble/hashes/sha256";
import { hkdf } from "@noble/hashes/hkdf";
import { randomBytes } from "@noble/ciphers/webcrypto";
import { utf8ToBytes, bytesToHex, hexToBytes } from "@noble/ciphers/utils";
import { createPublicClient, http, type WalletClient } from "viem";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";

export interface EncryptedDocument {
    ephemeralPubKey: string;
    nonce: string;
    ciphertext: string;
    version: "fileverse-ecies-v1";
}

export interface DocumentContent {
    title: string;
    body: string;
    createdAt: string;
    author: string;
}


export function encryptForWallet(
    content: DocumentContent,
    recipientPubKeyHex: string
): EncryptedDocument {
    const ephemeralPrivKey = secp256k1.utils.randomPrivateKey();
    const ephemeralPubKey = secp256k1.getPublicKey(ephemeralPrivKey, true);

    const sharedPoint = secp256k1.getSharedSecret(ephemeralPrivKey, recipientPubKeyHex);
    const aesKey = hkdf(sha256, sharedPoint.slice(1, 33), undefined, utf8ToBytes("fileverse-ecies"), 32);

    const nonce = randomBytes(12);
    const plaintext = utf8ToBytes(JSON.stringify(content));
    const cipher = gcm(aesKey, nonce);
    const ciphertext = cipher.encrypt(plaintext);

    return {
        ephemeralPubKey: bytesToHex(ephemeralPubKey),
        nonce: bytesToHex(nonce),
        ciphertext: bytesToHex(ciphertext),
        version: "fileverse-ecies-v1",
    };
}

export function decryptWithKey(
    encrypted: EncryptedDocument,
    recipientPrivKeyHex: string
): DocumentContent {
    const sharedPoint = secp256k1.getSharedSecret(recipientPrivKeyHex, encrypted.ephemeralPubKey);
    const aesKey = hkdf(sha256, sharedPoint.slice(1, 33), undefined, utf8ToBytes("fileverse-ecies"), 32);

    const nonce = hexToBytes(encrypted.nonce);
    const ciphertext = hexToBytes(encrypted.ciphertext);
    const decipher = gcm(aesKey, nonce);
    const plaintext = decipher.decrypt(ciphertext);

    return JSON.parse(new TextDecoder().decode(plaintext)) as DocumentContent;
}



export function deriveKeyFromSignature(signature: string): {
    privateKey: string;
    publicKey: string;
} {
    const hash = sha256(utf8ToBytes(signature));
    const pubKey = secp256k1.getPublicKey(hash, true);
    return { privateKey: bytesToHex(hash), publicKey: bytesToHex(pubKey) };
}

export const SIGN_MESSAGE = "DarkEarn: Derive my Fileverse encryption key pair";

const ensPublicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
});

export async function getPublicKeyForAddress(
    address: string,
    walletClient: WalletClient | null,
    ensName?: string
): Promise<string> {
    if (walletClient) {
        const addresses = await walletClient.getAddresses();
        const connectedAddress = addresses?.[0];
        if (connectedAddress?.toLowerCase() === address.toLowerCase()) {
            const sig = await walletClient.signMessage({
                account: connectedAddress,
                message: SIGN_MESSAGE,
            });
            const keys = deriveKeyFromSignature(sig);
            return keys.publicKey;
        }
    }

    let nameToLookup: string | null = ensName ?? null;
    if (!nameToLookup) {
        nameToLookup = await ensPublicClient.getEnsName({
            address: address as `0x${string}`,
        });
    }
    if (!nameToLookup) {
        throw new Error(`No ENS name found for ${address}. User must set "darkearn-pubkey" ENS text record.`);
    }

    const pubKey = await ensPublicClient.getEnsText({
        name: normalize(nameToLookup),
        key: "darkearn-pubkey",
    });

    if (!pubKey) {
        throw new Error(`${nameToLookup} has not set darkearn-pubkey ENS text record.`);
    }
    return pubKey;
}

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || "";
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs";
const LOCAL_STORAGE_KEY = "fileverse-docs";

function isPinataConfigured(): boolean {
    return PINATA_JWT.length > 0;
}


async function pinToIPFS(doc: EncryptedDocument, name: string): Promise<string> {
    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: JSON.stringify({
            pinataContent: doc,
            pinataMetadata: { name },
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Pinata pin failed (${res.status}): ${err}`);
    }

    const data = await res.json();
    return data.IpfsHash as string;
}


async function fetchFromIPFS(cid: string): Promise<EncryptedDocument> {
    const res = await fetch(`${PINATA_GATEWAY}/${cid}`);
    if (!res.ok) throw new Error(`IPFS fetch failed (${res.status})`);
    return (await res.json()) as EncryptedDocument;
}


function localStore(cid: string, doc: EncryptedDocument): void {
    try {
        const store = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
        store[cid] = doc;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
    } catch {
        console.error("[Fileverse] localStorage write failed");
    }
}

function localFetch(cid: string): EncryptedDocument | null {
    try {
        const store = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
        return store[cid] || null;
    } catch {
        return null;
    }
}


export async function storeEncryptedDocument(doc: EncryptedDocument): Promise<string> {
    if (isPinataConfigured()) {
        try {
            const cid = await pinToIPFS(doc, `darkearn-${Date.now()}`);
            console.log(`[Fileverse] Pinned to IPFS: ${cid}`);
            localStore(cid, doc);
            return cid;
        } catch (err) {
            console.error("[Fileverse] IPFS pin failed, falling back to localStorage:", err);
        }
    }

    
    const serialized = JSON.stringify(doc);
    const hash = bytesToHex(sha256(utf8ToBytes(serialized)));
    const cid = `local-${hash.slice(0, 16)}`;
    localStore(cid, doc);
    console.log(`[Fileverse] Stored locally: ${cid}`);
    return cid;
}

export async function fetchEncryptedDocument(cid: string): Promise<EncryptedDocument | null> {
   
    const cached = localFetch(cid);
    if (cached) return cached;

    
    if (isPinataConfigured() && !cid.startsWith("local-")) {
        try {
            const doc = await fetchFromIPFS(cid);
            localStore(cid, doc);
            return doc;
        } catch (err) {
            console.error("[Fileverse] IPFS fetch failed:", err);
        }
    }

    return null;
}
