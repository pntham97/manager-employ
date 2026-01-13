const EmployeeKPIView = () => {
    return (
        < main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text-main-light dark:text-text-main-dark">
                        KPI &amp; Sản lượng tuần
                    </h1>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-base">
                        Theo dõi hiệu suất làm việc và sản lượng hàng tuần của nhân viên.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-end gap-3 w-full md:w-auto">

                    {/* <button className="flex items-center justify-center gap-2 h-[42px] px-4 bg-blue-500 hover:bg-blue-500 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all w-full sm:w-auto">
                                    <span className="material-symbols-outlined text-lg">download</span>
                                    <span>Xuất báo cáo</span>
                                </button> */}
                </div>
            </div>

            <div className="hidden bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8 flex items-start gap-3">
                <span className="material-symbols-outlined text-danger">warning</span>
                <div>
                    <h3 className="text-sm font-bold text-danger">Cảnh báo hiệu suất</h3>
                    <p className="text-sm text-red-600 dark:text-red-400">Nhân viên này đã có 3 tuần liên tiếp không đạt KPI. Cần xem xét lại quy trình hoặc đào tạo bổ sung.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                <div className="col-span-1 lg:col-span-5 flex flex-col">
                    <div className="h-full bg-white dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                            <span className="material-symbols-outlined text-[180px] leading-none text-primary">speed</span>
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-text-secondary-light dark:text-text-secondary-dark font-medium text-sm uppercase tracking-wider">Sản lượng trung bình</h3>
                                    <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-success text-xs font-bold border border-green-200 dark:border-green-800 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        ĐẠT KPI
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-5xl md:text-6xl font-black text-text-main-light dark:text-text-main-dark tracking-tighter">18.5</span>
                                    <span className="text-lg text-text-secondary-light dark:text-text-secondary-dark font-medium">SP/h</span>
                                </div>

                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-bold shadow-md shadow-primary/20 mb-6">
                                    <span className="material-symbols-outlined text-lg">track_changes</span>
                                    <span>Mức Xuất Sắc (≥16)</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 border border-border-light dark:border-border-dark">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Mốc KPI hiện tại</span>
                                        <span className="text-sm font-bold text-primary">18 – 20 SP/h</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                        <div className="bg-blue-500 h-2.5 rounded-full w-[92%]" ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-text-secondary-light mt-1">
                                        <span>0</span>
                                        <span>Target: 20</span>
                                    </div>
                                </div>
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark italic">
                                    * Sản lượng trung bình được tính dựa trên tổng sản phẩm hợp lệ chia cho tổng giờ làm việc thực tế.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-1 lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div className="bg-white dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                    <span className="material-symbols-outlined text-xl">schedule</span>
                                </div>
                                <h3 className="text-text-secondary-light dark:text-text-secondary-dark font-medium text-sm">Tổng giờ làm tuần</h3>
                            </div>
                            <div className="mt-4">
                                <span className="text-3xl font-bold text-text-main-light dark:text-text-main-dark">32h</span>
                                <span className="text-lg text-text-secondary-light dark:text-text-secondary-dark"> / 32h</span>
                            </div>
                            <div className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-1">
                                <span>Theo ca:</span>
                                <span className="font-semibold text-text-main-light dark:text-text-main-dark">Full-time</span>
                            </div>
                        </div>
                        <div className="mt-6">
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-blue-500 h-1.5 rounded-full w-full" ></div>
                            </div>
                            <p className="text-right text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">Đủ công</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                                    <span className="material-symbols-outlined text-xl">inventory_2</span>
                                </div>
                                <h3 className="text-text-secondary-light dark:text-text-secondary-dark font-medium text-sm">Tổng sản lượng</h3>
                            </div>
                            <div className="mt-4 flex items-end gap-3">
                                <span className="text-3xl font-bold text-text-main-light dark:text-text-main-dark">592</span>
                                <span className="text-sm font-medium text-success bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded mb-1">
                                    +5% tuần trước
                                </span>
                            </div>
                            <div className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                Sản phẩm hoàn thành
                            </div>
                        </div>
                        <div className="mt-6">

                            <div className="flex items-end gap-1 h-8">
                                <div className="w-1/6 bg-purple-200 dark:bg-purple-900/40 rounded-t-sm h-[60%]"></div>
                                <div className="w-1/6 bg-purple-200 dark:bg-purple-900/40 rounded-t-sm h-[40%]"></div>
                                <div className="w-1/6 bg-purple-200 dark:bg-purple-900/40 rounded-t-sm h-[75%]"></div>
                                <div className="w-1/6 bg-purple-200 dark:bg-purple-900/40 rounded-t-sm h-[50%]"></div>
                                <div className="w-1/6 bg-purple-200 dark:bg-purple-900/40 rounded-t-sm h-[85%]"></div>
                                <div className="w-1/6 bg-purple-500 rounded-t-sm h-[90%]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-card-dark rounded-xl p-6 border border-border-light dark:border-border-dark shadow-sm flex flex-col justify-between md:col-span-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-md bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                                    <span className="material-symbols-outlined text-xl">history_toggle_off</span>
                                </div>
                                <h3 className="text-text-secondary-light dark:text-text-secondary-dark font-medium text-sm">Tuần không đạt liên tiếp</h3>
                            </div>

                            <span className="px-3 py-1 rounded-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-xs font-semibold text-text-secondary-light">
                                An toàn
                            </span>
                        </div>
                        <div className="flex items-center gap-8 mt-6">
                            <div>
                                <span className="text-3xl font-bold text-text-main-light dark:text-text-main-dark">0</span>
                                <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium">tuần</span>
                            </div>

                            <div className="flex-1 flex items-center gap-2">

                                <div className="flex-1 h-3 rounded-full bg-green-500 relative group cursor-help">
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                                        Mức 0: An toàn
                                    </div>
                                </div>

                                <div className="flex-1 h-3 rounded-full bg-gray-200 dark:bg-gray-700 relative group cursor-help">
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                                        Mức 1: Cảnh báo nhẹ
                                    </div>
                                </div>

                                <div className="flex-1 h-3 rounded-full bg-gray-200 dark:bg-gray-700 relative group cursor-help">
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                                        Mức 2: Cảnh báo
                                    </div>
                                </div>
                                <div className="flex-1 h-3 rounded-full bg-gray-200 dark:bg-gray-700 relative group cursor-help">
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                                        Mức 3: Nguy hiểm
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                            Chưa ghi nhận tuần không đạt KPI gần đây.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">calendar_view_day</span>
                    Chi tiết theo ngày
                </h3>
                <div className="bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-text-secondary-light uppercase bg-background-light dark:bg-gray-800 border-b border-border-light dark:border-border-dark">
                                <tr>
                                    <th className="px-6 py-4 font-semibold" scope="col">Ngày</th>
                                    <th className="px-6 py-4 font-semibold" scope="col">Ca làm việc</th>
                                    <th className="px-6 py-4 font-semibold text-right" scope="col">Giờ làm</th>
                                    <th className="px-6 py-4 font-semibold text-right" scope="col">Sản lượng</th>
                                    <th className="px-6 py-4 font-semibold text-right" scope="col">Hiệu suất (SP/h)</th>
                                    <th className="px-6 py-4 font-semibold text-center" scope="col">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                <tr className="bg-white dark:bg-card-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-text-main-light dark:text-text-main-dark">
                                        Thứ 2 (16/10)
                                    </td>
                                    <td className="px-6 py-4 text-text-secondary-light dark:text-text-secondary-dark">
                                        Sáng (08:00 - 17:00)
                                    </td>
                                    <td className="px-6 py-4 text-right tabular-nums">8h</td>
                                    <td className="px-6 py-4 text-right tabular-nums">152</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-primary">19.0</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                            <span className="material-symbols-outlined text-[14px]">star</span> Cao
                                        </span>
                                    </td>
                                </tr>
                                <tr className="bg-white dark:bg-card-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-text-main-light dark:text-text-main-dark">
                                        Thứ 3 (17/10)
                                    </td>
                                    <td className="px-6 py-4 text-text-secondary-light dark:text-text-secondary-dark">
                                        Sáng (08:00 - 17:00)
                                    </td>
                                    <td className="px-6 py-4 text-right tabular-nums">8h</td>
                                    <td className="px-6 py-4 text-right tabular-nums">148</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-primary">18.5</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                            <span className="material-symbols-outlined text-[14px]">star</span> Cao
                                        </span>
                                    </td>
                                </tr>
                                <tr className="bg-white dark:bg-card-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-text-main-light dark:text-text-main-dark">
                                        Thứ 4 (18/10)
                                    </td>
                                    <td className="px-6 py-4 text-text-secondary-light dark:text-text-secondary-dark">
                                        Sáng (08:00 - 17:00)
                                    </td>
                                    <td className="px-6 py-4 text-right tabular-nums">8h</td>
                                    <td className="px-6 py-4 text-right tabular-nums">136</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-blue-400">17.0</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                                            Đạt
                                        </span>
                                    </td>
                                </tr>
                                <tr className="bg-white dark:bg-card-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-text-main-light dark:text-text-main-dark">
                                        Thứ 5 (19/10)
                                    </td>
                                    <td className="px-6 py-4 text-text-secondary-light dark:text-text-secondary-dark">
                                        Sáng (08:00 - 17:00)
                                    </td>
                                    <td className="px-6 py-4 text-right tabular-nums">8h</td>
                                    <td className="px-6 py-4 text-right tabular-nums">156</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-primary">19.5</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                            <span className="material-symbols-outlined text-[14px]">star</span> Cao
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-4 border-t border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/30 flex justify-between items-center">
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                            Hiển thị 4 trên 4 ngày làm việc
                        </p>
                        <div className="flex gap-2">
                            <button className="text-xs font-medium text-primary hover:underline">Xem lịch sử</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-xs text-text-secondary-light dark:text-text-secondary-dark justify-center opacity-80">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span>&lt; 12 SP/h (Chưa đạt)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                    <span>12-14 SP/h (Trung bình)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-300"></span>
                    <span>14-16 SP/h (Khá)</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span>≥ 16 SP/h (Xuất sắc 🎯)</span>
                </div>
            </div>
        </main>
    );
};

export default EmployeeKPIView;
