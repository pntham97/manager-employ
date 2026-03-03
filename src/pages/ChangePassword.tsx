import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ChangePasswordPage = () => {
    const navigate = useNavigate();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [errors, setErrors] = useState<{
        old?: string;
        new?: string;
        confirm?: string;
    }>({});

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
            // TODO: call API đổi mật khẩu ở đây
            console.log({ oldPassword, newPassword });

            alert("Đổi mật khẩu thành công 🎉");
            navigate(-1); // quay lại trang trước
        } catch (error: any) {
            alert(error?.response?.data?.message || "Đổi mật khẩu thất bại");
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
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className={`w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 ${errors.old ? "border-red-500" : "border-gray-300"
                                }`}
                        />
                        {errors.old && (
                            <p className="text-red-500 text-sm mt-1">{errors.old}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Mật khẩu mới</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={`w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 ${errors.new ? "border-red-500" : "border-gray-300"
                                }`}
                        />
                        {errors.new && (
                            <p className="text-red-500 text-sm mt-1">{errors.new}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium">
                            Xác nhận mật khẩu
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 ${errors.confirm ? "border-red-500" : "border-gray-300"
                                }`}
                        />
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
            </div>
        </div>
    );
};

export default ChangePasswordPage;