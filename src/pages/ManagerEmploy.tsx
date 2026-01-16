import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { employeeApi, type EmployeeResponse, type PageResponse, type Company } from "../api/employee.api";
import { authApi } from "../api/auth.api";
import { message } from "antd";
import { exportEmployeesToExcel } from "../utils/exportEmploys";

interface Supplier {
    id: number;
    name: string;
    status: boolean;
    createdAt: string;
    companyId?: number;
}

const ManagerEmploy = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [size] = useState(10); // Cố định size = 10
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [employeeName, setEmployeeName] = useState<string>(""); // Tên nhân viên để tìm kiếm (đã debounce)
    const [selectedSupplierId, setSelectedSupplierId] = useState<number | undefined>(undefined); // Supplier ID được chọn
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | undefined>(undefined);
    const [pagination, setPagination] = useState<{
        totalElements: number;
        totalPages: number;
        first: boolean;
        last: boolean;
    }>({
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true,
    });
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const lastQueryKeyRef = useRef<string>("");
    const abortRef = useRef<AbortController | null>(null);
    const inactivityTimeoutRef = useRef<number | null>(null);

    // Format ngày tháng
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (error) {
            return "N/A";
        }
    };

    // Format số điện thoại Việt Nam
    const formatPhoneNumber = (phone: string | null | undefined): string => {
        if (!phone) return "N/A";

        // Loại bỏ tất cả ký tự không phải số
        const cleaned = phone.replace(/\D/g, "");

        // Kiểm tra độ dài số điện thoại Việt Nam (10 hoặc 11 số)
        if (cleaned.length === 10) {
            // Định dạng: 0xxx xxx xxx
            return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
        } else if (cleaned.length === 11) {
            // Định dạng: 0xxx xxxx xxx
            return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
        } else if (cleaned.length === 9) {
            // Định dạng: xxx xxx xxx (thiếu số 0 đầu)
            return `0${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
        }

        // Nếu không đúng định dạng, trả về số gốc
        return phone;
    };

    // Tính thời gian offline (số ngày/giờ/phút từ lastOfflineAt đến hiện tại)
    const calculateOfflineTime = (lastOfflineAt: string | undefined | null): string => {
        if (!lastOfflineAt) return "";

        try {
            const lastOffline = new Date(lastOfflineAt);
            const now = new Date();

            // Kiểm tra ngày hợp lệ
            if (isNaN(lastOffline.getTime())) {
                return "";
            }

            // Tính chênh lệch thời gian (milliseconds)
            const diffMs = now.getTime() - lastOffline.getTime();

            // Chuyển đổi sang các đơn vị
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            // Format kết quả
            if (diffDays > 0) {
                const remainingHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                if (remainingHours > 0) {
                    return ` - ${diffDays} ngày ${remainingHours} giờ`;
                }
                return ` - ${diffDays} ngày`;
            } else if (diffHours > 0) {
                const remainingMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                if (remainingMinutes > 0) {
                    return ` - ${diffHours} giờ ${remainingMinutes} phút`;
                }
                return ` - ${diffHours} giờ`;
            } else if (diffMinutes > 0) {
                return ` - ${diffMinutes} phút`;
            } else {
                return " - Vừa mới";
            }
        } catch (error) {
            return "";
        }
    };

    // Lấy chữ cái đầu của tên để hiển thị avatar
    const getInitials = (name: string) => {
        if (!name) return "??";
        const words = name.trim().split(" ");
        if (words.length >= 2) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Load danh sách công ty và suppliers theo công ty
    const loadCompaniesAndSuppliers = async () => {
        try {
            const res = await employeeApi.getTypeWorksAndCompanies();
            const companiesData = res.data?.companies || [];
            setCompanies(companiesData);

            // Ghép suppliers kèm companyId để tiện lọc
            const suppliersData: Supplier[] = companiesData.flatMap((c: Company) =>
                (c.suppliers || []).map((s) => ({
                    ...s,
                    companyId: c.id,
                }))
            );

            setSuppliers(suppliersData.filter((s: Supplier) => s.status === true));
        } catch (error) {
            console.error("Failed to load companies/suppliers", error);
        }
    };

    // Gọi API lấy danh sách nhân viên
    const fetchEmployees = async (currentPage: number, pageSize: number, searchName?: string, supplierId?: number, companyId?: number) => {
        try {
            const queryKey = JSON.stringify({ currentPage, pageSize, searchName, supplierId, companyId });
            if (queryKey === lastQueryKeyRef.current) {
                return; // Bỏ qua nếu tham số không đổi để tránh call thừa
            }
            lastQueryKeyRef.current = queryKey;

            // Huỷ call trước đó nếu còn pending
            if (abortRef.current) {
                abortRef.current.abort();
            }
            const controller = new AbortController();
            abortRef.current = controller;

            setLoading(true);
            console.log("🚀 [API CALL] Gọi API getList:", {
                endpoint: `GET /employee/list`,
                params: { page: currentPage, size: pageSize, employeeName: searchName, supplierId, companyId },
                timestamp: new Date().toISOString(),
            });

            const response = await employeeApi.getList(currentPage, pageSize, searchName, supplierId, companyId, controller.signal);

            console.log("✅ [API SUCCESS] API getList thành công:", {
                response: response.data,
                timestamp: new Date().toISOString(),
            });

            // Xử lý response data
            // response.data có thể là PageResponse<EmployeeResponse> hoặc được bọc trong ApiResponse
            const responseData: any = response.data;
            let pageData: PageResponse<EmployeeResponse> | null = null;

            // Kiểm tra xem response.data có phải là PageResponse không
            if (responseData && typeof responseData === 'object') {
                if ('content' in responseData) {
                    // response.data là PageResponse trực tiếp
                    pageData = responseData as PageResponse<EmployeeResponse>;
                } else if ('data' in responseData) {
                    const nestedData = responseData.data;
                    if (nestedData && typeof nestedData === 'object' && 'content' in nestedData) {
                        // response.data được bọc trong ApiResponse, cần lấy response.data.data
                        pageData = nestedData as PageResponse<EmployeeResponse>;
                    }
                }
            }

            if (pageData) {
                setEmployees(pageData.content ?? []);
                setPagination({
                    totalElements: pageData.totalElements ?? 0,
                    totalPages: pageData.totalPages ?? 0,
                    first: pageData.first ?? true,
                    last: pageData.last ?? true,
                });
            } else if (Array.isArray(responseData)) {
                setEmployees(responseData);
            } else {
                setEmployees([]);
            }
        } catch (error: any) {
            if (error?.name === "CanceledError" || error?.name === "AbortError") {
                console.warn("⚠️ Request bị huỷ (stale):", error?.message);
                return;
            }
            console.error("❌ [API ERROR] Lỗi khi gọi API getList:", {
                endpoint: `GET /employee/list`,
                error: error.response?.data || error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                timestamp: new Date().toISOString(),
            });
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    // Load companies + suppliers khi component mount
    useEffect(() => {
        loadCompaniesAndSuppliers();
    }, []);

    // Reset page về 0 khi supplierId thay đổi
    useEffect(() => {
        setPage(0);
    }, [selectedSupplierId]);

    // Reset supplier + page khi company thay đổi
    useEffect(() => {
        setSelectedSupplierId((prev) => (prev ? undefined : prev));
        setPage(0);
    }, [selectedCompanyId]);

    // Gọi API khi component mount hoặc page/size/employeeName/selectedSupplierId thay đổi
    useEffect(() => {
        fetchEmployees(page, size, employeeName || undefined, selectedSupplierId, selectedCompanyId);
    }, [page, size, employeeName]);

    // Hàm reload list dựa trên tham số hiện tại (phục vụ auto refresh khi inactivity)
    const reloadEmployees = useCallback(() => {
        fetchEmployees(page, size, employeeName || undefined, selectedSupplierId, selectedCompanyId);
    }, [page, size, employeeName, selectedSupplierId, selectedCompanyId]);

    // Auto reload sau 5 phút không có tương tác
    useEffect(() => {
        const INACTIVITY_MS = 5 * 60 * 1000;

        const resetInactivityTimer = () => {
            if (inactivityTimeoutRef.current !== null) {
                window.clearTimeout(inactivityTimeoutRef.current);
            }
            inactivityTimeoutRef.current = window.setTimeout(() => {
                reloadEmployees();
            }, INACTIVITY_MS);
        };

        const handleActivity = () => {
            resetInactivityTimer();
        };

        window.addEventListener("click", handleActivity);
        window.addEventListener("keydown", handleActivity);
        window.addEventListener("mousemove", handleActivity);
        window.addEventListener("scroll", handleActivity);

        // Khởi tạo timer ban đầu
        resetInactivityTimer();

        return () => {
            if (inactivityTimeoutRef.current !== null) {
                window.clearTimeout(inactivityTimeoutRef.current);
            }
            window.removeEventListener("click", handleActivity);
            window.removeEventListener("keydown", handleActivity);
            window.removeEventListener("mousemove", handleActivity);
            window.removeEventListener("scroll", handleActivity);
        };
    }, [reloadEmployees]);
    const displayedSuppliers = useMemo(() => {
        return selectedCompanyId
            ? suppliers.filter((s) => s.companyId === selectedCompanyId)
            : suppliers;
    }, [selectedCompanyId, suppliers]);

    const [forceLogoutUserId, setForceLogoutUserId] = useState<string | null>(null);

    const handleSearchCompanyOrSuplior = () => {
        const value = searchInputRef.current?.value || "";
        setEmployeeName(value);
        fetchEmployees(page, size, employeeName || undefined, selectedSupplierId, selectedCompanyId);
    };

    // Gọi API force-logout cho 1 nhân viên
    const handleForceLogoutEmployee = async (employee: EmployeeResponse) => {
        if (!employee?.userId) {
            message.warning("Không tìm thấy userId của nhân viên, không thể đăng xuất.");
            return;
        }

        const ok = window.confirm(`Bạn có chắc muốn đăng xuất tất cả thiết bị của nhân viên "${employee.name}"?`);
        if (!ok) return;

        try {
            setForceLogoutUserId(employee.userId);
            await authApi.forceLogout(employee.userId);

            // Cập nhật trạng thái employee về Offline ngay trên UI
            const now = new Date().toISOString();
            setEmployees((prev) =>
                prev.map((e) =>
                    e.employeeId === employee.employeeId
                        ? {
                            ...e,
                            online: false,
                            lastOfflineAt: now,
                        }
                        : e
                )
            );

            message.success(`Đã đăng xuất thành công nhân viên "${employee.name}".`);
        } catch (error: any) {
            const status = error?.response?.status;
            const backendMessage = error?.response?.data?.message;

            if (status === 403) {
                message.error(backendMessage || "Bạn không có quyền đăng xuất nhân viên này (khác supplier).");
            } else {
                message.error(backendMessage || "Đăng xuất nhân viên thất bại. Vui lòng thử lại.");
            }

            console.error("❌ [API ERROR] force-logout employee:", {
                userId: employee.userId,
                status,
                error: error?.response?.data || error?.message,
            });
        } finally {
            setForceLogoutUserId(null);
        }
    };

    // Xử lý chuyển trang
    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            setPage(newPage);
        }
    };

    // Render phân trang
    const renderPagination = () => {
        const { totalPages, first, last } = pagination;
        const pages: (number | string)[] = [];

        if (totalPages <= 7) {
            // Hiển thị tất cả các trang nếu <= 7 trang
            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Logic hiển thị trang với ellipsis
            if (page < 3) {
                for (let i = 0; i < 5; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages - 1);
            } else if (page > totalPages - 4) {
                pages.push(0);
                pages.push("...");
                for (let i = totalPages - 5; i < totalPages; i++) pages.push(i);
            } else {
                pages.push(0);
                pages.push("...");
                for (let i = page - 1; i <= page + 1; i++) pages.push(i);
                pages.push("...");
                pages.push(totalPages - 1);
            }
        }

        const startItem = page * size + 1;
        const endItem = Math.min((page + 1) * size, pagination.totalElements);

        return (
            <div className="px-6 py-4 border-t border-border-light dark:border-border-dark flex items-center justify-between bg-white dark:bg-card-dark">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            Hiển thị <span className="font-medium text-text-main-light dark:text-text-main-dark">{startItem}</span> đến{" "}
                            <span className="font-medium text-text-main-light dark:text-text-main-dark">{endItem}</span> trong số{" "}
                            <span className="font-medium text-text-main-light dark:text-text-main-dark">{pagination.totalElements}</span> kết quả
                        </p>
                    </div>
                    <div>
                        <nav aria-label="Pagination" className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={first}
                                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-border-light dark:border-border-dark text-sm font-medium ${first
                                    ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                    : "bg-white dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-gray-700"
                                    }`}
                            >
                                <span className="sr-only">Previous</span>
                                <span className="material-icons-outlined text-base">chevron_left</span>
                            </button>
                            {pages.map((p, idx) => {
                                if (p === "...") {
                                    return (
                                        <span
                                            key={`ellipsis-${idx}`}
                                            className="relative inline-flex items-center px-4 py-2 border border-border-light dark:border-border-dark bg-white dark:bg-gray-800 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark"
                                        >
                                            ...
                                        </span>
                                    );
                                }
                                const pageNum = p as number;
                                const isActive = pageNum === page;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${isActive
                                            ? "z-10 bg-blue-50 dark:bg-blue-900 border-[white] text-[black]"
                                            : "bg-white dark:bg-gray-800 border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        {pageNum + 1}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={last}
                                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-border-light dark:border-border-dark text-sm font-medium ${last
                                    ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                    : "bg-white dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-50 dark:hover:bg-gray-700"
                                    }`}
                            >
                                <span className="sr-only">Next</span>
                                <span className="material-icons-outlined text-base">chevron_right</span>
                            </button>
                        </nav>
                    </div>
                </div>
                <div className="flex items-center justify-between sm:hidden w-full">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={first}
                        className={`relative inline-flex items-center px-4 py-2 border border-border-light dark:border-border-dark text-sm font-medium rounded-md ${first
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                            : "text-text-secondary-light dark:text-text-secondary-dark bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                    >
                        Trước
                    </button>
                    <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        Trang {page + 1}/{pagination.totalPages || 1}
                    </div>
                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={last}
                        className={`ml-3 relative inline-flex items-center px-4 py-2 border border-border-light dark:border-border-dark text-sm font-medium rounded-md ${last
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                            : "text-text-secondary-light dark:text-text-secondary-dark bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                    >
                        Sau
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <nav className="flex text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-4">
                <a className="hover:text-[white] transition-colors" href="#">
                    Trang chủ
                </a>
                <span className="mx-2">/</span>
                <span className="text-text-main-light dark:text-text-main-dark">Danh sách nhân viên</span>
            </nav>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-main-light dark:text-text-main-dark tracking-tight">
                        Danh sách nhân viên
                    </h1>
                    <p className="mt-1 text-text-secondary-light dark:text-text-secondary-dark">
                        Quản lý và theo dõi toàn bộ nhân sự trong công ty.
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex gap-3">
                    <button onClick={() => exportEmployeesToExcel(employees)} className="inline-flex items-center px-4 py-2 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[white] shadow-soft transition-colors text-text-main-light dark:text-text-main-dark">
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
                        <input
                            className="block w-full pl-10 pr-3 py-2 border border-border-light dark:border-border-dark rounded-lg leading-5 bg-gray-50 dark:bg-gray-800 placeholder-text-secondary-light dark:placeholder-text-secondary-dark focus:outline-none focus:ring-1 focus:ring-[white] focus:border-[white] sm:text-sm text-text-main-light dark:text-text-main-dark transition-colors"
                            placeholder="Tìm kiếm theo tên nhân viên..."
                            type="text"
                            ref={searchInputRef}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    const value = searchInputRef.current?.value || "";
                                    setEmployeeName(value);
                                    setPage(0);
                                }
                            }}
                        />
                        {/* <button
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-secondary-light dark:text-text-secondary-dark hover:text-[white]"
                            onClick={() => {
                                const value = searchInputRef.current?.value || "";
                                setEmployeeName(value);
                                setPage(0);
                            }}
                            type="button"
                        >
                            <span className="material-icons-outlined text-base">search</span>
                        </button> */}
                    </div>
                    <div className="md:col-span-1">
                        <select
                            className="block w-full pl-3 pr-10 py-2 text-base border border-border-light dark:border-border-dark focus:outline-none focus:ring-[white] focus:border-[white] sm:text-sm rounded-lg bg-gray-50 dark:bg-gray-800 text-text-main-light dark:text-text-main-dark"
                            value={selectedCompanyId || ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectedCompanyId(value ? Number(value) : undefined);
                            }}
                        >
                            <option value="">Tất cả công ty</option>
                            {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-1">
                        <select
                            className="block w-full pl-3 pr-10 py-2 text-base border border-border-light dark:border-border-dark focus:outline-none focus:ring-[white] focus:border-[white] sm:text-sm rounded-lg bg-gray-50 dark:bg-gray-800 text-text-main-light dark:text-text-main-dark"
                            value={selectedSupplierId || ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectedSupplierId(value ? Number(value) : undefined);
                            }}
                        >
                            <option value="">Tất cả supplier</option>
                            {displayedSuppliers.map((supplier) => (
                                <option key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </option>
                            ))}
                        </select>

                    </div>
                    <button
                        onClick={handleSearchCompanyOrSuplior}
                        className="
        h-[40px]
        px-4
        rounded-lg
        border border-border-light dark:border-border-dark
        bg-blue-500 dark:bg-gray-800
        text-sm font-medium
        text-text-main-light dark:text-text-main-dark
        inline-flex items-center justify-center gap-2
        shadow-sm
        hover:bg-blue-500 dark:hover:bg-gray-700
        hover:border-blue-500
        hover:text-white
        transition-all
        focus:outline-none focus:ring-2 focus:ring-primary/40
        active:scale-[0.97]
        text-white
    "
                        type="button"
                    >
                        <span className="material-icons-outlined text-base">search</span>
                        Tìm kiếm
                    </button>
                    {/* <div className="md:col-span-1 flex justify-end">
                        <button className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 border border-border-light dark:border-border-dark shadow-sm text-sm font-medium rounded-lg text-text-secondary-light dark:text-text-secondary-dark bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <span className="material-icons-outlined text-lg mr-2">filter_list</span>
                            Bộ lọc nâng cao
                        </button>
                    </div> */}
                </div>
            </div>
            <div className="bg-white dark:bg-card-dark shadow-soft rounded-xl overflow-hidden border border-border-light dark:border-border-dark">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-text-secondary-light dark:text-text-secondary-dark">Đang tải dữ liệu...</div>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th
                                            className="px-6 py-4 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider"
                                            scope="col"
                                        >
                                            Nhân viên
                                        </th>
                                        <th
                                            className="px-6 py-4 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider"
                                            scope="col"
                                        >
                                            Vị trí
                                        </th>
                                        <th
                                            className="px-6 py-4 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider"
                                            scope="col"
                                        >
                                            Giới tính
                                        </th>
                                        <th
                                            className="px-6 py-4 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider"
                                            scope="col"
                                        >
                                            Phòng ban
                                        </th>
                                        <th
                                            className="px-6 py-4 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider"
                                            scope="col"
                                        >
                                            Trạng thái
                                        </th>
                                        <th
                                            className="px-6 py-4 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider"
                                            scope="col"
                                        >
                                            Ngày tham gia
                                        </th>
                                        <th
                                            className="px-6 py-4 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider"
                                            scope="col"
                                        >
                                            SĐT
                                        </th>
                                        <th className="relative px-6 py-4" scope="col">
                                            <span className="sr-only">Hành động</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-card-dark divide-y divide-border-light dark:divide-border-dark">
                                    {employees.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-text-secondary-light dark:text-text-secondary-dark">
                                                Không có dữ liệu nhân viên
                                            </td>
                                        </tr>
                                    ) : (
                                        employees.map((employee) => (
                                            <tr
                                                key={employee.employeeId}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div
                                                                className="h-10 w-10 rounded-full overflow-hidden 
        bg-white dark:bg-gray-700 
        flex items-center justify-center 
        ring-2 ring-white dark:ring-gray-700"
                                                            >
                                                                {employee.avatarUrl ? (
                                                                    <img
                                                                        src={employee.avatarUrl}
                                                                        alt={employee.name}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                                                        {getInitials(employee.name)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-text-main-light dark:text-text-main-dark group-hover:text-black transition-colors">
                                                                {employee.name}
                                                            </div>
                                                            <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                                                {employee.workEmail || employee.phone || "N/A"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-text-main-light dark:text-text-main-dark font-medium">
                                                        {employee.position?.name}
                                                    </div>

                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-text-main-light dark:text-text-main-dark font-medium">
                                                        {employee.gender ? "Nam" : "Nữ"}
                                                    </div>

                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                                        <span className="material-icons-outlined text-sm mr-1">apartment</span>
                                                        {employee.supplier?.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${employee.online
                                                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-500 dark:border-green-700"
                                                                : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-500 dark:border-gray-700"
                                                                }`}
                                                        >
                                                            {employee.online
                                                                ? "Online"
                                                                : `Offline${calculateOfflineTime(employee.lastOfflineAt)}`
                                                            }
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                                    {formatDate(employee.joinDate)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                                    {formatPhoneNumber(employee.phone)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {employee.online && (
                                                            <button
                                                                onClick={() => handleForceLogoutEmployee(employee)}
                                                                disabled={forceLogoutUserId === employee.userId}
                                                                className={`inline-flex items-center px-3 py-1.5 rounded-md text-[11px] font-medium border transition-colors
                                                                    ${forceLogoutUserId === employee.userId
                                                                        ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-border-light dark:border-border-dark cursor-not-allowed"
                                                                        : "bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 border-red-200 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                    }`}
                                                            >
                                                                <span className="material-icons-outlined text-sm mr-1">logout</span>
                                                                {forceLogoutUserId === employee.userId ? "Đang đăng xuất..." : "Đăng xuất"}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => navigate("/EmployDetail", { state: { employee } })}
                                                            className="text-text-secondary-light dark:text-text-secondary-dark hover:text-[white] transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                                        >
                                                            <span className="material-icons-outlined">more_vert</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {renderPagination()}
                    </>
                )}
            </div>
        </div>
    );
};

export default ManagerEmploy;
