import { useEffect, useState } from "react";
import { shiftTypeSupplierApi } from "../api/shiftTypeSupplier.api";
import type { CreateShiftTypeSupplierRequest } from "../api/shiftTypeSupplier.api";
import { shiftTypeApi } from "../api/shiftType.api";
import { employeeApi } from "../api/employee.api";
import { useNavigate, Link, useLocation } from "react-router-dom";

interface Supplier {
    id: number;
    name: string;
    status: boolean;
}

interface ShiftTypeDetail {
    id: number;
    name: string;
    startAt?: string;
    endAt?: string;
    shiftTypeId?: number;
    createdAt?: string;
}

interface ShiftType {
    id: number;
    name: string;
    createdAt?: string;
    listDetailShiftType?: ShiftTypeDetail[];
}

const CreateShiftTypeSupplier = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
    const [selectedShiftType, setSelectedShiftType] = useState<ShiftType | null>(null);
    const [form, setForm] = useState<CreateShiftTypeSupplierRequest>({
        name: "",
        supplierId: 0,
        shiftTypeId: 0,
        startDate: "",
        endDate: "",
    });
    const [errors, setErrors] = useState<Partial<Record<keyof CreateShiftTypeSupplierRequest, string>>>({});

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

    const { search } = useLocation();

    // Load danh sách suppliers
    useEffect(() => {
        if (!hasPermission) return;
        const loadSuppliers = async () => {
            try {
                const res = await employeeApi.getSuppliersPositions();
                const suppliersData = res.data?.suppliers || [];
                // Chỉ lấy suppliers có status = true
                const activeSuppliers = suppliersData.filter((s: any) => s.status === true);
                setSuppliers(activeSuppliers);

                // Nếu là ADMIN và có suppliers, set mặc định supplier đầu tiên
                if (isAdmin && activeSuppliers.length > 0 && form.supplierId === 0) {
                    setForm(prev => ({ ...prev, supplierId: activeSuppliers[0].id }));
                }
            } catch (error: any) {
                console.error("Failed to load suppliers", error);
            }
        };
        loadSuppliers();
    }, [hasPermission, isAdmin]);

    // Prefill startDate nếu có query ?startDate=YYYY-MM-DD
    useEffect(() => {
        if (!search) return;
        const params = new URLSearchParams(search);
        const startDateParam = params.get("startDate");
        if (startDateParam) {
            setForm(prev => ({ ...prev, startDate: startDateParam }));
        }
    }, [search]);

    // Load danh sách shift types từ API mới GET /api/shift-types
    useEffect(() => {
        if (!hasPermission) return;
        const loadShiftTypes = async () => {
            try {
                const res = await shiftTypeApi.getAll();
                const apiData: any = (res as any)?.data ?? (res as any);
                const payload = Array.isArray(apiData) ? apiData : apiData?.data;
                setShiftTypes(payload ?? []);
            } catch (error: any) {
                console.error("Failed to load shift types", error);
            }
        };
        loadShiftTypes();
    }, [hasPermission]);

    // Redirect nếu không có quyền
    useEffect(() => {
        if (!hasPermission) {
            navigate("/");
        }
    }, [hasPermission, navigate]);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof CreateShiftTypeSupplierRequest, string>> = {};

        if (!form.name || form.name.trim() === "") {
            newErrors.name = "Tên là bắt buộc";
        }

        if (!form.supplierId || form.supplierId === 0) {
            newErrors.supplierId = "Văn phòng là bắt buộc";
        }

        if (!form.shiftTypeId || form.shiftTypeId === 0) {
            newErrors.shiftTypeId = "Loại ca là bắt buộc";
        }

        if (!form.startDate) {
            newErrors.startDate = "Ngày bắt đầu là bắt buộc";
        }

        if (!form.endDate) {
            newErrors.endDate = "Ngày kết thúc là bắt buộc";
        }

        if (form.startDate && form.endDate) {
            const start = new Date(form.startDate);
            const end = new Date(form.endDate);
            if (end < start) {
                newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            const payload: CreateShiftTypeSupplierRequest = {
                name: form.name.trim(),
                supplierId: form.supplierId,
                shiftTypeId: form.shiftTypeId,
                startDate: form.startDate,
                endDate: form.endDate,
            };

            const res = await shiftTypeSupplierApi.create(payload);
            console.log("Tạo shift type supplier thành công:", res.data);
            alert("Tạo thời gian đăng ký loại ca thành công!");
            navigate("/ScheduleManagement");
        } catch (error: any) {
            console.error("Lỗi tạo shift type supplier:", error);
            const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi tạo thời gian đăng ký loại ca";
            alert(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="layout-content-container flex flex-col w-full px-16 mt-8 mb-8 flex-1 gap-6">
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium leading-normal flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    Trang chủ
                </Link>
                <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_right</span>
                <Link to="/ScheduleManagement" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium leading-normal">Quản lý ca đăng ký lịch làm việc</Link>
                <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_right</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium leading-normal">Tạo thời gian đăng ký loại ca</span>
            </div>

            <div className="flex flex-col gap-2">
                <h1 className="text-slate-900 dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">Tạo thời gian đăng ký loại ca</h1>
                <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal max-w-2xl">
                    Nhập thông tin bên dưới để tạo cấu hình thời gian đăng ký loại ca cho văn phòng.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                            <span className="material-symbols-outlined">schedule</span>
                        </div>
                        <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Thông tin cấu hình</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">
                                Tên cấu hình <span className="text-red-500">*</span>
                            </span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">badge</span>
                                </div>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Ví dụ: Ca ngày công ty Việt"
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                            {errors.name && (
                                <span className="text-xs text-red-500">{errors.name}</span>
                            )}
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">
                                Văn phòng <span className="text-red-500">*</span>
                            </span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">apartment</span>
                                </div>
                                <select
                                    value={form.supplierId}
                                    onChange={(e) => setForm({ ...form, supplierId: +e.target.value })}
                                    disabled={!isAdmin}
                                    className="form-select w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 pl-10 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="0">Chọn văn phòng...</option>
                                    {suppliers.map((supplier) => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                                </div>
                            </div>
                            {errors.supplierId && (
                                <span className="text-xs text-red-500">{errors.supplierId}</span>
                            )}
                            {!isAdmin && (
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Văn phòng sẽ được tự động lấy từ thông tin của bạn
                                </span>
                            )}
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">
                                Loại ca (Shift Type ID) <span className="text-red-500">*</span>
                            </span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">work</span>
                                </div>
                                {shiftTypes.length > 0 ? (
                                    <select
                                        value={form.shiftTypeId}
                                        onChange={(e) => {
                                            const id = +e.target.value;
                                            setForm({ ...form, shiftTypeId: id });
                                            const found = shiftTypes.find(st => st.id === id) || null;
                                            setSelectedShiftType(found);
                                        }}
                                        className="form-select w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 pl-10 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="0">Chọn loại ca...</option>
                                        {shiftTypes.map((st) => (
                                            <option key={st.id} value={st.id}>
                                                {st.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="number"
                                        value={form.shiftTypeId || ""}
                                        onChange={(e) => setForm({ ...form, shiftTypeId: +e.target.value })}
                                        placeholder="Nhập ID loại ca"
                                        className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                    />
                                )}
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                                </div>
                            </div>
                            {errors.shiftTypeId && (
                                <span className="text-xs text-red-500">{errors.shiftTypeId}</span>
                            )}

                            {/* Hiển thị chi tiết loại ca đã chọn */}
                            {selectedShiftType && selectedShiftType.listDetailShiftType && selectedShiftType.listDetailShiftType.length > 0 && (
                                <div className="mt-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200">
                                    <div className="font-semibold mb-1">
                                        Chi tiết ca của "{selectedShiftType.name}"
                                    </div>
                                    <ul className="space-y-1">
                                        {selectedShiftType.listDetailShiftType.map((dt) => (
                                            <li key={dt.id} className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-[16px] text-primary">event_available</span>
                                                <span className="font-medium">{dt.name}</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {dt.startAt && dt.endAt ? `(${dt.startAt} - ${dt.endAt})` : ""}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">
                                Ngày bắt đầu <span className="text-red-500">*</span>
                            </span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">event</span>
                                </div>
                                <input
                                    type="date"
                                    value={form.startDate}
                                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                            {errors.startDate && (
                                <span className="text-xs text-red-500">{errors.startDate}</span>
                            )}
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">
                                Ngày kết thúc <span className="text-red-500">*</span>
                            </span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">event</span>
                                </div>
                                <input
                                    type="date"
                                    value={form.endDate}
                                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                            {errors.endDate && (
                                <span className="text-xs text-red-500">{errors.endDate}</span>
                            )}
                        </label>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => navigate("/ScheduleManagement")}
                        className="flex items-center justify-center px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-500 text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        {submitting ? "Đang xử lý..." : "Tạo cấu hình"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateShiftTypeSupplier;

