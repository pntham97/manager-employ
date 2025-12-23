import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api.type";

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
};


