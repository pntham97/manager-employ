import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import Cookies from "js-cookie";
import { useEffect } from "react";

const ChangePasswordPage = () => {
    const navigate = useNavigate();

    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState<{
        old?: string;
        new?: string;
        confirm?: string;
    }>({});

    useEffect(() => {
        return () => {
            Cookies.remove("newPassword", { path: "/change-password" });
        };
    }, []);

    useEffect(() => {
        const savedPassword = Cookies.get("newPassword");
        if (savedPassword) {
            setShowOtpModal(true);
        }
    }, []);

    const validate = () => {
        const newErrors: typeof errors = {};

        if (!oldPassword) newErrors.old = "Vui lòng nhập mật khẩu cũ";
        if (!newPassword) newErrors.new = "Vui lòng nhập mật khẩu mới";
        if (newPassword.length < 6)
            newErrors.new = "Mật khẩu mới phải ít nhất 6 ký tự";
        if (confirmPassword !== newPassword)
            newErrors.confirm = "Mật khẩu xác nhận không khớp";

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {

            // 🔥 Call API gửi OTP
            await authApi.changePasswordAdmin(oldPassword);

            // 🔥 Lưu newPassword tạm thời (KHÔNG gửi lên server lúc này)
            sessionStorage.setItem("newPassword", newPassword);

            alert("OTP đã được gửi về email 📩");
            Cookies.set("newPassword", newPassword || "", {
                expires: 1,      // 1 ngày
                secure: true,    // chỉ gửi qua https
                sameSite: "Strict"
            });
            setShowOtpModal(true);


        } catch (error: any) {
            alert(error?.response?.data?.message || "Gửi OTP thất bại");
        }
    };

    const handleConfirmOtp = async () => {
        try {

            await authApi.confirmChangePassword(
                otp,
                newPassword
            );

            sessionStorage.removeItem("newPassword");
            setShowOtpModal(false);
            setConfirmPassword("");
            setNewPassword("");
            setOldPassword("");
            Cookies.remove("newPassword");
            alert("Đổi mật khẩu thành công 🎉");

        } catch (error: any) {
            alert(error?.response?.data?.message || "OTP không hợp lệ");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
                <h2 className="text-2xl font-semibold mb-6 text-center">
                    Đổi mật khẩu
                </h2>

                <form className="space-y-4" onSubmit={handleChangePassword}>
                    <div>
                        <label className="block text-sm font-medium">Mật khẩu cũ</label>

                        <div className="relative">
                            <input
                                type={showOld ? "text" : "password"}
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className={`w-full border rounded-lg px-3 py-2 mt-1 pr-10 focus:ring-2 focus:ring-blue-500 ${errors.old ? "border-red-500" : "border-gray-300"
                                    }`}
                            />

                            <button
                                type="button"
                                onClick={() => setShowOld(!showOld)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showOld ? "🙈" : "👁"}
                            </button>
                        </div>

                        {errors.old && (
                            <p className="text-red-500 text-sm mt-1">{errors.old}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Mật khẩu mới</label>

                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={`w-full border rounded-lg px-3 py-2 mt-1 pr-10 focus:ring-2 focus:ring-blue-500 ${errors.new ? "border-red-500" : "border-gray-300"
                                    }`}
                            />

                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showNew ? "🙈" : "👁"}
                            </button>
                        </div>

                        {errors.new && (
                            <p className="text-red-500 text-sm mt-1">{errors.new}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium">
                            Xác nhận mật khẩu
                        </label>

                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-full border rounded-lg px-3 py-2 mt-1 pr-10 focus:ring-2 focus:ring-blue-500 ${errors.confirm ? "border-red-500" : "border-gray-300"
                                    }`}
                            />

                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirm ? "🙈" : "👁"}
                            </button>
                        </div>

                        {errors.confirm && (
                            <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                            Xác nhận
                        </button>
                    </div>
                </form>
                {showOtpModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fadeIn">

                            {/* Header */}
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Nhập mã OTP
                                </h2>
                                <button
                                    onClick={() => {
                                        setOtp("");          // reset OTP
                                        setShowOtpModal(false);
                                        Cookies.remove("newPassword");
                                    }}
                                    className="text-gray-400 hover:text-red-500 text-xl"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Body */}
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-2">
                                    Vui lòng nhập mã OTP đã gửi về email của bạn 📩
                                </p>

                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Nhập OTP..."
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest text-lg"
                                />
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setOtp("");          // reset OTP
                                        setShowOtpModal(false);
                                        Cookies.remove("newPassword");
                                    }}
                                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                                >
                                    Hủy
                                </button>

                                <button
                                    onClick={handleConfirmOtp}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChangePasswordPage;