import { useState, type FC } from "react";
import { Bell, LogOut, Mail, Search, ShieldCheck, UserCircle2, Zap } from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";
import { useUserNFT } from "../../hooks/useUserNFT";

const SettingsTab: FC = () => {
    const { address } = useAccount();
    const { disconnect } = useDisconnect();
    const { ensName, band } = useUserNFT();
    const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected");

    const settingsKey = address ? `darkearn-settings-${address.toLowerCase()}` : null;
    const loadSetting = (key: string, fallback: boolean) => {
        if (!settingsKey) return fallback;
        try {
            const stored = JSON.parse(localStorage.getItem(settingsKey) || "{}");
            return stored[key] !== undefined ? stored[key] : fallback;
        } catch { return fallback; }
    };
    const saveSetting = (key: string, value: boolean) => {
        if (!settingsKey) return;
        try {
            const stored = JSON.parse(localStorage.getItem(settingsKey) || "{}");
            stored[key] = value;
            localStorage.setItem(settingsKey, JSON.stringify(stored));
        } catch { /* ignore */ }
    };

    const [directoryToggle, setDirectoryToggle] = useState(() => loadSetting("directory", true));
    const [notifBounties, setNotifBounties] = useState(() => loadSetting("notifBounties", true));
    const [notifPrivateBids, setNotifPrivateBids] = useState(() => loadSetting("notifPrivateBids", true));
    const [notifPayments, setNotifPayments] = useState(() => loadSetting("notifPayments", true));

    const toggleDirectory = () => { const v = !directoryToggle; setDirectoryToggle(v); saveSetting("directory", v); };
    const toggleBounties = () => { const v = !notifBounties; setNotifBounties(v); saveSetting("notifBounties", v); };
    const togglePrivateBids = () => { const v = !notifPrivateBids; setNotifPrivateBids(v); saveSetting("notifPrivateBids", v); };
    const togglePayments = () => { const v = !notifPayments; setNotifPayments(v); saveSetting("notifPayments", v); };

    const Toggle: FC<{ on: boolean; onToggle: () => void }> = ({ on, onToggle }) => (
        <button
            type="button"
            onClick={onToggle}
            className="w-12 h-7 rounded-full relative border-none cursor-pointer"
            style={{ background: on ? "#e8ff00" : "#334155", fontFamily: "inherit" }}
        >
            <div
                className="absolute top-1 w-5 h-5 rounded-full transition-all"
                style={{ background: "#fff", left: on ? 26 : 3 }}
            />
        </button>
    );

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-md flex items-center justify-center"
                        style={{ background: "#e8ff00", color: "#0a0a0a" }}
                    >
                        <Zap className="w-5 h-5" />
                    </div>
                    <h2 className="text-[28px] font-extrabold text-white leading-none">DarkEarn</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="border-none bg-transparent cursor-pointer"
                        style={{ color: "#cbd5e1" }}
                    >
                        <Search className="w-5 h-5" />
                    </button>
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: "#c08457", color: "#fff" }}
                    >
                        <UserCircle2 className="w-5 h-5" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <div>
                    <p className="text-[12px] font-bold tracking-widest uppercase mb-3" style={{ color: "#e8ff00" }}>
                        ENS Name
                    </p>
                    <div
                        className="p-5 rounded-xl border flex items-center justify-between gap-4"
                        style={{ background: "#121208", borderColor: "#2a2a12" }}
                    >
                        <div className="flex items-center gap-3">
                            <UserCircle2 className="w-5 h-5" style={{ color: "#e8ff00" }} />
                            <p className="text-[26px] font-extrabold text-white leading-none">{displayName}</p>
                        </div>
                        {band !== undefined && (
                            <span
                                className="text-[10px] font-bold px-2 py-1 rounded"
                                style={{ background: "rgba(232,255,0,0.1)", color: "#e8ff00" }}
                            >
                                Band {band}
                            </span>
                        )}
                    </div>
                </div>

                <div>
                    <p className="text-[12px] font-bold tracking-widest uppercase mb-3" style={{ color: "#e8ff00" }}>
                        Privacy & Visibility
                    </p>
                    <div
                        className="p-5 rounded-xl border"
                        style={{ background: "#121208", borderColor: "#2a2a12" }}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-[22px] font-bold text-white mb-2">
                                    Appear in Contributor Directory
                                </h3>
                                <p className="text-[13px]" style={{ color: "#8b93a1" }}>
                                    Requires Band 2+. Allow posters to find and send you private bids directly.
                                </p>
                            </div>
                            <Toggle on={directoryToggle} onToggle={toggleDirectory} />
                        </div>
                    </div>
                </div>

                <div>
                    <p className="text-[12px] font-bold tracking-widest uppercase mb-3" style={{ color: "#e8ff00" }}>
                        Notification Preferences
                    </p>
                    <div
                        className="rounded-xl border overflow-hidden"
                        style={{ background: "#121208", borderColor: "#2a2a12" }}
                    >
                        <div
                            className="px-5 py-4 flex items-center justify-between"
                            style={{ borderBottom: "1px solid #2a2a12" }}
                        >
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5" style={{ color: "#cbd5e1" }} />
                                <span className="text-[20px] font-bold text-white">New Bounties</span>
                            </div>
                            <Toggle on={notifBounties} onToggle={toggleBounties} />
                        </div>
                        <div
                            className="px-5 py-4 flex items-center justify-between"
                            style={{ borderBottom: "1px solid #2a2a12" }}
                        >
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5" style={{ color: "#cbd5e1" }} />
                                <span className="text-[20px] font-bold text-white">Private Bids</span>
                            </div>
                            <Toggle on={notifPrivateBids} onToggle={togglePrivateBids} />
                        </div>
                        <div className="px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5" style={{ color: "#cbd5e1" }} />
                                <span className="text-[20px] font-bold text-white">Payment Success</span>
                            </div>
                            <Toggle on={notifPayments} onToggle={togglePayments} />
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => disconnect()}
                    className="w-full py-5 rounded-xl border text-[18px] font-bold cursor-pointer bg-transparent flex items-center justify-center gap-3"
                    style={{ borderColor: "rgba(239,68,68,0.5)", color: "#ef4444", fontFamily: "inherit" }}
                >
                    <LogOut className="w-5 h-5" /> Disconnect Wallet
                </button>
            </div>
        </div>
    );
};

export default SettingsTab;
