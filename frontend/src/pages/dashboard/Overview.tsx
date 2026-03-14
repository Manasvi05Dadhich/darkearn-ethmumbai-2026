import { useState, type FC, type MouseEvent } from "react";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useUserNFT } from "../../hooks/useUserNFT";
import { useMyApplications } from "../../hooks/useMyApplications";
import { useEarnings } from "../../hooks/useEarnings";
import type { DashboardTab } from "./index";

const OverviewTab: FC<{ onNavigate: (tab: DashboardTab) => void }> = ({ onNavigate }) => {
    const [showEarnings, setShowEarnings] = useState(false);
    const { band, isLoading: nftLoading } = useUserNFT();
    const { applications, isLoading: appsLoading } = useMyApplications();
    const { totalEarnedFormatted, isLoading: earningsLoading } = useEarnings();

    const currentBand = band ?? 0;
    const activeApps = applications.filter(
        (a) => !["payment-claimed", "cancelled"].includes(a.status)
    );
    const pendingApps = applications.filter((a) => a.status === "pending");
    const acceptedApps = applications.filter((a) => a.status === "accepted");
    const isLoading = nftLoading || appsLoading || earningsLoading;

    const nextBandCompletions = [3, 8, 15, 25][currentBand] ?? 25;
    const totalCompletions = applications.filter((a) => a.status === "completed" || a.status === "payment-claimed").length;
    const progressPercent = Math.min(100, Math.round((totalCompletions / nextBandCompletions) * 100));

    return (
        <div className="max-w-5xl">
            {isLoading && (
                <div className="flex items-center gap-2 mb-4">
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#e8ff00" }} />
                    <span className="text-[12px]" style={{ color: "#888" }}>Syncing with chain...</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="p-6 rounded-xl border" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                    <p className="text-[11px] font-bold tracking-widest uppercase mb-4" style={{ color: "#888" }}>
                        Reputation Band
                    </p>
                    <h2 className="text-3xl font-extrabold mb-4" style={{ color: "#e8ff00" }}>
                        Band {currentBand}
                    </h2>
                    <div className="w-full h-2 rounded-full overflow-hidden mb-2" style={{ background: "#111" }}>
                        <div className="h-full rounded-full" style={{ width: `${progressPercent}%`, background: "#e8ff00" }} />
                    </div>
                    <p className="text-[11px] mb-4" style={{ color: "#777" }}>
                        {currentBand < 4
                            ? `Complete ${Math.max(0, nextBandCompletions - totalCompletions)} bounties to reach Band ${currentBand + 1}`
                            : "Maximum band reached"}
                    </p>
                    <button
                        onClick={() => onNavigate("reputation")}
                        className="text-[12px] font-semibold bg-transparent border-none cursor-pointer flex items-center gap-1 transition-opacity hover:opacity-80"
                        style={{ color: "#e8ff00", fontFamily: "inherit" }}
                    >
                        View Reputation Details <ArrowRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="p-6 rounded-xl border" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#888" }}>
                            Total Earned
                        </p>
                        <button
                            onClick={() => setShowEarnings(!showEarnings)}
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-transparent border cursor-pointer transition-colors"
                            style={{ borderColor: "#222" }}
                            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                                e.currentTarget.style.borderColor = "#444";
                            }}
                            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                                e.currentTarget.style.borderColor = "#222";
                            }}
                        >
                            {showEarnings ? (
                                <EyeOff className="w-3.5 h-3.5" style={{ color: "#888" }} />
                            ) : (
                                <Eye className="w-3.5 h-3.5" style={{ color: "#888" }} />
                            )}
                        </button>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-2">
                        {showEarnings ? `${totalEarnedFormatted} ETH` : "••••••"}
                    </h2>
                    <p className="text-[11px]" style={{ color: "#555" }}>
                        Only you can see this
                    </p>
                </div>

                <div className="p-6 rounded-xl border" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                    <p className="text-[11px] font-bold tracking-widest uppercase mb-4" style={{ color: "#888" }}>
                        Active Applications
                    </p>
                    <h2 className="text-3xl font-extrabold text-white mb-2">{activeApps.length} Active</h2>
                    <p className="text-[12px] mb-4" style={{ color: "#777" }}>
                        {pendingApps.length} Pending · {acceptedApps.length} Accepted
                    </p>
                    <button
                        onClick={() => onNavigate("applications")}
                        className="text-[12px] font-semibold bg-transparent border-none cursor-pointer flex items-center gap-1 transition-opacity hover:opacity-80"
                        style={{ color: "#e8ff00", fontFamily: "inherit" }}
                    >
                        View Applications <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

            <div className="rounded-xl border mb-8" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                <div className="px-6 py-4 border-b" style={{ borderColor: "#1a1a1a" }}>
                    <h3 className="text-[13px] font-bold tracking-widest uppercase" style={{ color: "#888" }}>
                        Recent Activity
                    </h3>
                </div>
                {applications.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                        <p className="text-[13px]" style={{ color: "#555" }}>
                            No activity yet. Browse bounties to get started.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y" style={{ borderColor: "#111" }}>
                        {applications.slice(0, 10).map((app) => (
                            <div key={app.bountyId} className="px-6 py-3 flex items-center justify-between">
                                <div>
                                    <p className="text-[13px] font-medium text-white">{app.title}</p>
                                    <p className="text-[11px]" style={{ color: "#555" }}>
                                        {app.status === "pending"
                                            ? "Applied anonymously"
                                            : app.status === "accepted"
                                              ? "Accepted by poster"
                                              : app.status === "completed"
                                                ? "Work approved"
                                                : app.status === "payment-claimed"
                                                  ? "Payment claimed"
                                                  : app.status}
                                    </p>
                                </div>
                                <span className="text-[11px] font-bold" style={{ color: "#e8ff00" }}>
                                    {app.prize}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Browse Bounties", tab: "bounties" as DashboardTab },
                    { label: "Post a Bounty", tab: "post-bounty" as DashboardTab },
                    { label: "Find Contributors", tab: "find-contributors" as DashboardTab },
                ].map((a) => (
                    <button
                        key={a.tab}
                        onClick={() => onNavigate(a.tab)}
                        className="py-4 rounded-lg text-[13px] font-bold uppercase tracking-wider border cursor-pointer transition-all bg-transparent"
                        style={{ borderColor: "#222", color: "#ccc", fontFamily: "inherit" }}
                        onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                            e.currentTarget.style.borderColor = "#e8ff00";
                            e.currentTarget.style.color = "#e8ff00";
                        }}
                        onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                            e.currentTarget.style.borderColor = "#222";
                            e.currentTarget.style.color = "#ccc";
                        }}
                    >
                        {a.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default OverviewTab;
