import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { employeeApi, type EmployeeResponse, type UpdateEmployeeRequest, type TypeWork, type Company } from "../api/employee.api";

interface Supplier {
    id: number;
    name: string;
    status: boolean;
    createdAt: string;
}

interface Position {
    id: number;
    name: string;
    createdAt: string;
}


const EmployDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const employee = location.state?.employee as EmployeeResponse | undefined;
    const [showBankAccount, setShowBankAccount] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]); // Lưu tất cả suppliers để filter
    const [positions, setPositions] = useState<Position[]>([]);
    const [typeWorks, setTypeWorks] = useState<TypeWork[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
    const [formData, setFormData] = useState<UpdateEmployeeRequest | null>(null);

    // Nếu không có employee data, có thể redirect về trang danh sách
    if (!employee) {
        // Có thể hiển thị thông báo hoặc redirect
        console.warn("No employee data found");
    }

    // Format ngày tháng
    const formatDate = (dateString: string | undefined | null): string => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (error) {
            return "N/A";
        }
    };

    // Format số điện thoại Việt Nam
    const formatPhoneNumber = (phone: string | null | undefined): string => {
        if (!phone) return "N/A";

        // Loại bỏ tất cả ký tự không phải số
        const cleaned = phone.replace(/\D/g, "");

        // Kiểm tra độ dài số điện thoại Việt Nam (10 hoặc 11 số)
        if (cleaned.length === 10) {
            // Định dạng: 0xxx xxx xxx
            return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
        } else if (cleaned.length === 11) {
            // Định dạng: 0xxx xxxx xxx
            return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
        } else if (cleaned.length === 9) {
            // Định dạng: xxx xxx xxx (thiếu số 0 đầu)
            return `0${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
        }

        // Nếu không đúng định dạng, trả về số gốc
        return phone;
    };

    // Format số tài khoản (che đi và chỉ hiển thị 4 số cuối)
    const formatBankAccount = (accountNumber: string | undefined | null): string => {
        if (!accountNumber) return "N/A";
        if (showBankAccount) {
            return accountNumber;
        }
        // Chỉ hiển thị 4 số cuối, các số đầu được thay bằng *
        if (accountNumber.length <= 4) {
            return accountNumber;
        }
        const lastFour = accountNumber.slice(-4);
        const masked = "*".repeat(accountNumber.length - 4);
        return `${masked}${lastFour}`;
    };

    // Load suppliers, positions, typeWorks và companies
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load suppliers và positions
                const suppliersPositionsRes = await employeeApi.getSuppliersPositions();
                if (suppliersPositionsRes.data) {
                    setSuppliers(suppliersPositionsRes.data.suppliers.filter((s: Supplier) => s.status === true));
                    setPositions(suppliersPositionsRes.data.positions);
                }

                // Load typeWorks và companies
                const typeWorksCompaniesRes = await employeeApi.getTypeWorksAndCompanies();
                if (typeWorksCompaniesRes.data) {
                    setTypeWorks(typeWorksCompaniesRes.data.typeWorks || []);
                    setCompanies(typeWorksCompaniesRes.data.companies || []);

                    // Cập nhật suppliers từ companies (ưu tiên suppliers từ companies vì có thông tin đầy đủ hơn)
                    const allSuppliersFromCompanies: Supplier[] = [];
                    typeWorksCompaniesRes.data.companies?.forEach((company: Company) => {
                        company.suppliers?.forEach((supplier) => {
                            if (supplier.status) {
                                allSuppliersFromCompanies.push({
                                    id: supplier.id,
                                    name: supplier.name,
                                    status: supplier.status,
                                    createdAt: supplier.createdAt,
                                });
                            }
                        });
                    });
                    // Lưu tất cả suppliers để filter sau này
                    if (allSuppliersFromCompanies.length > 0) {
                        setAllSuppliers(allSuppliersFromCompanies);
                        setSuppliers(allSuppliersFromCompanies);
                    }
                }
            } catch (error) {
                console.error("Failed to load data", error);
            }
        };
        loadData();
    }, []);

    // Khởi tạo formData từ employee khi vào chế độ edit
    useEffect(() => {
        if (isEditing && employee && companies.length > 0 && allSuppliers.length > 0) {
            // Tìm companyId từ supplierId của employee
            const employeeCompany = companies.find(c =>
                c.suppliers?.some(s => s.id === employee.supplierId)
            );

            if (employeeCompany) {
                setSelectedCompanyId(employeeCompany.id);
            }

            setFormData({
                name: employee.name || "",
                avatarUrl: employee.avatarUrl || "",
                phone: employee.phone || "",
                address: employee.address || "",
                positionId: employee.positionId || 0,
                supplierId: employee.supplierId || 0,
                typeWorkId: employee.typeWorkId || 0,
                joinDate: employee.joinDate ? employee.joinDate.split("T")[0] : "",
                gender: employee.gender ?? true,
                nationality: employee.nationality || "",
                dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split("T")[0] : "",
                identityNumber: employee.identityNumber || "",
                taxCode: employee.taxCode || "",
                workEmail: employee.workEmail || "",
                bankName: employee.bankName || "",
                bankAccountNumber: employee.bankAccountNumber || "",
                bankAccountHolderName: employee.bankAccountHolderName || "",
                emergencyContactName: employee.emergencyContactName || "",
                emergencyContactPhone: employee.emergencyContactPhone || "",
            });
        }
    }, [isEditing, employee, companies, allSuppliers]);

    // Filter suppliers khi company được chọn
    useEffect(() => {
        if (selectedCompanyId && companies.length > 0) {
            const selectedCompany = companies.find(c => c.id === selectedCompanyId);
            if (selectedCompany && selectedCompany.suppliers) {
                const filteredSuppliers = selectedCompany.suppliers
                    .filter(s => s.status)
                    .map(s => ({
                        id: s.id,
                        name: s.name,
                        status: s.status,
                        createdAt: s.createdAt,
                    }));
                setSuppliers(filteredSuppliers);

                // Reset supplierId nếu supplier hiện tại không thuộc company mới
                if (formData && formData.supplierId) {
                    const currentSupplierExists = filteredSuppliers.some(s => s.id === formData.supplierId);
                    if (!currentSupplierExists) {
                        setFormData({ ...formData, supplierId: 0 });
                    }
                }
            }
        } else if (!selectedCompanyId && allSuppliers.length > 0) {
            // Nếu không chọn company, hiển thị tất cả suppliers
            setSuppliers(allSuppliers);
        }
    }, [selectedCompanyId, companies, allSuppliers, formData]);

    // Xử lý submit form
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!employee || !formData) return;

        try {
            setSubmitting(true);
            const response = await employeeApi.updateEmployee(employee.employeeId, formData);

            if (response.data) {
                // Cập nhật employee data trong location state
                navigate("/EmployDetail", {
                    state: { employee: response.data },
                    replace: true
                });
                setIsEditing(false);
                alert("Cập nhật thông tin nhân viên thành công!");
            }
        } catch (error: any) {
            console.error("Failed to update employee", error);
            alert(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin nhân viên");
        } finally {
            setSubmitting(false);
        }
    };

    // Tính thâm niên từ ngày gia nhập
    const calculateTenure = (joinDate: string | undefined | null): string => {
        if (!joinDate) return "N/A";
        try {
            const join = new Date(joinDate);
            const now = new Date();

            // Kiểm tra ngày hợp lệ
            if (isNaN(join.getTime())) {
                return "N/A";
            }

            // Tính số năm và tháng
            let years = now.getFullYear() - join.getFullYear();
            let months = now.getMonth() - join.getMonth();

            // Điều chỉnh nếu tháng hiện tại nhỏ hơn tháng gia nhập
            if (months < 0) {
                years--;
                months += 12;
            }

            // Điều chỉnh nếu ngày hiện tại nhỏ hơn ngày gia nhập trong tháng
            if (now.getDate() < join.getDate()) {
                months--;
                if (months < 0) {
                    years--;
                    months += 12;
                }
            }

            // Format kết quả
            const parts: string[] = [];
            if (years > 0) {
                parts.push(`${years} năm`);
            }
            if (months > 0) {
                parts.push(`${months} tháng`);
            }

            // Nếu chưa đủ 1 tháng
            if (parts.length === 0) {
                const days = Math.floor((now.getTime() - join.getTime()) / (1000 * 60 * 60 * 24));
                return `${days} ngày`;
            }

            return parts.join(", ");
        } catch (error) {
            return "N/A";
        }
    };


    return (
        <div className="mx-auto max-w-6xl space-y-6 py-8">

            <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                <span className="mx-2 text-gray-400">/</span>
                <Link to="/ManagerEmploy" className="hover:text-primary transition-colors">Danh sách nhân viên</Link>
                <span className="mx-2 text-gray-400">/</span>
                <span className="font-medium text-gray-900 dark:text-white">{employee?.name}</span>
            </nav>

            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Hồ sơ nhân viên</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Quản lý thông tin chi tiết, hợp đồng và lịch sử công việc.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center justify-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <span className="material-symbols-outlined text-[20px]">print</span>
                        <span>In hồ sơ</span>
                    </button>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-black hover:text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
                        >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                            <span>Chỉnh sửa hồ sơ</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex items-center justify-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                            <span>Hủy</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark shadow-sm border border-border-light dark:border-border-dark p-6">

                <div className="absolute right-0 top-0 h-32 w-32 -mr-8 -mt-8 rounded-full bg-primary/10 blur-3xl"></div>
                <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white dark:border-gray-800 shadow-md">
                            {employee?.avatarUrl ? (
                                <img alt="Chân dung nhân viên" className="h-full w-full object-cover" src={employee.avatarUrl} />
                            ) : (
                                <img
                                    alt="Chân dung nhân viên mặc định"
                                    className="h-full w-full object-cover"
                                    src={employee?.gender
                                        ? "https://blog.vn.revu.net/wp-content/uploads/2025/09/anh-son-tung-mtp-thumb.jpg"
                                        : "https://i.pinimg.com/originals/4c/e5/2a/4ce52a5518ecb3daef9770148a80f21a.jpg"
                                    }
                                />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{employee?.name}</h2>
                                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400"> {employee?.online ? "Đang hoạt động" : "Offline"}</span>
                            </div>
                            <p className="text-base text-gray-500 dark:text-gray-400">{employee?.position?.name}</p>
                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">badge</span>
                                    <span>CCCD/CMND: #{employee?.identityNumber}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">apartment</span>
                                    <span>{employee?.company?.name || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">business</span>
                                    <span>{employee?.supplier?.name || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                    <span>{employee?.company?.address || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row gap-8 md:flex-col md:items-end md:gap-1 lg:flex-row lg:items-center lg:gap-8 border-t md:border-t-0 border-border-light dark:border-border-dark pt-4 md:pt-0">
                        <div className="text-left md:text-right lg:text-center">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày gia nhập</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatDate(employee?.joinDate)}</p>
                        </div>
                        <div className="text-left md:text-right lg:text-center">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Quản lý chi nhánh</p>
                            <div className="flex items-center gap-2 md:justify-end lg:justify-center">
                                {employee?.managers && employee.managers.length > 0 ? (
                                    employee.managers.map((manager) => (
                                        <div key={manager.employeeId} className="flex items-center gap-2">
                                            <div
                                                className="h-6 w-6 rounded-full bg-cover bg-center"
                                                style={{
                                                    backgroundImage: `url(${manager?.avatarUrl
                                                        ? manager.avatarUrl
                                                        : manager.gender
                                                            ? "https://blog.vn.revu.net/wp-content/uploads/2025/09/anh-son-tung-mtp-thumb.jpg"
                                                            : "https://cdn2.tuoitre.vn/thumb_w/480/471584752817336320/2025/7/31/edit-122946417b8bf2d5ab9a-17539298651421799809578.jpeg"
                                                        })`
                                                }}
                                            />
                                            <p className="font-bold text-gray-900 dark:text-white">{manager.name}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm font-medium text-gray-400 dark:text-gray-400">Chưa có quản lý chi nhánh</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 rounded-xl shadow-sm">
                <nav aria-label="Tabs" className="-mb-px flex space-x-8 overflow-x-auto">
                    <a aria-current="page" className="border-b-2 border-primary py-4 px-1 text-sm font-bold text-primary" href="#">Tổng quan</a>
                    <a className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" href="#">Hợp đồng</a>
                    <a className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" href="#">Lịch sử công việc</a>
                    <a className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" href="#">Lương &amp; Phúc lợi</a>
                    <a className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" href="#">Tài liệu</a>
                </nav>
            </div>

            {isEditing && formData ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">person</span>
                                Thông tin cá nhân
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Họ và tên *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ảnh đại diện</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const url = prompt("Nhập URL ảnh đại diện:", formData.avatarUrl || "");
                                        if (url !== null) {
                                            setFormData({ ...formData, avatarUrl: url });
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">image</span>
                                    <span>Chỉnh sửa ảnh</span>
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Giới tính *</label>
                                <select
                                    required
                                    value={formData.gender ? "true" : "false"}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value === "true" })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="true">Nam</option>
                                    <option value="false">Nữ</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ngày sinh *</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.dateOfBirth}
                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Quốc tịch *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nationality}
                                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">CCCD/CMND *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.identityNumber}
                                    onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Mã số thuế *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.taxCode}
                                    onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Địa chỉ thường trú *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">contact_phone</span>
                                Thông tin liên hệ
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email công việc *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.workEmail}
                                    onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Số điện thoại *</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tên người liên hệ khẩn cấp *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.emergencyContactName}
                                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">SĐT người liên hệ khẩn cấp *</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.emergencyContactPhone}
                                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">account_balance</span>
                                Thông tin ngân hàng
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ngân hàng *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Số tài khoản *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.bankAccountNumber}
                                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tên chủ tài khoản *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.bankAccountHolderName}
                                    onChange={(e) => setFormData({ ...formData, bankAccountHolderName: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">work</span>
                                Thông tin công việc
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Vị trí *</label>
                                <select
                                    required
                                    value={formData.positionId}
                                    onChange={(e) => setFormData({ ...formData, positionId: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Chọn vị trí</option>
                                    {positions.map((pos) => (
                                        <option key={pos.id} value={pos.id}>
                                            {pos.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Công ty *</label>
                                <select
                                    required
                                    value={selectedCompanyId || ""}
                                    onChange={(e) => {
                                        const companyId = e.target.value ? Number(e.target.value) : null;
                                        setSelectedCompanyId(companyId);
                                        // Reset supplierId khi đổi company
                                        if (formData) {
                                            setFormData({ ...formData, supplierId: 0 });
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Chọn công ty</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Văn phòng *</label>
                                <select
                                    required
                                    value={formData.supplierId}
                                    onChange={(e) => setFormData({ ...formData, supplierId: Number(e.target.value) })}
                                    disabled={!selectedCompanyId}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">{selectedCompanyId ? "Chọn văn phòng" : "Vui lòng chọn công ty trước"}</option>
                                    {suppliers.map((sup) => (
                                        <option key={sup.id} value={sup.id}>
                                            {sup.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Loại hình *</label>
                                <select
                                    required
                                    value={formData.typeWorkId}
                                    onChange={(e) => setFormData({ ...formData, typeWorkId: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Chọn loại hình</option>
                                    {typeWorks.map((typeWork) => (
                                        <option key={typeWork.id} value={typeWork.id}>
                                            {typeWork.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ngày gia nhập *</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.joinDate}
                                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">person</span>
                                    Thông tin cá nhân
                                </h3>
                            </div>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Họ và tên</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Giới tính</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.gender ? "Nam" : "Nữ"}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày sinh</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{formatDate(employee?.dateOfBirth)}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Quốc tịch</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.nationality}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">CCCD/CMND</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.identityNumber}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Mã số thuế</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.taxCode}</dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Địa chỉ thường trú</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.address}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">contact_phone</span>
                                    Thông tin liên hệ
                                </h3>
                            </div>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email công việc</dt>
                                    <dd className="mt-1 text-sm font-semibold text-primary">{employee?.workEmail}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email cá nhân</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.email}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Số điện thoại</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.phone}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Liên hệ khẩn cấp</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.emergencyContactName} - {formatPhoneNumber(employee?.emergencyContactPhone)}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">account_balance</span>
                                    Thông tin ngân hàng
                                </h3>
                            </div>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ngân hàng</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.bankName}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Số tài khoản</dt>
                                    <dd className="mt-1 flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                                            {formatBankAccount(employee?.bankAccountNumber)}
                                        </span>
                                        <button
                                            onClick={() => setShowBankAccount(!showBankAccount)}
                                            className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                                            title={showBankAccount ? "Ẩn số tài khoản" : "Hiện số tài khoản"}
                                        >
                                            <span className="material-icons-outlined text-sm">
                                                {showBankAccount ? "visibility_off" : "visibility"}
                                            </span>
                                        </button>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tên chủ tài khoản</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.bankAccountHolderName}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <div className="space-y-6 lg:col-span-1">
                        <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">work</span>
                                Thông tin công việc
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Loại hình</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{employee?.typeWork?.name}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Ngày chính thức</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(employee?.joinDate)}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Thâm niên</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{calculateTenure(employee?.joinDate)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Văn phòng</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{employee?.supplier?.name}</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">description</span>
                                Hợp đồng hiện tại
                            </h3>
                            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                                        <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="truncate text-sm font-bold text-gray-900 dark:text-white">HDLD-2023-056.pdf</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Hợp đồng lao động không xác định thời hạn</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-green-600 font-medium">Đã ký ngày 12/07/2023</span>
                                    <a className="text-primary hover:underline" href="#">Tải về</a>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">history</span>
                                    Lịch sử
                                </h3>
                                <a className="text-xs font-medium text-primary hover:underline" href="#">Xem tất cả</a>
                            </div>
                            <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-3 space-y-8">

                                <div className="relative ml-6">
                                    <span className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-primary dark:border-gray-900"></span>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Thăng chức Senior Engineer</h4>
                                    <p className="text-xs text-gray-500 mt-1">01/01/2023</p>
                                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">Được bổ nhiệm vị trí mới sau đánh giá hiệu suất năm 2022.</p>
                                </div>

                                <div className="relative ml-6">
                                    <span className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-gray-300 dark:border-gray-900 dark:bg-gray-600"></span>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Ký hợp đồng chính thức</h4>
                                    <p className="text-xs text-gray-500 mt-1">12/07/2021</p>
                                </div>

                                <div className="relative ml-6">
                                    <span className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-gray-300 dark:border-gray-900 dark:bg-gray-600"></span>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Gia nhập công ty</h4>
                                    <p className="text-xs text-gray-500 mt-1">12/05/2021</p>
                                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">Vị trí: Software Engineer (Thử việc)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployDetail;
