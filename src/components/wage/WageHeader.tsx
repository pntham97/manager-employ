import React from "react";

const WageHeader: React.FC = () => {
    return (
        <>
            <nav className="flex flex-wrap gap-2 pb-4 text-sm">
                <a className="text-[#616f89] dark:text-gray-400 font-medium hover:underline" href="#">Trang chủ</a>
                <span className="text-[#616f89] dark:text-gray-400">/</span>
                <a className="text-[#616f89] dark:text-gray-400 font-medium hover:underline" href="#">Quản lý lương</a>
                <span className="text-[#616f89] dark:text-gray-400">/</span>
                <span className="text-[#111318] dark:text-white font-semibold">Tính lương chi tiết</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-gray-200 dark:border-gray-800 mb-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-[#111318] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">Tính lương tháng 10/2023</h1>
                    <p className="text-[#616f89] dark:text-gray-400 text-base">Quản lý, điều chỉnh và chốt lương cho nhân viên.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 px-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-[#111318] dark:text-white text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <span className="material-symbols-outlined text-[20px] mr-2">download</span>
                        <span className="truncate">Xuất Excel</span>
                    </button>
                    <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[#2563eb] text-white text-sm font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[20px] mr-2">send</span>
                        <span className="truncate">Gửi phiếu lương</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default WageHeader;
