import { useEffect, useState, useRef, useCallback } from "react";
import { scheduleApi } from "../api/schedule.api";
import { employeeApi } from "../api/employee.api";

const ScheduleApproval = () => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(
        () => new Date(today.getFullYear(), today.getMonth(), 1)
    );
    const [approvalData, setApprovalData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [approvingId, setApprovingId] = useState<number | null>(null);
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectModal, setRejectModal] = useState<{
        show: boolean;
        historyId: number | null;
        reasonRefusal: string;
    }>({ show: false, historyId: null, reasonRefusal: "" });
    const [errorModal, setErrorModal] = useState<{
        show: boolean;
        message: string;
    }>({ show: false, message: "" });

    const currentMonth = currentDate.getMonth(); // 0-11
    const currentYear = currentDate.getFullYear();
    const inactivityTimeoutRef = useRef<number | null>(null);

    // Kiểm tra quyền ADMIN hoặc MANAGER
    const checkPermission = () => {
        const userStr = localStorage.getItem("user");
        if (!userStr) return false;
        try {
            const user = JSON.parse(userStr);
            const role = user?.role?.name || user?.role || "";
            return role === "ADMIN" || role === "MANAGER";
        } catch {
            return false;
        }
    };

    const hasPermission = checkPermission();

    // Lấy role để biết có phải ADMIN không (ADMIN sẽ chọn supplierId để lọc)
    const getUserRole = () => {
        const userStr = localStorage.getItem("user");
        if (!userStr) return null;
        try {
            const user = JSON.parse(userStr);
            return user?.role?.name || user?.role || null;
        } catch {
            return null;
        }
    };

    const userRole = getUserRole();
    const isAdmin = userRole === "ADMIN";

    // Danh sách supplier (chỉ dùng cho ADMIN)
    const [suppliers, setSuppliers] = useState<Array<{ id: number; name: string; status: boolean }>>([]);
    const [selectedSupplierId, setSelectedSupplierId] = useState<number | undefined>(undefined);

    // Hàm load danh sách yêu cầu phê duyệt theo tháng/năm hiện tại
    const loadApprovalData = useCallback(async () => {
        if (!hasPermission) return;
        setLoading(true);
        try {
            const month = currentMonth + 1;
            const year = currentYear;
            // Với ADMIN: truyền supplierId nếu có, với MANAGER: không truyền supplierId (backend lấy từ token)
            const supplierIdForApi = isAdmin ? selectedSupplierId : undefined;
            const res = await scheduleApi.getHistory(month, year, supplierIdForApi);
            const payload = Array.isArray(res.data) ? res.data : res.data?.data;
            // API tự động lọc chỉ "Chờ duyệt" cho ADMIN/MANAGER
            setApprovalData(payload ?? []);
        } catch (error: any) {
            console.error("Failed to load approval data", error);
            setErrorModal({
                show: true,
                message: error.response?.data?.message || "Không thể tải danh sách yêu cầu phê duyệt",
            });
        } finally {
            setLoading(false);
        }
    }, [hasPermission, currentMonth, currentYear, isAdmin, selectedSupplierId]);

    // Load danh sách suppliers khi là ADMIN
    useEffect(() => {
        if (!hasPermission || !isAdmin) return;
        const fetchSuppliers = async () => {
            try {
                const res = await employeeApi.getSuppliersPositions();
                const suppliersData = res.data?.suppliers || [];
                // Chỉ lấy suppliers đang active
                setSuppliers(suppliersData.filter((s: any) => s.status === true));
            } catch (error) {
                console.error("Failed to load suppliers for ScheduleApproval", error);
            }
        };
        fetchSuppliers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasPermission, isAdmin]);

    // Set default supplier cho ADMIN khi đã load suppliers
    useEffect(() => {
        if (isAdmin && suppliers.length > 0 && selectedSupplierId === undefined) {
            setSelectedSupplierId(suppliers[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [suppliers, isAdmin]);

    // Khi thay đổi tháng/năm hoặc supplierId (ADMIN) thì reload danh sách phê duyệt
    useEffect(() => {
        if (!hasPermission) return;
        loadApprovalData();
    }, [currentMonth, currentYear, selectedSupplierId, hasPermission, loadApprovalData]);

    // Auto reload danh sách phê duyệt sau 5 phút không có tương tác
    useEffect(() => {
        const INACTIVITY_MS = 5 * 60 * 1000;

        const resetInactivityTimer = () => {
            if (inactivityTimeoutRef.current !== null) {
                window.clearTimeout(inactivityTimeoutRef.current);
            }
            inactivityTimeoutRef.current = window.setTimeout(() => {
                loadApprovalData();
            }, INACTIVITY_MS);
        };

        const handleActivity = () => {
            resetInactivityTimer();
        };

        window.addEventListener("click", handleActivity);
        window.addEventListener("keydown", handleActivity);
        window.addEventListener("mousemove", handleActivity);
        window.addEventListener("scroll", handleActivity);

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
    }, [loadApprovalData]);

    // Đã bỏ realtime SSE vì backend không còn hỗ trợ

    const handlePrevMonth = () => {
        setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleChangeMonth = (event: any) => {
        const newMonth = Number(event.target.value);
        setCurrentDate((prev) => new Date(prev.getFullYear(), newMonth, 1));
    };

    const handleChangeYear = (event: any) => {
        const newYear = Number(event.target.value);
        setCurrentDate((prev) => new Date(newYear, prev.getMonth(), 1));
    };

    const handleApprove = async (historyId: number) => {
        if (approvingId !== null || rejectingId !== null) return;

        const ok = window.confirm("Bạn có chắc muốn phê duyệt yêu cầu này?");
        if (!ok) return;

        try {
            setApprovingId(historyId);
            await scheduleApi.approveHistory(historyId, true);

            // Reload danh sách sau khi phê duyệt thành công
            const month = currentMonth + 1;
            const year = currentYear;
            const supplierIdForApi = isAdmin ? selectedSupplierId : undefined;
            const res = await scheduleApi.getHistory(month, year, supplierIdForApi);
            const payload = Array.isArray(res.data) ? res.data : res.data?.data;
            setApprovalData(payload ?? []);
        } catch (error: any) {
            console.error("Failed to approve request", error);
            setErrorModal({
                show: true,
                message: error.response?.data?.message || "Không thể phê duyệt yêu cầu này",
            });
        } finally {
            setApprovingId(null);
        }
    };

    const handleRejectClick = (historyId: number) => {
        if (approvingId !== null || rejectingId !== null) return;
        setRejectModal({ show: true, historyId, reasonRefusal: "" });
    };

    const handleRejectCancel = () => {
        setRejectModal({ show: false, historyId: null, reasonRefusal: "" });
    };

    const handleRejectConfirm = async () => {
        if (!rejectModal.historyId) return;

        const reasonRefusal = rejectModal.reasonRefusal.trim();
        if (!reasonRefusal) {
            setErrorModal({
                show: true,
                message: "Vui lòng nhập lý do từ chối",
            });
            return;
        }

        try {
            setRejectingId(rejectModal.historyId);
            await scheduleApi.approveHistory(rejectModal.historyId, false, reasonRefusal);

            // Reload danh sách sau khi từ chối thành công
            const month = currentMonth + 1;
            const year = currentYear;
            const supplierIdForApi = isAdmin ? selectedSupplierId : undefined;
            const res = await scheduleApi.getHistory(month, year, supplierIdForApi);
            const payload = Array.isArray(res.data) ? res.data : res.data?.data;
            setApprovalData(payload ?? []);

            // Đóng modal
            setRejectModal({ show: false, historyId: null, reasonRefusal: "" });
        } catch (error: any) {
            console.error("Failed to reject request", error);
            setErrorModal({
                show: true,
                message: error.response?.data?.message || "Không thể từ chối yêu cầu này",
            });
        } finally {
            setRejectingId(null);
        }
    };

    const monthLabel = `Tháng ${currentMonth + 1}`;

    if (!hasPermission) {
        return (
            <div className="p-6 lg:p-10 px-8 mx-auto w-full flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-6xl mb-4">
                        block
                    </span>
                    <h2 className="text-2xl font-bold text-[#111318] dark:text-white mb-2">
                        Không có quyền truy cập
                    </h2>
                    <p className="text-[#616f89] dark:text-[#9ca3af]">
                        Chỉ ADMIN và MANAGER mới có quyền xem và phê duyệt yêu cầu schedule.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 px-8 mx-auto w-full flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#111318] dark:text-white">
                        Phê duyệt Schedule
                    </h1>
                    <p className="text-[#616f89] dark:text-[#9ca3af] text-base">
                        Xem và phê duyệt các yêu cầu đăng ký, bổ sung hoặc xóa ca làm việc.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {/* Chọn Supplier (chỉ hiển thị cho ADMIN) */}
                    {isAdmin && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-[#616f89] dark:text-[#9ca3af]">Supplier:</span>
                            <select
                                value={selectedSupplierId || (suppliers.length > 0 ? suppliers[0].id : "")}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    setSelectedSupplierId(Number.isNaN(value) ? undefined : value);
                                }}
                                className="px-3 py-2 border border-[#dbdfe6] dark:border-[#4b5563] rounded-lg bg-white dark:bg-[#111827] text-[#111318] dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[180px]"
                            >
                                {suppliers.map((supplier) => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-lg border border-[#dbdfe6] dark:border-[#4b5563] overflow-hidden">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                className="p-1.5 hover:bg-background-light dark:hover:bg-[#374151] text-[#616f89] dark:text-[#9ca3af]"
                            >
                                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                className="p-1.5 hover:bg-background-light dark:hover:bg-[#374151] text-[#616f89] dark:text-[#9ca3af] border-l border-[#dbdfe6] dark:border-[#4b5563]"
                            >
                                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                            </button>
                        </div>
                        <select
                            value={currentMonth}
                            onChange={handleChangeMonth}
                            className="px-3 py-2 border border-[#dbdfe6] dark:border-[#4b5563] rounded-lg bg-white dark:bg-[#111827] text-[#111318] dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            {Array.from({ length: 12 }).map((_, index) => (
                                <option key={index} value={index}>
                                    Tháng {index + 1}
                                </option>
                            ))}
                        </select>
                        <select
                            value={currentYear}
                            onChange={handleChangeYear}
                            className="px-3 py-2 border border-[#dbdfe6] dark:border-[#4b5563] rounded-lg bg-white dark:bg-[#111827] text-[#111318] dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            {Array.from({ length: 7 }).map((_, index) => {
                                const year = today.getFullYear() - 3 + index;
                                return (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a2230] rounded-xl border border-[#dbdfe6] dark:border-[#2e374a] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[#dbdfe6] dark:border-[#2e374a]">
                    <h3 className="text-lg font-bold text-[#111318] dark:text-white">
                        Danh sách yêu cầu chờ duyệt - {monthLabel}, {currentYear}
                    </h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-4xl animate-spin">
                            sync
                        </span>
                        <p className="text-[#616f89] dark:text-[#9ca3af] mt-4">Đang tải dữ liệu...</p>
                    </div>
                ) : approvalData.length === 0 ? (
                    <div className="p-8 text-center">
                        <span className="material-symbols-outlined text-gray-400 text-6xl mb-4">
                            check_circle
                        </span>
                        <p className="text-[#616f89] dark:text-[#9ca3af] text-lg">
                            Không có yêu cầu nào chờ duyệt trong tháng này.
                        </p>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#f0f2f4] dark:bg-[#252d3d] text-[#616f89] dark:text-[#9ca3af]">
                                <tr>
                                    <th className="px-6 py-4 font-semibold whitespace-nowrap text-center">STT</th>
                                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Ngày gửi</th>
                                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Nhân viên</th>
                                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Loại yêu cầu</th>
                                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Chi tiết</th>
                                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Ngày yêu cầu</th>
                                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Chi tiết ca yêu cầu</th>
                                    <th className="px-6 py-4 font-semibold whitespace-nowrap">Trạng thái</th>
                                    <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#dbdfe6] dark:divide-[#2e374a]">
                                {approvalData.map((item: any, index: number) => {
                                    const createdAt = item?.createdAt ? new Date(item.createdAt) : null;
                                    const formattedDate = createdAt
                                        ? `${String(createdAt.getDate()).padStart(2, "0")}/${String(createdAt.getMonth() + 1).padStart(2, "0")}/${createdAt.getFullYear()}`
                                        : "N/A";

                                    const requestType = item?.typeHistorySchudule?.name || "N/A";
                                    const detail = item?.detai || item?.detail || "N/A";
                                    const employeeId = item?.employee?.name || "N/A";

                                    // Format dateRequest sang định dạng ngày/tháng/năm
                                    let formattedDateRequest = "N/A";
                                    if (item?.dateRequest) {
                                        const dateRequestDate = new Date(item.dateRequest);
                                        if (!isNaN(dateRequestDate.getTime())) {
                                            formattedDateRequest = `${String(dateRequestDate.getDate()).padStart(2, "0")}/${String(dateRequestDate.getMonth() + 1).padStart(2, "0")}/${dateRequestDate.getFullYear()}`;
                                        }
                                    }

                                    const detailShiftType = item?.detailShiftType?.name
                                        ? `${item.detailShiftType.name}: ${item.detailShiftType?.startAt || ""}-${item.detailShiftType?.endAt || ""}`
                                        : "N/A";
                                    const status = item?.typeHistorySchuduleStatus?.name || "N/A";

                                    return (
                                        <tr key={item?.id} className="hover:bg-background-light dark:hover:bg-[#252d3d] transition-colors">
                                            <td className="px-6 py-4 text-center text-[#111318] dark:text-white font-medium">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-[#111318] dark:text-white">{formattedDate}</td>
                                            <td className="px-6 py-4 text-[#111318] dark:text-white">
                                                <span className="font-medium"> {employeeId}</span>
                                            </td>
                                            <td className="px-6 py-4 text-[#111318] dark:text-white">{requestType}</td>
                                            <td className="px-6 py-4 text-[#616f89] dark:text-[#9ca3af]">{detail}</td>
                                            <td className="px-6 py-4 text-[#616f89] dark:text-[#9ca3af]">{formattedDateRequest}</td>
                                            <td className="px-6 py-4 text-[#616f89] dark:text-[#9ca3af]">{detailShiftType}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200">
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                                        onClick={() => handleApprove(item.id)}
                                                        disabled={approvingId === item.id || rejectingId === item.id}
                                                    >
                                                        {approvingId === item.id ? "Đang duyệt..." : "Phê duyệt"}
                                                    </button>
                                                    <button
                                                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                                        onClick={() => handleRejectClick(item.id)}
                                                        disabled={approvingId === item.id || rejectingId === item.id}
                                                    >
                                                        {rejectingId === item.id ? "Đang từ chối..." : "Từ chối"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {rejectModal.show && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
                    <div className="bg-white dark:bg-[#111827] rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">cancel</span>
                            <h4 className="text-lg font-semibold text-[#111318] dark:text-white">Từ chối yêu cầu</h4>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-[#111318] dark:text-white">
                                Lý do từ chối <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={rejectModal.reasonRefusal}
                                onChange={(e) =>
                                    setRejectModal((prev) => ({
                                        ...prev,
                                        reasonRefusal: e.target.value,
                                    }))
                                }
                                placeholder="Nhập lý do từ chối..."
                                rows={4}
                                className="w-full px-3 py-2 border border-[#dbdfe6] dark:border-[#4b5563] rounded-lg bg-white dark:bg-[#111827] text-[#111318] dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 rounded border border-[#dbdfe6] dark:border-[#4b5563] bg-white dark:bg-[#111827] text-[#111318] dark:text-white hover:bg-gray-50 dark:hover:bg-[#1f2937] text-sm transition-colors"
                                onClick={handleRejectCancel}
                                disabled={rejectingId !== null}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                onClick={handleRejectConfirm}
                                disabled={rejectingId !== null || !rejectModal.reasonRefusal.trim()}
                            >
                                {rejectingId !== null ? "Đang từ chối..." : "Xác nhận từ chối"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {errorModal.show && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
                    <div className="bg-white dark:bg-[#111827] rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">error</span>
                            <h4 className="text-lg font-semibold text-[#111318] dark:text-white">Lỗi</h4>
                        </div>
                        <div className="border border-red-200 dark:border-red-800 rounded p-4 text-sm text-[#111318] dark:text-white bg-red-50 dark:bg-red-900/20">
                            <p className="text-red-700 dark:text-red-300 whitespace-pre-wrap break-words">
                                {errorModal.message}
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                                onClick={() => setErrorModal({ show: false, message: "" })}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleApproval;

