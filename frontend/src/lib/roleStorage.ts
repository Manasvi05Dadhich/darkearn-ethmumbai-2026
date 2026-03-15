const ROLE_KEY = "darkearn-role";
const HUNTER_NAME_KEY = "darkearn-hunter-name";

export type UserRole = "poster" | "hunter";

export function getStoredRole(): UserRole | null {
    const r = localStorage.getItem(ROLE_KEY);
    if (r === "poster" || r === "hunter") return r;
    return null;
}

export function setStoredRole(role: UserRole): void {
    localStorage.setItem(ROLE_KEY, role);
}

export function getHunterDisplayName(): string | null {
    return localStorage.getItem(HUNTER_NAME_KEY);
}

export function setHunterDisplayName(name: string): void {
    localStorage.setItem(HUNTER_NAME_KEY, name);
}

export function clearRoleStorage(): void {
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(HUNTER_NAME_KEY);
}

const ADJECTIVES = [
    "red", "blue", "swift", "silent", "cosmic", "lunar", "stellar", "shadow",
    "bright", "quick", "calm", "bold", "wild", "cool", "warm", "frost",
];
const ANIMALS = [
    "panda", "wolf", "fox", "owl", "hawk", "lynx", "raven", "bear",
    "tiger", "eagle", "otter", "deer", "cobra", "falcon", "moth", "bat",
];

export function generateHunterName(): string {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const num = Math.floor(100 + Math.random() * 900);
    return `${adj}-${animal}-${num}`;
}
