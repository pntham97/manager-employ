import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api.type";

export interface CreateSchedulePayload {
    supplierId: number;
    detailShiftTypeId: number;
    registrationDate: string;
    dateRequest?: string;
    // Tuỳ chọn: ADMIN/MANAGER có thể truyền employeeId để đăng ký ca cho nhân viên khác
    employeeId?: number;
}
// export interface shiftTimeDeviation {
//     supplierId: number;
//     detailShiftTypeId: number;
//     registrationDate: string;
//     dateRequest?: string;
//     // Tuỳ chọn: ADMIN/MANAGER có thể truyền employeeId để đăng ký ca cho nhân viên khác
//     employeeId?: number;
// }
export const scheduleApi = {
    create(data: CreateSchedulePayload): Promise<ApiResponse<any>> {
        return axiosClient.post("/schedule", data);
    },

    getByMonthYear(month: number, year: number): Promise<ApiResponse<any>> {
        return axiosClient.get("/schedule", {
            params: { month, year },
        });
    },

    deleteHistory(params: {
        typeHistoryName: string;
        dateRequest: string;
        detailShiftTypeId: number;
    }): Promise<ApiResponse<any>> {
        return axiosClient.delete("/schedule/history", {
            params,
        });
    },

    delete(id: number): Promise<ApiResponse<any>> {
        return axiosClient.delete(`/schedule/${id}`);
    },

    getHistory(month: number, year: number, supplierId?: number): Promise<ApiResponse<any>> {
        const params: { month: number; year: number; supplierId?: number } = { month, year };
        // Backend: nếu role ADMIN có thể truyền thêm supplierId để lọc theo supplier
        if (supplierId !== undefined) {
            params.supplierId = supplierId;
        }
        return axiosClient.get("/schedule/history", {
            params,
        });
    },

    approveHistory(id: number, status: boolean = true, reasonRefusal?: string): Promise<ApiResponse<any>> {
        const params: { status: boolean; reasonRefusal?: string } = { status };
        if (reasonRefusal) {
            params.reasonRefusal = reasonRefusal;
        }
        return axiosClient.put(`/schedule/history/${id}/approve`, null, {
            params,
        });
    },

    getAdminManagerSchedule(month: number, year: number, supplierId?: number): Promise<ApiResponse<any>> {
        const params: { month: number; year: number; supplierId?: number } = { month, year };
        if (supplierId !== undefined) {
            params.supplierId = supplierId;
        }
        return axiosClient.get("/schedule/admin-manager", {
            params,
        });
    },

    createOrUpdateShiftTimeDeviation(data: {
        scheduleId: number;
        timeDeviation?: number;
        reason?: string;
    }): Promise<ApiResponse<any>> {
        return axiosClient.post("/shift-time-deviation", data);
    },
};

