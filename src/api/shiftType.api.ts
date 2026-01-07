import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api.type";

export interface ShiftTypeDetail {
    id: number;
    name: string;
    startAt?: string;
    endAt?: string;
    shiftTypeId?: number;
    createdAt?: string;
}

export interface ShiftTypeResponse {
    id: number;
    name: string;
    createdAt?: string;
    listDetailShiftType?: ShiftTypeDetail[];
}

export const shiftTypeApi = {
    getAll(): Promise<ApiResponse<ShiftTypeResponse[]>> {
        return axiosClient.get("/shift-types");
    },
};

