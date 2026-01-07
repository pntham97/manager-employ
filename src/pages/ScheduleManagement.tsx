import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { scheduleApi } from "../api/schedule.api";
import { shiftTypeSupplierApi } from "../api/shiftTypeSupplier.api";
import { employeeApi } from "../api/employee.api";

const ScheduleManagement = () => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(
        () => new Date(today.getFullYear(), today.getMonth(), 1)
    );
    const [scheduleData, setScheduleData] = useState<any[]>([]);
    const [shiftTypeData, setShiftTypeData] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<Array<{ id: number; name: string; status: boolean }>>([]);
    const [loading, setLoading] = useState(false);
    const [errorModal, setErrorModal] = useState<{
        show: boolean;
        message: string;
    }>({ show: false, message: "" });
    const [selectedSupplierId, setSelectedSupplierId] = useState<number | undefined>(undefined);
    const [selectedShiftTypeId, setSelectedShiftTypeId] = useState<number | null>(null);
    const [employeeListModal, setEmployeeListModal] = useState<{
        show: boolean;
        day: number;
        detailShiftTypeName: string;
        startAt: string;
        endAt: string;
        employees: Array<{ name: string; phone?: string; positionId?: number; roleName?: string }>;
    }>({
        show: false,
        day: 0,
        detailShiftTypeName: "",
        startAt: "",
        endAt: "",
        employees: [],
    });

    const currentMonth = currentDate.getMonth(); // 0-11
    const currentYear = currentDate.getFullYear();
    const navigate = useNavigate();

    // Chuẩn hoá registrationDate về dạng Date chỉ có ngày, tránh lệch 1 ngày do timezone
    const toRegistrationDateOnly = (value: string | undefined | null) => {
        if (!value) return null;

        // Nếu backend trả về dạng "YYYY-MM-DD" (không có giờ) thì tự parse thủ công
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            const [y, m, d] = value.split("-").map(Number);
            if (!y || !m || !d) return null;
            return new Date(y, m - 1, d);
        }

        // Các trường hợp còn lại (có 'T' / full ISO) dùng Date rồi bỏ phần giờ
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return null;
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    // Chuẩn hoá bất kỳ date string để so sánh start/end của shiftType
    const toDateOnly = (value: string | Date | undefined | null) => {
        if (!value) return null;
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return null;
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };

    // Kiểm tra shiftType (hoặc record) có hiệu lực cho ngày target hay không (dựa vào start/end date)
    const isShiftTypeActiveOnDate = (item: any, target: Date) => {
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
        if (!start || !end) return true; // không có range thì coi như áp dụng
        const t = new Date(target.getFullYear(), target.getMonth(), target.getDate());
        return t >= start && t <= end;
    };

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

    // Lấy role để xác định có cần supplierId hay không
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

    // Load danh sách schedule
    const loadScheduleData = async () => {
        if (!hasPermission) return;
        setLoading(true);
        try {
            const month = currentMonth + 1;
            const year = currentYear;

            // Với MANAGER: không truyền supplierId (API sẽ tự động lấy từ token)
            // Với ADMIN: truyền selectedSupplierId nếu có
            let supplierIdForApi: number | undefined = undefined;
            if (isAdmin) {
                supplierIdForApi = selectedSupplierId;
            }
            // Với MANAGER, không truyền supplierId để API tự động lấy từ token

            const res = await scheduleApi.getAdminManagerSchedule(month, year, supplierIdForApi);
            const payload = Array.isArray(res.data) ? res.data : res.data?.data;
            console.log(payload);
            setScheduleData(payload ?? []);
        } catch (error: any) {
            console.error("Failed to load schedule data", error);
            setErrorModal({
                show: true,
                message: error.response?.data?.message || "Không thể tải danh sách ca đăng ký",
            });
        } finally {
            setLoading(false);
        }
    };

    // Load danh sách shiftType
    const loadShiftTypeData = async () => {
        if (!hasPermission) return;
        try {
            const month = currentMonth + 1;
            const year = currentYear;

            // Với MANAGER: không truyền supplierId (API sẽ tự động lấy từ token)
            // Với ADMIN: truyền selectedSupplierId nếu có
            let supplierIdForApi: number | undefined = undefined;
            if (isAdmin) {
                supplierIdForApi = selectedSupplierId;
            }
            // Với MANAGER, không truyền supplierId để API tự động lấy từ token

            const res = await shiftTypeSupplierApi.getByMonthYearAdminManager(month, year, supplierIdForApi);
            const payload = Array.isArray(res.data) ? res.data : res.data?.data;
            setShiftTypeData(payload ?? []);
        } catch (error: any) {
            console.error("Failed to load shift type data", error);
        }
    };

    // Load danh sách suppliers (chỉ cho ADMIN)
    const loadSuppliers = async () => {
        if (!hasPermission || !isAdmin) return;
        try {
            const res = await employeeApi.getSuppliersPositions();
            const suppliersData = res.data?.suppliers || [];
            // Chỉ lấy suppliers có status = true
            setSuppliers(suppliersData.filter((s: any) => s.status === true));
        } catch (error: any) {
            console.error("Failed to load suppliers", error);
        }
    };

    // Load suppliers khi component mount (chỉ cho ADMIN)
    useEffect(() => {
        if (!hasPermission || !isAdmin) return;
        loadSuppliers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasPermission, isAdmin]);

    // Set mặc định supplier đầu tiên khi suppliers được load (chỉ cho ADMIN)
    useEffect(() => {
        if (isAdmin && suppliers.length > 0 && selectedSupplierId === undefined) {
            setSelectedSupplierId(suppliers[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [suppliers, isAdmin]);

    // Reset selectedSupplierId nếu là MANAGER (đảm bảo không có supplierId được chọn)
    useEffect(() => {
        if (!isAdmin && selectedSupplierId !== undefined) {
            setSelectedSupplierId(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin]);

    // Load dữ liệu khi thay đổi tháng/năm hoặc supplierId (nếu là ADMIN)
    useEffect(() => {
        if (!hasPermission) return;
        loadScheduleData();
        loadShiftTypeData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentMonth, currentYear, selectedSupplierId, hasPermission]);

    // Set mặc định shiftType đầu tiên khi shiftTypeData được load hoặc thay đổi
    useEffect(() => {
        if (shiftTypeData.length > 0) {
            // Gộp các shiftType trùng lặp để lấy danh sách unique
            const uniqueShiftTypes = new Map<number, { id: number; name: string }>();
            shiftTypeData.forEach((item: any) => {
                const shiftType = item?.shiftType;
                if (!shiftType) return;
                const shiftTypeId = shiftType?.id;
                const shiftTypeName = shiftType?.name || "Chưa có tên";
                if (!uniqueShiftTypes.has(shiftTypeId)) {
                    uniqueShiftTypes.set(shiftTypeId, {
                        id: shiftTypeId,
                        name: shiftTypeName,
                    });
                }
            });
            const uniqueShiftTypesArray = Array.from(uniqueShiftTypes.values());

            // Kiểm tra xem selectedShiftTypeId hiện tại có còn trong danh sách không
            const currentShiftTypeExists = uniqueShiftTypesArray.some(st => st.id === selectedShiftTypeId);

            // Nếu chưa có selectedShiftTypeId hoặc selectedShiftTypeId không còn hợp lệ, set về shiftType đầu tiên
            if (uniqueShiftTypesArray.length > 0 && (selectedShiftTypeId === null || !currentShiftTypeExists)) {
                setSelectedShiftTypeId(uniqueShiftTypesArray[0].id);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shiftTypeData]);

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

    // Hàm lấy danh sách nhân viên đã đăng ký một ca cụ thể
    const getEmployeesForShift = (day: number, detailShiftTypeId: number): Array<{ name: string; phone?: string; positionId?: number; roleName?: string }> => {
        if (!Array.isArray(scheduleData)) return [];

        const daySchedules = scheduleData.filter((s: any) => {
            const regDate = s?.registrationDate;
            const d = toRegistrationDateOnly(regDate);
            if (!d) return false;
            const isSameDay =
                d.getFullYear() === currentYear &&
                d.getMonth() === currentMonth &&
                d.getDate() === day;

            const shiftDetailId = s?.detailShiftType?.id;
            const isSameDetailShift = shiftDetailId === detailShiftTypeId;

            // Nếu có filter theo shiftType, chỉ lấy schedule có shiftTypeId khớp
            if (selectedShiftTypeId !== null) {
                const shiftTypeId = s?.shiftType?.id;
                return isSameDay && isSameDetailShift && shiftTypeId === selectedShiftTypeId;
            }

            return isSameDay && isSameDetailShift;
        });

        return daySchedules
            .map((s: any) => {
                const employee = s?.employee;
                if (!employee) return null;

                // Lấy roleName ưu tiên từ field roleName backend, sau đó tới role.name/role
                const rawRoleName =
                    employee?.roleName ??
                    employee?.role?.name ??
                    employee?.role ??
                    "";

                const roleName = rawRoleName ? String(rawRoleName).toUpperCase() : "";

                return {
                    name: employee?.name || "Chưa có tên",
                    phone: employee?.phone,
                    positionId: employee?.positionId,
                    roleName,
                };
            })
            .filter((emp: any) => emp !== null) as Array<{ name: string; phone?: string; positionId?: number; roleName?: string }>;
    };

    // Hàm xử lý click vào ca để hiển thị danh sách nhân viên
    const handleShiftClick = (day: number, detailShiftTypeName: string, startAt: string, endAt: string, detailShiftTypeId: number) => {
        const employees = getEmployeesForShift(day, detailShiftTypeId);
        setEmployeeListModal({
            show: true,
            day,
            detailShiftTypeName,
            startAt,
            endAt,
            employees,
        });
    };

    // Hàm lấy thông tin schedule theo ngày
    // Nếu có selectedShiftTypeId: trả về chi tiết các ca đăng ký
    // Nếu không: group theo shiftType và đếm
    const getScheduleInfoForDay = (day: number): Array<{
        shiftTypeName?: string;
        detailCount?: number;
        shiftTypeId?: number;
        detailShiftTypeName?: string;
        detailShiftTypeId?: number; // ID của detailShiftType để lấy danh sách nhân viên
        employeeName?: string;
        employeeCount?: number; // Số lượng người đăng ký ca này
        employeeNames?: string[]; // Danh sách tên người đăng ký
        managerCount?: number;
        userCount?: number;
        otherCount?: number;
        startAt?: string;
        endAt?: string;
        isDetail?: boolean; // true nếu là chi tiết từng ca, false nếu là tổng hợp
    }> => {
        if (!Array.isArray(scheduleData)) return [];

        // Lọc schedule theo ngày và shiftType (nếu có filter)
        const daySchedules = scheduleData.filter((s: any) => {
            const regDate = s?.registrationDate;
            const d = toRegistrationDateOnly(regDate);
            if (!d) return false;
            const isSameDay =
                d.getFullYear() === currentYear &&
                d.getMonth() === currentMonth &&
                d.getDate() === day;

            // Nếu có filter theo shiftType, chỉ lấy schedule có shiftTypeId khớp
            if (selectedShiftTypeId !== null) {
                const shiftTypeId = s?.shiftType?.id;
                return isSameDay && shiftTypeId === selectedShiftTypeId;
            }

            return isSameDay;
        });

        // Nếu đã chọn shiftType: group các ca giống nhau và đếm số người đăng ký
        if (selectedShiftTypeId !== null) {
            // Group theo detailShiftTypeId
            const detailShiftTypeMap = new Map<number, {
                detailShiftTypeName: string;
                startAt: string;
                endAt: string;
                employeeCount: number;
                employeeNames: string[];
                managerCount: number;
                userCount: number;
                otherCount: number;
            }>();

            daySchedules.forEach((s: any) => {
                const detailShiftType = s?.detailShiftType;
                const employee = s?.employee;
                if (!detailShiftType) return;

                const detailShiftTypeId = detailShiftType?.id;
                if (!detailShiftTypeId) return;

                if (!detailShiftTypeMap.has(detailShiftTypeId)) {
                    detailShiftTypeMap.set(detailShiftTypeId, {
                        detailShiftTypeName: detailShiftType?.name || "Chưa có tên",
                        startAt: detailShiftType?.startAt || "",
                        endAt: detailShiftType?.endAt || "",
                        employeeCount: 0,
                        employeeNames: [],
                        managerCount: 0,
                        userCount: 0,
                        otherCount: 0,
                    });
                }

                const item = detailShiftTypeMap.get(detailShiftTypeId)!;
                item.employeeCount += 1;
                if (employee?.name) {
                    item.employeeNames.push(employee.name);
                }

                // Ưu tiên đếm USER/MANAGER; còn lại cũng gom vào USER để không bị 0
                const roleName = (employee?.role?.name || employee?.role || "").toString().toUpperCase();
                if (roleName === "MANAGER") {
                    item.managerCount += 1;
                } else if (roleName === "USER") {
                    item.userCount += 1;
                } else {
                    item.userCount += 1;
                }
            });

            // Chuyển Map thành Array, bao gồm detailShiftTypeId
            const detailItems: Array<{
                detailShiftTypeName: string;
                detailShiftTypeId: number;
                startAt: string;
                endAt: string;
                employeeCount: number;
                employeeNames: string[];
                managerCount: number;
                userCount: number;
                otherCount: number;
                isDetail: boolean;
            }> = Array.from(detailShiftTypeMap.entries()).map(([detailShiftTypeId, item]) => ({
                ...item,
                detailShiftTypeId,
                isDetail: true,
            }));

            return detailItems.sort((a, b) => {
                // Sort theo startAt nếu có
                if (a.startAt && b.startAt) {
                    return a.startAt.localeCompare(b.startAt);
                }
                return a.detailShiftTypeName.localeCompare(b.detailShiftTypeName);
            });
        }

        // Nếu không chọn shiftType: group theo shiftType và đếm (logic cũ)
        const shiftTypeMap = new Map<string, Set<number>>();

        daySchedules.forEach((s: any) => {
            const shiftType = s?.shiftType;
            const detailShiftType = s?.detailShiftType;

            if (!shiftType || !detailShiftType) return;

            const shiftTypeName = shiftType?.name || "Chưa có tên";
            const detailShiftTypeId = detailShiftType?.id;

            if (!shiftTypeMap.has(shiftTypeName)) {
                shiftTypeMap.set(shiftTypeName, new Set());
            }

            if (detailShiftTypeId) {
                shiftTypeMap.get(shiftTypeName)!.add(detailShiftTypeId);
            }
        });

        // Chuyển Map thành Array và sort theo tên
        return Array.from(shiftTypeMap.entries())
            .map(([shiftTypeName, detailIds]) => {
                // Tìm shiftTypeId từ schedule đầu tiên có shiftTypeName này
                const firstSchedule = daySchedules.find((s: any) => {
                    const st = s?.shiftType;
                    return st?.name === shiftTypeName;
                });
                return {
                    shiftTypeName,
                    detailCount: detailIds.size,
                    shiftTypeId: firstSchedule?.shiftType?.id || 0,
                    isDetail: false,
                };
            })
            .sort((a, b) => a.shiftTypeName!.localeCompare(b.shiftTypeName!));
    };

    // Tính toán các ô lịch cho tháng hiện tại
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7; // Chuyển đổi CN = 0 sang T2 = 0
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    type CalendarCell = {
        key: string;
        label: number | "";
        isCurrentMonth: boolean;
        isToday: boolean;
    };

    const calendarCells: CalendarCell[] = [];

    // Các ô trống (trước ngày 1)
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
                        Chỉ ADMIN và MANAGER mới có quyền xem quản lý ca đăng ký lịch làm việc.
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
                        Quản lý ca đăng ký lịch làm việc
                    </h1>
                    <p className="text-[#616f89] dark:text-[#9ca3af] text-base">
                        Xem số lượng ca đăng ký theo từng ngày trong tháng.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {isAdmin && (
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-[#616f89] dark:text-[#9ca3af]">Supplier:</label>
                            <select
                                value={selectedSupplierId || (suppliers.length > 0 ? suppliers[0].id : "")}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    setSelectedSupplierId(value);
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

            <div className="bg-white dark:bg-[#1a2230] border border-[#dbdfe6] dark:border-[#2e374a] rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#dbdfe6] dark:border-[#2e374a]">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-bold text-[#111318] dark:text-white">
                                {monthLabel}, {currentYear}
                            </h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-100 border border-blue-500"></span>
                            <span className="text-[#616f89] dark:text-[#9ca3af]">Có ca đăng ký</span>
                        </div>
                        {Array.isArray(shiftTypeData) && shiftTypeData.length > 0 && (() => {
                            // Gộp các shiftType trùng lặp (cùng shiftTypeId) thành 1
                            const uniqueShiftTypes = new Map<number, { id: number; name: string }>();

                            shiftTypeData.forEach((item: any) => {
                                const shiftType = item?.shiftType;
                                if (!shiftType) return;
                                const shiftTypeId = shiftType?.id;
                                const shiftTypeName = shiftType?.name || "Chưa có tên";

                                // Chỉ lưu shiftType đầu tiên cho mỗi shiftTypeId
                                if (!uniqueShiftTypes.has(shiftTypeId)) {
                                    uniqueShiftTypes.set(shiftTypeId, {
                                        id: shiftTypeId,
                                        name: shiftTypeName,
                                    });
                                }
                            });

                            const uniqueShiftTypesArray = Array.from(uniqueShiftTypes.values());

                            return (
                                <div className="flex items-center gap-2 flex-wrap">
                                    {uniqueShiftTypesArray.map((shiftType) => {
                                        const isSelected = selectedShiftTypeId === shiftType.id;

                                        return (
                                            <button
                                                key={shiftType.id}
                                                onClick={() => setSelectedShiftTypeId(shiftType.id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isSelected
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-white dark:bg-[#111827] border border-[#dbdfe6] dark:border-[#4b5563] text-[#111318] dark:text-white hover:bg-gray-50 dark:hover:bg-[#1f2937]"
                                                    }`}
                                            >
                                                {shiftType.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })()}
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

                {loading ? (
                    <div className="p-8 text-center">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-4xl animate-spin">
                            sync
                        </span>
                        <p className="text-[#616f89] dark:text-[#9ca3af] mt-4">Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-7 auto-rows-fr bg-[#f0f2f4] dark:bg-[#1a2230] gap-px border-b border-[#dbdfe6] dark:border-[#2e374a]">
                        {calendarCells.map((cell) => {
                            const scheduleInfo = cell.isCurrentMonth && typeof cell.label === "number"
                                ? getScheduleInfoForDay(cell.label)
                                : [];

                            return (
                                <div
                                    key={cell.key}
                                    className={`min-h-[120px] p-2 transition-colors relative overflow-y-auto
                                        ${cell.isCurrentMonth
                                            ? "bg-white dark:bg-[#1a2230]"
                                            : "opacity-40 bg-gray-100 dark:bg-[#111827]"
                                        }
                                        ${cell.isToday
                                            ? "bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-900/30 dark:via-indigo-900/20 dark:to-blue-900/30 ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-1 shadow-md"
                                            : ""
                                        }`}
                                >
                                    {cell.label !== "" && (
                                        <div className="flex flex-col gap-1">
                                            {cell.isToday ? (
                                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white text-sm font-extrabold shadow-lg ring-2 ring-blue-300 dark:ring-blue-500">
                                                    {cell.label}
                                                </span>
                                            ) : (
                                                <span className="text-sm font-bold text-[#111318] dark:text-white">
                                                    {cell.label}
                                                </span>
                                            )}

                                            {cell.isCurrentMonth && typeof cell.label === "number" && (
                                                (() => {
                                                    const targetDate = new Date(currentYear, currentMonth, cell.label as number);
                                                    const hasActiveShiftType = shiftTypeData.some((st: any) =>
                                                        isShiftTypeActiveOnDate(st, targetDate)
                                                    );

                                                    if (scheduleInfo.length > 0) {
                                                        return (
                                                            <div className="mt-1 flex flex-col gap-1 max-h-[90px] overflow-y-auto">
                                                                {scheduleInfo.map((info, idx) => {
                                                                    // Nếu đã chọn shiftType: hiển thị chi tiết từng ca với số lượng người đăng ký
                                                                    if (info.isDetail && info.detailShiftTypeId) {
                                                                        const employeeCount = info.employeeCount || 0;
                                                                        const employeeNames = info.employeeNames || [];
                                                                        let managerCount = info.managerCount || 0;
                                                                        let userCount = info.userCount || 0;
                                                                        const otherCount = info.otherCount || 0;
                                                                        // Nếu cả USER và MANAGER đều 0 nhưng có người, gán toàn bộ vào USER
                                                                        if (employeeCount > 0 && managerCount === 0 && userCount === 0) {
                                                                            userCount = employeeCount;
                                                                        }
                                                                        const roleSummary = [
                                                                            managerCount ? `MANAGER: ${managerCount}` : "",
                                                                            userCount ? `USER: ${userCount}` : "",
                                                                            otherCount ? `OTHER: ${otherCount}` : "",
                                                                        ].filter(Boolean).join("\n");
                                                                        const tooltipText = employeeNames.length > 0
                                                                            ? `${info.detailShiftTypeName} (${info.startAt} - ${info.endAt})\nTổng: ${employeeCount}\n${roleSummary ? `${roleSummary}\n` : ""}Danh sách: ${employeeNames.join(", ")}\n\nClick để xem chi tiết`
                                                                            : `${info.detailShiftTypeName} (${info.startAt} - ${info.endAt})\nTổng: ${employeeCount}\n${roleSummary ? `${roleSummary}\n` : ""}\nClick để xem chi tiết`;

                                                                        return (
                                                                            <div
                                                                                key={idx}
                                                                                onClick={() => handleShiftClick(
                                                                                    cell.label as number,
                                                                                    info.detailShiftTypeName || "",
                                                                                    info.startAt || "",
                                                                                    info.endAt || "",
                                                                                    info.detailShiftTypeId!
                                                                                )}
                                                                                className="text-[9px] px-1.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                                                                title={tooltipText}
                                                                            >
                                                                                <div className="flex items-center justify-between gap-1">
                                                                                    <div className="font-semibold truncate flex-1">{info.detailShiftTypeName}</div>
                                                                                    {employeeCount > 0 && (
                                                                                        <div className="flex items-center gap-1 whitespace-nowrap">
                                                                                            <span className="text-[8px] font-semibold text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">
                                                                                                USER: {userCount}
                                                                                            </span>
                                                                                            <span className="text-[8px] font-semibold text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.5 rounded">
                                                                                                MANAGER: {managerCount}
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                {info.startAt && info.endAt && (
                                                                                    <div className="text-[8px] text-blue-600 dark:text-blue-300 mt-0.5">
                                                                                        {info.startAt} - {info.endAt}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    }

                                                                    // Nếu không chọn shiftType: hiển thị tổng hợp như cũ
                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700 text-center"
                                                                            title={`${info.shiftTypeName}: ${info.detailCount} ca chi tiết`}
                                                                        >
                                                                            <span className="font-semibold">{info.shiftTypeName}</span>
                                                                            <span className="text-[9px]">: {info.detailCount} ca</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        );
                                                    }

                                                    // Không có scheduleInfo
                                                    if (!hasActiveShiftType) {
                                                        const startDatePrefill = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(cell.label).padStart(2, "0")}`;
                                                        return (
                                                            <button
                                                                type="button"
                                                                onClick={() => navigate(`/ScheduleManagement/CreateShiftTypeSupplier?startDate=${startDatePrefill}`)}
                                                                className="mt-2 inline-flex items-center gap-1 rounded-full border border-blue-200 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-900/30 px-2.5 py-1 text-[11px] font-medium text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                                                            >
                                                                <span className="material-symbols-outlined text-[14px]">
                                                                    add_circle
                                                                </span>
                                                                <span>Chưa đăng ký loại ca · Bấm để bổ sung</span>
                                                            </button>
                                                        );
                                                    }

                                                    // Có loại ca hiệu lực nhưng chưa có đăng ký
                                                    return (
                                                        <div className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 italic">
                                                            Chưa có người đăng ký ca
                                                        </div>
                                                    );
                                                })()
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

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

            {employeeListModal.show && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={() => setEmployeeListModal({ ...employeeListModal, show: false })}>
                    <div className="bg-white dark:bg-[#111827] rounded-lg shadow-xl max-w-md w-full p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">people</span>
                                <div>
                                    <h4 className="text-lg font-semibold text-[#111318] dark:text-white">Danh sách nhân viên</h4>
                                    <p className="text-sm text-[#616f89] dark:text-[#9ca3af]">
                                        Ngày {employeeListModal.day} - {employeeListModal.detailShiftTypeName}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEmployeeListModal({ ...employeeListModal, show: false })}
                                className="text-[#616f89] dark:text-[#9ca3af] hover:text-[#111318] dark:hover:text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="border border-[#dbdfe6] dark:border-[#4b5563] rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">schedule</span>
                                <span className="text-sm font-medium text-[#111318] dark:text-white">
                                    {employeeListModal.startAt} - {employeeListModal.endAt}
                                </span>
                            </div>
                            {(() => {
                                const userCount = employeeListModal.employees.filter(e => (e.roleName || "").toUpperCase() === "USER").length;
                                const managerCount = employeeListModal.employees.filter(e => (e.roleName || "").toUpperCase() === "MANAGER").length;
                                const total = employeeListModal.employees.length;
                                return (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">person</span>
                                            <span className="text-sm text-[#111318] dark:text-white">
                                                Tổng số: {total} người
                                            </span>
                                        </div>
                                        <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                                            USER: {userCount}
                                        </span>
                                        <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                                            MANAGER: {managerCount}
                                        </span>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="border border-[#dbdfe6] dark:border-[#4b5563] rounded-lg max-h-[400px] overflow-y-auto">
                            {employeeListModal.employees.length > 0 ? (
                                <div className="divide-y divide-[#dbdfe6] dark:divide-[#4b5563]">
                                    {employeeListModal.employees.map((employee, idx) => (
                                        <div key={idx} className="p-3 hover:bg-gray-50 dark:hover:bg-[#1f2937] transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">person</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="font-medium text-[#111318] dark:text-white">
                                                            {employee.name}
                                                        </div>
                                                        {employee.roleName && (
                                                            <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-200">
                                                                {employee.roleName}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {employee.phone && (
                                                        <div className="text-xs text-[#616f89] dark:text-[#9ca3af] mt-0.5">
                                                            {employee.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-[#616f89] dark:text-[#9ca3af]">
                                    <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                                    <p>Không có nhân viên nào đăng ký ca này</p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                                onClick={() => setEmployeeListModal({ ...employeeListModal, show: false })}
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

export default ScheduleManagement;

