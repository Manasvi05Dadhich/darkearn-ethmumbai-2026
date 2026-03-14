/**
 * DarkEarn ERC-5564 Stealth Address Library
 *
 * Uses secp256k1 curve for all EC operations.
 * Keys derived deterministically from wallet signatures — no new seed phrase.
 *
 * Flow:
 *   Hunter: generateStealthKeys() → produces spending + viewing keypairs
 *   Poster: generateStealthAddress(metaAddress) → one-time stealth address + ephemeral pubkey
 *   Hunter: checkAnnouncement() → scans chain events to find their payments
 *   Hunter: computeStealthPrivateKey() → derives spending key for matched stealth address
 */

import { secp256k1 } from "@noble/curves/secp256k1";
import { keccak256, toHex, toBytes, type Hex } from "viem";

export const SCHEME_ID = 0; // secp256k1

const CURVE_ORDER = BigInt(
    "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141"
);

// ─── Types ───────────────────────────────────────────────────

export interface StealthKeys {
    spendingPrivateKey: Hex;
    viewingPrivateKey: Hex;
    spendingPublicKey: Hex; // compressed 33 bytes
    viewingPublicKey: Hex;  // compressed 33 bytes
    metaAddress: string;    // st:eth:0x{spending}{viewing}
}

export interface StealthPaymentData {
    stealthAddress: Hex;
    ephemeralPublicKey: Hex; // compressed 33 bytes, announced on-chain
    viewTag: Hex;            // first byte of keccak256(sharedSecret)
}

// ─── Key Generation (Hunter side) ────────────────────────────

/**
 * Derive stealth keypairs from two wallet signatures.
 * Deterministic: same wallet always produces same keys.
 */
export function deriveStealthKeys(
    spendingSignature: Hex,
    viewingSignature: Hex
): StealthKeys {
    const spendingPrivateKey = keccak256(spendingSignature);
    const viewingPrivateKey = keccak256(viewingSignature);

    const spendingPubBytes = secp256k1.getPublicKey(
        toBytes(spendingPrivateKey),
        true // compressed
    );
    const viewingPubBytes = secp256k1.getPublicKey(
        toBytes(viewingPrivateKey),
        true
    );

    const spendingPublicKey = toHex(spendingPubBytes);
    const viewingPublicKey = toHex(viewingPubBytes);

    const metaAddress = `st:eth:0x${spendingPublicKey.slice(2)}${viewingPublicKey.slice(2)}`;

    return {
        spendingPrivateKey,
        viewingPrivateKey,
        spendingPublicKey,
        viewingPublicKey,
        metaAddress,
    };
}

/** Messages the hunter signs to derive their stealth keypair */
export const SPENDING_SIGN_MSG = (addr: string) =>
    `DarkEarn stealth spending key for ${addr}`;
export const VIEWING_SIGN_MSG = (addr: string) =>
    `DarkEarn stealth viewing key for ${addr}`;

// ─── Stealth Address Generation (Poster side) ────────────────

/**
 * Parse an ERC-5564 stealth meta-address.
 * Format: st:eth:0x{33bytesSpending}{33bytesViewing}
 */
function parseMetaAddress(metaAddress: string): {
    spendingPubKey: Uint8Array;
    viewingPubKey: Uint8Array;
} {
    const hex = metaAddress.replace("st:eth:0x", "");
    const spendingHex = hex.slice(0, 66);  // 33 bytes = 66 hex chars
    const viewingHex = hex.slice(66, 132);
    return {
        spendingPubKey: toBytes(("0x" + spendingHex) as Hex),
        viewingPubKey: toBytes(("0x" + viewingHex) as Hex),
    };
}

/**
 * Generate a one-time stealth address for a hunter.
 * Poster calls this before releasing payment.
 *
 * Math:
 *   ephemeral = random keypair
 *   sharedSecret = ECDH(ephemeral.priv, hunter.viewingPub)
 *   hashedSecret = keccak256(sharedSecret)
 *   stealthPub = hunter.spendingPub + hashedSecret * G
 *   stealthAddress = address(stealthPub)
 */
export function generateStealthAddress(metaAddress: string): StealthPaymentData {
    const { spendingPubKey, viewingPubKey } = parseMetaAddress(metaAddress);

    // Random ephemeral keypair
    const ephemeralPrivKey = secp256k1.utils.randomPrivateKey();
    const ephemeralPubKey = secp256k1.getPublicKey(ephemeralPrivKey, true);

    // ECDH: shared secret = ephemeral_priv * viewing_pub
    const sharedSecretPoint = secp256k1.getSharedSecret(ephemeralPrivKey, viewingPubKey);
    // Use x-coordinate only (skip the 04 prefix byte, take 32 bytes)
    const sharedSecretX = sharedSecretPoint.slice(1, 33);
    const hashedSecret = keccak256(toHex(sharedSecretX));

    // stealthPub = spendingPub + hashedSecret * G
    const spendingPoint = secp256k1.ProjectivePoint.fromHex(spendingPubKey);
    const secretScalar = BigInt(hashedSecret);
    const secretPoint = secp256k1.ProjectivePoint.BASE.multiply(secretScalar);
    const stealthPoint = spendingPoint.add(secretPoint);
    const stealthPubBytes = stealthPoint.toRawBytes(false); // uncompressed for address derivation

    // Address = last 20 bytes of keccak256(uncompressed pubkey without 04 prefix)
    const stealthAddress = pubKeyToAddress(stealthPubBytes);

    // View tag = first byte of keccak256(sharedSecret)
    const viewTag = ("0x" + hashedSecret.slice(2, 4)) as Hex;

    return {
        stealthAddress,
        ephemeralPublicKey: toHex(ephemeralPubKey),
        viewTag,
    };
}

// ─── Announcement Scanning (Hunter side) ─────────────────────

/**
 * Check if an on-chain Announcement event belongs to this hunter.
 * Step 1: View tag check (fast, filters 99%)
 * Step 2: Full stealth address computation (only if view tag matches)
 */
export function checkAnnouncementForHunter(
    announcement: {
        stealthAddress: string;
        ephemeralPublicKey: string;
        metadata: string; // first byte is view tag
    },
    hunterKeys: StealthKeys
): boolean {
    const ephPubBytes = toBytes(announcement.ephemeralPublicKey as Hex);
    const viewingPrivBytes = toBytes(hunterKeys.viewingPrivateKey);

    // ECDH with viewing key
    const sharedSecretPoint = secp256k1.getSharedSecret(viewingPrivBytes, ephPubBytes);
    const sharedSecretX = sharedSecretPoint.slice(1, 33);
    const hashedSecret = keccak256(toHex(sharedSecretX));

    // View tag check (first byte)
    const expectedViewTag = hashedSecret.slice(2, 4);
    const announcedViewTag = announcement.metadata.slice(2, 4);
    if (expectedViewTag !== announcedViewTag) {
        return false;
    }

    // Full check — compute expected stealth address
    const spendingPubBytes = toBytes(hunterKeys.spendingPublicKey);
    const spendingPoint = secp256k1.ProjectivePoint.fromHex(spendingPubBytes);
    const secretScalar = BigInt(hashedSecret);
    const secretPoint = secp256k1.ProjectivePoint.BASE.multiply(secretScalar);
    const expectedStealthPoint = spendingPoint.add(secretPoint);
    const expectedStealthPub = expectedStealthPoint.toRawBytes(false);
    const expectedAddress = pubKeyToAddress(expectedStealthPub);

    return expectedAddress.toLowerCase() === announcement.stealthAddress.toLowerCase();
}

// ─── Stealth Private Key Recovery (Hunter side) ──────────────

/**
 * Compute the private key for a matched stealth address.
 * Hunter calls this to spend funds from the stealth address.
 *
 * Math:
 *   sharedSecret = ECDH(viewingPriv, ephemeralPub)
 *   hashedSecret = keccak256(sharedSecret)
 *   stealthPrivKey = spendingPrivKey + hashedSecret (mod curve order)
 */
export function computeStealthPrivateKey(
    ephemeralPublicKey: string,
    hunterKeys: StealthKeys
): Hex {
    const ephPubBytes = toBytes(ephemeralPublicKey as Hex);
    const viewingPrivBytes = toBytes(hunterKeys.viewingPrivateKey);

    const sharedSecretPoint = secp256k1.getSharedSecret(viewingPrivBytes, ephPubBytes);
    const sharedSecretX = sharedSecretPoint.slice(1, 33);
    const hashedSecret = keccak256(toHex(sharedSecretX));

    const spendingKeyBig = BigInt(hunterKeys.spendingPrivateKey);
    const hashedSecretBig = BigInt(hashedSecret);
    const stealthPrivKey = ((spendingKeyBig + hashedSecretBig) % CURVE_ORDER)
        .toString(16)
        .padStart(64, "0");

    return ("0x" + stealthPrivKey) as Hex;
}

// ─── Helpers ─────────────────────────────────────────────────

function pubKeyToAddress(uncompressedPubKey: Uint8Array): Hex {
    // Skip the 0x04 prefix byte, hash the 64 raw bytes
    const raw = uncompressedPubKey.slice(1);
    const hash = keccak256(toHex(raw));
    return ("0x" + hash.slice(-40)) as Hex;
}

/**
 * Encode stealth meta-address as bytes for on-chain storage.
 * Returns the raw 66-byte payload (33 spending + 33 viewing).
 */
export function metaAddressToBytes(metaAddress: string): Hex {
    const hex = metaAddress.replace("st:eth:0x", "");
    return ("0x" + hex) as Hex;
}
