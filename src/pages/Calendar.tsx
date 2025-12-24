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
    // Dữ liệu ca làm từ API
    const [shiftData, setShiftData] = useState<any | null>(null);
    // Lịch đã đăng ký (schedule)
    const [scheduleData, setScheduleData] = useState<any[]>([]);

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

    const handleDetailShiftClick = async (e: React.MouseEvent, detailShift: any) => {
        e.stopPropagation();

        // Lấy ngày đã chọn
        if (selectedDay !== null) {
            // Tạo Date object với ngày và giờ phút giây mặc định về 0
            const registrationDate = new Date(currentYear, currentMonth, selectedDay, 0, 0, 0);

            // Format thành ISO string như "2024-01-15T00:00:00"
            const year = registrationDate.getFullYear();
            const month = String(registrationDate.getMonth() + 1).padStart(2, '0');
            const day = String(registrationDate.getDate()).padStart(2, '0');
            const hour = String(registrationDate.getHours()).padStart(2, '0');
            const minute = String(registrationDate.getMinutes()).padStart(2, '0');
            const second = String(registrationDate.getSeconds()).padStart(2, '0');

            const formattedDate = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
            const employee = JSON.parse(localStorage.getItem("employee") ?? "{}");

            try {
                const response = await scheduleApi.create({
                    supplierId: employee.supplierId,
                    detailShiftTypeId: detailShift?.id ?? detailShift?.detailShiftTypeId,
                    registrationDate: formattedDate
                });
                console.log("Tạo schedule thành công:", response.data);

                // Lấy schedule mới tạo từ response (ưu tiên res.data.data)
                const createdSchedule = response?.data?.data ?? response?.data ?? null;
                if (createdSchedule) {
                    setScheduleData((prev) => [...prev, createdSchedule]);
                } else {
                    // Fallback: tự dựng object tối thiểu để hiển thị tức thì
                    setScheduleData((prev) => [
                        ...prev,
                        {
                            detailShiftType: detailShift,
                            registrationDate: formattedDate,
                            supplierId: employee.supplierId,
                        },
                    ]);
                }

                // Đóng hộp thoại chi tiết ca sau khi đăng ký xong
                setSelectedShiftDetails([]);
                setSelectedShiftLabel("");
                setShiftOptionsDay(null);
            } catch (error: any) {
                console.error("Lỗi khi tạo schedule:", error.response?.data || error.message);
            }
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


    return (
        <div className="p-6 lg:p-10 px-8  mx-auto w-full flex flex-col gap-8">

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
                            className={`min-h-[181px] max-h-[181px] overflow-y-auto p-2 transition-colors relative bg-white dark:bg-[#1a2230]
${cell.isCurrentMonth
                                    ? "group hover:bg-blue-50/50 dark:hover:bg-[#252d3d] cursor-pointer"
                                    : "opacity-40"
                                }
${cell.isToday
                                    ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-[#f0f2f4] dark:ring-offset-[#1a2230]"
                                    : ""
                                }
${cell.isCurrentMonth && selectedDay === cell.label
                                    ? "border-2 border-blue-500"
                                    : ""
                                }`}
                        >
                            {cell.label !== "" && (
                                <div className="flex flex-col ">
                                    <span
                                        className={`text-sm font-bold ${cell.isToday
                                            ? "text-blue-600 dark:text-blue-300"
                                            : "text-[#111318] dark:text-white"
                                            }`}
                                    >
                                        {cell.label}
                                    </span>

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
                                                    return (
                                                        <div
                                                            key={s?.id ?? `sch-${cell.label}-${idx}`}
                                                            className="text-[11px] px-2 py-1 mt-2 rounded border border-green-500 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-200 dark:bg-green-900/20"
                                                        >
                                                            {shiftName} {startTime && endTime ? `(${startTime} - ${endTime})` : ""}
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
                                                        Đăng ký ca
                                                    </button>
                                                    <button className="text-xs px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition">
                                                        Xóa ca
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
                                                                className="text-[12px] text-left px-2 py-1 rounded border border-blue-400 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-900/30 transition"
                                                            >
                                                                {d?.name ?? "Ca"}: {d?.startAt ?? d?.start_at ?? d?.start} -{" "}
                                                                {d?.endAt ?? d?.end_at ?? d?.end}
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
