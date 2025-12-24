import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api.type";

export interface CreateSchedulePayload {
    supplierId: number;
    detailShiftTypeId: number;
    registrationDate: string;
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
};

