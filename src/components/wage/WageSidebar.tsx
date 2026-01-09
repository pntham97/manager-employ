import React from "react";

const WageSidebar: React.FC = () => {
    return (
        <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="sticky top-24">
                <div className="bg-[#2563eb] text-white rounded-xl shadow-lg shadow-blue-500/20 p-6 mb-6 relative overflow-hidden">

                    <div className="absolute top-0 right-0 opacity-10">
                        <span className="material-symbols-outlined text-[180px] -mr-8 -mt-8">paid</span>
                    </div>
                    <h3 className="text-lg font-medium opacity-90 mb-6 relative z-10">Tổng kết lương</h3>
                    <div className="space-y-3 relative z-10">
                        <div className="flex justify-between items-center text-sm opacity-90">
                            <span>Tổng thu nhập</span>
                            <span className="font-mono">20.280.500 ₫</span>
                        </div>
                        <div className="flex justify-between items-center text-sm opacity-90">
                            <span>Tổng khấu trừ</span>
                            <span className="font-mono text-red-200">-2.025.000 ₫</span>
                        </div>
                        <div className="h-px bg-white/20 my-4"></div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium opacity-80">Thực lĩnh (Net Salary)</span>
                            <span className="text-3xl lg:text-4xl font-black tracking-tight font-mono">18.255.500 ₫</span>
                        </div>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-3 relative z-10">
                        <button className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm text-sm font-bold transition-colors border border-white/20">Lưu nháp</button>
                        <button className="w-full py-2.5 rounded-lg bg-white text-[#2563eb] hover:bg-gray-50 text-sm font-bold transition-colors shadow-sm">Chốt lương</button>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-[#111318] dark:text-white text-sm">Lịch sử thanh toán</h4>
                        <a className="text-xs text-[#2563eb] font-medium hover:underline" href="#">Xem tất cả</a>
                    </div>
                    <div className="flex flex-col gap-4">

                        <div className="flex items-start justify-between pb-3 border-b border-gray-50 dark:border-gray-800 last:border-0 last:pb-0">
                            <div className="flex gap-3">
                                <div className="size-10 rounded bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">check_circle</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#111318] dark:text-white">Tháng 9/2023</p>
                                    <p className="text-xs text-gray-500">05/10/2023</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-mono font-bold text-[#111318] dark:text-white">18.100.000 ₫</p>
                                <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300 ring-1 ring-inset ring-green-600/20">Đã TT</span>
                            </div>
                        </div>

                        <div className="flex items-start justify-between pb-3 border-b border-gray-50 dark:border-gray-800 last:border-0 last:pb-0">
                            <div className="flex gap-3">
                                <div className="size-10 rounded bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">check_circle</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#111318] dark:text-white">Tháng 8/2023</p>
                                    <p className="text-xs text-gray-500">05/09/2023</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-mono font-bold text-[#111318] dark:text-white">17.850.000 ₫</p>
                                <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300 ring-1 ring-inset ring-green-600/20">Đã TT</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-100 dark:border-orange-800">
                    <div className="flex gap-3">
                        <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 shrink-0">info</span>
                        <div>
                            <p className="text-sm font-bold text-orange-800 dark:text-orange-300 mb-1">Lưu ý</p>
                            <p className="text-xs text-orange-700 dark:text-orange-400 leading-relaxed">
                                Hệ thống sẽ tự động chốt công vào ngày 30 hàng tháng. Vui lòng kiểm tra kỹ các khoản phụ cấp trước khi xuất phiếu lương.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WageSidebar;
