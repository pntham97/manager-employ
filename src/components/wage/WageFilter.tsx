import React from "react";
import type { Company, EmployeeResponse } from "../../api/employee.api";

// Re-defining locally for the component prop usage if not exported commonly
export interface CompanySupplier {
    id: number;
    name: string;
    status: boolean;
    companyId: number;
    createdAt: string;
}

interface WageFilterProps {
    companies: Company[];
    displayedSuppliers: CompanySupplier[]; // Using the local interface or we could use appropriate type
    employees: EmployeeResponse[];
    selectedCompanyId: number | null;

    // Clearing selectedEmployeeId and employees list is a side effect often handled by the parent when company changes,
    // but here we might pass a handler that does all that, or separate setters.
    // The original code did: setSelectedCompanyId(id); setSelectedEmployeeId(null); setEmployees([]);
    // So we can either pass individual setters and let this component orchestrate, or pass a "onCompanyChange" handler.
    // Passing individual setters is more flexible but "onCompanyChange" is cleaner. 
    // Let's pass the setters for now to keep it close to original logic, or wrap them.
    // Actually, to fully replicate logic:
    // onChange Company -> setSelectedCompanyId, setSelectedEmployeeId(null), setEmployees([])
    // onChange Supplier -> setSelectedSuppliersId, setSelectedEmployeeId(null)

    // So we need:
    onCompanyChange: (id: number | null) => void;

    selectedSuppliersId: number | null;
    onSupplierChange: (id: number | null) => void;

    selectedEmployeeId: number | null;
    setSelectedEmployeeId: (id: number | null) => void;
    fromDate: string;
    toDate: string;
    onFromDateChange: (val: string) => void;
    onToDateChange: (val: string) => void;
    handleSubmit: () => void;
    typeWorksEmploys: string | null;
}

const WageFilter: React.FC<WageFilterProps> = ({
    companies,
    displayedSuppliers,
    employees,
    selectedCompanyId,
    onCompanyChange,
    selectedSuppliersId,
    onSupplierChange,
    selectedEmployeeId,
    setSelectedEmployeeId,
    onFromDateChange,
    onToDateChange,
    handleSubmit,
    toDate,
    fromDate
    // typeWorksEmploys
}) => {
    return (
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
                                const val = e.target.value ? +e.target.value : null;
                                onCompanyChange(val);
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
                                const val = e.target.value ? +e.target.value : null;
                                onSupplierChange(val);
                            }}
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
                <label className="flex flex-col gap-2">
                    <span className="text-slate-900 dark:text-slate-200 text-sm font-medium ml-1">
                        Khoảng thời gian
                    </span>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* From date */}
                        <div className="relative">
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => onFromDateChange(e.target.value)}
                                className="w-full sm:w-40 bg-slate-50 dark:bg-slate-800
                    border border-slate-200 dark:border-slate-700
                    text-slate-900 dark:text-white text-sm
                    rounded-lg px-3 py-2 shadow-sm
                    focus:ring-2 focus:ring-primary/20 focus:border-primary
                    transition-colors cursor-pointer"
                            />
                        </div>

                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-400">
                            —
                        </span>

                        {/* To date */}
                        <div className="relative">
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => onToDateChange(e.target.value)}
                                className="w-full sm:w-40 bg-slate-50 dark:bg-slate-800
                    border border-slate-200 dark:border-slate-700
                    text-slate-900 dark:text-white text-sm
                    rounded-lg px-3 py-2 shadow-sm
                    focus:ring-2 focus:ring-primary/20 focus:border-primary
                    transition-colors cursor-pointer"
                            />
                        </div>
                    </div>
                </label>
                <button onClick={handleSubmit} className="flex max-w-[180px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[#2563eb] text-white text-sm font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px] mr-2">send</span>
                    <span className="truncate">Xuất phiếu lương</span>
                </button>
                {/* {typeWorksEmploys === "Hợp đồng" && <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kỳ lương</span>
                    <div className="relative">
                        <input className="form-input w-full h-11 rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-[#111318] dark:text-white focus:ring-[#2563eb] focus:border-[#2563eb] px-4" type="month" value="2023-10" />
                    </div>
                </label>} */}

            </div>
        </div>
    );
};

export default WageFilter;
