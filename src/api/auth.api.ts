import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api.type";
import { tokenService } from "../utils/token";


export interface LoginPayload {
    emailOrUsername: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

export const authApi = {
    login(data: LoginPayload): Promise<ApiResponse<LoginResponse>> {
        return axiosClient.post("/auth/login", data);
    },

    logout() {
        const token = localStorage.getItem("token");

        return axiosClient.post(
            "/auth/logout",
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
    },
    refreshToken() {
        console.log("🔍 [DEBUG] Refreshing token");
        console.log("🔍 [DEBUG] Refresh token:", tokenService.getRefreshToken());
        return axiosClient.post(
            "/auth/refresh",
            {
                refreshToken: tokenService.getRefreshToken(),
            }
        );
    },

    // Force logout một user theo userId (ADMIN: mọi user, MANAGER: chỉ nhân viên cùng supplier)
    forceLogout(userId: string): Promise<ApiResponse<any>> {
        return axiosClient.post(`/auth/force-logout/${userId}`);
    },
};