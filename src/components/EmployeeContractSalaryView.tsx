const EmployeeContractSalaryView = () => {
    return (
        <div>
            <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 my-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#2563eb]">calendar_month</span>
                        Chi tiết ngày công
                    </h3>
                    <button className="text-[#2563eb] text-sm font-medium hover:underline">Xem bảng công</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-background-light dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Công chuẩn</p>
                        <p className="text-xl font-bold text-[#111318] dark:text-white">22</p>
                    </div>
                    <div className="bg-background-light dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Thực tế</p>
                        <div className="flex items-center gap-2">
                            <input className="w-full bg-transparent border-none p-0 text-xl font-bold focus:ring-0 text-[#111318] dark:text-white h-auto" type="number" value="21" />
                            <span className="material-symbols-outlined text-gray-400 text-sm">edit</span>
                        </div>
                    </div>
                    <div className="bg-background-light dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Nghỉ phép</p>
                        <input className="w-full bg-transparent border-none p-0 text-xl font-bold focus:ring-0 text-[#111318] dark:text-white h-auto" type="number" value="1" />
                    </div>
                    <div className="bg-background-light dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Tăng ca (h)</p>
                        <input className="w-full bg-transparent border-none p-0 text-xl font-bold focus:ring-0 text-[#2563eb] h-auto" type="number" value="4.5" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 my-4">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600">trending_up</span>
                    Thu nhập &amp; Phụ cấp
                </h3>
                <div className="space-y-4">

                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col">
                            <span className="font-semibold text-[#111318] dark:text-white">Lương cơ bản</span>
                            <span className="text-xs text-gray-500">Theo hợp đồng chính thức</span>
                        </div>
                        <span className="font-bold text-[#111318] dark:text-white font-mono">15.000.000 ₫</span>
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col">
                            <span className="font-semibold text-[#111318] dark:text-white">Lương tăng ca (150%)</span>
                            <span className="text-xs text-gray-500">4.5 giờ x 129.000đ</span>
                        </div>
                        <span className="font-bold text-[#111318] dark:text-white font-mono">580.500 ₫</span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phụ cấp ăn trưa</span>
                        </div>
                        <div className="w-40">
                            <input className="text-right w-full rounded border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-[#111318] dark:text-white focus:ring-#2563eb focus:border-#2563eb text-sm font-mono font-medium py-1.5" type="text" value="1.200.000" />
                        </div>
                        <button className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-lg">delete</span></button>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Thưởng dự án</span>
                        </div>
                        <div className="w-40">
                            <input className="text-right w-full rounded border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-[#111318] dark:text-white focus:ring-#2563eb focus:border-#2563eb text-sm font-mono font-medium py-1.5" type="text" value="3.500.000" />
                        </div>
                        <button className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-lg">delete</span></button>
                    </div>

                    <button className="flex items-center gap-2 text-sm text-[#2563eb] font-medium mt-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-2 rounded-lg transition-colors w-fit">
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Thêm khoản thu nhập
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500">trending_down</span>
                    Các khoản khấu trừ
                </h3>
                <div className="space-y-4">

                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col">
                            <span className="font-semibold text-[#111318] dark:text-white">BHXH, BHYT, BHTN (10.5%)</span>
                            <span className="text-xs text-gray-500">Trên lương đóng bảo hiểm</span>
                        </div>
                        <span className="font-bold text-red-600 dark:text-red-400 font-mono">-1.575.000 ₫</span>
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col">
                            <span className="font-semibold text-[#111318] dark:text-white">Thuế TNCN tạm tính</span>
                            <span className="text-xs text-gray-500">Đã trừ giảm trừ gia cảnh</span>
                        </div>
                        <span className="font-bold text-red-600 dark:text-red-400 font-mono">-450.000 ₫</span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <input className="w-full rounded border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111318] dark:text-white focus:ring-#2563eb focus:border-#2563eb text-sm py-1.5" placeholder="Tên khoản khấu trừ khác" type="text" />
                        </div>
                        <div className="w-40 relative">
                            <input className="text-right w-full rounded border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-red-600 dark:text-red-400 focus:ring-#2563eb focus:border-#2563eb text-sm font-mono font-medium py-1.5 pr-8" placeholder="0" type="text" />
                            <span className="absolute right-3 top-1.5 text-gray-400 text-sm">₫</span>
                        </div>
                        <button className="text-gray-400 hover:text-red-500"><span className="material-symbols-outlined text-lg">delete</span></button>
                    </div>
                    <button className="flex items-center gap-2 text-sm text-red-500 font-medium mt-2 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors w-fit">
                        <span className="material-symbols-outlined text-lg">remove_circle</span>
                        Thêm khoản trừ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeContractSalaryView;
