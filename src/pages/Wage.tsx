import { useEffect, useMemo, useRef, useState } from "react";
import { employeeApi, type Company, type EmployeeResponse, type PageResponse } from "../api/employee.api";
import EmployeeContractSalaryView from "../components/EmployeeContractSalaryView";
import EmployeeKPIView from "../components/EmployeeKPIView";
import WageFilter, { type CompanySupplier } from "../components/wage/WageFilter";
import WageHeader from "../components/wage/WageHeader";
import WageSidebar from "../components/wage/WageSidebar";

const Wage: React.FC = () => {
    // State declarations
    const abortRef = useRef<AbortController | null>(null);
    const lastQueryKeyRef = useRef<string | null>(null);


    const [typeWorksEmploys, setTypeWorksEmploys] = useState<string | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [allSuppliers, setAllSuppliers] = useState<CompanySupplier[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
    const [selectedSuppliersId, setSelectedSuppliersId] = useState<number | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const [employees, setEmployees] = useState<EmployeeResponse[]>([]);

    useEffect(() => {

        const fetchTypeWorksAndCompanies = async () => {
            try {
                const res = await employeeApi.getTypeWorksAndCompanies();
                if (res.data) {

                    setCompanies(res.data.companies || []);

                    // Lưu tất cả suppliers từ companies
                    const allSuppliersFromCompanies: CompanySupplier[] = [];
                    res.data.companies?.forEach((company: Company) => {
                        company.suppliers?.forEach((supplier) => {
                            if (supplier.status) {
                                allSuppliersFromCompanies.push(supplier as unknown as CompanySupplier);
                            }
                        });
                    });
                    setAllSuppliers(allSuppliersFromCompanies);

                }
            } catch (err: any) {
                console.error("Failed to load typeWorks and companies", err);
            }
        };
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

    // Removed unused countProductByCreator function and call if not needed, 
    // but preserving for safety if it was doing something invisible (though it just calculated a variable).
    // The variable 'cuongTieCount' was unused in JSX. I will leave it out for cleaner code.

    const handleCompanyChange = (id: number | null) => {
        setSelectedCompanyId(id);
        setSelectedEmployeeId(null);
        setEmployees([]);
    };

    const handleSupplierChange = (id: number | null) => {
        setSelectedSuppliersId(id);
        setSelectedEmployeeId(null);
    };

    return (
        <div className="px-16 py-8 w-full flex flex-col">
            <WageHeader />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <WageFilter
                        companies={companies}
                        displayedSuppliers={displayedSuppliers}
                        employees={employees}
                        selectedCompanyId={selectedCompanyId}
                        onCompanyChange={handleCompanyChange}
                        selectedSuppliersId={selectedSuppliersId}
                        onSupplierChange={handleSupplierChange}
                        selectedEmployeeId={selectedEmployeeId}
                        setSelectedEmployeeId={setSelectedEmployeeId}
                        typeWorksEmploys={typeWorksEmploys}
                    />
                    {renderByTypeWork(typeWorksEmploys)}
                </div>

                <WageSidebar />
            </div>
        </div>
    );
};

export default Wage;
