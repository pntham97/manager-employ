import axiosClient from "./axiosClient";

export interface RegisterEmployPayload {
    userName: string;
    email: string;
    password: string;
    employeeName: string;
    phone: string;
    address: string;
    positionId: number;
    supplierId: number;
    roleCodeId: string;
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
    typeWorkId: number;
    contractImgUrl?: string;
    contractSigningDate?: string;
    contractType?: boolean;
    emergencyContactName: string;
    emergencyContactPhone: string;
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

