
const EmployDetail = () => {
    const managerAvatar =
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDDOi0-tpqso3eYCWh3dKmobQrbqwRptXM3j-JOx9PGX9OSATHMVXWyWs0DgoDRhLlFM8U-qghUWeBWZvu-BPwQuE0-g-66s-dmVw5-2VESlNse3hkDNjrS1hhgRUxtNzSwV6Ozrl87E9Bq_NcozN-7U0qsJVb7TWpOmX85cG2ekcJbxVFrUNIkjuhGctqdq8TaFYrRtYmw9I4leIXYy2wG-8C5QVXXhrDZrd7_wBwiSVM-nLQ6CZlTmsuYwHvmcWzAMpFbZg1j8IA";


    return (
        <div className="mx-auto max-w-6xl space-y-6 py-8">

            <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <a className="hover:text-primary transition-colors" href="#">Trang chủ</a>
                <span className="mx-2 text-gray-400">/</span>
                <a className="hover:text-primary transition-colors" href="#">Danh sách nhân viên</a>
                <span className="mx-2 text-gray-400">/</span>
                <span className="font-medium text-gray-900 dark:text-white">Nguyễn Văn A</span>
            </nav>

            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Hồ sơ nhân viên</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Quản lý thông tin chi tiết, hợp đồng và lịch sử công việc.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center justify-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">print</span>
                        <span>In hồ sơ</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-black hover:text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                        <span>Chỉnh sửa hồ sơ</span>
                    </button>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark shadow-sm border border-border-light dark:border-border-dark p-6">

                <div className="absolute right-0 top-0 h-32 w-32 -mr-8 -mt-8 rounded-full bg-primary/10 blur-3xl"></div>
                <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white dark:border-gray-800 shadow-md">
                            {/* <img alt="Chân dung nhân viên nam mỉm cười" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTKdFS3ikluJimBTPY6z-LfF8FS5GYQq0sHM5BtrgqV1-Hy6cmYBGnkPr3wkFIAnZgdzvysMk6YKiT5zoKtXNwCMn5HLy2c0qvzL1SdQxnCynPg2IyOqyxXjkWorhFTL9ckmECQOHJ-xiGN4NrebUwiaeuZN3OqEL24YKX5rdTDHDv2KzoRHbLXxlzZezFYtX5wqYZDs_fWcE30GJCqZ2I09NvbfnhPJ4ohhnh923ocZVOvWbpr1sadhpW-xyMU4sM7Ab7ZDOcsyM"> */}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nguyễn Văn A</h2>
                                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400">Đang hoạt động</span>
                            </div>
                            <p className="text-base text-gray-500 dark:text-gray-400">Senior Software Engineer</p>
                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">badge</span>
                                    <span>ID: #EMP2023056</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">apartment</span>
                                    <span>Phòng Kỹ thuật</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                    <span>Hà Nội, Việt Nam</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row gap-8 md:flex-col md:items-end md:gap-1 lg:flex-row lg:items-center lg:gap-8 border-t md:border-t-0 border-border-light dark:border-border-dark pt-4 md:pt-0">
                        <div className="text-left md:text-right lg:text-center">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày gia nhập</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">12/05/2021</p>
                        </div>
                        <div className="text-left md:text-right lg:text-center">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Người quản lý</p>
                            <div className="flex items-center gap-2 md:justify-end lg:justify-center">
                                <div
                                    className="h-6 w-6 rounded-full bg-cover bg-center"
                                    style={{ backgroundImage: `url(${managerAvatar})` }}
                                />
                                <p className="font-bold text-gray-900 dark:text-white">Trần Thị B</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 rounded-xl shadow-sm">
                <nav aria-label="Tabs" className="-mb-px flex space-x-8 overflow-x-auto">
                    <a aria-current="page" className="border-b-2 border-primary py-4 px-1 text-sm font-bold text-primary" href="#">Tổng quan</a>
                    <a className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" href="#">Hợp đồng</a>
                    <a className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" href="#">Lịch sử công việc</a>
                    <a className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" href="#">Lương &amp; Phúc lợi</a>
                    <a className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" href="#">Tài liệu</a>
                </nav>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                <div className="space-y-6 lg:col-span-2">

                    <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">person</span>
                                Thông tin cá nhân
                            </h3>
                        </div>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Họ và tên</dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">Nguyễn Văn A</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Giới tính</dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">Nam</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày sinh</dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">12/10/1995</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Quốc tịch</dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">Việt Nam</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">CCCD/CMND</dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">001095012345</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Mã số thuế</dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">8372947192</dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Địa chỉ thường trú</dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">Số 15, Ngõ 123, Đường Trần Duy Hưng, Phường Trung Hòa, Quận Cầu Giấy, Hà Nội</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">contact_phone</span>
                                Thông tin liên hệ
                            </h3>
                        </div>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email công việc</dt>
                                <dd className="mt-1 text-sm font-semibold text-primary">nguyenvana@company.com</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email cá nhân</dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">anhnguyen95@gmail.com</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Số điện thoại</dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">0912 345 678</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Liên hệ khẩn cấp</dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">Nguyễn Thị C (Vợ) - 0987 654 321</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">account_balance</span>
                                Thông tin ngân hàng
                            </h3>
                        </div>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ngân hàng</dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">Vietcombank - CN Hà Nội</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Số tài khoản</dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">**** **** **** 1234</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tên chủ tài khoản</dt>
                                <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">NGUYEN VAN A</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <div className="space-y-6 lg:col-span-1">

                    <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">work</span>
                            Thông tin công việc
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Loại hình</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Toàn thời gian</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Ngày chính thức</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">12/07/2021</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Thâm niên</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">2 năm, 5 tháng</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Văn phòng</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">Keangnam Landmark 72</span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">description</span>
                            Hợp đồng hiện tại
                        </h3>
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                                    <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate text-sm font-bold text-gray-900 dark:text-white">HDLD-2023-056.pdf</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Hợp đồng lao động không xác định thời hạn</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <span className="text-green-600 font-medium">Đã ký ngày 12/07/2023</span>
                                <a className="text-primary hover:underline" href="#">Tải về</a>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">history</span>
                                Lịch sử
                            </h3>
                            <a className="text-xs font-medium text-primary hover:underline" href="#">Xem tất cả</a>
                        </div>
                        <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-3 space-y-8">

                            <div className="relative ml-6">
                                <span className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-primary dark:border-gray-900"></span>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Thăng chức Senior Engineer</h4>
                                <p className="text-xs text-gray-500 mt-1">01/01/2023</p>
                                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">Được bổ nhiệm vị trí mới sau đánh giá hiệu suất năm 2022.</p>
                            </div>

                            <div className="relative ml-6">
                                <span className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-gray-300 dark:border-gray-900 dark:bg-gray-600"></span>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Ký hợp đồng chính thức</h4>
                                <p className="text-xs text-gray-500 mt-1">12/07/2021</p>
                            </div>

                            <div className="relative ml-6">
                                <span className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-gray-300 dark:border-gray-900 dark:bg-gray-600"></span>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Gia nhập công ty</h4>
                                <p className="text-xs text-gray-500 mt-1">12/05/2021</p>
                                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">Vị trí: Software Engineer (Thử việc)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployDetail;
