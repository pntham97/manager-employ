import { useEffect, useState } from "react";
import { employsApi } from "../api/employs.api";

interface Role {
    id: string;
    name: string;
}

interface Supplier {
    id: number;
    name: string;
    status: boolean;
}

interface Position {
    id: number;
    name: string;
}

const AddEmploys = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [cccd, setCccd] = useState("");
    const [cccdError, setCccdError] = useState("");
    const [emergencyPhone, setEmergencyPhone] = useState("");
    const [emergencyPhoneError, setEmergencyPhoneError] = useState("");
    const [employs, setEmploys] = useState({
        suppliers: [] as Supplier[],
        positions: [] as Position[],
    });
    const [contractFile, setContractFile] = useState<File | null>(null);
    const [contractPreview, setContractPreview] = useState<string | null>(null);
    const [contractError, setContractError] = useState("");
    const [showContract, setShowContract] = useState(false);
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

    const validateContractFile = (file: File): string => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return "Chỉ chấp nhận file JPG, PNG hoặc PDF";
        }
        if (file.size > MAX_FILE_SIZE) {
            return "Dung lượng file không được vượt quá 5MB";
        }
        return "";
    };
    const [form, setForm] = useState({
        userName: "",
        email: "",
        password: "",
        employeeName: "",
        phone: "",
        address: "",
        positionId: "",
        supplierId: "",
        roleId: "",
    });
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [rolesRes, employsRes] = await Promise.all([
                    employsApi.getRole(),
                    employsApi.getEmploys(),
                ]);

                setRoles(rolesRes.data);
                setEmploys(employsRes.data);
            } catch (err) {
                console.error(err);
                setError("Không thể tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const validateUsername = (username: string): string | null => {
        if (!username) return "Username is required";
        if (username.length < 6 || username.length > 255) {
            return "Username must be between 6 and 255 characters";
        }
        return null;
    };
    const handleAddEmploys = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = formData.get("username") as string;

        // ✅ validate trước
        const usernameError = validateUsername(username);
        if (usernameError) {
            setUsernameError(usernameError); // nếu bạn có state hiển thị lỗi
            return; // 🚫 DỪNG – KHÔNG CALL API
        }

        const payload = {
            userName: formData.get("username") as string,
            password: formData.get("password") as string,
            email: formData.get("email") as string,
            address: formData.get("address") as string,
            employeeName: formData.get("name") as string,
            phone: formData.get("phoneNumber") as string,
            supplierId: +form.supplierId,
            positionId: +form.positionId,
            roleCodeId: form.roleId as string,
        };

        try {
            const res = await employsApi.postEmploys(payload);
            console.log("Tạo nhân viên thành công:", res.data);
        } catch (error) {
            console.error("Lỗi tạo nhân viên:", error);
        }
    }

    // CCCD: đúng 12 chữ số
    const validateCCCD = (value: string): string => {
        if (!value) return "CCCD không được để trống";
        if (!/^\d{12}$/.test(value)) return "CCCD phải gồm đúng 12 chữ số";
        return "";
    };

    // SĐT: 10–11 chữ số
    const validatePhone = (value: string): string => {
        if (!value) return "Số điện thoại không được để trống";
        if (!/^\d{10,11}$/.test(value))
            return "Số điện thoại phải gồm 10–11 chữ số";
        return "";
    };

    const isFormValid =
        !cccdError &&
        !emergencyPhoneError &&
        cccd &&
        emergencyPhone;
    const handleContractFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const error = validateContractFile(file);
        if (error) {
            setContractError(error);
            setContractFile(null);
            setContractPreview(null);
            return;
        }

        setContractError("");
        setContractFile(file);

        // Preview
        if (file.type === "application/pdf") {
            setContractPreview("pdf");
        } else {
            const reader = new FileReader();
            reader.onloadend = () => {
                setContractPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="layout-content-container flex flex-col w-full px-16 mt-8 mb-8  flex-1 gap-6">

            <div className="flex flex-wrap items-center gap-2 text-sm">
                <a className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium leading-normal flex items-center gap-1" href="#">
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    Trang chủ
                </a>
                <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_right</span>
                <a className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium leading-normal" href="#">Danh sách nhân viên</a>
                <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_right</span>
                <span className="text-slate-900 dark:text-slate-100 font-medium leading-normal">Thêm mới nhân viên</span>
            </div>

            <div className="flex flex-col gap-2">
                <h1 className="text-slate-900 dark:text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">Thêm mới nhân viên</h1>
                <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal max-w-2xl">Nhập thông tin chi tiết bên dưới để tạo hồ sơ nhân viên mới vào hệ thống quản lý.</p>
            </div>

            <form onSubmit={handleAddEmploys} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">

                <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                            <span className="material-symbols-outlined">badge</span>
                        </div>
                        <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Thông tin tài khoản</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">
                                Tên đăng nhập <span className="text-red-500">*</span>
                            </span>

                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">person</span>
                                </div>

                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setUsername(value);
                                        setUsernameError(validateUsername(value)); // ✅ validate realtime
                                    }}
                                    onBlur={() => {
                                        setUsernameError(validateUsername(username)); // ✅ validate khi blur
                                    }}
                                    name="username"
                                    placeholder="Nhập tên đăng nhập"
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>

                            {usernameError && (
                                <span className="text-xs text-red-500">
                                    {usernameError}
                                </span>
                            )}
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Mật khẩu <span className="text-red-500">*</span></span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">lock</span>
                                </div>
                                <input
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 pl-10 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                    placeholder="Nhập mật khẩu"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center cursor-pointer transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPassword ? "visibility_off" : "visibility"}
                                    </span>
                                </button>
                            </div>
                        </label>
                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Role</span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">work</span>
                                </div>
                                <select
                                    value={form.roleId}
                                    onChange={(e) =>
                                        setForm({ ...form, roleId: e.target.value })
                                    }
                                    className="form-select w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 pl-10 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer"
                                >
                                    <option value="">Chọn role...</option>
                                    {roles.map((pos) => (
                                        <option key={pos.id} value={pos.id}>
                                            {pos.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                                </div>
                            </div>
                        </label>
                        <label className="flex flex-col gap-2 md:col-span-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Email <span className="text-red-500">*</span></span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">mail</span>
                                </div>
                                <input name="email" className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" placeholder="example@company.com" type="email" />
                            </div>
                        </label>
                        <label className="flex flex-col gap-2 md:col-span-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Địa chỉ <span className="text-red-500">*</span></span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">place</span>
                                </div>
                                <input name="address" className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" placeholder="Địa chỉ thường trú " />
                            </div>
                        </label>
                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                                Giới tính
                            </span>
                            <select
                                name="gender"
                                className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 
        bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white 
        h-12 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                            >
                                <option value="">-- Chọn giới tính --</option>
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                                CCCD <span className="text-red-500">*</span>
                            </span>

                            <input
                                type="text"
                                value={cccd}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, ""); // chỉ cho nhập số
                                    setCccd(value);
                                    setCccdError(validateCCCD(value));
                                }}
                                onBlur={() => setCccdError(validateCCCD(cccd))}
                                maxLength={12}
                                placeholder="Nhập 12 chữ số CCCD"
                                className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 
        bg-slate-50 dark:bg-slate-800 h-12 px-4 text-sm"
                            />

                            {cccdError && (
                                <span className="text-xs text-red-500">{cccdError}</span>
                            )}
                        </label>

                        {/* Quốc tịch */}
                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                                Quốc tịch
                            </span>
                            <input
                                name="nationality"
                                placeholder="Ví dụ: Việt Nam"
                                className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 
        bg-slate-50 dark:bg-slate-800 h-12 px-4 text-sm"
                            />
                        </label>

                        {/* MST */}
                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                                Mã số thuế
                            </span>
                            <input
                                name="tax_code"
                                placeholder="Nhập mã số thuế"
                                className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 
        bg-slate-50 dark:bg-slate-800 h-12 px-4 text-sm"
                            />
                        </label>



                        {/* Email công việc */}
                        <label className="flex flex-col gap-2 md:col-span-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                                Email công việc
                            </span>
                            <input
                                name="work_email"
                                type="email"
                                placeholder="example@company.com"
                                className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 
        bg-slate-50 dark:bg-slate-800 h-12 px-4 text-sm"
                            />
                        </label>

                        {/* Liên hệ khẩn cấp */}
                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                                Liên hệ khẩn cấp (Họ tên - Quan hệ)
                            </span>
                            <input
                                name="emergency_contact_name"
                                placeholder="Nguyễn Văn A - Cha"
                                className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 
        bg-slate-50 dark:bg-slate-800 h-12 px-4 text-sm"
                            />
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                                SĐT liên hệ khẩn cấp <span className="text-red-500">*</span>
                            </span>

                            <input
                                type="text"
                                value={emergencyPhone}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    setEmergencyPhone(value);
                                    setEmergencyPhoneError(validatePhone(value));
                                }}
                                onBlur={() => setEmergencyPhoneError(validatePhone(emergencyPhone))}
                                maxLength={11}
                                placeholder="Nhập số điện thoại (10–11 số)"
                                className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 
        bg-slate-50 dark:bg-slate-800 h-12 px-4 text-sm"
                            />

                            {emergencyPhoneError && (
                                <span className="text-xs text-red-500">
                                    {emergencyPhoneError}
                                </span>
                            )}
                        </label>
                        {/* ================= THÔNG TIN NGÂN HÀNG ================= */}
                        <div className="md:col-span-2 mt-6">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">
                                    account_balance
                                </span>
                                Thông tin ngân hàng
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Tên ngân hàng */}
                                <label className="flex flex-col gap-2">
                                    <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                                        Tên ngân hàng
                                    </span>
                                    <input
                                        name="bank_name"
                                        placeholder="Ví dụ: Vietcombank"
                                        className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 
                bg-slate-50 dark:bg-slate-800 h-12 px-4 text-sm"
                                    />
                                </label>

                                {/* Số tài khoản */}
                                <label className="flex flex-col gap-2">
                                    <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                                        Số tài khoản
                                    </span>
                                    <input
                                        name="bank_account"
                                        placeholder="Nhập số tài khoản"
                                        className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 
                bg-slate-50 dark:bg-slate-800 h-12 px-4 text-sm"
                                    />
                                </label>

                                {/* Chủ tài khoản */}
                                <label className="flex flex-col gap-2 md:col-span-2">
                                    <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                                        Chủ tài khoản
                                    </span>
                                    <input
                                        name="bank_owner"
                                        placeholder="Họ và tên chủ tài khoản"
                                        className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 
                bg-slate-50 dark:bg-slate-800 h-12 px-4 text-sm"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                            <span className="material-symbols-outlined">person_add</span>
                        </div>
                        <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Thông tin cá nhân &amp; Công việc</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Họ và tên <span className="text-red-500">*</span></span>
                            <input name="name" className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" placeholder="Nhập họ và tên nhân viên" type="text" />
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Số điện thoại <span className="text-red-500">*</span></span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">call</span>
                                </div>
                                <input name="phoneNumber" className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" placeholder="0912 xxx xxx" type="tel" />
                            </div>
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Địa chỉ làm việc</span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">apartment</span>
                                </div>
                                <select
                                    value={form.supplierId}
                                    onChange={(e) =>
                                        setForm({ ...form, supplierId: e.target.value })
                                    }
                                    className="form-select w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 pl-10 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer"
                                >
                                    <option value="">Chọn địa chỉ làm việc...</option>

                                    {employs.suppliers
                                        .filter((s) => s.status)
                                        .map((sup) => (
                                            <option key={sup.id} value={sup.id}>
                                                {sup.name}
                                            </option>
                                        ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                                </div>
                            </div>
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Chức vụ</span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">work</span>
                                </div>
                                <select
                                    value={form.positionId}
                                    onChange={(e) =>
                                        setForm({ ...form, positionId: e.target.value })
                                    }
                                    className="form-select w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 pl-10 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer"
                                >
                                    <option value="">Chọn chức vụ...</option>

                                    {employs.positions.map((pos) => (
                                        <option key={pos.id} value={pos.id}>
                                            {pos.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                                </div>
                            </div>
                        </label>

                    </div>
                </div>

                <div className="md:col-span-2 mx-8 mt-6">
                    <button
                        type="button"
                        onClick={() => {
                            setShowContract((prev) => {
                                if (prev) {
                                    // Reset khi huỷ hợp đồng
                                    setContractFile(null);
                                    setContractPreview(null);
                                    setContractError("");
                                }
                                return !prev;
                            });
                        }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg 
        border border-dashed transition text-sm
        ${showContract
                                ? "border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                : "border-slate-300 text-slate-600 hover:border-primary hover:text-primary"
                            }
        dark:border-slate-600`}
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {showContract ? "close" : "add_circle"}
                        </span>

                        {showContract ? "Huỷ hợp đồng lao động" : "Thêm hợp đồng lao động"}
                    </button>
                </div>

                {showContract && (

                    < div className="md:col-span-2 mt-8 mx-8">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-200 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">description</span>
                            Hợp đồng lao động
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Loại hình hợp đồng */}
                            <label className="flex flex-col gap-2">
                                <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                                    Loại hình hợp đồng <span className="text-red-500">*</span>
                                </span>

                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        <span className="material-symbols-outlined text-[20px]">
                                            assignment
                                        </span>
                                    </div>

                                    <select
                                        name="contract_type"
                                        className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 
                    bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white 
                    h-12 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="">-- Chọn loại hợp đồng --</option>
                                        <option value="fixed_term">Có thời hạn</option>
                                        <option value="indefinite">Không thời hạn</option>
                                    </select>
                                </div>
                            </label>

                            {/* Ngày gia nhập */}
                            <label className="flex flex-col gap-2">
                                <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                                    Ngày gia nhập <span className="text-red-500">*</span>
                                </span>

                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        <span className="material-symbols-outlined text-[20px]">
                                            calendar_month
                                        </span>
                                    </div>

                                    <input
                                        type="date"
                                        name="join_date"
                                        className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 
                    bg-slate-50 dark:bg-slate-800 h-12 pl-10 pr-4 text-sm 
                    focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </label>

                            {/* Văn phòng */}
                            <label className="flex flex-col gap-2">
                                <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                                    Văn phòng làm việc <span className="text-red-500">*</span>
                                </span>

                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        <span className="material-symbols-outlined text-[20px]">
                                            apartment
                                        </span>
                                    </div>

                                    <input
                                        name="office"
                                        placeholder="Ví dụ: Văn phòng Hà Nội"
                                        className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 
                    bg-slate-50 dark:bg-slate-800 h-12 pl-10 pr-4 text-sm 
                    focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </label>

                            <label className="flex flex-col gap-2 md:col-span-2">
                                <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                                    Ảnh hợp đồng <span className="text-red-500">*</span>
                                </span>

                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,application/pdf"
                                    className="hidden"
                                    id="contract_file"
                                    onChange={handleContractFileChange}
                                />

                                {!contractPreview ? (
                                    <label
                                        htmlFor="contract_file"
                                        className="flex flex-col items-center justify-center gap-2 
            w-full h-40 rounded-lg border-2 border-dashed border-slate-300 
            dark:border-slate-600 bg-slate-50 dark:bg-slate-800/30 
            cursor-pointer hover:border-primary transition"
                                    >
                                        <span className="material-symbols-outlined text-3xl text-slate-400">
                                            upload_file
                                        </span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            JPG, PNG, PDF (tối đa 5MB)
                                        </span>
                                    </label>
                                ) : (
                                    <div className="relative w-full rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/30">
                                        {/* Preview IMAGE */}
                                        {contractPreview !== "pdf" ? (
                                            <img
                                                src={contractPreview}
                                                alt="Contract preview"
                                                className="max-h-64 mx-auto rounded-lg object-contain"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300">
                                                <span className="material-symbols-outlined text-4xl">
                                                    picture_as_pdf
                                                </span>
                                                <span className="text-sm">File PDF hợp đồng</span>
                                            </div>
                                        )}

                                        {/* Remove */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setContractFile(null);
                                                setContractPreview(null);
                                            }}
                                            className="absolute top-2 right-2 bg-white dark:bg-slate-700 
                border border-slate-200 dark:border-slate-600 rounded-full p-1 
                hover:text-red-500 transition"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                close
                                            </span>
                                        </button>
                                    </div>
                                )}

                                {contractError && (
                                    <span className="text-xs text-red-500">{contractError}</span>
                                )}
                            </label>
                        </div>
                    </div>
                )
                }
                <div className="flex items-center justify-end gap-3 p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                    <button className="flex items-center justify-center px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200" type="button">
                        Hủy
                    </button>
                    <button disabled={!isFormValid}
                        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                             bg-blue-500 text-white font-medium text-sm hover:bg-primary/90 transition-colors 
                             shadow-sm shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/40 
                             focus:ring-offset-1 dark:focus:ring-offset-slate-900 px-6 py-3 rounded-lg text-white transition
                             ${isFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-400 cursor-not-allowed"}`} type="submit"  >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Thêm nhân viên
                    </button>
                </div>
            </form >
        </div >
    );
};

export default AddEmploys;
