import { useEffect, useState } from "react";
// Nếu dùng TypeScript, đảm bảo đã khai báo module "event-source-polyfill" trong file d.ts
import { EventSourcePolyfill } from "event-source-polyfill";
import { scheduleApi } from "../api/schedule.api";
import { tokenService } from "../utils/token";

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

    // Hàm load danh sách yêu cầu phê duyệt theo tháng/năm hiện tại
    const loadApprovalData = async () => {
        if (!hasPermission) return;
        setLoading(true);
        try {
            const month = currentMonth + 1;
            const year = currentYear;
            const res = await scheduleApi.getHistory(month, year);
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
    };

    // Load lần đầu + khi đổi tháng/năm
    useEffect(() => {
        if (!hasPermission) return;
        loadApprovalData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentMonth, currentYear, hasPermission]);

    // Realtime SSE nhận thông báo phê duyệt mới
    useEffect(() => {
        if (!hasPermission) return;

        const token = tokenService.getAccessToken();
        if (!token) {
            console.warn("⚠️ No access token found, skipping SSE connection in ScheduleApproval");
            return;
        }

        const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "";
        const streamUrl = `${baseUrl}/realtime/history-schudule/stream`;

        let es: EventSourcePolyfill | null = null;
        let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 5;
        const reconnectDelay = 3000; // 3 seconds

        const connectSSE = () => {
            // Kiểm tra token lại trước khi kết nối
            const currentToken = tokenService.getAccessToken();
            if (!currentToken) {
                console.warn("⚠️ Token expired, stopping SSE reconnection attempts in ScheduleApproval");
                return;
            }

            try {
                es = new EventSourcePolyfill(streamUrl, {
                    headers: {
                        Authorization: `Bearer ${currentToken}`,
                    },
                });

                es.addEventListener("connected", (event: MessageEvent) => {
                    console.log("✅ Connected to history schedule stream:", event.data);
                    reconnectAttempts = 0; // Reset counter on successful connection
                });

                es.addEventListener("newHistorySchudule", (event: MessageEvent) => {
                    try {
                        const item = JSON.parse(event.data); // 1 HistorySchuduleResponse
                        if (!item) return;

                        // Xác định ngày của bản ghi mới (ưu tiên dateRequest, fallback createdAt)
                        const rawDate = item?.dateRequest || item?.createdAt;
                        if (!rawDate) return;

                        const d = new Date(rawDate);
                        if (isNaN(d.getTime())) return;

                        const month = d.getMonth();
                        const year = d.getFullYear();

                        // Chỉ cập nhật khi đúng tháng/năm đang xem
                        if (month !== currentMonth || year !== currentYear) return;

                        setApprovalData((prev) => {
                            if (!Array.isArray(prev) || prev.length === 0) {
                                return [item];
                            }

                            const existsIndex = prev.findIndex((x: any) => x?.id === item?.id);

                            // Nếu đã tồn tại id -> cập nhật phần tử đó
                            if (existsIndex !== -1) {
                                const clone = [...prev];
                                clone[existsIndex] = item;
                                return clone;
                            }

                            // Nếu chưa có -> thêm mới lên đầu danh sách
                            return [item, ...prev];
                        });
                    } catch (err) {
                        console.error("❌ Error handling newHistorySchudule event", err);
                    }
                });

                // Event khi một history bị xoá khỏi danh sách chờ duyệt
                es.addEventListener("deleteHistorySchudule", (event: MessageEvent) => {
                    try {
                        // Backend gửi Integer, có thể là "123" hoặc JSON "123"
                        const raw = event.data;
                        const parsed = (() => {
                            try {
                                return JSON.parse(raw);
                            } catch {
                                return Number(raw);
                            }
                        })();

                        const deletedId = Number(parsed);
                        if (!deletedId || Number.isNaN(deletedId)) return;

                        setApprovalData((prev) =>
                            Array.isArray(prev) ? prev.filter((item: any) => item?.id !== deletedId) : prev
                        );
                    } catch (err) {
                        console.error("❌ Error handling deleteHistorySchudule event", err);
                    }
                });

                es.onerror = (err: any) => {
                    const errorStatus = err?.status || err?.target?.status;

                    if (errorStatus === 401) {
                        console.warn("⚠️ SSE 401 Unauthorized in ScheduleApproval - Token may be expired");
                        // Không reconnect nếu là lỗi 401, có thể token đã hết hạn
                        if (es) {
                            es.close();
                            es = null;
                        }
                    } else {
                        // Các lỗi khác (network, timeout) thì thử reconnect
                        if (reconnectAttempts < maxReconnectAttempts) {
                            reconnectAttempts++;
                            console.warn(`⚠️ SSE error in ScheduleApproval (attempt ${reconnectAttempts}/${maxReconnectAttempts}, will retry in ${reconnectDelay}ms):`, err);

                            if (es) {
                                es.close();
                                es = null;
                            }

                            reconnectTimeout = setTimeout(() => {
                                connectSSE();
                            }, reconnectDelay);
                        } else {
                            console.error("❌ Max reconnect attempts reached for ScheduleApproval SSE");
                            if (es) {
                                es.close();
                                es = null;
                            }
                        }
                    }
                };
            } catch (error) {
                console.error("❌ Error creating SSE connection in ScheduleApproval:", error);
            }
        };

        // Kết nối lần đầu
        connectSSE();

        return () => {
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
            if (es) {
                es.close();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasPermission, currentMonth, currentYear]);

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
            const res = await scheduleApi.getHistory(month, year);
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
            const res = await scheduleApi.getHistory(month, year);
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
                <div className="flex items-center gap-4">
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

