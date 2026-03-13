import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api.type";

export interface DashboardSummaryEmployee {
    employeeId: number;
    userId: string;
    name: string;
    avatarUrl: string | null;
    supplierId: number;
    positionId: number;
    position?: { id: number; name: string; createdAt: string };
    typeWork?: { id: number; name: string; createdAt: string };
    createdAt: string;
}

export interface DashboardSummaryResponse {
    totalProjectsInProgress: number;
    totalEmployeesInSupplierHmt: number;
    totalHistorySchedulePending: number;
    employeeGrowthPercentMoM: number;
    totalProjectsInProgressNearDeadline: number;
    recentEmployees: DashboardSummaryEmployee[];
    projectsByTypeInCurrentMonth: Array<{
        type: {
            id: number;
            typeName: string;
            description: string;
        };
        projects: Array<{
            id: number;
            projectName: string;
            description: string;
            startDate: string;
            deadline: string;
            progress: number;
            typeId: number;
        }>;
    }>;
}
export interface ProcessImmediatelyResponse {
    id: number;
    name: string;
    isDone: boolean;
    deadline: string;
    createdAt: string;
}
export const dashboardApi = {
    getSummary(): Promise<ApiResponse<DashboardSummaryResponse>> {
        return axiosClient.get("/dashboard/summary");
    },
    getProcessImmediately(): Promise<ApiResponse<Array<ProcessImmediatelyResponse>>> {
        return axiosClient.get("/dashboard/process-immediately");
    },
    createProcessImmediately(payload: { name: string; deadline: string }): Promise<ApiResponse<void>> {
        return axiosClient.post("/dashboard/create-process-immediately", payload);
    },
    updateProcessImmediately(data: ProcessImmediatelyResponse): Promise<ApiResponse<any>> {
        return axiosClient.put(`/dashboard/path/${data.id}`, data);
    },
};