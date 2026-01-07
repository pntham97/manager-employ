import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api.type";

export interface EmployeeResponse {
    employeeId: number;
    userId: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    positionId: number;
    position?: {
        id: number;
        name: string;
        createdAt?: string;
    };
    supplierId: number;
    supplier?: {
        id: number;
        name: string;
        status?: boolean;
        createdAt?: string;
    };
    joinDate: string;
    gender: boolean;
    nationality: string;
    dateOfBirth: string;
    identityNumber: string;
    taxCode: string;
    workEmail: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolderName: string;
    online: boolean;
    createdAt: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    typeWorkId: number;
    typeWork: {
        id: number,
        name: string,
    },
    company: {
        id: number,
        name: string,
        address: string,
    }
    managers: Managers[],
    avatarUrl: string,
    lastOfflineAt: string;
}
export interface Managers {
    employeeId: number,
    name: string;
    email: string;
    phone: string;
    gender: boolean;
    avatarUrl: string;
}

export interface EmployeeStatusEvent {
    employeeId: number;
    userId: string;
    name: string;
    isOnline: boolean;
    lastOfflineAt: string | null;
}

export interface TypeWork {
    id: number;
    name: string;
    createdAt: string;
}

export interface CompanySupplier {
    id: number;
    name: string;
    status: boolean;
    companyId: number;
    createdAt: string;
}

export interface Company {
    id: number;
    name: string;
    address: string;
    createdAt: string;
    suppliers: CompanySupplier[];
}

export interface TypeWorksAndCompaniesResponse {
    typeWorks: TypeWork[];
    companies: Company[];
}

export interface UpdateEmployeeRequest {
    name: string;
    avatarUrl?: string;
    phone: string;
    address: string;
    positionId: number;
    supplierId: number;
    typeWorkId: number;
    joinDate: string;
    gender: boolean;
    nationality: string;
    dateOfBirth: string;
    identityNumber: string;
    taxCode: string;
    workEmail: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountHolderName: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    roleName: string;
}
export interface PageResponse<T> {
    data: any;
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export const employeeApi = {
    getSuppliersPositions(): Promise<ApiResponse<{
        suppliers: Array<{
            id: number;
            name: string;
            status: boolean;
            createdAt: string;
        }>;
        positions: Array<{
            id: number;
            name: string;
            createdAt: string;
        }>;
    }>> {
        return axiosClient.get("/employee/suppliers-positions");
    },

    getBySupplierId(
        supplierId: number,
        page: number = 0,
        size: number = 10,
        employeeName?: string
    ): Promise<ApiResponse<PageResponse<EmployeeResponse>>> {
        const params: { page: number; size: number; employeeName?: string } = { page, size };
        if (employeeName && employeeName.trim()) {
            params.employeeName = employeeName.trim();
        }
        return axiosClient.get(`/employee/supplier/${supplierId}`, {
            params,
        });
    },

    getList(
        page: number = 0,
        size: number = 10,
        employeeName?: string,
        supplierId?: number,
        companyId?: number,
        signal?: AbortSignal
    ): Promise<ApiResponse<PageResponse<EmployeeResponse>>> {
        const params: { page: number; size: number; employeeName?: string; supplierId?: number; companyId?: number } = { page, size };
        if (employeeName && employeeName.trim()) {
            params.employeeName = employeeName.trim();
        }
        if (supplierId) {
            params.supplierId = supplierId;
        }
        if (companyId) {
            params.companyId = companyId;
        }
        return axiosClient.get("/employee/list", {
            params,
            signal,
        });
    },

    updateEmployee(
        employeeId: number,
        data: UpdateEmployeeRequest
    ): Promise<ApiResponse<EmployeeResponse>> {
        return axiosClient.put(`/employee/${employeeId}`, data);
    },

    getTypeWorksAndCompanies(): Promise<ApiResponse<TypeWorksAndCompaniesResponse>> {
        return axiosClient.get("/employee/type-works-companies");
    },
};

