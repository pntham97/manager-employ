import { useEffect, useState } from "react";
import { employsApi } from "../api/employs.api";
import { employeeApi, type TypeWork, type Company } from "../api/employee.api";
import { useNavigate, Link } from "react-router-dom";

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

interface CompanySupplier {
    id: number;
    name: string;
    status: boolean;
    companyId: number;
    createdAt: string;
}

const AddEmploys = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [showNationalityDropdown, setShowNationalityDropdown] = useState(false);
    const [showContractInfo, setShowContractInfo] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    type FormErrors = Partial<Record<keyof typeof form, string>>;
    const [errors, setErrors] = useState<FormErrors>({});
    const [employs, setEmploys] = useState({
        suppliers: [] as Supplier[],
        positions: [] as Position[],
    });
    const [typeWorks, setTypeWorks] = useState<TypeWork[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [allSuppliers, setAllSuppliers] = useState<CompanySupplier[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
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
        joinDate: "",
        gender: true,
        nationality: "",
        dateOfBirth: "",
        identityNumber: "",
        taxCode: "",
        workEmail: "",
        bankName: "",
        bankAccountNumber: "",
        bankAccountHolderName: "",
        typeWorkId: "",
        contractImgUrl: "",
        contractSigningDate: "",
        contractType: true,
        emergencyContactName: "",
        emergencyContactPhone: "",
        phoneNumber: "",
    });
    const COUNTRIES = [
        'Việt Nam',
        'United States',
        'Japan',
        'South Korea',
        'China',
        'Singapore',
        'Thailand',
        'France',
        'Germany',
        'Australia',
        'Canada',
    ];
    
    const filteredCountries = COUNTRIES.filter((country) =>
        country.toLowerCase().includes(form.nationality.toLowerCase())
    );

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await employsApi.getRole();
                setRoles(res.data);
            } catch (err: any) {
                console.error(err);
            }
        };
        const fetchEmploys = async () => {
            try {
                const res = await employsApi.getEmploys();
                setEmploys(res.data);
            } catch (err: any) {
                console.error(err);
            }
        };
        const fetchTypeWorksAndCompanies = async () => {
            try {
                const res = await employeeApi.getTypeWorksAndCompanies();
                if (res.data) {
                    setTypeWorks(res.data.typeWorks || []);
                    setCompanies(res.data.companies || []);

                    // Lưu tất cả suppliers từ companies
                    const allSuppliersFromCompanies: CompanySupplier[] = [];
                    res.data.companies?.forEach((company: Company) => {
                        company.suppliers?.forEach((supplier) => {
                            if (supplier.status) {
                                allSuppliersFromCompanies.push(supplier);
                            }
                        });
                    });
                    setAllSuppliers(allSuppliersFromCompanies);
                    setEmploys(prev => ({
                        ...prev,
                        suppliers: allSuppliersFromCompanies.map(s => ({
                            id: s.id,
                            name: s.name,
                            status: s.status,
                        }))
                    }));
                }
            } catch (err: any) {
                console.error("Failed to load typeWorks and companies", err);
            }
        };

        fetchEmploys();
        fetchRoles();
        fetchTypeWorksAndCompanies();
    }, []);

    // Filter suppliers khi selectedCompanyId thay đổi
    useEffect(() => {
        if (selectedCompanyId !== null) {
            const filteredCompany = companies.find(comp => comp.id === selectedCompanyId);
            const filteredSuppliers = filteredCompany?.suppliers
                ?.filter(s => s.status)
                .map(s => ({
                    id: s.id,
                    name: s.name,
                    status: s.status,
                })) || [];
            setEmploys(prev => ({
                ...prev,
                suppliers: filteredSuppliers
            }));
            // Reset supplierId nếu không còn trong danh sách mới
            if (form.supplierId && !filteredSuppliers.some(s => s.id === +form.supplierId)) {
                setForm(prev => ({ ...prev, supplierId: "" }));
            }
        } else {
            setEmploys(prev => ({
                ...prev,
                suppliers: allSuppliers.map(s => ({
                    id: s.id,
                    name: s.name,
                    status: s.status,
                }))
            }));
        }
    }, [selectedCompanyId, companies, allSuppliers]);
    const validateField = (
        name: keyof typeof form,
        value: string
    ): string | undefined => {
        switch (name) {
            case 'identityNumber':
                if (!value) return 'Vui lòng nhập CMND/CCCD';
                if (!/^(\d{9}|\d{12})$/.test(value))
                    return 'CMND/CCCD phải gồm 9 hoặc 12 số';
                return;

            case 'taxCode':
                if (value && !/^(\d{10}|\d{13})$/.test(value))
                    return 'Mã số thuế không hợp lệ';
                return;

            case 'workEmail':
                if (!value) return 'Vui lòng nhập email';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                    return 'Email không hợp lệ';
                return;

            case 'email':
                if (!value) return 'Vui lòng nhập email';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                    return 'Email không hợp lệ';
                return;

            case 'bankName':
                if (!value) return 'Vui lòng nhập tên ngân hàng';
                return;

            case 'bankAccountNumber':
                if (!value) return 'Vui lòng nhập số tài khoản';
                if (!/^\d{6,20}$/.test(value))
                    return 'Số tài khoản không hợp lệ';
                return;

            case 'bankAccountHolderName':
                if (!value) return 'Vui lòng nhập tên chủ tài khoản';
                return;

            case 'emergencyContactName':
                if (!value) return 'Vui lòng nhập họ tên';
                return;

            case 'emergencyContactPhone':
                if (!value) return 'Vui lòng nhập số điện thoại';
                if (!/^(0|\+84)\d{9,10}$/.test(value))
                    return 'Số điện thoại không hợp lệ';
                return;

            case 'phone':
                if (!value) return 'Vui lòng nhập số điện thoại';
                if (!/^(0|\+84)\d{9,10}$/.test(value))
                    return 'Số điện thoại không hợp lệ';
                return;

            default:
                return;
        }
    };

    const validateUsername = (username: string): string | null => {
        if (!username) return "Username is required";
        if (username.length < 6 || username.length > 255) {
            return "Username must be between 6 and 255 characters";
        }
        return null;
    };
    const handleChange =
        (name: keyof typeof form) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;

                setForm((prev) => ({
                    ...prev,
                    [name]: value,
                }));

                const errorMessage = validateField(name, value);

                setErrors((prev) => ({
                    ...prev,
                    [name]: errorMessage,
                }));
            };
    const handleAddEmploys = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = formData.get("username") as string;
        const newErrors: FormErrors = {};

        (Object.keys(form) as (keyof typeof form)[]).forEach((key) => {
            const error = validateField(key, String(form[key] ?? ''));
            if (error) newErrors[key] = error;
        });

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;
        // ✅ validate trước
        const usernameError = validateUsername(username);
        if (usernameError) {
            setUsernameError(usernameError);
            return;
        }

        // Validate các trường bắt buộc
        // if (!form.employeeName || !form.phone || !form.address || !form.positionId || !form.supplierId || !form.roleId || ) {
        //     alert("Vui lòng điền đầy đủ thông tin bắt buộc");
        //     return;
        // }

        const payload = {
            userName: formData.get("username") as string,
            password: formData.get("password") as string,
            email: formData.get("email") as string,
            address: form.address,
            employeeName: form.employeeName,
            phone: form.phone,
            supplierId: +form.supplierId,
            positionId: +form.positionId,
            roleCodeId: form.roleId,
            joinDate: form.joinDate || new Date().toISOString().split("T")[0],
            gender: form.gender,
            nationality: form.nationality || "Việt Nam",
            dateOfBirth: form.dateOfBirth || "",
            identityNumber: form.identityNumber || "",
            taxCode: form.taxCode || "",
            workEmail: form.workEmail || formData.get("email") as string,
            bankName: form.bankName || "",
            bankAccountNumber: form.bankAccountNumber || "",
            bankAccountHolderName: form.bankAccountHolderName || form.employeeName,
            typeWorkId: +form.typeWorkId || 1,
            contractImgUrl: form.contractImgUrl || undefined,
            contractSigningDate: form.contractSigningDate || undefined,
            contractType: form.contractType,
            emergencyContactName: form.emergencyContactName || "",
            emergencyContactPhone: form.emergencyContactPhone || "",
        };

        try {
            setSubmitting(true);
            const res = await employsApi.postEmploys(payload);
            console.log("Tạo nhân viên thành công:", res.data);
            alert("Tạo nhân viên thành công!");
            navigate("/ManagerEmploy");
        } catch (error: any) {
            console.error("Lỗi tạo nhân viên:", error);
            alert(error.response?.data?.message || "Có lỗi xảy ra khi tạo nhân viên");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="layout-content-container flex flex-col w-full px-16 mt-8  flex-1 gap-6">

            <div className="flex flex-wrap items-center gap-2 text-sm">
                <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium leading-normal flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">home</span>
                    Trang chủ
                </Link>
                <span className="material-symbols-outlined text-slate-400 text-[16px]">chevron_right</span>
                <Link to="/ManagerEmploy" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium leading-normal">Danh sách nhân viên</Link>
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
                                <input name="email"
                                    onChange={handleChange('email')}
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                    placeholder="example@company.com"
                                    type="email" />
                            </div>
                            {errors.email && (
                                <span className="text-xs text-red-500">{errors.email}</span>
                            )}
                        </label>
                        <label className="flex flex-col gap-2 md:col-span-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Địa chỉ <span className="text-red-500">*</span></span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">place</span>
                                </div>
                                <input
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    name="address"
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                    placeholder="Địa chỉ thường trú "
                                />
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
                            <input
                                value={form.employeeName}
                                onChange={(e) => setForm({ ...form, employeeName: e.target.value })}
                                name="name"
                                className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                placeholder="Nhập họ và tên nhân viên"
                                type="text"
                            />
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Số điện thoại <span className="text-red-500">*</span></span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">call</span>
                                </div>
                                <input
                                    value={form.phone}
                                    onChange={handleChange('phone')}
                                    name="phone"
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                    placeholder="0912 xxx xxx"

                                />
                            </div>
                            {errors.phone && (
                                <span className="text-xs text-red-500">{errors.phone}</span>
                            )}
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Công ty</span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">business</span>
                                </div>
                                <select
                                    value={selectedCompanyId || ""}
                                    onChange={(e) => {
                                        const companyId = e.target.value ? +e.target.value : null;
                                        setSelectedCompanyId(companyId);
                                        setForm({ ...form, supplierId: "" });
                                    }}
                                    className="form-select w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 pl-10 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer"
                                >
                                    <option value="">Chọn công ty...</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                                </div>
                            </div>
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Văn phòng <span className="text-red-500">*</span></span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">apartment</span>
                                </div>
                                <select
                                    value={form.supplierId}
                                    onChange={(e) =>
                                        setForm({ ...form, supplierId: e.target.value })
                                    }
                                    disabled={!selectedCompanyId}
                                    className="form-select w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 pl-10 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">{selectedCompanyId ? "Chọn văn phòng..." : "Vui lòng chọn công ty trước"}</option>
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
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Loại hình</span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">schedule</span>
                                </div>
                                <select
                                    value={form.typeWorkId}
                                    onChange={(e) =>
                                        setForm({ ...form, typeWorkId: e.target.value })
                                    }
                                    className="form-select w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 pl-10 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer"
                                >
                                    <option value="">Chọn loại hình...</option>
                                    {typeWorks.map((tw) => (
                                        <option key={tw.id} value={tw.id}>
                                            {tw.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                                </div>
                            </div>
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Role <span className="text-red-500">*</span></span>
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

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Ngày gia nhập</span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">event</span>
                                </div>
                                <input
                                    type="date"
                                    value={form.joinDate}
                                    onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Giới tính</span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">person</span>
                                </div>
                                <select
                                    value={form.gender ? "true" : "false"}
                                    onChange={(e) => setForm({ ...form, gender: e.target.value === "true" })}
                                    className="form-select w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 pl-10 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer"
                                >
                                    <option value="true">Nam</option>
                                    <option value="false">Nữ</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                                </div>
                            </div>
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Ngày sinh</span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">cake</span>
                                </div>
                                <input
                                    type="date"
                                    value={form.dateOfBirth}
                                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Quốc tịch</span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">flag</span>
                                </div>
                                <input
                                    type="text"
                                    value={form.nationality}
                                    onChange={(e) => {
                                        setForm({ ...form, nationality: e.target.value });
                                        setShowNationalityDropdown(true);
                                    }}
                                    onFocus={() => setShowNationalityDropdown(true)}
                                    placeholder="Việt Nam"
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />

                                {showNationalityDropdown && filteredCountries.length > 0 && (
                                    <ul className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg max-h-56 overflow-auto">
                                        {filteredCountries.map((country) => (
                                            <li
                                                key={country}
                                                onMouseDown={() => {
                                                    setForm({ ...form, nationality: country });
                                                    setShowNationalityDropdown(false);
                                                }}
                                                className="px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                                            >
                                                {country}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">CMND/CCCD<span className="text-red-500">*</span></span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">badge</span>
                                </div>
                                <input
                                    type="text"
                                    value={form.identityNumber}
                                    onChange={handleChange('identityNumber')}
                                    placeholder="Nhập số CMND/CCCD"
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                            {errors.identityNumber && (
                                <span className="text-xs text-red-500">{errors.identityNumber}</span>
                            )}
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Mã số thuế<span className="text-red-500">*</span></span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">receipt</span>
                                </div>
                                <input
                                    type="text"
                                    value={form.taxCode}
                                    onChange={handleChange('taxCode')}
                                    placeholder="Nhập mã số thuế"
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                            {errors.taxCode && (
                                <span className="text-xs text-red-500">{errors.taxCode}</span>
                            )}
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Email công việc<span className="text-red-500">*</span></span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">mail</span>
                                </div>
                                <input
                                    type="email"
                                    value={form.workEmail}
                                    onChange={handleChange('workEmail')}
                                    placeholder="work@company.com"
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                            {errors.workEmail && (
                                <span className="text-xs text-red-500">{errors.workEmail}</span>
                            )}
                        </label>
                    </div>
                </div>

                <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                            <span className="material-symbols-outlined">account_balance</span>
                        </div>
                        <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Thông tin ngân hàng</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Tên ngân hàng<span className="text-red-500">*</span></span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">account_balance</span>
                                </div>
                                <input
                                    type="text"
                                    value={form.bankName}
                                    onChange={handleChange('bankName')}
                                    placeholder="Vietcombank"
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                            {errors.bankName && (
                                <span className="text-xs text-red-500">{errors.bankName}</span>
                            )}
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Số tài khoản<span className="text-red-500">*</span></span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">credit_card</span>
                                </div>
                                <input
                                    type="text"
                                    value={form.bankAccountNumber}
                                    onChange={handleChange('bankAccountNumber')}
                                    placeholder="Nhập số tài khoản"
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                            {errors.bankAccountNumber && (
                                <span className="text-xs text-red-500">{errors.bankAccountNumber}</span>
                            )}
                        </label>

                        <label className="flex flex-col gap-2 md:col-span-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Tên chủ tài khoản<span className="text-red-500">*</span></span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">person</span>
                                </div>
                                <input
                                    type="text"
                                    value={form.bankAccountHolderName}
                                    onChange={handleChange('bankAccountHolderName')}
                                    placeholder="Tên chủ tài khoản"
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                            {errors.bankAccountHolderName && (
                                <span className="text-xs text-red-500">{errors.bankAccountHolderName}</span>
                            )}
                        </label>
                    </div>
                </div>

                <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                            <span className="material-symbols-outlined">emergency</span>
                        </div>
                        <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Liên hệ khẩn cấp</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Họ tên người liên hệ<span className="text-red-500">*</span></span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">person</span>
                                </div>
                                <input
                                    type="text"
                                    value={form.emergencyContactName}
                                    onChange={handleChange('emergencyContactName')}
                                    placeholder="Nhập họ tên người liên hệ"
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                            {errors.emergencyContactName && (
                                <span className="text-xs text-red-500">{errors.emergencyContactName}</span>
                            )}
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">Số điện thoại liên hệ<span className="text-red-500">*</span></span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">call</span>
                                </div>
                                <input
                                    type="tel"
                                    value={form.emergencyContactPhone}
                                    onChange={handleChange('emergencyContactPhone')}
                                    placeholder="0912 xxx xxx"
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                            {errors.emergencyContactPhone && (
                                <span className="text-xs text-red-500">{errors.emergencyContactPhone}</span>
                            )}
                        </label>
                    </div>
                </div>
                <div className="flex items-center justify-between mx-8 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                            <span className="material-symbols-outlined">description</span>
                        </div>
                        <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                            Thông tin hợp đồng
                        </h3>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowContractInfo((prev) => !prev)}
                        className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                        {showContractInfo ? 'Ẩn hợp đồng' : 'Hiện hợp đồng'}
                        <span className="material-symbols-outlined text-[18px]">
                            {showContractInfo ? 'expand_less' : 'expand_more'}
                        </span>
                    </button>

                </div>
                {showContractInfo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-8 mb-6">
                        {/* URL ảnh hợp đồng */}
                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">
                                URL ảnh hợp đồng
                            </span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">image</span>
                                </div>
                                <input
                                    type="url"
                                    value={form.contractImgUrl}
                                    onChange={(e) =>
                                        setForm({ ...form, contractImgUrl: e.target.value })
                                    }
                                    placeholder="https://example.com/contract.jpg"
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                        </label>

                        {/* Ngày ký */}
                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">
                                Ngày ký hợp đồng
                            </span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">event</span>
                                </div>
                                <input
                                    type="date"
                                    value={form.contractSigningDate}
                                    onChange={(e) =>
                                        setForm({ ...form, contractSigningDate: e.target.value })
                                    }
                                    className="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 pl-10 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                        </label>

                        {/* Loại hợp đồng */}
                        <label className="flex flex-col gap-2">
                            <span className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal">
                                Loại hợp đồng
                            </span>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">description</span>
                                </div>
                                <select
                                    value={form.contractType ? 'true' : 'false'}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            contractType: e.target.value === 'true',
                                        })
                                    }
                                    className="form-select w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 pl-10 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer"
                                >
                                    <option value="true">Hợp đồng có thời hạn</option>
                                    <option value="false">
                                        Hợp đồng không xác định thời hạn
                                    </option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-[20px]">
                                        arrow_drop_down
                                    </span>
                                </div>
                            </div>
                        </label>
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                    <button className="flex items-center justify-center px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200" type="button">
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-500 text-white font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        {submitting ? "Đang xử lý..." : "Thêm nhân viên"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddEmploys;
