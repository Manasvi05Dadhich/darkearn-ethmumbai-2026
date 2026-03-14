/**
 * DarkEarn × Fileverse Encryption Service
 *
 * ECIES encryption (secp256k1 + AES-256-GCM) for private briefs and work submissions.
 * Storage: Pinata IPFS when VITE_PINATA_JWT is set, localStorage fallback otherwise.
 */

import { secp256k1 } from "@noble/curves/secp256k1";
import { gcm } from "@noble/ciphers/aes";
import { sha256 } from "@noble/hashes/sha256";
import { hkdf } from "@noble/hashes/hkdf";
import { randomBytes } from "@noble/ciphers/webcrypto";
import { utf8ToBytes, bytesToHex, hexToBytes } from "@noble/ciphers/utils";

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

// ─── Encryption / Decryption ────────────────────────────────

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

// ─── Wallet-based Key Derivation ────────────────────────────

export function deriveKeyFromSignature(signature: string): {
    privateKey: string;
    publicKey: string;
} {
    const hash = sha256(utf8ToBytes(signature));
    const pubKey = secp256k1.getPublicKey(hash, true);
    return { privateKey: bytesToHex(hash), publicKey: bytesToHex(pubKey) };
}

export const SIGN_MESSAGE = "DarkEarn: Derive my Fileverse encryption key pair";

// ─── IPFS Storage (Pinata) with localStorage fallback ───────

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || "";
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || "https://gateway.pinata.cloud/ipfs";
const LOCAL_STORAGE_KEY = "fileverse-docs";

function isPinataConfigured(): boolean {
    return PINATA_JWT.length > 0;
}

/**
 * Pin an encrypted document to IPFS via Pinata.
 * Returns the IPFS CID (e.g. "QmX...").
 */
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

/**
 * Fetch an encrypted document from IPFS via Pinata gateway.
 */
async function fetchFromIPFS(cid: string): Promise<EncryptedDocument> {
    const res = await fetch(`${PINATA_GATEWAY}/${cid}`);
    if (!res.ok) throw new Error(`IPFS fetch failed (${res.status})`);
    return (await res.json()) as EncryptedDocument;
}

// localStorage helpers for fallback
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

/**
 * Store an encrypted document.
 * Uses Pinata IPFS if configured, localStorage otherwise.
 * Always caches in localStorage for fast retrieval.
 */
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

    // Fallback: localStorage with hash-based CID
    const serialized = JSON.stringify(doc);
    const hash = bytesToHex(sha256(utf8ToBytes(serialized)));
    const cid = `local-${hash.slice(0, 16)}`;
    localStore(cid, doc);
    console.log(`[Fileverse] Stored locally: ${cid}`);
    return cid;
}

/**
 * Fetch an encrypted document by CID.
 * Checks localStorage first (cache), then IPFS.
 */
export async function fetchEncryptedDocument(cid: string): Promise<EncryptedDocument | null> {
    // Check local cache first
    const cached = localFetch(cid);
    if (cached) return cached;

    // If it looks like an IPFS CID (not local-*), try fetching from gateway
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
