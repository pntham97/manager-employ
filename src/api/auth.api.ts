import axiosClient from "./axiosClient";
import { axiosRefresh } from "./axiosClient";
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
        return axiosRefresh.post("/auth/refresh", {
            refreshToken: tokenService.getRefreshToken(),
        });
    },

    // Force logout một user theo userId (ADMIN: mọi user, MANAGER: chỉ nhân viên cùng supplier)
    forceLogout(userId: string): Promise<ApiResponse<any>> {
        return axiosClient.post(`/auth/force-logout/${userId}`);
    },

    // Đổi mật khẩu nhân viên
    changePassword(userId: string, newPassword: string): Promise<ApiResponse<any>> {
        return axiosClient.put(`/auth/users/password`, { userId, newPassword });
    },
    // Đổi mật khẩu nhân viên
    changePasswordAdmin(oldPassword: string): Promise<ApiResponse<any>> {
        return axiosClient.post(`/auth/change-password/request-otp`, { oldPassword });
    },
    confirmChangePassword(otp: string, newPassword: string): Promise<ApiResponse<any>> {
        return axiosClient.put(`/auth/change-password/confirm`, { otp, newPassword });
    },

};