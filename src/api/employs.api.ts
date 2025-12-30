import axiosClient from "./axiosClient";

export interface RegisterEmployPayload {
    userName: string;
    email: string;
    password: string;
    roleCodeId?: string;   // optional
    employeeName: string;
    phone: string;
    address: string;
    positionId: number;
    supplierId: number;
}

export const employsApi = {
    getRole() {
        return axiosClient.get("/auth/roles");
    },
    getEmploys() {
        return axiosClient.get("/employee/suppliers-positions");
    },
    postEmploys(data: RegisterEmployPayload) {
        return axiosClient.post("/auth/register", data);
    },
};

