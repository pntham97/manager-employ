import { Outlet } from "react-router-dom";
import SidebarLeft from "../components/SidebarLeft";
// import Header from "../components/Header";

const MainLayout = () => {
    return (
        <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-sky-50 to-indigo-100 relative">

            {/* Sidebar */}
            <div className="sticky top-0 h-screen">
                <SidebarLeft />
            </div>

            {/* Right content */}
            <div className="flex-1 flex flex-col">
                {/* <Header /> */}

                <main className="flex-1  overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            {/* Background pattern */}
            <div className="absolute inset-0 -z-10 opacity-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <rect width="40" height="40" fill="none" stroke="gray" strokeWidth="0.5" />
                            <circle cx="2" cy="2" r="1.5" fill="gray" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>
        </div>
    );
};

export default MainLayout;
