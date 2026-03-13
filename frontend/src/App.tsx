import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import BountyBoard from "./pages/BountyBoard";
import DashboardPage from "./pages/dashboard/index";

type PageType = "login" | "onboarding" | "bounties" | "dashboard";

function App() {
    const [currentPage, setCurrentPage] = useState<PageType>("login");

    return (
        <>
            {/* Dev Navigation Bar - Temporary to easily switch between pages */}
            <div className="fixed bottom-4 right-4 z-[9999] flex gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded-lg shadow-2xl">
                {(["login", "onboarding", "bounties", "dashboard"] as PageType[]).map((page) => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 text-xs font-bold rounded cursor-pointer border-none ${currentPage === page ? 'bg-[#e8ff00] text-black' : 'text-white hover:bg-zinc-800'}`}
                        style={{ fontFamily: "inherit" }}
                    >
                        {page.charAt(0).toUpperCase() + page.slice(1)}
                    </button>
                ))}
            </div>

            {currentPage === "login" && <LoginPage />}
            {currentPage === "onboarding" && <OnboardingPage />}
            {currentPage === "bounties" && <BountyBoard />}
            {currentPage === "dashboard" && <DashboardPage />}
        </>
    );
}

export default App;
