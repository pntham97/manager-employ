

const Projects = () => {

    const avatars = ["https://lh3.googleusercontent.com/aida-public/AB6AXuDYoWJkSaMftzVGFQ1W3tlA8RzUFRLIuhlCWLHp-XEWEYYXSo1Y7pwHNi2SO1tCUVe9tDUKWMSZnR9_rnXv8sZjvHBBMy1bfbeF0q7pPV3kEm3V1FZd-XFh7uGmHvVIcIuCKc4c_E3JxPl2u5q6-nvCWo-WbXw_GUarMeRt-w-4kWXjIexS6FaXaxTv1Gr6jcKaUXnDBs8PrE5YyKWDCjkw18g2GcXupQS7bj5DbvD9RL0YydpSogMnaN7txlUw8ZLbwMDiePFFcaQ", "https://lh3.googleusercontent.com/aida-public/AB6AXuDYoWJkSaMftzVGFQ1W3tlA8RzUFRLIuhlCWLHp-XEWEYYXSo1Y7pwHNi2SO1tCUVe9tDUKWMSZnR9_rnXv8sZjvHBBMy1bfbeF0q7pPV3kEm3V1FZd-XFh7uGmHvVIcIuCKc4c_E3JxPl2u5q6-nvCWo-WbXw_GUarMeRt-w-4kWXjIexS6FaXaxTv1Gr6jcKaUXnDBs8PrE5YyKWDCjkw18g2GcXupQS7bj5DbvD9RL0YydpSogMnaN7txlUw8ZLbwMDiePFFcaQ"];
    return (
        <div className="max-w-[1200px] h-full py-8 mx-auto flex flex-col gap-8">

            <div className="flex flex-col gap-4 ">

                <div className="flex items-center flex-wrap gap-2 text-sm">
                    <a className="text-text-sub hover:text-[#fff] transition-colors" href="#">Trang chủ</a>
                    <span className="text-text-sub">/</span>
                    <a className="text-text-sub hover:text-[#fff] transition-colors" href="#">Quản lý</a>
                    <span className="text-text-sub">/</span>
                    <span className="text-text-main dark:text-white font-medium">Dự án</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex flex-col gap-2 max-w-2xl">
                        <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-black tracking-tight">Quản lý dự án</h1>
                        <p className="text-text-sub dark:text-gray-400 text-base font-normal">Theo dõi tiến độ, phân công nhân sự và quản lý thời hạn cho toàn bộ tổ chức.</p>
                    </div>
                    <button className="flex items-center justify-center gap-2 rounded-lg bg-[#fff] hover:bg-blue-700 hover:text-white text-blue-700 text-sm font-bold h-11 px-5 transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>Tạo dự án mới</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                <div className="flex flex-col justify-between gap-4 p-5 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-color dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-text-sub dark:text-gray-400 text-sm font-medium">Tổng dự án</p>
                        <span className="material-symbols-outlined text-[#fff] bg-[#fff]/10 p-1.5 rounded-lg">folder_open</span>
                    </div>
                    <div>
                        <p className="text-text-main dark:text-white text-2xl font-bold">24</p>
                        <p className="text-green-600 text-sm font-medium mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">trending_up</span>
                            +2 so với tháng trước
                        </p>
                    </div>
                </div>

                <div className="flex flex-col justify-between gap-4 p-5 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-color dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-text-sub dark:text-gray-400 text-sm font-medium">Đang thực hiện</p>
                        <span className="material-symbols-outlined text-blue-500 bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg">pending_actions</span>
                    </div>
                    <div>
                        <p className="text-text-main dark:text-white text-2xl font-bold">12</p>
                        <p className="text-text-sub dark:text-gray-500 text-sm font-medium mt-1">Đang hoạt động tích cực</p>
                    </div>
                </div>

                <div className="flex flex-col justify-between gap-4 p-5 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-color dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-text-sub dark:text-gray-400 text-sm font-medium">Hoàn thành</p>
                        <span className="material-symbols-outlined text-green-500 bg-green-100 dark:bg-green-900/30 p-1.5 rounded-lg">task_alt</span>
                    </div>
                    <div>
                        <p className="text-text-main dark:text-white text-2xl font-bold">8</p>
                        <p className="text-green-600 text-sm font-medium mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                            +15% hiệu suất
                        </p>
                    </div>
                </div>

                <div className="flex flex-col justify-between gap-4 p-5 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-color dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-text-sub dark:text-gray-400 text-sm font-medium">Quá hạn</p>
                        <span className="material-symbols-outlined text-red-500 bg-red-100 dark:bg-red-900/30 p-1.5 rounded-lg">warning</span>
                    </div>
                    <div>
                        <p className="text-text-main dark:text-white text-2xl font-bold">4</p>
                        <p className="text-red-500 text-sm font-medium mt-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">priority_high</span>
                            Cần chú ý
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between bg-surface-light dark:bg-surface-dark p-2 rounded-xl">

                <div className="flex-1 max-w-lg">
                    <label className="flex items-center w-full h-11 bg-[#f6f6f8] dark:bg-gray-800 border border-transparent focus-within:border-[#fff] rounded-lg transition-colors px-3">
                        <span className="material-symbols-outlined text-text-sub dark:text-gray-400">search</span>
                        <input className="w-full bg-transparent border-none focus:ring-0 text-text-main dark:text-white placeholder:text-text-sub ml-2 text-sm" placeholder="Tìm kiếm dự án, nhiệm vụ hoặc nhân sự..." />
                    </label>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">

                    <div className="relative group">
                        <button className="flex items-center gap-2 h-11 px-4 bg-white dark:bg-surface-dark border border-border-color dark:border-gray-700 rounded-lg text-sm font-medium text-text-main dark:text-white whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-800">
                            <span className="material-symbols-outlined text-[18px] text-text-sub">filter_list</span>
                            Trạng thái
                            <span className="material-symbols-outlined text-[18px] text-text-sub">expand_more</span>
                        </button>
                    </div>

                    <div className="relative group">
                        <button className="flex items-center gap-2 h-11 px-4 bg-white dark:bg-surface-dark border border-border-color dark:border-gray-700 rounded-lg text-sm font-medium text-text-main dark:text-white whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-800">
                            <span className="material-symbols-outlined text-[18px] text-text-sub">domain</span>
                            Phòng ban
                            <span className="material-symbols-outlined text-[18px] text-text-sub">expand_more</span>
                        </button>
                    </div>
                    <div className="h-6 w-px bg-border-color dark:bg-gray-700 mx-1"></div>

                    <div className="flex bg-[#f6f6f8] dark:bg-gray-800 p-1 rounded-lg border border-border-color dark:border-gray-700">
                        <button className="p-1.5 rounded bg-white dark:bg-gray-600 shadow-sm text-[blue] dark:text-white">
                            <span className="material-symbols-outlined text-[20px]">grid_view</span>
                        </button>
                        <button className="p-1.5 rounded text-text-sub hover:text-text-main dark:text-gray-400 dark:hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[20px]">view_list</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                <div className="group flex flex-col bg-surface-light dark:bg-surface-dark border border-border-color dark:border-gray-700 rounded-xl p-5 hover:border-[#fff]/50 dark:hover:border-[#fff] transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-[blue] uppercase tracking-wider">Payroll</span>
                            <h3 className="text-lg font-bold text-text-main dark:text-white hover:text-black transition-colors">Triển khai Payroll Q3</h3>
                        </div>
                        <button className="text-text-sub hover:text-text-main dark:text-gray-400">
                            <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                    </div>
                    <p className="text-text-sub dark:text-gray-400 text-sm mb-4 line-clamp-2">Cập nhật hệ thống tính lương mới và tích hợp bảo hiểm xã hội tự động cho toàn bộ nhân viên.</p>

                    <div className="mb-4">
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                            <span className="text-text-sub dark:text-gray-400">Tiến độ</span>
                            <span className="text-[#fff]">65%</span>
                        </div>
                        <div className="w-full bg-[#f6f6f8] dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-[#fff] h-2 rounded-full w-[65%]" ></div>
                        </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-border-color dark:border-gray-700">
                        <div className="flex -space-x-2 overflow-hidden">
                            {avatars.map((url: any, index: number) => (
                                <div
                                    key={index}
                                    className="inline-block size-8 rounded-full ring-2 ring-white bg-cover bg-center"
                                    style={{ backgroundImage: `url(${url})` }}
                                />
                            ))}
                            <div className="flex items-center justify-center size-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-[#f6f6f8] dark:bg-gray-700 text-xs font-medium text-text-sub dark:text-gray-300">+2</div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-semibold">
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            30 Oct
                        </div>
                    </div>
                </div>

                <div className="group flex flex-col bg-surface-light dark:bg-surface-dark border border-border-color dark:border-gray-700 rounded-xl p-5 hover:border-[#fff]/50 dark:hover:border-[#fff] transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Tuyển dụng</span>
                            <h3 className="text-lg font-bold text-text-main dark:text-white hover:text-black transition-colors">Tuyển dụng Senior IT</h3>
                        </div>
                        <button className="text-text-sub hover:text-text-main dark:text-gray-400">
                            <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                    </div>
                    <p className="text-text-sub dark:text-gray-400 text-sm mb-4 line-clamp-2">Phỏng vấn vòng 2 cho các ứng viên vị trí Backend Developer và Frontend Leader.</p>

                    <div className="mb-4">
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                            <span className="text-text-sub dark:text-gray-400">Tiến độ</span>
                            <span className="text-[#fff]">40%</span>
                        </div>
                        <div className="w-full bg-[#f6f6f8] dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full w-[40%]" ></div>
                        </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-border-color dark:border-gray-700">
                        <div className="flex -space-x-2 overflow-hidden">
                            {avatars.map((url, index) => (
                                <div
                                    key={index}
                                    className="inline-block size-8 rounded-full ring-2 ring-white bg-cover bg-center"
                                    style={{ backgroundImage: `url(${url})` }}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-text-sub dark:text-gray-300 text-xs font-semibold">
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            15 Nov
                        </div>
                    </div>
                </div>

                <div className="group flex flex-col bg-surface-light dark:bg-surface-dark border border-border-color dark:border-gray-700 rounded-xl p-5 hover:border-[#fff]/50 dark:hover:border-[#fff] transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Đánh giá</span>
                            <h3 className="text-lg font-bold text-text-main dark:text-white hover:text-black transition-colors">KPI Cuối năm</h3>
                        </div>
                        <button className="text-text-sub hover:text-text-main dark:text-gray-400">
                            <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                    </div>
                    <p className="text-text-sub dark:text-gray-400 text-sm mb-4 line-clamp-2">Thu thập dữ liệu đánh giá hiệu suất từ các trưởng phòng ban và nhân viên.</p>

                    <div className="mb-4">
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                            <span className="text-text-sub dark:text-gray-400">Tiến độ</span>
                            <span className="text-[#fff]">15%</span>
                        </div>
                        <div className="w-full bg-[#f6f6f8] dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full w-[15%]" ></div>
                        </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-border-color dark:border-gray-700">
                        <div className="flex -space-x-2 overflow-hidden">
                            {avatars.map((url, index) => (
                                <div
                                    key={index}
                                    className="inline-block size-8 rounded-full ring-2 ring-white bg-cover bg-center"
                                    style={{ backgroundImage: `url(${url})` }}
                                />
                            ))}
                            <div className="flex items-center justify-center size-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-[#f6f6f8] dark:bg-gray-700 text-xs font-medium text-text-sub dark:text-gray-300">+5</div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                            <span className="material-symbols-outlined text-[14px]">priority_high</span>
                            Quá hạn
                        </div>
                    </div>
                </div>

                <div className="group flex flex-col bg-surface-light dark:bg-surface-dark border border-border-color dark:border-gray-700 rounded-xl p-5 hover:border-[#fff]/50 dark:hover:border-[#fff] transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Văn hóa</span>
                            <h3 className="text-lg font-bold text-text-main dark:text-white hover:text-black transition-colors">Teambuilding Đà Nẵng</h3>
                        </div>
                        <button className="text-text-sub hover:text-text-main dark:text-gray-400">
                            <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                    </div>
                    <p className="text-text-sub dark:text-gray-400 text-sm mb-4 line-clamp-2">Lên kế hoạch đặt vé máy bay, khách sạn và các hoạt động gắn kết cho chuyến đi tháng 12.</p>

                    <div className="mb-4">
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                            <span className="text-text-sub dark:text-gray-400">Tiến độ</span>
                            <span className="text-[#fff]">10%</span>
                        </div>
                        <div className="w-full bg-[#f6f6f8] dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full w-[10%]" ></div>
                        </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-border-color dark:border-gray-700">
                        <div className="flex -space-x-2 overflow-hidden">
                            {avatars.map((url, index) => (
                                <div
                                    key={index}
                                    className="inline-block size-8 rounded-full ring-2 ring-white bg-cover bg-center"
                                    style={{ backgroundImage: `url(${url})` }}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-text-sub dark:text-gray-300 text-xs font-semibold">
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            10 Dec
                        </div>
                    </div>
                </div>

                <div className="group flex flex-col bg-surface-light dark:bg-surface-dark border border-border-color dark:border-gray-700 rounded-xl p-5 hover:border-[#fff]/50 dark:hover:border-[#fff] transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer opacity-80 hover:opacity-100">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Admin</span>
                            <h3 className="text-lg font-bold text-text-main dark:text-white hover:text-black transition-colors decoration-slice">Bảo hiểm xã hội T11</h3>
                        </div>
                        <button className="text-text-sub hover:text-text-main dark:text-gray-400">
                            <span className="material-symbols-outlined">check_circle</span>
                        </button>
                    </div>
                    <p className="text-text-sub dark:text-gray-400 text-sm mb-4 line-clamp-2">Đã hoàn thành thủ tục chốt sổ và nộp hồ sơ cho cơ quan bảo hiểm.</p>
                    <div className="mb-4">
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                            <span className="text-text-sub dark:text-gray-400">Tiến độ</span>
                            <span className="text-green-600">100%</span>
                        </div>
                        <div className="w-full bg-[#f6f6f8] dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full w-[100%]" ></div>
                        </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-border-color dark:border-gray-700">
                        <div className="flex -space-x-2 overflow-hidden">
                            {avatars.map((url, index) => (
                                <div
                                    key={index}
                                    className="inline-block size-8 rounded-full ring-2 ring-white bg-cover bg-center"
                                    style={{ backgroundImage: `url(${url})` }}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-semibold">
                            Đã xong
                        </div>
                    </div>
                </div>

                <div className="group flex flex-col bg-surface-light dark:bg-surface-dark border border-border-color dark:border-gray-700 rounded-xl p-5 hover:border-[#fff]/50 dark:hover:border-[#fff] transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">L&amp;D</span>
                            <h3 className="text-lg font-bold text-text-main dark:text-white hover:text-black transition-colors">Đào tạo nội bộ: Leadership</h3>
                        </div>
                        <button className="text-text-sub hover:text-text-main dark:text-gray-400">
                            <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                    </div>
                    <p className="text-text-sub dark:text-gray-400 text-sm mb-4 line-clamp-2">Khóa học phát triển kỹ năng lãnh đạo cho cấp quản lý mới.</p>

                    <div className="mb-4">
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                            <span className="text-text-sub dark:text-gray-400">Tiến độ</span>
                            <span className="text-[#fff]">25%</span>
                        </div>
                        <div className="w-full bg-[#f6f6f8] dark:bg-gray-700 rounded-full h-2">
                            <div className="bg-indigo-500 h-2 rounded-full w-[25%]" ></div>
                        </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-border-color dark:border-gray-700">
                        <div className="flex -space-x-2 overflow-hidden">
                            {avatars.map((url, index) => (
                                <div
                                    key={index}
                                    className="inline-block size-8 rounded-full ring-2 ring-white bg-cover bg-center"
                                    style={{ backgroundImage: `url(${url})` }}
                                />
                            ))}
                            <div className="flex items-center justify-center size-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-[#f6f6f8] dark:bg-gray-700 text-xs font-medium text-text-sub dark:text-gray-300">+8</div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-text-sub dark:text-gray-300 text-xs font-semibold">
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            20 Dec
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Projects;
