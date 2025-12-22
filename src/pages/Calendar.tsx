

const Calendar = () => {

    return (
        <div className="p-6 lg:p-10 max-w-[1280px] mx-auto w-full flex flex-col gap-8">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#111318] dark:text-white">Đăng ký lịch làm</h1>
                    <p className="text-[#616f89] dark:text-[#9ca3af] text-base">Quản lý ca làm việc và gửi yêu cầu thay đổi lịch trình cho tháng này.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-[#2e374a] border border-[#e5e7eb] dark:border-[#4b5563] text-[#111318] dark:text-white rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-[#374151] flex items-center gap-2 transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[20px]">help</span>
                        Hướng dẫn
                    </button>
                    <button className="px-5 py-2 bg-[white] text-[#111318] hover:text-white rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Đăng ký ca mới
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#1a2230] rounded-xl p-6 border border-[#dbdfe6] dark:border-[#2e374a] shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <p className="text-[#616f89] dark:text-[#9ca3af] text-sm font-medium">Tổng giờ đăng ký (T9)</p>
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-md text-[20px]">schedule</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold dark:text-white">152h</p>
                        <p className="text-[#e73908] text-sm font-medium bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">-13.6%</p>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                        <div className="bg-primary h-1.5 rounded-full w-[86%]" ></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1a2230] rounded-xl p-6 border border-[#dbdfe6] dark:border-[#2e374a] shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <p className="text-[#616f89] dark:text-[#9ca3af] text-sm font-medium">Giờ quy định</p>
                        <span className="material-symbols-outlined text-green-600 bg-green-100 dark:bg-green-900/30 p-1 rounded-md text-[20px]">fact_check</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold dark:text-white">176h</p>
                    </div>
                    <p className="text-xs text-[#616f89] dark:text-[#9ca3af] mt-2">Cần đăng ký thêm 24h để đủ định mức.</p>
                </div>
                <div className="bg-white dark:bg-[#1a2230] rounded-xl p-6 border border-[#dbdfe6] dark:border-[#2e374a] shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <p className="text-[#616f89] dark:text-[#9ca3af] text-sm font-medium">Ngày phép còn lại</p>
                        <span className="material-symbols-outlined text-orange-600 bg-orange-100 dark:bg-orange-900/30 p-1 rounded-md text-[20px]">beach_access</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold dark:text-white">12 <span className="text-lg font-normal text-[#616f89]">ngày</span></p>
                    </div>
                    <p className="text-xs text-[#616f89] dark:text-[#9ca3af] mt-2">Hết hạn vào 31/12/2023</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a2230] border border-[#dbdfe6] dark:border-[#2e374a] rounded-xl shadow-sm overflow-hidden flex flex-col">

                <div className="flex items-center justify-between px-6 py-4 border-b border-[#dbdfe6] dark:border-[#2e374a]">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-bold text-[#111318] dark:text-white">Tháng 9, 2023</h3>
                        <div className="flex items-center rounded-lg border border-[#dbdfe6] dark:border-[#4b5563] overflow-hidden">
                            <button className="p-1.5 hover:bg-background-light dark:hover:bg-[#374151] text-[#616f89] dark:text-[#9ca3af]">
                                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                            </button>
                            <button className="p-1.5 hover:bg-background-light dark:hover:bg-[#374151] text-[#616f89] dark:text-[#9ca3af] border-l border-[#dbdfe6] dark:border-[#4b5563]">
                                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-100 border border-blue-500"></span>
                            <span className="text-[#616f89] dark:text-[#9ca3af]">Đã duyệt</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-orange-100 border border-orange-500"></span>
                            <span className="text-[#616f89] dark:text-[#9ca3af]">Chờ duyệt</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-100 border border-red-500"></span>
                            <span className="text-[#616f89] dark:text-[#9ca3af]">Từ chối</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-7 border-b border-[#dbdfe6] dark:border-[#2e374a]">
                    <div className="py-3 text-center text-sm font-semibold text-[#616f89] dark:text-[#9ca3af] border-r border-[#dbdfe6] dark:border-[#2e374a] last:border-r-0">T2</div>
                    <div className="py-3 text-center text-sm font-semibold text-[#616f89] dark:text-[#9ca3af] border-r border-[#dbdfe6] dark:border-[#2e374a] last:border-r-0">T3</div>
                    <div className="py-3 text-center text-sm font-semibold text-[#616f89] dark:text-[#9ca3af] border-r border-[#dbdfe6] dark:border-[#2e374a] last:border-r-0">T4</div>
                    <div className="py-3 text-center text-sm font-semibold text-[#616f89] dark:text-[#9ca3af] border-r border-[#dbdfe6] dark:border-[#2e374a] last:border-r-0">T5</div>
                    <div className="py-3 text-center text-sm font-semibold text-[#616f89] dark:text-[#9ca3af] border-r border-[#dbdfe6] dark:border-[#2e374a] last:border-r-0">T6</div>
                    <div className="py-3 text-center text-sm font-semibold text-[#616f89] dark:text-[#9ca3af] border-r border-[#dbdfe6] dark:border-[#2e374a] last:border-r-0">T7</div>
                    <div className="py-3 text-center text-sm font-semibold text-[#616f89] dark:text-[#9ca3af] last:border-r-0">CN</div>
                </div>
                <div className="grid grid-cols-7 auto-rows-fr bg-[#f0f2f4] dark:bg-[#1a2230] gap-px border-b border-[#dbdfe6] dark:border-[#2e374a]">

                    <div className="min-h-[140px] bg-white dark:bg-[#1a2230] p-2 opacity-50">
                        <span className="text-sm font-medium text-[#616f89] dark:text-[#9ca3af]">28</span>
                    </div>
                    <div className="min-h-[140px] bg-white dark:bg-[#1a2230] p-2 opacity-50">
                        <span className="text-sm font-medium text-[#616f89] dark:text-[#9ca3af]">29</span>
                    </div>
                    <div className="min-h-[140px] bg-white dark:bg-[#1a2230] p-2 opacity-50">
                        <span className="text-sm font-medium text-[#616f89] dark:text-[#9ca3af]">30</span>
                    </div>
                    <div className="min-h-[140px] bg-white dark:bg-[#1a2230] p-2 opacity-50">
                        <span className="text-sm font-medium text-[#616f89] dark:text-[#9ca3af]">31</span>
                    </div>

                    <div className="min-h-[140px] bg-white dark:bg-[#1a2230] p-2 group hover:bg-blue-50/50 dark:hover:bg-[#252d3d] transition-colors relative">
                        <span className="text-sm font-bold text-[#111318] dark:text-white">1</span>
                        <div className="mt-2 flex flex-col gap-1">
                            <div className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 border-l-2 border-primary">
                                <p className="text-xs font-bold text-blue-800 dark:text-blue-100">08:00 - 17:00</p>
                                <p className="text-[10px] text-blue-600 dark:text-blue-300">Hành chính</p>
                            </div>
                        </div>
                    </div>
                    <div className="min-h-[140px] bg-white dark:bg-[#1a2230] p-2 group hover:bg-blue-50/50 dark:hover:bg-[#252d3d] transition-colors relative">
                        <span className="text-sm font-bold text-[#111318] dark:text-white">2</span>
                        <div className="mt-2 flex flex-col gap-1">
                            <div className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border-l-2 border-gray-400">
                                <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Nghỉ Lễ</p>
                                <p className="text-[10px] text-gray-600 dark:text-gray-400">Quốc Khánh</p>
                            </div>
                        </div>
                    </div>
                    <div className="min-h-[140px] bg-white dark:bg-[#1a2230] p-2 group hover:bg-blue-50/50 dark:hover:bg-[#252d3d] transition-colors relative">
                        <span className="text-sm font-bold text-[#111318] dark:text-white">3</span>
                    </div>

                    <div className="min-h-[140px] bg-white dark:bg-[#1a2230] p-2 group hover:bg-blue-50/50 dark:hover:bg-[#252d3d] transition-colors relative">
                        <span className="text-sm font-bold text-[#111318] dark:text-white">4</span>
                        <div className="mt-2 flex flex-col gap-1">
                            <div className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 border-l-2 border-primary">
                                <p className="text-xs font-bold text-blue-800 dark:text-blue-100">08:00 - 17:00</p>
                                <p className="text-[10px] text-blue-600 dark:text-blue-300">Hành chính</p>
                            </div>
                        </div>
                    </div>
                    <div className="min-h-[140px] bg-white dark:bg-[#1a2230] p-2 group hover:bg-blue-50/50 dark:hover:bg-[#252d3d] transition-colors relative">
                        <span className="text-sm font-bold text-[#111318] dark:text-white">5</span>
                        <div className="mt-2 flex flex-col gap-1">
                            <div className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 border-l-2 border-primary">
                                <p className="text-xs font-bold text-blue-800 dark:text-blue-100">08:00 - 17:00</p>
                                <p className="text-[10px] text-blue-600 dark:text-blue-300">Hành chính</p>
                            </div>
                        </div>
                    </div>
                    <div className="min-h-[140px] bg-white dark:bg-[#1a2230] p-2 group hover:bg-blue-50/50 dark:hover:bg-[#252d3d] transition-colors relative">
                        <span className="text-sm font-bold text-[#111318] dark:text-white">6</span>
                        <div className="mt-2 flex flex-col gap-1">
                            <div className="px-2 py-1 rounded bg-orange-100 dark:bg-orange-900/40 border-l-2 border-orange-500">
                                <p className="text-xs font-bold text-orange-800 dark:text-orange-100">08:00 - 12:00</p>
                                <p className="text-[10px] text-orange-600 dark:text-orange-300">Chờ duyệt</p>
                            </div>
                        </div>
                    </div>
                    <div className="min-h-[140px] bg-white dark:bg-[#1a2230] p-2 group hover:bg-blue-50/50 dark:hover:bg-[#252d3d] transition-colors relative">
                        <span className="text-sm font-bold text-[#111318] dark:text-white">7</span>
                        <div className="mt-2 flex flex-col gap-1">
                            <div className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 border-l-2 border-primary">
                                <p className="text-xs font-bold text-blue-800 dark:text-blue-100">08:00 - 17:00</p>
                            </div>
                        </div>
                    </div>
                    <div className="min-h-[140px] bg-white dark:bg-[#1a2230] p-2 group hover:bg-blue-50/50 dark:hover:bg-[#252d3d] transition-colors relative">
                        <span className="text-sm font-bold text-[#111318] dark:text-white">8</span>
                        <div className="mt-2 flex flex-col gap-1">
                            <div className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/40 border-l-2 border-red-500 opacity-70">
                                <p className="text-xs font-bold text-red-800 dark:text-red-100">Nghỉ phép</p>
                                <p className="text-[10px] text-red-600 dark:text-red-300">Từ chối</p>
                            </div>
                        </div>
                    </div>
                    <div className="min-h-[140px] bg-white dark:bg-[#1a2230] p-2 group hover:bg-blue-50/50 dark:hover:bg-[#252d3d] transition-colors relative">
                        <span className="text-sm font-bold text-[#111318] dark:text-white">9</span>
                    </div>
                    <div className="min-h-[140px] bg-white dark:bg-[#1a2230] p-2 group hover:bg-blue-50/50 dark:hover:bg-[#252d3d] transition-colors relative">
                        <span className="text-sm font-bold text-[#111318] dark:text-white">10</span>
                    </div>

                    <div className="min-h-[140px] bg-white dark:bg-[#1a2230] p-2 group hover:bg-blue-50/50 dark:hover:bg-[#252d3d] transition-colors relative">
                        <span className="text-sm font-bold text-[#111318] dark:text-white">11</span>
                        <div className="mt-2 flex flex-col gap-1">
                            <div className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 border-l-2 border-primary">
                                <p className="text-xs font-bold text-blue-800 dark:text-blue-100">13:30 - 17:30</p>
                                <p className="text-[10px] text-blue-600 dark:text-blue-300">Ca chiều</p>
                            </div>
                        </div>
                    </div>
                    <div className="min-h-[140px] bg-white dark:bg-[#1a2230] p-2 group hover:bg-blue-50/50 dark:hover:bg-[#252d3d] transition-colors relative">
                        <span className="text-sm font-bold text-[#111318] dark:text-white">12</span>
                        <div className="mt-2 flex flex-col gap-1">
                            <div className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 border-l-2 border-primary">
                                <p className="text-xs font-bold text-blue-800 dark:text-blue-100">13:30 - 17:30</p>
                                <p className="text-[10px] text-blue-600 dark:text-blue-300">Ca chiều</p>
                            </div>
                        </div>
                    </div>
                    <div className="min-h-[140px] bg-white dark:bg-[#1a2230] p-2 group hover:bg-blue-50/50 dark:hover:bg-[#252d3d] transition-colors relative">
                        <span className="text-sm font-bold text-[#111318] dark:text-white">13</span>
                    </div>
                    <div className="min-h-[140px] bg-white dark:bg-[#1a2230] p-2 group hover:bg-blue-50/50 dark:hover:bg-[#252d3d] transition-colors relative">
                        <span className="text-sm font-bold text-[#111318] dark:text-white">14</span>
                        <div className="mt-2 flex flex-col gap-1">
                            <div className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 border-l-2 border-primary">
                                <p className="text-xs font-bold text-blue-800 dark:text-blue-100">08:00 - 17:00</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4 mb-10">
                <h3 className="text-xl font-bold text-[#111318] dark:text-white">Lịch sử yêu cầu thay đổi</h3>
                <div className="w-full overflow-x-auto rounded-xl border border-[#dbdfe6] dark:border-[#2e374a] shadow-sm bg-white dark:bg-[#1a2230]">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#f0f2f4] dark:bg-[#252d3d] text-[#616f89] dark:text-[#9ca3af]">
                            <tr>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Ngày gửi</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Loại yêu cầu</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Chi tiết</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Trạng thái</th>
                                <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dbdfe6] dark:divide-[#2e374a]">
                            <tr className="hover:bg-background-light dark:hover:bg-[#252d3d] transition-colors">
                                <td className="px-6 py-4 text-[#111318] dark:text-white">06/09/2023</td>
                                <td className="px-6 py-4 text-[#111318] dark:text-white">Đăng ký mới</td>
                                <td className="px-6 py-4 text-[#616f89] dark:text-[#9ca3af]">Ca sáng (08:00 - 12:00) ngày 15/09</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200">
                                        Chờ duyệt
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-[#616f89] dark:text-[#9ca3af] hover:text-red-600 dark:hover:text-red-400 font-medium text-sm">Hủy</button>
                                </td>
                            </tr>
                            <tr className="hover:bg-background-light dark:hover:bg-[#252d3d] transition-colors">
                                <td className="px-6 py-4 text-[#111318] dark:text-white">02/09/2023</td>
                                <td className="px-6 py-4 text-[#111318] dark:text-white">Nghỉ phép</td>
                                <td className="px-6 py-4 text-[#616f89] dark:text-[#9ca3af]">Nghỉ phép năm ngày 08/09</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200">
                                        Từ chối
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-primary hover:text-blue-700 font-medium text-sm">Xem lý do</button>
                                </td>
                            </tr>
                            <tr className="hover:bg-background-light dark:hover:bg-[#252d3d] transition-colors">
                                <td className="px-6 py-4 text-[#111318] dark:text-white">01/09/2023</td>
                                <td className="px-6 py-4 text-[#111318] dark:text-white">Đổi ca</td>
                                <td className="px-6 py-4 text-[#616f89] dark:text-[#9ca3af]">Đổi ca chiều sang sáng ngày 04/09</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">
                                        Đã duyệt
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
