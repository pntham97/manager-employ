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
    const [employs, setEmploys] = useState({
        suppliers: [] as Supplier[],
        positions: [] as Position[],
    });
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
        const fetchRoles = async () => {
            try {
                setLoading(true);
                const res = await employsApi.getRole();
                setRoles(res.data);
            } catch (err: any) {
                console.error(err);
                setError("Không thể tải danh sách role");
            } finally {
                setLoading(false);
            }
        };
        const fetchEmploys = async () => {
            try {
                setLoading(true);
                const res = await employsApi.getEmploys();
                setEmploys(res.data);
            } catch (err: any) {
                console.error(err);
                setError("Không thể tải danh sách role");
            } finally {
                setLoading(false);
            }
        };

        fetchEmploys();
        fetchRoles();
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

    return (
        <div className="layout-content-container flex flex-col w-full px-16 mt-8  flex-1 gap-6">

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
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                    <button className="flex items-center justify-center px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200" type="button">
                        Hủy
                    </button>
                    <button type="submit" className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-500 text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1 dark:focus:ring-offset-slate-900" >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Thêm nhân viên
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddEmploys;
