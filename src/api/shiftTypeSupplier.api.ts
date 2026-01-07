import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api.type";

export interface CreateShiftTypeSupplierRequest {
    name: string;
    supplierId: number;
    shiftTypeId: number;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
}

export const shiftTypeSupplierApi = {
    getByMonthYear(
        supplierId: number,
        month: number,
        year: number
    ): Promise<ApiResponse<any>> {
        return axiosClient.get(`/shift-type-supplier/supplier/${supplierId}`, {
            params: { month, year },
        });
    },

    getByMonthYearAdminManager(
        month: number,
        year: number,
        supplierId?: number
    ): Promise<ApiResponse<any>> {
        const params: { month: number; year: number; supplierId?: number } = { month, year };
        if (supplierId !== undefined) {
            params.supplierId = supplierId;
        }

        console.log("[shiftTypeSupplierApi.getByMonthYearAdminManager] Request params:", params);

        return axiosClient.get("/shift-type-supplier/month-year", {
            params,
        }).then((response: any) => {
            console.log("[shiftTypeSupplierApi.getByMonthYearAdminManager] Response:", response);
            console.log("[shiftTypeSupplierApi.getByMonthYearAdminManager] Response data:", response.data);
            return response;
        }).catch((error: any) => {
            console.error("[shiftTypeSupplierApi.getByMonthYearAdminManager] Error:", error);
            console.error("[shiftTypeSupplierApi.getByMonthYearAdminManager] Error response:", error.response?.data);
            throw error;
        });
    },

    create(data: CreateShiftTypeSupplierRequest): Promise<ApiResponse<any>> {
        return axiosClient.post("/shift-type-supplier", data);
    },
};


