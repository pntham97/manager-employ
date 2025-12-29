import { useNavigate } from "react-router-dom";

const ManagerEmploy = () => {
    const navigate = useNavigate();
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <nav className="flex text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-4">
                <a className="hover:text-[white] transition-colors" href="#">Trang chủ</a>
                <span className="mx-2">/</span>
                <span className="text-text-main-light dark:text-text-main-dark">Danh sách nhân viên</span>
            </nav>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-main-light dark:text-text-main-dark tracking-tight">Danh sách nhân viên</h1>
                    <p className="mt-1 text-text-secondary-light dark:text-text-secondary-dark">Quản lý và theo dõi toàn bộ nhân sự trong công ty.</p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-3">
                    <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[white] shadow-soft transition-colors text-text-main-light dark:text-text-main-dark">
                        <span className="material-icons-outlined text-lg mr-2">file_download</span>
                        Xuất Excel
                    </button>
                    <button
                        onClick={() => navigate("/ManagerEmploy/AddEmploys")}
                        className="inline-flex items-center px-4 py-2 bg-[white] hover:bg-[white]-hover text-black rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[white] shadow-soft transition-colors"
                    >
                        <span className="material-icons-outlined text-lg mr-2">add</span>
                        Thêm nhân viên mới
                    </button>
                </div>
            </div>
            <div className="bg-white dark:bg-card-dark rounded-xl shadow-soft p-4 mb-6 border border-border-light dark:border-border-dark">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark">search</span>
                        </div>
                        <input className="block w-full pl-10 pr-3 py-2 border border-border-light dark:border-border-dark rounded-lg leading-5 bg-gray-50 dark:bg-gray-800 placeholder-text-secondary-light dark:placeholder-text-secondary-dark focus:outline-none focus:ring-1 focus:ring-[white] focus:border-[white] sm:text-sm text-text-main-light dark:text-text-main-dark transition-colors" placeholder="Tìm kiếm theo tên, ID..." type="text" />
                    </div>
                    <div className="md:col-span-1">
                        <select className="block w-full pl-3 pr-10 py-2 text-base border border-border-light dark:border-border-dark focus:outline-none focus:ring-[white] focus:border-[white] sm:text-sm rounded-lg bg-gray-50 dark:bg-gray-800 text-text-main-light dark:text-text-main-dark">
                            <option>Tất cả phòng ban</option>
                            <option>Phòng Kỹ thuật</option>
                            <option>Phòng Marketing</option>
                            <option>Phòng Nhân sự</option>
                            <option>Phòng Kinh doanh</option>
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <select className="block w-full pl-3 pr-10 py-2 text-base border border-border-light dark:border-border-dark focus:outline-none focus:ring-[white] focus:border-[white] sm:text-sm rounded-lg bg-gray-50 dark:bg-gray-800 text-text-main-light dark:text-text-main-dark">
                            <option>Tất cả trạng thái</option>
                            <option>Đang hoạt động</option>
                            <option>Nghỉ phép</option>
                            <option>Đã nghỉ việc</option>
                        </select>
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                        <button className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-border-light dark:border-border-dark shadow-sm text-sm font-medium rounded-lg text-text-secondary-light dark:text-text-secondary-dark bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <span className="material-icons-outlined text-lg mr-2">filter_list</span>
                            Bộ lọc nâng cao
                        </button>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-card-dark shadow-soft rounded-xl overflow-hidden border border-border-light dark:border-border-dark">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider" scope="col">
                                    Nhân viên
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider" scope="col">
                                    ID &amp; Vị trí
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider" scope="col">
                                    Phòng ban
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider" scope="col">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider" scope="col">
                                    Ngày tham gia
                                </th>
                                <th className="relative px-6 py-4" scope="col">
                                    <span className="sr-only">Hành động</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-card-dark divide-y divide-border-light dark:divide-border-dark">
                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {/* <img alt="Avatar Nguyễn Văn A" className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcgMrWCB9VMNKIzoub9csNipyxEX6gkM9-XSCNnDO1tZEsQ6yWmXnX3p4LunDxYMrS-GUtNlmrzjcQSDvj3wV0vfkQOC8HsZKKMVjR8TQyywm1mGKhL4SOxsdD59dNj3tMUzBbXW_icwAahLtthR9eZL3urwEqSYlXntyGmdn5_WevofrO8BgejJWs75Kiki04L1-Hfh59JLHrJV7vnoO5urGyOxdpZZ3hrYBATJr9iAFudoDg6F4GJB5ickJwSge36eA9eI0_5Gk"> */}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-text-main-light dark:text-text-main-dark group-hover:text-black transition-colors">Nguyễn Văn A</div>
                                            <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">nguyenvana@company.com</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-text-main-light dark:text-text-main-dark font-medium">Senior Software Engineer</div>
                                    <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">ID: #EMP2023056</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                        <span className="material-icons-outlined text-sm mr-1">apartment</span>
                                        Phòng Kỹ thuật
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-bg text-success-text border border-success-text/10">
                                        Đang hoạt động
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                    12/05/2021
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-text-secondary-light dark:text-text-secondary-dark hover:text-[white] transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <span className="material-icons-outlined">more_vert</span>
                                    </button>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {/* <img alt="Avatar Trần Thị B" className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDs0C52yLx6jfNlmRMmj29qs9cpur5GJKh3WeN_g-StBFCiGHLV6pBPHFpTEA996UvIiVsHeMvRmDgtZ8P7omGlt1rt160hKPlA9Z0lKWydVPdmG3oEhtMWYNQDBtgBKWfwLhc5s8NfRj8sUfL2E4FUgT3Bmt9T9blrPezfVeWbFBfB2iV_4E67HAx2EKy1ebVa9AEDPIFpmdO963K2-aQxbZGYNME7aHUQk_Cl4m2OKDWSjbyN2daemYWAc0S0tbpOSOIxkZYHtEA"> */}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-text-main-light dark:text-text-main-dark group-hover:text-[black] transition-colors">Trần Thị B</div>
                                            <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">tranthib@company.com</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-text-main-light dark:text-text-main-dark font-medium">Marketing Lead</div>
                                    <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">ID: #EMP2023089</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                        <span className="material-icons-outlined text-sm mr-1">campaign</span>
                                        Phòng Marketing
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-bg text-success-text border border-success-text/10">
                                        Đang hoạt động
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                    20/08/2021
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-text-secondary-light dark:text-text-secondary-dark hover:text-[white] transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <span className="material-icons-outlined">more_vert</span>
                                    </button>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {/* <Image alt="Avatar Lê Văn C" className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlLlPk6Ov2AtxUMbG5Y3ceuSlqPGxYGSPrtjtIRC-1mAJL4JwQyw9gZevGxPwcZ-hbIYefj5nUCwRV1cJ-GqvNbP9qi-ztOMPLXsA75ZaxSWo2knS4LXp76bw3zh3adlKmIlrw1TXuKjAtbJGDEhSoHkc3-CQ4BWBH10o1gIEyYgHEIE1lOpjU5zgUamt_9v2sytSsHBXJHm2HkQkhFRDFT3INE-SjNR3XQmVHr04fm_RT_01_bHXktnOUv5GCppavQrwOSXPgWT4"> */}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-text-main-light dark:text-text-main-dark group-hover:text-[black] transition-colors">Lê Văn C</div>
                                            <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">levanc@company.com</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-text-main-light dark:text-text-main-dark font-medium">HR Specialist</div>
                                    <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">ID: #EMP2022012</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                        <span className="material-icons-outlined text-sm mr-1">group</span>
                                        Phòng Nhân sự
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-warning-bg text-warning-text border border-warning-text/10">
                                        Nghỉ phép
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                    15/01/2022
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-text-secondary-light dark:text-text-secondary-dark hover:text-[white] transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <span className="material-icons-outlined">more_vert</span>
                                    </button>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <div className="h-10 w-10 rounded-full bg-[white] flex items-center justify-center text-white font-bold ring-2 ring-white dark:ring-gray-700">
                                                PT
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-text-main-light dark:text-text-main-dark group-hover:text-[black] transition-colors">Phạm Thị D</div>
                                            <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">phamthid@company.com</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-text-main-light dark:text-text-main-dark font-medium">Sales Executive</div>
                                    <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">ID: #EMP2021004</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                        <span className="material-icons-outlined text-sm mr-1">trending_up</span>
                                        Phòng Kinh doanh
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-danger-bg text-danger-text border border-danger-text/10">
                                        Đã nghỉ việc
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                    01/03/2021
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-text-secondary-light dark:text-text-secondary-dark hover:text-[white] transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <span className="material-icons-outlined">more_vert</span>
                                    </button>
                                </td>
                            </tr>
                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {/* <img alt="Avatar Hoàng Văn E" className="h-10 w-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUsKuVbaCMny2ad--gpMonO07kWKlAbweah-yWlY2Ma1SRsMzD4sG3A4G5PJD7HIsDgnu5KVcLObh0bQzMOKgjerJ9a2jw8efAVez28HuFl7SuRU8GJqPdMSl726nt-6OedKhzDknJjJWkpl05J6yH4t0uP2_GeDDPibzEGrIjxXHpxXRAITWqNtTft385wpSvtXIKs4HuAzaM_QAbzXazbadF28dCIvEUtSIYhYVHJkrZeNb8T5xpWbkGse-gfDwTGico3pWXrmY"> */}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-text-main-light dark:text-text-main-dark group-hover:text-[black] transition-colors">Hoàng Văn E</div>
                                            <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">hoangvane@company.com</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-text-main-light dark:text-text-main-dark font-medium">Product Manager</div>
                                    <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">ID: #EMP2020098</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                        <span className="material-icons-outlined text-sm mr-1">inventory_2</span>
                                        Phòng Sản phẩm
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-bg text-success-text border border-success-text/10">
                                        Đang hoạt động
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                    10/10/2020
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => navigate("/EmployDetail")}
                                        className="text-text-secondary-light dark:text-text-secondary-dark hover:text-white transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <span className="material-icons-outlined">more_vert</span>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-border-light dark:border-border-dark flex items-center justify-between bg-white dark:bg-card-dark">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                Hiển thị <span className="font-medium text-text-main-light dark:text-text-main-dark">1</span> đến <span className="font-medium text-text-main-light dark:text-text-main-dark">10</span> trong số <span className="font-medium text-text-main-light dark:text-text-main-dark">97</span> kết quả
                            </p>
                        </div>
                        <div>
                            <nav aria-label="Pagination" className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <a className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-gray-700" href="#">
                                    <span className="sr-only">Previous</span>
                                    <span className="material-icons-outlined text-base">chevron_left</span>
                                </a>
                                <a aria-current="page" className="z-10 bg-blue-50 dark:bg-blue-900 border-[white] text-[black] relative inline-flex items-center px-4 py-2 border text-sm font-medium" href="#">
                                    1
                                </a>
                                <a className="bg-white dark:bg-gray-800 border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-gray-700 relative inline-flex items-center px-4 py-2 border text-sm font-medium" href="#">
                                    2
                                </a>
                                <a className="bg-white dark:bg-gray-800 border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-gray-700 hidden md:inline-flex relative items-center px-4 py-2 border text-sm font-medium" href="#">
                                    3
                                </a>
                                <span className="relative inline-flex items-center px-4 py-2 border border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                                    ...
                                </span>
                                <a className="bg-white dark:bg-gray-800 border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-gray-700 hidden md:inline-flex relative items-center px-4 py-2 border text-sm font-medium" href="#">
                                    8
                                </a>
                                <a className="bg-white dark:bg-gray-800 border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-gray-700 hidden md:inline-flex relative items-center px-4 py-2 border text-sm font-medium" href="#">
                                    9
                                </a>
                                <a className="bg-white dark:bg-gray-800 border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-gray-700 relative inline-flex items-center px-4 py-2 border text-sm font-medium" href="#">
                                    10
                                </a>
                                <a className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-gray-700" href="#">
                                    <span className="sr-only">Next</span>
                                    <span className="material-icons-outlined text-base">chevron_right</span>
                                </a>
                            </nav>
                        </div>
                    </div>
                    <div className="flex items-center justify-between sm:hidden w-full">
                        <a className="relative inline-flex items-center px-4 py-2 border border-border-light dark:border-border-dark text-sm font-medium rounded-md text-text-secondary-light dark:text-text-secondary-dark bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700" href="#">
                            Trước
                        </a>
                        <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Trang 1/10</div>
                        <a className="ml-3 relative inline-flex items-center px-4 py-2 border border-border-light dark:border-border-dark text-sm font-medium rounded-md text-text-secondary-light dark:text-text-secondary-dark bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700" href="#">
                            Sau
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerEmploy;
