import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api.type";

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
};

