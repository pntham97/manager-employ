import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { scheduleApi } from "../api/schedule.api";
import { shiftTypeSupplierApi } from "../api/shiftTypeSupplier.api";
import { employeeApi, type EmployeeResponse } from "../api/employee.api";

interface RegisterDetail {
    id: number;
    name: string;
    startAt: string;
    endAt: string;
    registeredEmployeeNames: string[];
}
const ScheduleManagement = () => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(
        () => new Date(today.getFullYear(), today.getMonth(), 1)
    );
    const [scheduleData, setScheduleData] = useState<any[]>([]);
    const [shiftTypeData, setShiftTypeData] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<Array<{ id: number; name: string; status: boolean }>>([]);
    const [maxDetailShiftCount, setMaxDetailShiftCount] = useState<number>(0);
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
        detailShiftTypeId: number | null;
        employees: Array<{ employeeId?: number; name: string; phone?: string; positionId?: number; roleName?: string }>;
    }>({
        show: false,
        day: 0,
        detailShiftTypeName: "",
        startAt: "",
        endAt: "",
        detailShiftTypeId: null,
        employees: [],
    });
    const [newEmployeeId, setNewEmployeeId] = useState<number | null>(null);
    const [availableEmployees, setAvailableEmployees] = useState<Array<{ id: number; name: string }>>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [pendingCreateEmployee, setPendingCreateEmployee] = useState(false);
    const [registerModal, setRegisterModal] = useState<{
        show: boolean;
        day: number;
        details: RegisterDetail[]; // 🔥 DÙNG TYPE MỚI
        selectedDetailId: number | null;
        employees: { id: number; name: string }[];
        filteredEmployees: { id: number; name: string }[];
        selectedEmployeeId: number | null;
    }>({
        show: false,
        day: 0,
        details: [],
        selectedDetailId: null,
        employees: [],
        filteredEmployees: [],
        selectedEmployeeId: null,
    });

    const currentMonth = currentDate.getMonth(); // 0-11
    const currentYear = currentDate.getFullYear();
    const inactivityTimeoutRef = useRef<number | null>(null);
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
    const loadScheduleData = useCallback(async () => {
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
    }, [hasPermission, currentMonth, currentYear, isAdmin, selectedSupplierId]);

    // Load danh sách shiftType
    const loadShiftTypeData = useCallback(async () => {
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
    }, [hasPermission, currentMonth, currentYear, isAdmin, selectedSupplierId]);

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
    }, [currentMonth, currentYear, selectedSupplierId, hasPermission, loadScheduleData, loadShiftTypeData]);

    // Auto reload dữ liệu sau 5 phút không có tương tác
    useEffect(() => {
        if (!hasPermission) return;
        const INACTIVITY_MS = 5 * 60 * 1000;

        const resetInactivityTimer = () => {
            if (inactivityTimeoutRef.current !== null) {
                window.clearTimeout(inactivityTimeoutRef.current);
            }
            inactivityTimeoutRef.current = window.setTimeout(() => {
                loadScheduleData();
                loadShiftTypeData();
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
    }, [hasPermission, loadScheduleData, loadShiftTypeData]);

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

    // Helper: build registrationDate ISO string từ day trong tháng hiện tại
    const buildRegistrationDate = (day: number) => {
        const d = new Date(currentYear, currentMonth, day, 0, 0, 0);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const date = String(d.getDate()).padStart(2, "0");
        const hour = String(d.getHours()).padStart(2, "0");
        const minute = String(d.getMinutes()).padStart(2, "0");
        const second = String(d.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${date}T${hour}:${minute}:${second}`;
    };

    // Helper: kiểm tra 1 day có là quá khứ so với hôm nay không
    const isPastDate = (day: number) => {
        const target = new Date(currentYear, currentMonth, day);
        const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const targetOnly = new Date(target.getFullYear(), target.getMonth(), target.getDate());
        return targetOnly < todayOnly;
    };

    const openRegisterModalForDay = async (day: number, scheduleInfo: any[]) => {
        if (selectedShiftTypeId === null) {
            window.alert("Vui lòng chọn loại ca ở phía trên trước khi đăng ký ca.");
            return;
        }

        /* =======================
           Xác định supplierId
        ======================= */
        let supplierIdForApi: number | undefined;

        if (isAdmin) {
            if (!selectedSupplierId) {
                window.alert("Vui lòng chọn Supplier trước khi đăng ký ca.");
                return;
            }
            supplierIdForApi = selectedSupplierId;
        } else {
            const employeeStr = localStorage.getItem("employee");
            if (!employeeStr) {
                window.alert("Không tìm thấy thông tin employee.");
                return;
            }
            supplierIdForApi = JSON.parse(employeeStr)?.supplierId;
        }

        if (!supplierIdForApi) {
            window.alert("Không xác định được supplierId.");
            return;
        }

        try {
            /* =======================
               Load danh sách nhân viên
            ======================= */
            const res = await employeeApi.getList(0, 1000, undefined, supplierIdForApi);
            const pageData = res.data?.data ?? res.data;
            const employeeContent = pageData?.content ?? pageData ?? [];

            const employees = employeeContent as EmployeeResponse[];

            const modalEmployees = employees.map(e => ({
                id: e.employeeId,
                name: e.name,
            }));

            /* =======================
               Build danh sách CA KHẢ DỤNG
            ======================= */
            const availableDetails: RegisterDetail[] = [];

            shiftTypeData.forEach((item: any) => {
                const shiftType = item?.shiftType;
                if (!shiftType) return;
                if (shiftType.id !== selectedShiftTypeId) return;
                if (!isShiftTypeActiveOnDate(item, new Date(buildRegistrationDate(day)))) return;

                const list = shiftType.listDetailShiftType ?? [];

                list.forEach((d: any) => {
                    if (!availableDetails.some(x => x.id === d.id)) {
                        availableDetails.push({
                            id: d.id,
                            name: d.name,
                            startAt: d.startAt,
                            endAt: d.endAt,
                            registeredEmployeeNames: [],
                        });
                    }
                });
            });

            if (availableDetails.length === 0) {
                window.alert("Không tìm thấy ca chi tiết khả dụng.");
                return;
            }

            /* =======================
               Gắn nhân viên đã đăng ký từ scheduleInfo
            ======================= */
            availableDetails.forEach(detail => {
                const matched = scheduleInfo.find(
                    s => s?.isDetail && s.detailShiftTypeId === detail.id
                );

                detail.registeredEmployeeNames = (matched?.employeeNames || []).map(
                    (n: string) => n.trim().toLowerCase()
                );
            });

            /* =======================
               Filter cho ca đầu tiên
            ======================= */
            const firstDetail = availableDetails[0];

            const filteredEmployees = modalEmployees.filter(
                e => !firstDetail.registeredEmployeeNames.includes(
                    e.name.trim().toLowerCase()
                )
            );

            /* =======================
               Open modal
            ======================= */
            setRegisterModal({
                show: true,
                day,
                details: availableDetails,
                selectedDetailId: firstDetail.id,
                employees: modalEmployees,
                filteredEmployees,
                selectedEmployeeId: null,
            });

        } catch (err) {
            console.error(err);
            window.alert("Không thể tải danh sách nhân viên.");
        }
    };


    // Hàm lấy danh sách nhân viên đã đăng ký một ca cụ thể
    const getEmployeesForShift = (day: number, detailShiftTypeId: number): Array<{ employeeId?: number; name: string; phone?: string; positionId?: number; roleName?: string }> => {
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
            // NOTE: Chỉ check nếu s.shiftType tồn tại, để tránh trường hợp schedule data thiếu thông tin shiftType
            if (selectedShiftTypeId !== null) {
                const shiftTypeId = s?.shiftType?.id;
                if (shiftTypeId) {
                    return isSameDay && isSameDetailShift && shiftTypeId === selectedShiftTypeId;
                }
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

                // Lấy employeeId từ nhiều nguồn có thể
                const rawEmployeeId = employee?.employeeId ?? employee?.id ?? s?.employeeId ?? s?.employee?.id;
                const employeeId = rawEmployeeId ? Number(rawEmployeeId) : undefined;

                return {
                    employeeId: employeeId,
                    name: employee?.name || "Chưa có tên",
                    phone: employee?.phone,
                    positionId: employee?.positionId,
                    roleName,
                };
            })
            .filter((emp: any) => emp !== null) as Array<{ employeeId?: number; name: string; phone?: string; positionId?: number; roleName?: string }>;
    };

    // Hàm xử lý click vào ca để hiển thị danh sách nhân viên
    const handleShiftClick = async (
        day: number,
        detailShiftTypeName: string,
        startAt: string,
        endAt: string,
        detailShiftTypeId: number
    ) => {
        const employeesInShift = getEmployeesForShift(day, detailShiftTypeId);
        setEmployeeListModal({
            show: true,
            day,
            detailShiftTypeName,
            startAt,
            endAt,
            detailShiftTypeId,
            employees: employeesInShift,
        });

        // Reset danh sách nhân viên khả dụng & lựa chọn hiện tại
        setAvailableEmployees([]);
        setNewEmployeeId(null);

        // Xác định supplierId dùng cho API lấy danh sách nhân viên (GET /employee/list)
        let supplierIdForApi: number | undefined = undefined;
        if (isAdmin) {
            if (!selectedSupplierId) {
                window.alert("Vui lòng chọn supplier trước khi xem danh sách nhân viên.");
                return;
            }
            supplierIdForApi = selectedSupplierId;
        } else {
            const employeeStr = localStorage.getItem("employee");
            if (!employeeStr) {
                console.warn("Không tìm thấy thông tin employee trong localStorage khi mở modal danh sách nhân viên.");
                return;
            }
            try {
                const employee = JSON.parse(employeeStr);
                supplierIdForApi = employee?.supplierId;
            } catch {
                console.warn("Lỗi đọc thông tin employee từ localStorage khi mở modal danh sách nhân viên.");
                return;
            }
        }

        if (!supplierIdForApi) {
            return;
        }

        try {
            setLoadingEmployees(true);
            const res = await employeeApi.getList(0, 1000, undefined, supplierIdForApi);
            const pageData = res.data?.data ?? res.data;
            const employeeContent = pageData?.content ?? pageData ?? [];
            const employees = (Array.isArray(employeeContent) ? employeeContent : []) as EmployeeResponse[];

            const mapped = employees.map((e) => ({
                id: e.employeeId,
                name: e.name,
            }));

            // Loại bỏ những nhân viên đã đăng ký ca này khỏi danh sách
            // Tạo Set chứa employeeId đã đăng ký
            const registeredEmployeeIds = new Set(
                employeesInShift
                    .map((emp) => emp.employeeId)
                    .filter((id): id is number => id !== undefined && id !== null)
            );

            // Tạo Set chứa tên nhân viên đã đăng ký (fallback nếu không có employeeId)
            const registeredEmployeeNames = new Set(
                employeesInShift
                    .map((emp) => emp.name?.toLowerCase().trim())
                    .filter((name): name is string => !!name)
            );

            // Filter: loại bỏ nếu có employeeId khớp HOẶC tên khớp
            const filteredMapped = mapped.filter((emp) => {
                // Nếu có employeeId trong danh sách đã đăng ký → loại bỏ
                if (registeredEmployeeIds.has(emp.id)) {
                    return false;
                }
                // Nếu tên khớp với nhân viên đã đăng ký → loại bỏ (fallback)
                if (registeredEmployeeNames.has(emp.name?.toLowerCase().trim() || "")) {
                    return false;
                }
                return true;
            });

            // Debug log
            console.log("🔍 [DEBUG] Filter employees:", {
                totalEmployees: mapped.length,
                registeredCount: employeesInShift.length,
                registeredIds: Array.from(registeredEmployeeIds),
                registeredNames: Array.from(registeredEmployeeNames),
                filteredCount: filteredMapped.length,
            });

            setAvailableEmployees(filteredMapped);

            // Mặc định chọn nhân viên đầu tiên nếu chưa chọn
            if (filteredMapped.length > 0) {
                setNewEmployeeId((prev) => prev ?? filteredMapped[0].id);
            } else {
                setNewEmployeeId(null);
            }
        } catch (error: any) {
            console.error(
                "Lỗi khi tải danh sách nhân viên (GET /employee/list) cho modal danh sách nhân viên:",
                error?.response?.data || error?.message
            );
            window.alert("Không thể tải danh sách nhân viên. Vui lòng thử lại.");
        } finally {
            setLoadingEmployees(false);
        }
    };

    // Đăng ký ca cho nhân viên từ modal danh sách nhân viên
    const handleCreateScheduleForEmployee = async () => {
        if (!employeeListModal.show || !employeeListModal.day || !employeeListModal.detailShiftTypeId) return;
        if (!newEmployeeId) {
            window.alert("Vui lòng nhập ID nhân viên cần đăng ký ca.");
            return;
        }

        const employeeIdNum = newEmployeeId;
        if (!employeeIdNum || employeeIdNum <= 0) {
            window.alert("ID nhân viên không hợp lệ.");
            return;
        }

        // Xác định supplierId dùng cho API
        let supplierIdForApi: number | undefined = undefined;
        if (isAdmin) {
            if (!selectedSupplierId) {
                window.alert("Vui lòng chọn supplier trước khi đăng ký ca cho nhân viên.");
                return;
            }
            supplierIdForApi = selectedSupplierId;
        } else {
            // MANAGER: lấy supplierId từ localStorage.employee giống như Calendar
            const employeeStr = localStorage.getItem("employee");
            if (!employeeStr) {
                window.alert("Không tìm thấy thông tin employee trong localStorage.");
                return;
            }
            try {
                const employee = JSON.parse(employeeStr);
                supplierIdForApi = employee?.supplierId;
            } catch {
                window.alert("Lỗi đọc thông tin employee từ localStorage.");
                return;
            }
        }

        if (!supplierIdForApi) {
            window.alert("Không xác định được supplierId để đăng ký ca.");
            return;
        }

        const registrationDate = buildRegistrationDate(employeeListModal.day);
        const payload: any = {
            supplierId: supplierIdForApi,
            detailShiftTypeId: employeeListModal.detailShiftTypeId,
            registrationDate,
            employeeId: employeeIdNum,
        };

        // Nếu là ngày quá khứ, thêm dateRequest để backend xử lý như bổ sung ca
        if (isPastDate(employeeListModal.day)) {
            payload.dateRequest = registrationDate;
        }

        const ok = window.confirm(
            `Bạn có chắc muốn đăng ký ca "${employeeListModal.detailShiftTypeName}" ngày ${employeeListModal.day} cho nhân viên ID=${employeeIdNum}?`
        );
        if (!ok) return;

        try {
            setPendingCreateEmployee(true);
            const res = await scheduleApi.create(payload);
            console.log("Đăng ký ca thành công từ màn quản lý:", res.data);

            // Reload lại dữ liệu lịch
            await loadScheduleData();

            window.alert("Đăng ký ca cho nhân viên thành công.");
            setNewEmployeeId(null);
        } catch (error: any) {
            console.error("Lỗi khi đăng ký ca từ màn quản lý:", error?.response?.data || error?.message);
            const msg = error?.response?.data?.message || error?.message || "Đã xảy ra lỗi khi đăng ký ca.";
            window.alert(msg);
        } finally {
            setPendingCreateEmployee(false);
        }
    };

    // Xóa ca đăng ký cho một nhân viên cụ thể từ modal danh sách nhân viên
    const handleDeleteScheduleForEmployee = async (employeeName: string) => {
        if (!employeeListModal.show || !employeeListModal.day || !employeeListModal.detailShiftTypeId) return;

        const ok = window.confirm(
            `Bạn có chắc muốn xóa ca "${employeeListModal.detailShiftTypeName}" cho nhân viên "${employeeName}" ngày ${employeeListModal.day}?`
        );
        if (!ok) return;

        try {
            // Tìm schedule phù hợp theo ngày, detailShiftTypeId và tên nhân viên
            const target = scheduleData.find((s: any) => {
                const regDate = s?.registrationDate;
                const d = toRegistrationDateOnly(regDate);
                if (!d) return false;
                const isSameDay =
                    d.getFullYear() === currentYear &&
                    d.getMonth() === currentMonth &&
                    d.getDate() === employeeListModal.day;

                const detailShiftTypeId = s?.detailShiftType?.id;
                const empName = s?.employee?.name;

                return (
                    isSameDay &&
                    detailShiftTypeId === employeeListModal.detailShiftTypeId &&
                    empName === employeeName
                );
            });

            if (!target?.id) {
                window.alert("Không tìm thấy bản ghi ca làm để xóa cho nhân viên này.");
                return;
            }

            await scheduleApi.delete(target.id);

            // Reload lại dữ liệu sau khi xóa
            await loadScheduleData();

            // Cập nhật lại danh sách nhân viên trong modal (loại bỏ nhân viên vừa xóa)
            setEmployeeListModal((prev) => ({
                ...prev,
                employees: prev.employees.filter((e) => e.name !== employeeName),
            }));
        } catch (error: any) {
            console.error("Lỗi khi xóa ca từ màn quản lý:", error?.response?.data || error?.message);
            window.alert("Đã xảy ra lỗi khi xóa ca. Vui lòng thử lại.");
        }
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

                // Ưu tiên roleName (backend), sau đó role.name/role và chuẩn hóa uppercase
                const rawRoleName = employee?.roleName ?? employee?.role?.name ?? employee?.role ?? "";
                const roleName = rawRoleName ? String(rawRoleName).toUpperCase() : "";

                if (roleName === "MANAGER") {
                    item.managerCount += 1;
                } else if (roleName === "USER") {
                    item.userCount += 1;
                } else {
                    // Vai trò khác: vẫn cộng vào userCount để tránh 0 và lưu lại otherCount
                    item.otherCount += 1;
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

            </div>

            <div className="bg-white dark:bg-[#1a2230] border border-[#dbdfe6] dark:border-[#2e374a] rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#dbdfe6] dark:border-[#2e374a]">

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
                                                onClick={() => {
                                                    setSelectedShiftTypeId(shiftType.id);

                                                    // SET SỐ CA TỐI ĐA TẠI ĐÂY
                                                    if (shiftType.name === "3 CA") {
                                                        setMaxDetailShiftCount(3);
                                                    } else if (shiftType.name === "4 CA") {
                                                        setMaxDetailShiftCount(4);
                                                    } else {
                                                        // Nghỉ phép hoặc loại khác
                                                        setMaxDetailShiftCount(0);
                                                    }
                                                }}
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

                            // Kiểm tra xem tháng/năm hiện tại có loại ca nào khác ngoài "Nghỉ phép" không
                            const hasOtherShiftTypes = shiftTypeData.some((st: any) => {
                                const shiftType = st?.shiftType;
                                if (!shiftType) return false;
                                const shiftTypeName = shiftType?.name || "";
                                // Loại trừ "Nghỉ phép"
                                return shiftTypeName.toLowerCase() !== "nghỉ phép";
                            });

                            console.log(shiftTypeData, "hasOtherShiftTypes");

                            return (
                                <div
                                    key={cell.key}
                                    className={`min-h-[230px] p-2 transition-colors relative overflow-y-auto
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
                                                    // Kiểm tra loại ca hiệu lực (loại trừ "Nghỉ phép")
                                                    const hasActiveShiftType = shiftTypeData.some((st: any) => {
                                                        const shiftType = st?.shiftType;
                                                        if (!shiftType) return false;
                                                        const shiftTypeName = shiftType?.name || "";
                                                        // Loại trừ "Nghỉ phép"
                                                        if (shiftTypeName.toLowerCase() === "nghỉ phép") return false;
                                                        return isShiftTypeActiveOnDate(st, targetDate);
                                                    });

                                                    // Nếu tháng/năm hiện tại không có loại ca nào khác ngoài "Nghỉ phép", hiển thị thông báo
                                                    if (!hasOtherShiftTypes) {
                                                        const startDatePrefill = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(cell.label).padStart(2, "0")}`;
                                                        return (
                                                            <button
                                                                type="button"
                                                                onClick={() => navigate(`/ScheduleManagement/CreateShiftTypeSupplier?startDate=${startDatePrefill}`)}
                                                                className="mt-2 max-w-full inline-flex items-center justify-center gap-1 rounded-md
               border border-amber-300 dark:border-amber-600
               bg-gradient-to-r from-amber-50 to-yellow-50
               dark:from-amber-900/40 dark:to-yellow-900/30
               px-2 py-1 text-[10px] font-medium
               text-amber-700 dark:text-amber-200
               shadow-sm hover:shadow-md
               hover:from-amber-100 hover:to-yellow-100
               dark:hover:from-amber-800/50 dark:hover:to-yellow-800/40
               hover:border-amber-400 dark:hover:border-amber-500
               transition-all duration-200 active:scale-95 overflow-hidden"
                                                            >
                                                                <span className="material-symbols-outlined text-[13px] flex-shrink-0">
                                                                    add_circle
                                                                </span>
                                                                <span className="truncate leading-tight">Chưa đăng ký loại ca · Bấm để bổ sung</span>
                                                            </button>
                                                        );
                                                    }

                                                    if (scheduleInfo.length > 0) {
                                                        const currentDetailShiftCount = scheduleInfo.filter(
                                                            (info: any) => info?.isDetail && info?.detailShiftTypeId
                                                        ).length;
                                                        const canRegisterMore =
                                                            hasActiveShiftType &&
                                                            maxDetailShiftCount > 0 &&
                                                            currentDetailShiftCount < maxDetailShiftCount;
                                                        return (
                                                            <div className="mt-1 flex flex-col gap-1">
                                                                <div className="max-h-[180px] overflow-y-auto flex flex-col gap-1">
                                                                    {scheduleInfo.map((info, idx) => {
                                                                        // Define styles for up to 4 shifts
                                                                        const shiftStyles = [
                                                                            {
                                                                                container: "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50",
                                                                                badge: "text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/40",
                                                                                time: "text-blue-600 dark:text-blue-300"
                                                                            },
                                                                            {
                                                                                container: "bg-green-50 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/50",
                                                                                badge: "text-green-800 dark:text-green-200 bg-green-100 dark:bg-green-900/40",
                                                                                time: "text-green-600 dark:text-green-300"
                                                                            },
                                                                            {
                                                                                container: "bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/50",
                                                                                badge: "text-orange-800 dark:text-orange-200 bg-orange-100 dark:bg-orange-900/40",
                                                                                time: "text-orange-600 dark:text-orange-300"
                                                                            },
                                                                            {
                                                                                container: "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/50",
                                                                                badge: "text-purple-800 dark:text-purple-200 bg-purple-100 dark:bg-purple-900/40",
                                                                                time: "text-purple-600 dark:text-purple-300"
                                                                            }
                                                                        ];

                                                                        const style = shiftStyles[idx % shiftStyles.length];

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
                                                                                    className={`text-[9px] px-1.5 py-1 rounded border cursor-pointer transition-colors ${style.container}`}
                                                                                    title={tooltipText}
                                                                                >
                                                                                    <div className="flex items-center justify-between gap-1">
                                                                                        <div className="font-semibold truncate flex-1">{info.detailShiftTypeName}</div>
                                                                                        {employeeCount > 0 && (
                                                                                            <div className="flex items-center gap-1 whitespace-nowrap">
                                                                                                <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded ${style.badge}`}>
                                                                                                    USER: {userCount}
                                                                                                </span>
                                                                                                <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded ${style.badge}`}>
                                                                                                    MANAGER: {managerCount}
                                                                                                </span>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    {info.startAt && info.endAt && (
                                                                                        <div className={`text-[8px] mt-0.5 ${style.time}`}>
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
                                                                                className={`text-[10px] px-1.5 py-0.5 rounded border text-center ${style.container}`}
                                                                                title={`${info.shiftTypeName}: ${info.detailCount} ca chi tiết`}
                                                                            >
                                                                                <span className="font-semibold">{info.shiftTypeName}</span>
                                                                                <span className="text-[9px]">: {info.detailCount} ca</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                                {/* Nút đăng ký thêm ca - hiển thị ngay cả khi đã có ca đăng ký */}
                                                                {canRegisterMore && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openRegisterModalForDay(cell.label as number, scheduleInfo as any)}
                                                                        className="mt-1 max-w-full inline-flex items-center justify-center gap-1 rounded-md border border-blue-300 dark:border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/30 px-2 py-1 text-[10px] font-medium text-blue-700 dark:text-blue-200 shadow-sm hover:shadow-md hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/50 dark:hover:to-indigo-800/40 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 active:scale-95 overflow-hidden"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[13px] flex-shrink-0">
                                                                            add_circle
                                                                        </span>
                                                                        <span className="truncate leading-tight">Đăng ký thêm ca</span>
                                                                    </button>
                                                                )}
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
                                                                className="mt-2 max-w-full inline-flex items-center justify-center gap-1 rounded-md border border-blue-300 dark:border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/30 px-2 py-1 text-[10px] font-medium text-blue-700 dark:text-blue-200 shadow-sm hover:shadow-md hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/50 dark:hover:to-indigo-800/40 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 active:scale-95 overflow-hidden"
                                                            >
                                                                <span className="material-symbols-outlined text-[13px] flex-shrink-0">
                                                                    add_circle
                                                                </span>
                                                                <span className="truncate leading-tight">Chưa đăng ký loại ca · Bấm để bổ sung</span>
                                                            </button>
                                                        );
                                                    }

                                                    // Có loại ca hiệu lực nhưng chưa có đăng ký
                                                    return (
                                                        <button
                                                            type="button"
                                                            onClick={() => openRegisterModalForDay(cell.label as number, scheduleInfo as any)}
                                                            className="mt-2 max-w-full inline-flex items-center justify-center gap-1 rounded-md border border-blue-300 dark:border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/30 px-2 py-1 text-[10px] font-medium text-blue-700 dark:text-blue-200 shadow-sm hover:shadow-md hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/50 dark:hover:to-indigo-800/40 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 active:scale-95 overflow-hidden"
                                                        >
                                                            <span className="material-symbols-outlined text-[13px] flex-shrink-0">
                                                                add_circle
                                                            </span>
                                                            <span className="truncate leading-tight">Chưa có người đăng ký ca · Đăng ký ca</span>
                                                        </button>
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
                                                        <div className="flex items-center gap-2">
                                                            {employee.roleName && (
                                                                <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:text-blue-200">
                                                                    {employee.roleName}
                                                                </span>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteScheduleForEmployee(employee.name)}
                                                                className="inline-flex items-center px-2 py-0.5 rounded-md border border-red-200 dark:border-red-500 text-[11px] text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors"
                                                            >
                                                                <span className="material-symbols-outlined text-[14px] mr-0.5">delete</span>
                                                                Xóa ca
                                                            </button>
                                                        </div>
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
                        <div className="mt-4 flex flex-col gap-3">
                            <div className="border-t border-[#dbdfe6] dark:border-[#4b5563] pt-3">
                                <h5 className="text-sm font-semibold text-[#111318] dark:text-white mb-2">
                                    Đăng ký thêm ca cho nhân viên
                                </h5>
                                <p className="text-xs text-[#616f89] dark:text-[#9ca3af] mb-2">
                                    Chọn <strong>nhân viên</strong> từ danh sách để đăng ký ca này cho họ. Chỉ ADMIN hoặc MANAGER đúng
                                    supplier mới có quyền.
                                </p>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <select
                                            className="flex-1 px-3 py-2 border border-[#dbdfe6] dark:border-[#4b5563] rounded-lg bg-white dark:bg-[#111827] text-sm text-[#111318] dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            value={newEmployeeId ?? ""}
                                            onChange={(e) =>
                                                setNewEmployeeId(e.target.value ? Number(e.target.value) : null)
                                            }
                                            disabled={loadingEmployees || availableEmployees.length === 0}
                                        >
                                            <option value="">Chọn nhân viên...</option>
                                            {availableEmployees.map((emp) => (
                                                <option key={emp.id} value={emp.id}>
                                                    #{emp.id} - {emp.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={handleCreateScheduleForEmployee}
                                            disabled={pendingCreateEmployee || !newEmployeeId}
                                            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm disabled:opacity-60"
                                        >
                                            {pendingCreateEmployee ? "Đang đăng ký..." : "Đăng ký ca"}
                                        </button>
                                    </div>
                                    {loadingEmployees && (
                                        <p className="text-xs text-[#616f89] dark:text-[#9ca3af]">
                                            Đang tải danh sách nhân viên...
                                        </p>
                                    )}
                                    {!loadingEmployees && availableEmployees.length === 0 && (
                                        <p className="text-xs text-[#9ca3af]">
                                            Không có nhân viên khả dụng để đăng ký ca này.
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                                    onClick={() => setEmployeeListModal({ ...employeeListModal, show: false })}
                                // a
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {registerModal.show && (
                <div
                    className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4"
                    onClick={() => setRegisterModal({ ...registerModal, show: false })}
                >
                    <div
                        className="bg-white dark:bg-[#111827] rounded-lg shadow-xl max-w-md w-full p-6 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">
                                    event_available
                                </span>
                                <div>
                                    <h4 className="text-lg font-semibold text-[#111318] dark:text-white">
                                        Đăng ký ca cho nhân viên
                                    </h4>
                                    <p className="text-sm text-[#616f89] dark:text-[#9ca3af]">
                                        Ngày {registerModal.day}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setRegisterModal({ ...registerModal, show: false })}
                                className="text-[#616f89] dark:text-[#9ca3af] hover:text-[#111318] dark:hover:text-white"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="space-y-4">
                            {/* Select detail shift */}
                            <div>
                                <label className="block text-xs font-medium text-[#616f89] dark:text-[#9ca3af] mb-1">
                                    Chọn ca chi tiết
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-[#dbdfe6] dark:border-[#4b5563] rounded-lg bg-white dark:bg-[#111827] text-sm"
                                    value={registerModal.selectedDetailId ?? ""}
                                    onChange={(e) => {
                                        const detailId = Number(e.target.value);
                                        const detail = registerModal.details.find(d => d.id === detailId);
                                        if (!detail) return;

                                        const filteredEmployees = registerModal.employees.filter(emp =>
                                            !detail.registeredEmployeeNames.includes(
                                                emp.name.trim().toLowerCase()
                                            )
                                        );

                                        setRegisterModal(prev => ({
                                            ...prev,
                                            selectedDetailId: detailId,
                                            filteredEmployees,
                                            selectedEmployeeId: null,
                                        }));
                                    }}
                                >
                                    {registerModal.details.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} ({d.startAt} - {d.endAt})
                                        </option>
                                    ))}
                                </select>

                                {/* Registered employees */}
                                {(() => {
                                    const detail = registerModal.details.find(
                                        d => d.id === registerModal.selectedDetailId
                                    );
                                    if (!detail || detail.registeredEmployeeNames.length === 0) return null;

                                    return (
                                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                            Đã đăng ký: {detail.registeredEmployeeNames.join(", ")}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Select employee */}
                            <div>
                                <label className="block text-xs font-medium text-[#616f89] dark:text-[#9ca3af] mb-1">
                                    Chọn nhân viên
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-[#dbdfe6] dark:border-[#4b5563] rounded-lg bg-white dark:bg-[#111827] text-sm"
                                    value={registerModal.selectedEmployeeId ?? ""}
                                    onChange={(e) =>
                                        setRegisterModal(prev => ({
                                            ...prev,
                                            selectedEmployeeId: e.target.value ? Number(e.target.value) : null,
                                        }))
                                    }
                                >
                                    <option value="">Chọn nhân viên...</option>
                                    {registerModal.filteredEmployees.map(emp => (
                                        <option key={emp.id} value={emp.id}>
                                            #{emp.id} - {emp.name}
                                        </option>
                                    ))}
                                </select>

                                {registerModal.filteredEmployees.length === 0 && (
                                    <p className="text-xs text-red-500 mt-1">
                                        Tất cả nhân viên đã được đăng ký ca này
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                className="px-4 py-2 rounded border border-[#dbdfe6] dark:border-[#4b5563] text-sm"
                                onClick={() => setRegisterModal({ ...registerModal, show: false })}
                            >
                                Hủy
                            </button>

                            <button
                                className="px-4 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-60"
                                disabled={!registerModal.selectedDetailId || !registerModal.selectedEmployeeId}
                                onClick={async () => {
                                    if (!registerModal.selectedDetailId || !registerModal.selectedEmployeeId) return;

                                    let supplierIdForApi: number | undefined;
                                    if (isAdmin) {
                                        supplierIdForApi = selectedSupplierId;
                                    } else {
                                        try {
                                            const emp = JSON.parse(localStorage.getItem("employee") || "{}");
                                            supplierIdForApi = emp?.supplierId;
                                        } catch { }
                                    }

                                    if (!supplierIdForApi) {
                                        window.alert("Không xác định được supplierId.");
                                        return;
                                    }

                                    const registrationDate = buildRegistrationDate(registerModal.day);
                                    const payload: any = {
                                        supplierId: supplierIdForApi,
                                        detailShiftTypeId: registerModal.selectedDetailId,
                                        registrationDate,
                                        employeeId: registerModal.selectedEmployeeId,
                                    };

                                    if (isPastDate(registerModal.day)) {
                                        payload.dateRequest = registrationDate;
                                    }

                                    try {
                                        await scheduleApi.create(payload);
                                        await loadScheduleData();
                                        window.alert("Đăng ký ca thành công.");
                                        setRegisterModal({ ...registerModal, show: false });
                                    } catch (err: any) {
                                        window.alert(err?.response?.data?.message || "Lỗi đăng ký ca.");
                                    }
                                }}
                            >
                                Đăng ký ca
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleManagement;

