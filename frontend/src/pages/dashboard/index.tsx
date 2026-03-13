import { useState, type FC, type MouseEvent } from "react";
import {
    LayoutDashboard, Briefcase, FileText, Inbox, Star, Wrench, DollarSign,
    PlusCircle, List, Users, CreditCard, Settings, ChevronDown
} from "lucide-react";
import OverviewTab from "./Overview";
import ApplicationsTab from "./Applications";
import BidInboxTab from "./BidInbox";
import ReputationTab from "./Reputation";
import SkillsTab from "./Skills";
import EarningsTab from "./Earnings";
import PostBountyTab from "./PostBounty";
import MyPostedBountiesTab from "./MyPostedBounties";
import FindContributorsTab from "./FindContributors";
import PaymentsTab from "./Payments";
import SettingsTab from "./Settings";
import BountiesTab from "./Bounties";

export type DashboardTab =
    | "overview" | "bounties" | "applications" | "bid-inbox"
    | "reputation" | "skills" | "earnings"
    | "post-bounty" | "my-posted" | "find-contributors" | "payments" | "settings";

interface NavItem {
    id: DashboardTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
}

const NAV_TOP: NavItem[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "bounties", label: "Bounties", icon: <Briefcase className="w-4 h-4" /> },
    { id: "applications", label: "My Applications", icon: <FileText className="w-4 h-4" /> },
    { id: "bid-inbox", label: "Bid Inbox", icon: <Inbox className="w-4 h-4" />, badge: "2" },
    { id: "reputation", label: "Reputation", icon: <Star className="w-4 h-4" /> },
    { id: "skills", label: "Skills", icon: <Wrench className="w-4 h-4" /> },
    { id: "earnings", label: "Earnings", icon: <DollarSign className="w-4 h-4" /> },
];

const NAV_BOTTOM: NavItem[] = [
    { id: "post-bounty", label: "Post Bounty", icon: <PlusCircle className="w-4 h-4" /> },
    { id: "my-posted", label: "My Posted Bounties", icon: <List className="w-4 h-4" /> },
    { id: "find-contributors", label: "Find Contributors", icon: <Users className="w-4 h-4" /> },
    { id: "payments", label: "Payments", icon: <CreditCard className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
];

const DashboardPage: FC = () => {
    const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const renderTab = () => {
        switch (activeTab) {
            case "overview": return <OverviewTab onNavigate={setActiveTab} />;
            case "bounties": return <BountiesTab />;
            case "applications": return <ApplicationsTab />;
            case "bid-inbox": return <BidInboxTab />;
            case "reputation": return <ReputationTab />;
            case "skills": return <SkillsTab />;
            case "earnings": return <EarningsTab />;
            case "post-bounty": return <PostBountyTab />;
            case "my-posted": return <MyPostedBountiesTab />;
            case "find-contributors": return <FindContributorsTab />;
            case "payments": return <PaymentsTab />;
            case "settings": return <SettingsTab />;
            default: return <OverviewTab onNavigate={setActiveTab} />;
        }
    };

    const NavButton: FC<{ item: NavItem }> = ({ item }) => (
        <button
            onClick={() => setActiveTab(item.id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer border-none text-left"
            style={{
                background: activeTab === item.id ? "rgba(232,255,0,0.08)" : "transparent",
                color: activeTab === item.id ? "#e8ff00" : "#888",
                fontFamily: "inherit",
            }}
            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { if (activeTab !== item.id) e.currentTarget.style.background = "#111"; }}
            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { if (activeTab !== item.id) e.currentTarget.style.background = "transparent"; }}
        >
            {item.icon}
            {!sidebarCollapsed && <span className="flex-1">{item.label}</span>}
            {!sidebarCollapsed && item.badge && (
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "#ef4444", color: "#fff" }}>
                    {item.badge}
                </span>
            )}
        </button>
    );

    return (
        <div className="min-h-screen flex bg-[#060606] text-white font-sans">
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
                .dash-fade { animation: fadeIn 0.3s ease; }
            `}</style>

            {/* Sidebar */}
            <aside className="fixed top-0 left-0 bottom-0 z-40 flex flex-col border-r overflow-y-auto"
                style={{ width: sidebarCollapsed ? 60 : 250, borderColor: "#1a1a1a", background: "#0a0a0a", transition: "width 0.2s" }}>
                {/* Logo */}
                <div className="flex items-center justify-center px-4 border-b" style={{ height: 64, borderColor: "#1a1a1a" }}>
                    <img
                        src="/darkearn-logo.png"
                        alt="DarkEarn"
                        style={{
                            height: sidebarCollapsed ? 28 : 36,
                            width: "auto",
                            objectFit: "contain",
                            transition: "height 0.2s",
                        }}
                    />
                </div>

                {/* Profile */}
                <div className="px-4 py-5 border-b" style={{ borderColor: "#1a1a1a" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                            style={{ background: "rgba(232,255,0,0.12)", color: "#e8ff00", border: "1.5px solid rgba(232,255,0,0.2)" }}>
                            A
                        </div>
                        {!sidebarCollapsed && (
                            <div>
                                <p className="text-[13px] font-semibold text-white">alice.eth</p>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(232,255,0,0.1)", color: "#e8ff00" }}>Band 0</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Nav Top */}
                <div className="flex-1 px-3 py-4 flex flex-col gap-1">
                    {NAV_TOP.map((item) => <NavButton key={item.id} item={item} />)}

                    <div className="my-3 border-t" style={{ borderColor: "#1a1a1a" }} />

                    {NAV_BOTTOM.map((item) => <NavButton key={item.id} item={item} />)}
                </div>

                {/* Bottom info */}
                {!sidebarCollapsed && (
                    <div className="px-4 py-4 border-t" style={{ borderColor: "#1a1a1a" }}>
                        <p className="text-[10px] font-medium leading-relaxed" style={{ color: "#555" }}>
                            Band 0 · 0 completions<br />Member since March 2025
                        </p>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-h-screen" style={{ marginLeft: sidebarCollapsed ? 60 : 250, transition: "margin-left 0.2s" }}>
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex items-center justify-between px-8 border-b bg-[#060606]/95 backdrop-blur-md"
                    style={{ height: 64, borderColor: "#1a1a1a" }}>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border bg-transparent cursor-pointer transition-colors"
                            style={{ borderColor: "#222" }}
                            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "#111"; }}
                            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "transparent"; }}
                        >
                            <ChevronDown className="w-4 h-4" style={{ color: "#888", transform: sidebarCollapsed ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform 0.2s" }} />
                        </button>
                        <h1 className="text-[15px] font-bold text-white capitalize">{activeTab.replace("-", " ").replace("my posted", "My Posted Bounties")}</h1>
                    </div>
                </header>

                {/* Tab Content */}
                <div className="p-6 md:p-8 dash-fade" key={activeTab}>
                    {renderTab()}
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
