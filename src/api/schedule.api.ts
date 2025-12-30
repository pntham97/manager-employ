import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api.type";

export interface CreateSchedulePayload {
    supplierId: number;
    detailShiftTypeId: number;
    registrationDate: string;
    dateRequest?: string;
}

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

    getHistory(month: number, year: number): Promise<ApiResponse<any>> {
        return axiosClient.get("/schedule/history", {
            params: { month, year },
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
};

