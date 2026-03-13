import { useState, type FC, type MouseEvent } from "react";
import { ExternalLink, Shield, LogOut } from "lucide-react";

const SettingsTab: FC = () => {
    const [contributorToggle, setContributorToggle] = useState(false);
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifBrowser, setNotifBrowser] = useState(false);

    const Toggle: FC<{ on: boolean; onToggle: () => void; disabled?: boolean }> = ({ on, onToggle, disabled }) => (
        <div className="w-10 h-5 rounded-full relative cursor-pointer" style={{ background: on ? "#e8ff00" : "#333", opacity: disabled ? 0.4 : 1 }} onClick={disabled ? undefined : onToggle}>
            <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all" style={{ background: "#fff", left: on ? 22 : 2 }} />
        </div>
    );

    return (
        <div className="max-w-2xl flex flex-col gap-6">
            {/* ENS Name */}
            <div className="p-6 rounded-xl border" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                <h3 className="text-[12px] font-bold tracking-widest uppercase mb-3" style={{ color: "#888" }}>ENS Name</h3>
                <div className="flex items-center justify-between">
                    <p className="text-[15px] font-bold text-white">alice.eth</p>
                    <a href="#" className="text-[12px] font-medium flex items-center gap-1" style={{ color: "#3b82f6" }}>Update on ENS <ExternalLink className="w-3 h-3" /></a>
                </div>
            </div>

            {/* Find Contributors */}
            <div className="p-6 rounded-xl border" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-[13px] font-bold text-white mb-1">Appear in Contributor Directory</h3>
                        <p className="text-[11px]" style={{ color: "#777" }}>Requires Band 2+. Let posters discover you for private bids.</p>
                    </div>
                    <Toggle on={contributorToggle} onToggle={() => setContributorToggle(!contributorToggle)} disabled={true} />
                </div>
                <p className="text-[10px] mt-2" style={{ color: "#f59e0b" }}>You need Band 2 to enable this feature.</p>
            </div>

            {/* Notifications */}
            <div className="p-6 rounded-xl border" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                <h3 className="text-[12px] font-bold tracking-widest uppercase mb-4" style={{ color: "#888" }}>Notifications</h3>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-white">Email Notifications</span>
                        <Toggle on={notifEmail} onToggle={() => setNotifEmail(!notifEmail)} />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-white">Browser Notifications</span>
                        <Toggle on={notifBrowser} onToggle={() => setNotifBrowser(!notifBrowser)} />
                    </div>
                </div>
            </div>

            {/* Disconnect */}
            <button className="w-full py-4 rounded-xl border text-[13px] font-bold uppercase tracking-wider cursor-pointer bg-transparent transition-colors flex items-center justify-center gap-2"
                style={{ borderColor: "#ef444440", color: "#ef4444", fontFamily: "inherit" }}
                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "rgba(239,68,68,0.05)"; }}
                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "transparent"; }}>
                <LogOut className="w-4 h-4" /> Disconnect Wallet
            </button>
        </div>
    );
};

export default SettingsTab;
