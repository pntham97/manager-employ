import { useNavigate } from "react-router-dom";

const Wage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="px-16 py-8 w-full flex flex-col">
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
                    <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-#2563eb text-[#2563eb] text-sm font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[20px] mr-2">send</span>
                        <span className="truncate">Gửi phiếu lương</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                <div className="lg:col-span-8 flex flex-col gap-6">

                    <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#2563eb]">badge</span>
                            Thông tin nhân viên
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chọn nhân viên</span>
                                <div className="relative">
                                    <select className="form-select w-full h-11 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-[#111318] dark:text-white focus:ring-#2563eb focus:border-#2563eb px-4 appearance-none cursor-pointer">
                                        <option value="1">Nguyễn Văn A - IT Dept (ID: 1023)</option>
                                        <option value="2">Trần Thị B - HR Dept (ID: 1045)</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                        <span className="material-symbols-outlined">expand_more</span>
                                    </div>
                                </div>
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kỳ lương</span>
                                <div className="relative">
                                    <input className="form-input w-full h-11 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-[#111318] dark:text-white focus:ring-#2563eb focus:border-#2563eb px-4" type="month" value="2023-10" />
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
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

                    <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
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
            </div>
        </div>
    );
};

export default Wage;
