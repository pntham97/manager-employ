import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { employeeApi, type Company, type EmployeeResponse, type PageResponse, type TypeWork } from "../api/employee.api";
import { employsApi } from "../api/employs.api";
import EmployeeContractSalaryView from "../components/EmployeeContractSalaryView";
import EmployeeKPIView from "../components/EmployeeKPIView";

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


const Wage: React.FC = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<Role[]>([]);
    const abortRef = useRef<AbortController | null>(null);
    const lastQueryKeyRef = useRef<string | null>(null);
    const [employs, setEmploys] = useState({
        suppliers: [] as Supplier[],
        positions: [] as Position[],
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [typeWorks, setTypeWorks] = useState<TypeWork[]>([]);
    const [typeWorksEmploys, setTypeWorksEmploys] = useState<string | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [allSuppliers, setAllSuppliers] = useState<CompanySupplier[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
    const [selectedSuppliersId, setSelectedSuppliersId] = useState<number | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const [employees, setEmployees] = useState<EmployeeResponse[]>([]);


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
    const fetchEmployees = async (
        companyId?: number | null,
        supplierId?: number | null,
        searchName: string = ""
    ) => {
        // ❌ Chưa chọn đủ điều kiện thì không gọi API
        if (!companyId || !supplierId) {
            setEmployees([]);
            return;
        }

        const currentPage = 0;
        const pageSize = 100; // đủ cho select

        try {
            const queryKey = JSON.stringify({
                companyId,
                supplierId,
                searchName,
            });

            if (queryKey === lastQueryKeyRef.current) {
                return;
            }
            lastQueryKeyRef.current = queryKey;

            // Huỷ request trước
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            setLoading(true);

            console.log("🚀 [API CALL] get employees", {
                companyId,
                supplierId,
                searchName,
            });

            const response = await employeeApi.getList(
                currentPage,
                pageSize,
                searchName,
                supplierId,
                companyId,
                controller.signal
            );

            const raw = response.data;
            let pageData: PageResponse<EmployeeResponse> | null = null;

            if (raw?.content) {
                pageData = raw;
            } else if (raw?.data?.content) {
                pageData = raw.data;
            }

            setEmployees(pageData?.content ?? []);
        } catch (error: any) {
            if (error?.name === "AbortError" || error?.name === "CanceledError") {
                console.warn("⚠️ fetchEmployees aborted");
                return;
            }

            console.error("❌ fetchEmployees error", error);
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (!selectedCompanyId || !selectedSuppliersId) {
            setEmployees([]);
            return;
        }

        fetchEmployees(
            selectedCompanyId,
            selectedSuppliersId
        );
    }, [selectedCompanyId, selectedSuppliersId]);
    useEffect(() => {
        if (selectedEmployeeId) {
            const selectedEmployee = employees.find(
                (item) => item.employeeId === selectedEmployeeId
            );
            setTypeWorksEmploys(selectedEmployee?.typeWork?.name ?? null);
        }
    }, [selectedEmployeeId]);

    const displayedSuppliers = useMemo(() => {
        return selectedCompanyId
            ? allSuppliers.filter((s) => s.companyId === selectedCompanyId)
            : allSuppliers;
    }, [selectedCompanyId, allSuppliers]);

    const renderByTypeWork = (type: string | null) => {
        switch (type?.trim()) {
            case "Hợp đồng":
                return <EmployeeContractSalaryView />;

            case "Toàn thời gian":
            case "Bán thời gian":
            case "Thực tập":
            case "Thời vụ":
                return <EmployeeKPIView />;

            default:
                return (
                    <div className="text-sm text-gray-500 italic text-center mt-10">
                        Chưa có dữ liệu hiển thị
                    </div>
                );
        }
    };

    return (
        <div className="px-16 py-8 w-full flex flex-col">
            <nav className="flex flex-wrap gap-2 pb-4 text-sm">
                <a className="text-[#616f89] dark:text-gray-400 font-medium hover:underline" href="#">Trang chủ</a>
                <span className="text-[#616f89] dark:text-gray-400">/</span>
                <a className="text-[#616f89] dark:text-gray-400 font-medium hover:underline" href="#">Quản lý lương</a>
                <span className="text-[#616f89] dark:text-gray-400">/</span>
                <span className="text-[#111318] dark:text-white font-semibold">Tính lương chi tiết</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-gray-200 dark:border-gray-800 mb-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-[#111318] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">Tính lương tháng 10/2023</h1>
                    <p className="text-[#616f89] dark:text-gray-400 text-base">Quản lý, điều chỉnh và chốt lương cho nhân viên.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 px-4 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-[#111318] dark:text-white text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <span className="material-symbols-outlined text-[20px] mr-2">download</span>
                        <span className="truncate">Xuất Excel</span>
                    </button>
                    <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-#2563eb text-[#2563eb] text-sm font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[20px] mr-2">send</span>
                        <span className="truncate">Gửi phiếu lương</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                <div className="lg:col-span-8 flex flex-col gap-6">

                    <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#2563eb]">badge</span>
                            Thông tin nhân viên
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            setSelectedEmployeeId(null);
                                            setEmployees([]);
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
                                        value={selectedSuppliersId || ""}
                                        onChange={(e) => {
                                            const supplierId = e.target.value ? +e.target.value : null;
                                            setSelectedSuppliersId(supplierId);
                                            setSelectedEmployeeId(null);
                                        }
                                        }
                                        disabled={!selectedCompanyId}
                                        className="form-select w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 pl-10 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">{selectedCompanyId ? "Chọn văn phòng..." : "Vui lòng chọn công ty trước"}</option>
                                        {displayedSuppliers
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
                                <span className="text-slate-900 dark:text-slate-200 text-sm font-medium">
                                    Chọn Nhân viên <span className="text-red-500">*</span>
                                </span>

                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        <span className="material-symbols-outlined text-[20px]">person</span>
                                    </div>

                                    <select
                                        value={selectedEmployeeId ?? ""}
                                        onChange={(e) =>
                                            setSelectedEmployeeId(
                                                e.target.value ? Number(e.target.value) : null
                                            )
                                        }
                                        disabled={!selectedSuppliersId}
                                        className="form-select w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white h-12 pl-10 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">
                                            {selectedSuppliersId
                                                ? "Chọn nhân viên..."
                                                : "Vui lòng chọn văn phòng trước"}
                                        </option>

                                        {employees.map((emp: any) => (
                                            <option key={emp.id} value={emp.employeeId}>
                                                {emp.name} ({emp.employeeId})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center pointer-events-none">
                                        <span className="material-symbols-outlined text-[20px]">arrow_drop_down</span>
                                    </div>
                                </div>
                            </label>

                            {typeWorksEmploys === "Hợp đồng" && <label className="flex flex-col gap-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kỳ lương</span>
                                <div className="relative">
                                    <input className="form-input w-full h-11 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-[#111318] dark:text-white focus:ring-#2563eb focus:border-#2563eb px-4" type="month" value="2023-10" />
                                </div>
                            </label>}

                        </div>
                    </div>
                    {renderByTypeWork(typeWorksEmploys)}
                </div >

                <div className="lg:col-span-4 flex flex-col gap-6">

                    <div className="sticky top-24">
                        <div className="bg-[#2563eb] text-white rounded-xl shadow-lg shadow-blue-500/20 p-6 mb-6 relative overflow-hidden">

                            <div className="absolute top-0 right-0 opacity-10">
                                <span className="material-symbols-outlined text-[180px] -mr-8 -mt-8">paid</span>
                            </div>
                            <h3 className="text-lg font-medium opacity-90 mb-6 relative z-10">Tổng kết lương</h3>
                            <div className="space-y-3 relative z-10">
                                <div className="flex justify-between items-center text-sm opacity-90">
                                    <span>Tổng thu nhập</span>
                                    <span className="font-mono">20.280.500 ₫</span>
                                </div>
                                <div className="flex justify-between items-center text-sm opacity-90">
                                    <span>Tổng khấu trừ</span>
                                    <span className="font-mono text-red-200">-2.025.000 ₫</span>
                                </div>
                                <div className="h-px bg-white/20 my-4"></div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium opacity-80">Thực lĩnh (Net Salary)</span>
                                    <span className="text-3xl lg:text-4xl font-black tracking-tight font-mono">18.255.500 ₫</span>
                                </div>
                            </div>
                            <div className="mt-8 grid grid-cols-2 gap-3 relative z-10">
                                <button className="w-full py-2.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm text-sm font-bold transition-colors border border-white/20">Lưu nháp</button>
                                <button className="w-full py-2.5 rounded-lg bg-white text-[#2563eb] hover:bg-gray-50 text-sm font-bold transition-colors shadow-sm">Chốt lương</button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#1a202c] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-[#111318] dark:text-white text-sm">Lịch sử thanh toán</h4>
                                <a className="text-xs text-[#2563eb] font-medium hover:underline" href="#">Xem tất cả</a>
                            </div>
                            <div className="flex flex-col gap-4">

                                <div className="flex items-start justify-between pb-3 border-b border-gray-50 dark:border-gray-800 last:border-0 last:pb-0">
                                    <div className="flex gap-3">
                                        <div className="size-10 rounded bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-xl">check_circle</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#111318] dark:text-white">Tháng 9/2023</p>
                                            <p className="text-xs text-gray-500">05/10/2023</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-mono font-bold text-[#111318] dark:text-white">18.100.000 ₫</p>
                                        <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300 ring-1 ring-inset ring-green-600/20">Đã TT</span>
                                    </div>
                                </div>

                                <div className="flex items-start justify-between pb-3 border-b border-gray-50 dark:border-gray-800 last:border-0 last:pb-0">
                                    <div className="flex gap-3">
                                        <div className="size-10 rounded bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-xl">check_circle</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#111318] dark:text-white">Tháng 8/2023</p>
                                            <p className="text-xs text-gray-500">05/09/2023</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-mono font-bold text-[#111318] dark:text-white">17.850.000 ₫</p>
                                        <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300 ring-1 ring-inset ring-green-600/20">Đã TT</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-100 dark:border-orange-800">
                            <div className="flex gap-3">
                                <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 shrink-0">info</span>
                                <div>
                                    <p className="text-sm font-bold text-orange-800 dark:text-orange-300 mb-1">Lưu ý</p>
                                    <p className="text-xs text-orange-700 dark:text-orange-400 leading-relaxed">
                                        Hệ thống sẽ tự động chốt công vào ngày 30 hàng tháng. Vui lòng kiểm tra kỹ các khoản phụ cấp trước khi xuất phiếu lương.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
};

export default Wage;
