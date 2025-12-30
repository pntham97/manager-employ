import { useEffect, useRef, useState } from "react";
import { shiftTypeSupplierApi } from "../api/shiftTypeSupplier.api";
import { scheduleApi } from "../api/schedule.api";

const Calendar = () => {

    const today = new Date();
    const [currentDate, setCurrentDate] = useState(
        () => new Date(today.getFullYear(), today.getMonth(), 1)
    );
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [shiftOptionsDay, setShiftOptionsDay] = useState<number | null>(null);
    const [availableShiftTypes, setAvailableShiftTypes] = useState<any[]>([]);
    const [selectedShiftDetails, setSelectedShiftDetails] = useState<any[]>([]);
    const [selectedShiftLabel, setSelectedShiftLabel] = useState<string>("");
    const calendarGridRef = useRef<HTMLDivElement | null>(null);
    const [pendingCreate, setPendingCreate] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    const [pendingHistoryId, setPendingHistoryId] = useState<number | null>(null);
    const [confirmData, setConfirmData] = useState<{
        detail: any;
        dateString: string;
        day: number;
    } | null>(null);
    // Dữ liệu ca làm từ API
    const [shiftData, setShiftData] = useState<any | null>(null);
    // Lịch đã đăng ký (schedule)
    const [scheduleData, setScheduleData] = useState<any[]>([]);
    // Modal lỗi
    const [errorModal, setErrorModal] = useState<{
        show: boolean;
        message: string;
    }>({ show: false, message: "" });
    // Lịch sử yêu cầu thay đổi
    const [historyData, setHistoryData] = useState<any[]>([]);
    // Modal hướng dẫn
    const [showGuideModal, setShowGuideModal] = useState(false);
    // Modal hiển thị lý do từ chối
    const [rejectReasonModal, setRejectReasonModal] = useState<{
        show: boolean;
        reasonRefusal: string;
    }>({ show: false, reasonRefusal: "" });

    const currentMonth = currentDate.getMonth(); // 0-11
    const currentYear = currentDate.getFullYear();

    const toDateOnly = (value: string | Date | undefined | null) => {
        if (!value) return null;
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return null;
        // bỏ phần giờ
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    const isDateInRange = (target: Date, item: any) => {
        // Ưu tiên start/end nằm ở record gốc, sau đó mới đến shiftType
        const start = toDateOnly(
            item?.start_day ??
            item?.startDay ??
            item?.startDate ??
            item?.shiftType?.start_day ??
            item?.shiftType?.startDay ??
            item?.shiftType?.startDate
        );
        const end = toDateOnly(
            item?.end_day ??
            item?.endDay ??
            item?.endDate ??
            item?.shiftType?.end_day ??
            item?.shiftType?.endDay ??
            item?.shiftType?.endDate
        );
        if (!start || !end) return true; // nếu không có range thì cho phép
        const t = new Date(target.getFullYear(), target.getMonth(), target.getDate());
        return t >= start && t <= end;
    };

    const buildFormattedDate = (day: number) => {
        const registrationDate = new Date(currentYear, currentMonth, day, 0, 0, 0);
        const year = registrationDate.getFullYear();
        const month = String(registrationDate.getMonth() + 1).padStart(2, "0");
        const date = String(registrationDate.getDate()).padStart(2, "0");
        const hour = String(registrationDate.getHours()).padStart(2, "0");
        const minute = String(registrationDate.getMinutes()).padStart(2, "0");
        const second = String(registrationDate.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${date}T${hour}:${minute}:${second}`;
    };

    // Kiểm tra xem ngày có phải là quá khứ (trước hôm nay) không
    const isPastDate = (day: number) => {
        const targetDate = new Date(currentYear, currentMonth, day);
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        // So sánh chỉ phần ngày (bỏ giờ)
        const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        const todayDateOnly = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());

        return targetDateOnly < todayDateOnly;
    };

    const handleRegisterShift = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        const filtered =
            Array.isArray(shiftData)
                ? shiftData.filter((item: any) => isDateInRange(date, item))
                : [];
        setAvailableShiftTypes(filtered);
        setShiftOptionsDay(day);
        setSelectedShiftDetails([]);
        setSelectedShiftLabel("");
    };

    const handleDetailShiftClick = (e: React.MouseEvent, detailShift: any) => {
        e.stopPropagation();
        if (pendingCreate) return;
        if (selectedDay === null) return;
        const formattedDate = buildFormattedDate(selectedDay);
        setConfirmData({
            detail: detailShift,
            dateString: formattedDate,
            day: selectedDay,
        });
    };

    const handleConfirmCreate = async () => {
        if (!confirmData || pendingCreate) return;
        const employee = JSON.parse(localStorage.getItem("employee") ?? "{}");
        try {
            setPendingCreate(true);

            // Kiểm tra xem có phải là bổ sung ca (ngày quá khứ) không
            const isPast = isPastDate(confirmData.day);

            const payload: any = {
                supplierId: employee.supplierId,
                detailShiftTypeId: confirmData.detail?.id ?? confirmData.detail?.detailShiftTypeId,
                registrationDate: confirmData.dateString,
            };

            // Nếu là bổ sung ca (ngày quá khứ), thêm dateRequest
            if (isPast) {
                payload.dateRequest = confirmData.dateString;
            }

            const response = await scheduleApi.create(payload);
            console.log("Tạo schedule thành công:", response.data);

            const createdSchedule = response?.data?.data ?? response?.data ?? null;
            if (createdSchedule) {
                setScheduleData((prev) => [...prev, createdSchedule]);

                // Kiểm tra xem ca vừa tạo có reviewStatus = false (màu vàng - chờ duyệt) không
                const reviewStatus = createdSchedule?.reviewStatus ?? createdSchedule?.review_status ?? true;

                // Nếu reviewStatus = false (ca màu vàng), reload history để thêm vào bảng "Lịch sử yêu cầu thay đổi"
                if (reviewStatus === false) {
                    // Đợi một chút để backend xử lý xong, sau đó reload history
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Reload history để cập nhật và thêm dữ liệu yêu cầu đăng ký/bổ sung ca vào bảng "Lịch sử yêu cầu thay đổi"
                    const month = currentMonth + 1;
                    const year = currentYear;
                    const historyRes = await scheduleApi.getHistory(month, year);
                    const historyPayload = Array.isArray(historyRes.data) ? historyRes.data : historyRes.data?.data;

                    // Cập nhật historyData với dữ liệu mới (bao gồm yêu cầu đăng ký/bổ sung ca vừa tạo)
                    setHistoryData(historyPayload ?? []);
                    console.log("Đã cập nhật lịch sử yêu cầu thay đổi với dữ liệu mới:", historyPayload);
                }
            } else {
                setScheduleData((prev) => [
                    ...prev,
                    {
                        detailShiftType: confirmData.detail,
                        registrationDate: confirmData.dateString,
                        supplierId: employee.supplierId,
                    },
                ]);
            }

            setSelectedShiftDetails([]);
            setSelectedShiftLabel("");
            setShiftOptionsDay(null);
        } catch (error: any) {
            console.error("Lỗi khi tạo schedule:", error.response?.data || error.message);
            // Hiển thị modal lỗi với thông báo từ backend
            const errorMessage = error.response?.data?.message || error.message || "Đã xảy ra lỗi khi đăng ký ca";
            setErrorModal({
                show: true,
                message: errorMessage,
            });
        } finally {
            setPendingCreate(false);
            setConfirmData(null);
        }
    };

    const handleCancelConfirm = () => {
        if (pendingCreate) return;
        setConfirmData(null);
    };

    const handleCancelHistory = async (historyItem: any) => {
        if (!historyItem || pendingHistoryId !== null) return;

        const ok = window.confirm("Bạn có chắc muốn hủy yêu cầu này?");
        if (!ok) return;

        const typeHistoryName = historyItem?.typeHistorySchudule?.name;
        const dateRequestRaw = historyItem?.dateRequest;
        const detailShiftTypeId =
            historyItem?.detailShiftType?.id ?? historyItem?.detailShiftTypeId;

        if (!typeHistoryName || !dateRequestRaw || !detailShiftTypeId) {
            console.warn("Thiếu dữ liệu để gọi API hủy lịch sử yêu cầu thay đổi", {
                typeHistoryName,
                dateRequestRaw,
                detailShiftTypeId,
            });
            return;
        }

        try {
            setPendingHistoryId(historyItem.id ?? null);

            await scheduleApi.deleteHistory({
                typeHistoryName,
                dateRequest: dateRequestRaw,
                detailShiftTypeId,
            });

            // Sau khi backend xử lý xong, reload lại lịch sử và lịch đăng ký
            const month = currentMonth + 1;
            const year = currentYear;

            const [historyRes, scheduleRes] = await Promise.all([
                scheduleApi.getHistory(month, year),
                scheduleApi.getByMonthYear(month, year),
            ]);

            const historyPayload = Array.isArray(historyRes.data)
                ? historyRes.data
                : historyRes.data?.data;
            const schedulePayload = Array.isArray(scheduleRes.data)
                ? scheduleRes.data
                : scheduleRes.data?.data;

            setHistoryData(historyPayload ?? []);
            setScheduleData(schedulePayload ?? []);

            console.log(
                "Đã cập nhật lịch sử yêu cầu thay đổi và lịch đăng ký sau khi hủy:",
                { historyPayload, schedulePayload }
            );
        } catch (error: any) {
            console.error(
                "Lỗi khi hủy lịch sử yêu cầu thay đổi:",
                error.response?.data || error.message
            );
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Đã xảy ra lỗi khi hủy yêu cầu";
            setErrorModal({
                show: true,
                message: errorMessage,
            });
        } finally {
            setPendingHistoryId(null);
        }
    };

    const handleDeleteSchedule = async (scheduleId: number) => {
        if (pendingDeleteId !== null) return;

        // Tìm schedule cần xóa
        const scheduleToDelete = scheduleData.find((s: any) => s.id === scheduleId);
        if (!scheduleToDelete) return;

        const reviewStatus =
            scheduleToDelete?.reviewStatus ?? scheduleToDelete?.review_status ?? true;

        // Tính ngày đăng ký của ca và ngưỡng "hôm nay + 2 ngày"
        const registrationDate = toDateOnly(
            scheduleToDelete?.registrationDate ?? scheduleToDelete?.registration_date
        );
        let isBeforeTodayPlus2 = false;
        if (registrationDate) {
            const todayOnly = new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            );
            const threshold = new Date(
                todayOnly.getFullYear(),
                todayOnly.getMonth(),
                todayOnly.getDate() + 2
            );
            isBeforeTodayPlus2 = registrationDate < threshold;
        }

        // Nếu reviewStatus = false (ca màu vàng/cam) HOẶC
        // reviewStatus = true nhưng ngày ca < hôm nay + 2 ngày,
        // thì không xóa khỏi lịch mà chỉ tạo yêu cầu xóa (chuyển sang màu vàng cam + thêm lịch sử)
        if (reviewStatus === false || isBeforeTodayPlus2) {
            try {
                setPendingDeleteId(scheduleId);
                // Gọi API delete để tạo yêu cầu xóa (backend sẽ xử lý)
                const deleteRes = await scheduleApi.delete(scheduleId);
                console.log("Đã tạo yêu cầu xóa ca:", deleteRes.data);

                // Đợi một chút để backend xử lý xong, sau đó reload dữ liệu
                await new Promise(resolve => setTimeout(resolve, 500));

                // Reload history và schedule để cập nhật màu cam + lịch sử yêu cầu thay đổi
                const month = currentMonth + 1;
                const year = currentYear;
                const [historyRes, scheduleRes] = await Promise.all([
                    scheduleApi.getHistory(month, year),
                    scheduleApi.getByMonthYear(month, year),
                ]);

                const historyPayload = Array.isArray(historyRes.data)
                    ? historyRes.data
                    : historyRes.data?.data;
                const schedulePayload = Array.isArray(scheduleRes.data)
                    ? scheduleRes.data
                    : scheduleRes.data?.data;

                // Cập nhật historyData và scheduleData với dữ liệu mới
                setHistoryData(historyPayload ?? []);
                setScheduleData(schedulePayload ?? []);
                console.log(
                    "Đã cập nhật lịch sử yêu cầu thay đổi và lịch sau khi tạo yêu cầu xóa:",
                    { historyPayload, schedulePayload }
                );
            } catch (error: any) {
                console.error("Lỗi khi tạo yêu cầu xóa ca:", error.response?.data || error.message);
                const errorMessage = error.response?.data?.message || error.message || "Đã xảy ra lỗi khi tạo yêu cầu xóa ca";
                setErrorModal({
                    show: true,
                    message: errorMessage,
                });
            } finally {
                setPendingDeleteId(null);
            }
            return;
        }

        // Nếu reviewStatus = true, xóa bình thường
        try {
            setPendingDeleteId(scheduleId);
            const res = await scheduleApi.delete(scheduleId);
            console.log("Xóa schedule thành công:", res.data);
            setScheduleData((prev) => prev.filter((s: any) => s.id !== scheduleId));
        } catch (error: any) {
            console.error("Lỗi khi xóa schedule:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || error.message || "Đã xảy ra lỗi khi xóa ca";
            setErrorModal({
                show: true,
                message: errorMessage,
            });
        } finally {
            setPendingDeleteId(null);
        }
    };

    // Gọi API lấy dữ liệu ca làm theo tháng/năm hiện tại
    useEffect(() => {
        const month = currentMonth + 1; // API dùng tháng 1-12
        const year = currentYear;

        // Lấy supplierId từ employee được lưu ở localStorage
        const employeeStr = localStorage.getItem("employee");
        if (!employeeStr) {
            console.warn("Employee is not found in localStorage");
            return;
        }

        try {
            const employee = JSON.parse(employeeStr);
            const supplierId = employee?.supplierId;

            if (!supplierId) {
                console.warn("supplierId is missing in employee data");
                return;
            }

            shiftTypeSupplierApi
                .getByMonthYear(supplierId, month, year)
                .then((res) => {
                    // Nếu backend bọc trong { data: [...] } thì lấy res.data.data, nếu không thì lấy res.data
                    const payload = Array.isArray(res.data) ? res.data : res.data?.data;
                    setShiftData(payload);
                    console.log("Shift data", payload);
                })
                .catch((error) => {
                    console.error("Failed to load shift data", error);
                });
        } catch (error) {
            console.error("Failed to parse employee from localStorage", error);
        }
    }, [currentMonth, currentYear]);

    // Gọi API lấy schedule theo tháng/năm hiện tại
    useEffect(() => {
        const month = currentMonth + 1; // API dùng tháng 1-12
        const year = currentYear;

        const employeeStr = localStorage.getItem("employee");
        if (!employeeStr) {
            console.warn("Employee is not found in localStorage (schedule)");
            return;
        }

        try {
            const employee = JSON.parse(employeeStr);
            const supplierId = employee?.supplierId;

            if (!supplierId) {
                console.warn("supplierId is missing in employee data (schedule)");
                return;
            }

            scheduleApi
                .getByMonthYear(month, year)
                .then((res) => {
                    const payload = Array.isArray(res.data) ? res.data : res.data?.data;
                    setScheduleData(payload ?? []);
                    console.log("Schedule data", payload);
                })
                .catch((error) => {
                    console.error("Failed to load schedule data", error);
                });
        } catch (error) {
            console.error("Failed to parse employee from localStorage (schedule)", error);
        }
    }, [currentMonth, currentYear]);

    // Gọi API lấy lịch sử yêu cầu thay đổi theo tháng/năm
    useEffect(() => {
        const month = currentMonth + 1; // API dùng tháng 1-12
        const year = currentYear;

        scheduleApi
            .getHistory(month, year)
            .then((res) => {
                const payload = Array.isArray(res.data) ? res.data : res.data?.data;
                setHistoryData(payload ?? []);
                console.log("History data", payload);
            })
            .catch((error) => {
                console.error("Failed to load history data", error);
            });
    }, [currentMonth, currentYear]);

    // Click ra ngoài khu vực calendar thì reset chọn ngày và danh sách ca
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (calendarGridRef.current && !calendarGridRef.current.contains(target)) {
                setSelectedDay(null);
                setShiftOptionsDay(null);
                setAvailableShiftTypes([]);
                setSelectedShiftDetails([]);
                setSelectedShiftLabel("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Tính toán các ô lịch cho tháng hiện tại
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    // Chuyển đổi getDay() (CN = 0) sang thứ 2 = 0, ..., CN = 6
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    type CalendarCell = {
        key: string;
        label: number | "";
        isCurrentMonth: boolean;
        isToday: boolean;
    };

    const calendarCells: CalendarCell[] = [];

    // Các ô trống (trước ngày 1) để canh đúng thứ trong tuần
    for (let i = 0; i < startOffset; i++) {
        calendarCells.push({
            key: `empty-start-${i}`,
            label: "",
            isCurrentMonth: false,
            isToday: false,
        });
    }

    // Các ngày trong tháng hiện tại
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const isToday =
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate();

        calendarCells.push({
            key: `current-${day}`,
            label: day,
            isCurrentMonth: true,
            isToday,
        });
    }

    // Bổ sung các ô trống cuối cùng để đủ hàng (bội số của 7)
    const totalCells = Math.ceil(calendarCells.length / 7) * 7;
    for (let i = calendarCells.length; i < totalCells; i++) {
        calendarCells.push({
            key: `empty-end-${i}`,
            label: "",
            isCurrentMonth: false,
            isToday: false,
        });
    }

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

    const monthLabel = `Tháng ${currentMonth + 1}`;

    // ====== Thống kê giờ làm ======
    const STANDARD_MONTHLY_HOURS = 160; // tạm thời cố định 160h/tháng, sau này có thể lấy từ API

    const parseTimeToMinutes = (timeStr: string | undefined | null): number => {
        if (!timeStr) return 0;
        const parts = timeStr.split(":").map((p) => Number(p));
        if (parts.length === 0 || parts.some((n) => Number.isNaN(n))) return 0;
        const [h, m = 0] = parts;
        return h * 60 + m;
    };

    const totalRegisteredHours = Array.isArray(scheduleData)
        ? scheduleData.reduce((sum: number, s: any) => {
            const st = s?.detailShiftType ?? s;
            const startTimeStr = st?.startAt ?? st?.start_at ?? st?.start ?? "";
            const endTimeStr = st?.endAt ?? st?.end_at ?? st?.end ?? "";

            const startMinutes = parseTimeToMinutes(startTimeStr);
            const endMinutes = parseTimeToMinutes(endTimeStr);

            if (endMinutes <= startMinutes) return sum;

            const durationHours = (endMinutes - startMinutes) / 60;
            return sum + durationHours;
        }, 0)
        : 0;

    const diffHours = totalRegisteredHours - STANDARD_MONTHLY_HOURS;
    const diffPercent =
        STANDARD_MONTHLY_HOURS > 0 ? (diffHours / STANDARD_MONTHLY_HOURS) * 100 : 0;
    const diffPercentDisplay = `${diffPercent >= 0 ? "+" : ""}${diffPercent.toFixed(1)}%`;

    const remainingHours = Math.max(STANDARD_MONTHLY_HOURS - totalRegisteredHours, 0);

    const progressPercent =
        STANDARD_MONTHLY_HOURS > 0
            ? Math.min((totalRegisteredHours / STANDARD_MONTHLY_HOURS) * 100, 100)
            : 0;


    return (
        <div className="p-6 lg:p-10 px-8  mx-auto w-full flex flex-col gap-8">

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#111318] dark:text-white">Đăng ký lịch làm</h1>
                    <p className="text-[#616f89] dark:text-[#9ca3af] text-base">Quản lý ca làm việc và gửi yêu cầu thay đổi lịch trình cho tháng này.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        className="px-4 py-2 bg-white dark:bg-[#2e374a] border border-[#e5e7eb] dark:border-[#4b5563] text-[#111318] dark:text-white rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-[#374151] flex items-center gap-2 transition-colors shadow-sm"
                        onClick={() => setShowGuideModal(true)}
                    >
                        <span className="material-symbols-outlined text-[20px]">help</span>
                        Hướng dẫn
                    </button>
                    <button className="px-5 py-2 bg-[white] text-[#111318] hover:text-white rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Đăng ký ca mới
                    </button>
                </div>
                <p className="text-sm text-[#616f89] dark:text-[#9ca3af]">
                    Trạng thái dữ liệu ca làm: {shiftData ? "Đã tải" : "Chưa có"}
                </p>
                <p className="text-sm text-[#616f89] dark:text-[#9ca3af]">
                    Lịch đã đăng ký: {scheduleData.length > 0 ? `${scheduleData.length} mục` : "Chưa có"}
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#1a2230] rounded-xl p-6 border border-[#dbdfe6] dark:border-[#2e374a] shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <p className="text-[#616f89] dark:text-[#9ca3af] text-sm font-medium">Tổng giờ đăng ký ({monthLabel})</p>
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-1 rounded-md text-[20px]">schedule</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold dark:text-white">
                            {totalRegisteredHours.toFixed(1)}h
                        </p>
                        <p
                            className={`text-sm font-medium px-1.5 py-0.5 rounded ${diffHours >= 0
                                ? "text-green-700 bg-green-50 dark:bg-green-900/20"
                                : "text-[#e73908] bg-red-50 dark:bg-red-900/20"
                                }`}
                        >
                            {diffPercentDisplay}
                        </p>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                        <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                        ></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#1a2230] rounded-xl p-6 border border-[#dbdfe6] dark:border-[#2e374a] shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <p className="text-[#616f89] dark:text-[#9ca3af] text-sm font-medium">Giờ quy định</p>
                        <span className="material-symbols-outlined text-green-600 bg-green-100 dark:bg-green-900/30 p-1 rounded-md text-[20px]">fact_check</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold dark:text-white">
                            {STANDARD_MONTHLY_HOURS}h/tháng
                        </p>
                    </div>
                    <p className="text-xs text-[#616f89] dark:text-[#9ca3af] mt-2">
                        {remainingHours > 0
                            ? `Cần đăng ký thêm ${remainingHours.toFixed(1)}h để đủ định mức.`
                            : "Bạn đã đạt hoặc vượt định mức giờ quy định trong tháng."}
                    </p>
                </div>
                <div className="bg-white dark:bg-[#1a2230] rounded-xl p-6 border border-[#dbdfe6] dark:border-[#2e374a] shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <p className="text-[#616f89] dark:text-[#9ca3af] text-sm font-medium">Loại ca có thể đăng ký trong tháng</p>
                        <span className="material-symbols-outlined text-orange-600 bg-orange-100 dark:bg-orange-900/30 p-1 rounded-md text-[20px]">beach_access</span>
                    </div>

                    {/* Hiển thị mảng shiftData: chỉ show trường name và numberOfShift */}
                    {Array.isArray(shiftData) && shiftData.length > 0 && (
                        <div className="mt-3 text-xs text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-[#111827] p-3 rounded space-y-2">
                            {/* <div className="font-semibold">Shift data</div> */}
                            <ul className="space-y-1">
                                {shiftData.map((item: any, idx: number) => (
                                    <li key={item?.id ?? idx} className="break-words">
                                        {item?.shiftType.name ?? "Chưa có dữ liệu "} -{" "}
                                        Số ca có thể đăng ký: {item?.shiftType.numberOfShift ?? "Chưa có dữ liệu"}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-[#1a2230] border border-[#dbdfe6] dark:border-[#2e374a] rounded-xl shadow-sm overflow-hidden flex flex-col">

                <div className="flex items-center justify-between px-6 py-4 border-b border-[#dbdfe6] dark:border-[#2e374a]">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-bold text-[#111318] dark:text-white">
                                {monthLabel}, {currentYear}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <select
                                    value={currentMonth}
                                    onChange={handleChangeMonth}
                                    className="px-2 py-1 border border-[#dbdfe6] dark:border-[#4b5563] rounded-lg bg-white dark:bg-[#111827] text-[#111318] dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                                    className="px-2 py-1 border border-[#dbdfe6] dark:border-[#4b5563] rounded-lg bg-white dark:bg-[#111827] text-[#111318] dark:text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                <div
                    ref={calendarGridRef}
                    className="grid grid-cols-7 auto-rows-fr bg-[#f0f2f4] dark:bg-[#1a2230] gap-px border-b border-[#dbdfe6] dark:border-[#2e374a]"
                >
                    {calendarCells.map((cell) => (
                        <div
                            key={cell.key}
                            onClick={() => {
                                if (cell.isCurrentMonth && typeof cell.label === "number") {
                                    setSelectedDay(cell.label);
                                    setShiftOptionsDay(null);
                                    setAvailableShiftTypes([]);
                                    setSelectedShiftDetails([]);
                                    setSelectedShiftLabel("");
                                }
                            }}
                            className={`min-h-[181px] max-h-[181px] overflow-y-auto p-2 transition-colors relative
${cell.isCurrentMonth
                                    ? "group hover:bg-blue-50/50 dark:hover:bg-[#252d3d] cursor-pointer"
                                    : "opacity-40"
                                }
${cell.isToday
                                    ? "bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-blue-900/30 ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-1 shadow-md"
                                    : "bg-white dark:bg-[#1a2230]"
                                }
${cell.isCurrentMonth && selectedDay === cell.label && !cell.isToday
                                    ? "border-2 border-blue-500"
                                    : ""
                                }
${cell.isCurrentMonth && selectedDay === cell.label && cell.isToday
                                    ? "ring-4 ring-blue-400 dark:ring-blue-500"
                                    : ""
                                }`}
                        >
                            {cell.label !== "" && (
                                <div className="flex flex-col ">
                                    {cell.isToday ? (
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white text-sm font-extrabold shadow-lg ring-2 ring-blue-300 dark:ring-blue-500">
                                            {cell.label}
                                        </span>
                                    ) : (
                                        <span className="text-sm font-bold text-[#111318] dark:text-white">
                                            {cell.label}
                                        </span>
                                    )}

                                    {/* Hiển thị các schedule đã đăng ký ứng với ngày này */}
                                    {cell.isCurrentMonth && typeof cell.label === "number" && (
                                        <div className="flex flex-col gap-1">
                                            {scheduleData
                                                .filter((s: any) => {
                                                    const reg = toDateOnly(s?.registrationDate ?? s?.registration_date);
                                                    if (!reg) return false;
                                                    return (
                                                        reg.getFullYear() === currentYear &&
                                                        reg.getMonth() === currentMonth &&
                                                        reg.getDate() === cell.label
                                                    );
                                                })
                                                .map((s: any, idx: number) => {
                                                    const st = s?.detailShiftType ?? s;
                                                    const shiftName = st?.name ?? "Ca";
                                                    const startTime = st?.startAt ?? st?.start_at ?? st?.start ?? "";
                                                    const endTime = st?.endAt ?? st?.end_at ?? st?.end ?? "";
                                                    const reviewStatus = s?.reviewStatus ?? s?.review_status ?? true;

                                                    // Kiểm tra xem ca này có record lịch sử tương ứng không
                                                    const registrationDate = toDateOnly(s?.registrationDate ?? s?.registration_date);
                                                    const matchingHistoryItem =
                                                        reviewStatus === false && registrationDate
                                                            ? historyData.find((historyItem: any) => {
                                                                const historyDateRequest = historyItem?.dateRequest
                                                                    ? toDateOnly(historyItem.dateRequest)
                                                                    : null;
                                                                if (!historyDateRequest) return false;

                                                                const regDateOnly = new Date(
                                                                    registrationDate.getFullYear(),
                                                                    registrationDate.getMonth(),
                                                                    registrationDate.getDate()
                                                                );
                                                                const historyDateOnly = new Date(
                                                                    historyDateRequest.getFullYear(),
                                                                    historyDateRequest.getMonth(),
                                                                    historyDateRequest.getDate()
                                                                );

                                                                if (regDateOnly.getTime() !== historyDateOnly.getTime())
                                                                    return false;

                                                                const historyShiftType = historyItem?.detailShiftType;
                                                                if (!historyShiftType) return false;

                                                                const historyShiftName = historyShiftType?.name;
                                                                const historyStartTime =
                                                                    historyShiftType?.startAt ?? historyShiftType?.start_at ?? "";
                                                                const historyEndTime =
                                                                    historyShiftType?.endAt ?? historyShiftType?.end_at ?? "";

                                                                return (
                                                                    historyShiftName === shiftName &&
                                                                    historyStartTime === startTime &&
                                                                    historyEndTime === endTime
                                                                );
                                                            }) ?? null
                                                            : null;

                                                    // Xác định xem record history này có phải loại "Xoá ca" không (để tô màu đỏ cam)
                                                    const hasDeleteRequest =
                                                        !!matchingHistoryItem &&
                                                        matchingHistoryItem?.typeHistorySchudule?.name === "Xoá ca";

                                                    // Xác định màu dựa trên reviewStatus và yêu cầu xóa
                                                    let boxClass = "";
                                                    if (reviewStatus === false) {
                                                        if (hasDeleteRequest) {
                                                            // Màu đỏ cam cho ca có yêu cầu xóa
                                                            boxClass =
                                                                "text-[11px] px-2 py-1 mt-2 rounded border border-orange-500 text-orange-700 bg-orange-50 dark:border-orange-700 dark:text-orange-200 dark:bg-orange-900/20 cursor-pointer";
                                                        } else {
                                                            // Màu vàng cho ca chờ duyệt thông thường
                                                            boxClass =
                                                                "text-[11px] px-2 py-1 mt-2 rounded border border-yellow-500 text-yellow-700 bg-yellow-50 dark:border-yellow-700 dark:text-yellow-200 dark:bg-yellow-900/20 cursor-pointer";
                                                        }
                                                    } else {
                                                        // Màu xanh cho ca đã duyệt
                                                        boxClass =
                                                            "text-[11px] px-2 py-1 mt-2 rounded border border-green-500 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-200 dark:bg-green-900/20 cursor-pointer";
                                                    }

                                                    return (
                                                        <div
                                                            key={s?.id ?? `sch-${cell.label}-${idx}`}
                                                            className={boxClass}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!s?.id) return;
                                                                if (pendingDeleteId !== null || pendingCreate || pendingHistoryId !== null) return;

                                                                // Với các ca màu vàng / đỏ cam (reviewStatus = false),
                                                                // khi click sẽ chuyển sang chức năng Hủy yêu cầu thay đổi
                                                                if (reviewStatus === false && matchingHistoryItem) {
                                                                    handleCancelHistory(matchingHistoryItem);
                                                                    return;
                                                                }

                                                                // Các ca đã duyệt (màu xanh) vẫn cho phép xóa như cũ
                                                                const ok = window.confirm(
                                                                    "Bạn có chắc muốn xóa ca này khỏi lịch đã đăng ký?"
                                                                );
                                                                if (ok) {
                                                                    handleDeleteSchedule(s.id);
                                                                }
                                                            }}
                                                        >
                                                            {pendingDeleteId === s?.id
                                                                ? "Đang xóa..."
                                                                : `${shiftName} ${startTime && endTime ? `(${startTime} - ${endTime})` : ""
                                                                }`}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )}

                                    {selectedDay === cell.label && (
                                        <div className="flex flex-col gap-2 mt-1">
                                            {/* Ẩn nút khi đang hiển thị chi tiết ca */}
                                            {shiftOptionsDay !== cell.label && selectedShiftDetails.length === 0 && (
                                                <>
                                                    <button
                                                        className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (typeof cell.label === "number") {
                                                                handleRegisterShift(cell.label);
                                                            }
                                                        }}
                                                    >
                                                        {typeof cell.label === "number" && isPastDate(cell.label)
                                                            ? "Bổ sung ca"
                                                            : "Đăng ký ca"}
                                                    </button>
                                                </>
                                            )}

                                            {/* Danh sách shiftType khả dụng cho ngày đã chọn */}
                                            {shiftOptionsDay === cell.label && (
                                                <div className="flex flex-col gap-1">
                                                    {availableShiftTypes.length === 0 && (
                                                        <span className="text-[11px] text-gray-500">
                                                            Không có ca phù hợp ngày này
                                                        </span>
                                                    )}
                                                    {availableShiftTypes.map((item: any, idx: number) => {
                                                        const st = item?.shiftType ?? item;
                                                        return (
                                                            <button
                                                                key={st?.id ?? idx}
                                                                className="text-xs px-2 py-1 rounded border border-blue-500 text-blue-700 hover:bg-blue-50 transition text-left"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const details =
                                                                        st?.listDetailShiftType ??
                                                                        item?.listDetailShiftType ??
                                                                        [];
                                                                    // Loại bỏ các ca chi tiết đã đăng ký cho ngày này
                                                                    const existingDetailIds = scheduleData
                                                                        .filter((s: any) => {
                                                                            const reg = toDateOnly(s?.registrationDate ?? s?.registration_date);
                                                                            if (!reg) return false;
                                                                            return (
                                                                                reg.getFullYear() === currentYear &&
                                                                                reg.getMonth() === currentMonth &&
                                                                                reg.getDate() === cell.label
                                                                            );
                                                                        })
                                                                        .map(
                                                                            (s: any) =>
                                                                                s?.detailShiftType?.id ??
                                                                                s?.detailShiftTypeId ??
                                                                                s?.detailShiftTypeID
                                                                        )
                                                                        .filter(Boolean);

                                                                    const filteredDetails = Array.isArray(details)
                                                                        ? details.filter(
                                                                            (d: any) =>
                                                                                !existingDetailIds.includes(
                                                                                    d?.id ??
                                                                                    d?.detailShiftTypeId ??
                                                                                    d?.detailShiftTypeID
                                                                                )
                                                                        )
                                                                        : [];
                                                                    setSelectedShiftDetails(
                                                                        filteredDetails
                                                                    );
                                                                    setSelectedShiftLabel(st?.name ?? "Ca");
                                                                    // Ẩn danh sách shiftType sau khi chọn
                                                                    setShiftOptionsDay(null);
                                                                    setAvailableShiftTypes([]);
                                                                }}
                                                            >
                                                                {st?.name ?? "Chưa có tên"} - Số ca:{" "}
                                                                {st?.numberOfShift ?? "N/A"}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Chi tiết ca đã chọn (dạng nút bấm) */}
                                            {selectedShiftDetails.length > 0 && (
                                                <div className=" flex flex-col gap-1 border border-blue-100 dark:border-blue-900/40 rounded p-2 bg-white dark:bg-[#111827]">
                                                    <span className="text-[12px] font-semibold text-blue-700 dark:text-blue-300">
                                                        Chi tiết {selectedShiftLabel}
                                                    </span>
                                                    <div className="flex flex-col gap-1">
                                                        {selectedShiftDetails.map((d: any, i: number) => (
                                                            <button
                                                                key={d?.id ?? i}
                                                                onClick={(e) => handleDetailShiftClick(e, d)}
                                                                disabled={pendingCreate}
                                                                className={`text-[12px] text-left px-2 py-1 rounded border border-blue-400 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-900/30 transition ${pendingCreate ? "opacity-60 cursor-not-allowed" : ""
                                                                    }`}
                                                            >
                                                                {pendingCreate
                                                                    ? "Đang đăng ký..."
                                                                    : `${d?.name ?? "Ca"}: ${d?.startAt ?? d?.start_at ?? d?.start} - ${d?.endAt ?? d?.end_at ?? d?.end}`}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedShiftDetails.length === 0 && selectedShiftLabel && (
                                                <span className="text-[11px] text-gray-500">
                                                    Không còn ca trống cho {selectedShiftLabel} (đã đăng ký hết trong ngày)
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4 mb-10">
                <h3 className="text-xl font-bold text-[#111318] dark:text-white">Lịch sử yêu cầu thay đổi</h3>
                <div className="w-full overflow-x-auto rounded-xl border border-[#dbdfe6] dark:border-[#2e374a] shadow-sm bg-white dark:bg-[#1a2230]">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#f0f2f4] dark:bg-[#252d3d] text-[#616f89] dark:text-[#9ca3af]">
                            <tr>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap text-center">STT</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Ngày gửi</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Loại yêu cầu</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Chi tiết</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Ngày yêu cầu</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Chi tiết ca yêu cầu</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Trạng thái</th>
                                <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dbdfe6] dark:divide-[#2e374a]">
                            {historyData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-4 text-center text-[#616f89] dark:text-[#9ca3af]">
                                        Chưa có lịch sử yêu cầu thay đổi
                                    </td>
                                </tr>
                            ) : (
                                historyData.map((item: any, index: number) => {
                                    const createdAt = item?.createdAt ? new Date(item.createdAt) : null;
                                    const formattedDate = createdAt
                                        ? `${String(createdAt.getDate()).padStart(2, "0")}/${String(createdAt.getMonth() + 1).padStart(2, "0")}/${createdAt.getFullYear()}`
                                        : "N/A";

                                    const requestType = item?.typeHistorySchudule?.name || "N/A";
                                    const detail = item?.detai || item?.detail || "N/A";

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

                                    // Xác định màu badge dựa trên trạng thái và loại yêu cầu
                                    let statusBadgeClass = "";

                                    // Nếu là "Đăng ký ca" thì dùng màu vàng giống ca trực
                                    if (requestType === "Đăng ký ca") {
                                        statusBadgeClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200";
                                    } else if (status === "Chờ duyệt" || status === "Pending") {
                                        statusBadgeClass = "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200";
                                    } else if (status === "Từ chối" || status === "Rejected") {
                                        statusBadgeClass = "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200";
                                    } else if (status === "Đã duyệt" || status === "Approved") {
                                        statusBadgeClass = "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200";
                                    } else {
                                        statusBadgeClass = "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-200";
                                    }

                                    return (
                                        <tr key={item?.id} className="hover:bg-background-light dark:hover:bg-[#252d3d] transition-colors">
                                            <td className="px-6 py-4 text-center text-[#111318] dark:text-white font-medium">{index + 1}</td>
                                            <td className="px-6 py-4 text-[#111318] dark:text-white">{formattedDate}</td>
                                            <td className="px-6 py-4 text-[#111318] dark:text-white">{requestType}</td>
                                            <td className="px-6 py-4 text-[#616f89] dark:text-[#9ca3af]">{detail}</td>
                                            <td className="px-6 py-4 text-[#616f89] dark:text-[#9ca3af]">{formattedDateRequest}</td>
                                            <td className="px-6 py-4 text-[#616f89] dark:text-[#9ca3af]">{detailShiftType}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClass}`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {status === "Chờ duyệt" || status === "Pending" ? (
                                                    <button
                                                        className="text-[#616f89] dark:text-[#9ca3af] hover:text-red-600 dark:hover:text-red-400 font-medium text-sm disabled:opacity-60"
                                                        onClick={() => handleCancelHistory(item)}
                                                        disabled={pendingHistoryId === item?.id}
                                                    >
                                                        {pendingHistoryId === item?.id
                                                            ? "Đang hủy..."
                                                            : "Hủy"}
                                                    </button>
                                                ) : status === "Từ chối" || status === "Rejected" ? (
                                                    <button
                                                        className="text-primary hover:text-blue-700 font-medium text-sm"
                                                        onClick={() => {
                                                            const reasonRefusal = item?.reasonRefusal || item?.reason_refusal || "";
                                                            setRejectReasonModal({
                                                                show: true,
                                                                reasonRefusal: reasonRefusal || "Không có lý do được cung cấp",
                                                            });
                                                        }}
                                                    >
                                                        Xem lý do
                                                    </button>
                                                ) : null}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {confirmData && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
                    <div className="bg-white dark:bg-[#111827] rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                        <h4 className="text-lg font-semibold text-[#111318] dark:text-white">Xác nhận đăng ký ca</h4>
                        <p className="text-sm text-[#4b5563] dark:text-[#9ca3af]">
                            Bạn có chắc muốn đăng ký ca này không?
                        </p>
                        <div className="border border-[#e5e7eb] dark:border-[#374151] rounded p-3 text-sm text-[#111318] dark:text-white bg-gray-50 dark:bg-[#1f2937]">
                            <div className="font-semibold">{confirmData.detail?.name ?? "Ca"}</div>
                            <div className="text-xs text-[#4b5563] dark:text-[#9ca3af]">
                                {confirmData.detail?.startAt ?? confirmData.detail?.start_at ?? confirmData.detail?.start} -{" "}
                                {confirmData.detail?.endAt ?? confirmData.detail?.end_at ?? confirmData.detail?.end}
                            </div>
                            <div className="text-xs text-[#4b5563] dark:text-[#9ca3af] mt-1">
                                Ngày: {confirmData.dateString.split("T")[0]}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 rounded border border-[#e5e7eb] dark:border-[#4b5563] text-[#111318] dark:text-white hover:bg-gray-100 dark:hover:bg-[#374151] text-sm"
                                onClick={handleCancelConfirm}
                                disabled={pendingCreate}
                            >
                                Hủy
                            </button>
                            <button
                                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm disabled:opacity-60"
                                onClick={handleConfirmCreate}
                                disabled={pendingCreate}
                            >
                                {pendingCreate ? "Đang đăng ký..." : "Xác nhận"}
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
                            <h4 className="text-lg font-semibold text-[#111318] dark:text-white">Lỗi đăng ký ca</h4>
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

            {rejectReasonModal.show && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
                    <div className="bg-white dark:bg-[#111827] rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">cancel</span>
                            <h4 className="text-lg font-semibold text-[#111318] dark:text-white">Lý do từ chối</h4>
                        </div>
                        <div className="border border-red-200 dark:border-red-800 rounded p-4 text-sm text-[#111318] dark:text-white bg-red-50 dark:bg-red-900/20">
                            <p className="text-red-700 dark:text-red-300 whitespace-pre-wrap break-words">
                                {rejectReasonModal.reasonRefusal}
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                                onClick={() => setRejectReasonModal({ show: false, reasonRefusal: "" })}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showGuideModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
                    <div className="bg-white dark:bg-[#111827] rounded-lg shadow-xl max-w-3xl w-full p-6 space-y-6 my-auto">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">help</span>
                                <h4 className="text-xl font-semibold text-[#111318] dark:text-white">Hướng dẫn đăng ký ca</h4>
                            </div>
                            <button
                                className="text-[#616f89] dark:text-[#9ca3af] hover:text-[#111318] dark:hover:text-white transition-colors"
                                onClick={() => setShowGuideModal(false)}
                            >
                                <span className="material-symbols-outlined text-[28px]">close</span>
                            </button>
                        </div>

                        <div className="space-y-4 text-sm text-[#111318] dark:text-white">
                            <div className="space-y-2">
                                <h5 className="font-semibold text-base flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px]">calendar_month</span>
                                    Đăng ký ca mới
                                </h5>
                                <ul className="list-disc list-inside space-y-1 text-[#616f89] dark:text-[#9ca3af] ml-6">
                                    <li>Chọn ngày trong lịch mà bạn muốn đăng ký ca</li>
                                    <li>Nhấn nút <span className="font-medium text-blue-600 dark:text-blue-400">"Đăng ký ca"</span> hoặc <span className="font-medium text-blue-600 dark:text-blue-400">"Bổ sung ca"</span> (nếu là ngày quá khứ)</li>
                                    <li>Chọn loại ca từ danh sách hiển thị</li>
                                    <li>Chọn chi tiết ca (khung giờ cụ thể) mà bạn muốn đăng ký</li>
                                    <li>Xác nhận đăng ký trong hộp thoại</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h5 className="font-semibold text-base flex items-center gap-2">
                                    <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-[20px]">schedule</span>
                                    Màu sắc ca đăng ký
                                </h5>
                                <div className="space-y-2 ml-6">
                                    <div className="flex items-center gap-2">
                                        <span className="w-4 h-4 rounded border border-green-500 bg-green-50 dark:bg-green-900/20"></span>
                                        <span className="text-[#616f89] dark:text-[#9ca3af]"><strong className="text-[#111318] dark:text-white">Màu xanh:</strong> Ca đã được duyệt</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-4 h-4 rounded border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"></span>
                                        <span className="text-[#616f89] dark:text-[#9ca3af]"><strong className="text-[#111318] dark:text-white">Màu vàng:</strong> Ca đang chờ duyệt (Đăng ký ca/Bổ sung ca)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-4 h-4 rounded border border-orange-500 bg-orange-50 dark:bg-orange-900/20"></span>
                                        <span className="text-[#616f89] dark:text-[#9ca3af]"><strong className="text-[#111318] dark:text-white">Màu cam:</strong> Ca có yêu cầu xóa đang chờ duyệt</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h5 className="font-semibold text-base flex items-center gap-2">
                                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[20px]">delete</span>
                                    Xóa/Hủy ca đăng ký
                                </h5>
                                <ul className="list-disc list-inside space-y-1 text-[#616f89] dark:text-[#9ca3af] ml-6">
                                    <li><strong className="text-[#111318] dark:text-white">Ca màu xanh (đã duyệt):</strong> Click vào ca để xóa trực tiếp (nếu ngày ≥ hôm nay + 2 ngày) hoặc tạo yêu cầu xóa (nếu ngày &lt; hôm nay + 2 ngày)</li>
                                    <li><strong className="text-[#111318] dark:text-white">Ca màu vàng/cam (chờ duyệt):</strong> Click vào ca để hủy yêu cầu đăng ký/xóa</li>
                                    <li>Bạn có thể hủy yêu cầu từ bảng <strong className="text-[#111318] dark:text-white">"Lịch sử yêu cầu thay đổi"</strong> bằng cách nhấn nút <span className="font-medium text-red-600 dark:text-red-400">"Hủy"</span></li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h5 className="font-semibold text-base flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-[20px]">history</span>
                                    Lịch sử yêu cầu thay đổi
                                </h5>
                                <ul className="list-disc list-inside space-y-1 text-[#616f89] dark:text-[#9ca3af] ml-6">
                                    <li>Xem tất cả các yêu cầu đăng ký, bổ sung, hoặc xóa ca của bạn</li>
                                    <li>Theo dõi trạng thái: <strong className="text-[#111318] dark:text-white">Chờ duyệt</strong>, <strong className="text-[#111318] dark:text-white">Đã duyệt</strong>, hoặc <strong className="text-[#111318] dark:text-white">Từ chối</strong></li>
                                    <li>Hủy các yêu cầu đang chờ duyệt nếu cần</li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <h5 className="font-semibold text-base flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[20px]">info</span>
                                    Lưu ý quan trọng
                                </h5>
                                <ul className="list-disc list-inside space-y-1 text-[#616f89] dark:text-[#9ca3af] ml-6">
                                    <li>Ca đăng ký cho ngày quá khứ sẽ tự động chuyển sang trạng thái <strong className="text-[#111318] dark:text-white">"Chờ duyệt"</strong></li>
                                    <li>Ca đăng ký cho ngày trong tương lai (≥ hôm nay + 2 ngày) sẽ được duyệt tự động</li>
                                    <li>Ca đăng ký cho ngày gần (&lt; hôm nay + 2 ngày) cần được duyệt bởi quản lý</li>
                                    <li>Bạn không thể đăng ký trùng ca trong cùng một ngày</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-[#e5e7eb] dark:border-[#374151]">
                            <button
                                className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors"
                                onClick={() => setShowGuideModal(false)}
                            >
                                Đã hiểu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;
