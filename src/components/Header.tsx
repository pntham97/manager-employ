import React, { useEffect, useState } from "react";
import { Moon, Sun, User, LogOut, Key, X } from "lucide-react";

const Header: React.FC = () => {
    const [darkMode, setDarkMode] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // State đổi mật khẩu
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<{ old?: string; new?: string; confirm?: string }>({});

    // Đồng bộ dark mode với html tag
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);

    // Validate form
    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!oldPassword.trim()) {
            newErrors.old = "Vui lòng nhập mật khẩu cũ";
        }

        if (!newPassword.trim()) {
            newErrors.new = "Vui lòng nhập mật khẩu mới";
        } else if (newPassword.length < 6) {
            newErrors.new = "Mật khẩu mới phải có ít nhất 6 ký tự";
        } else if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            newErrors.new = "Mật khẩu mới phải có chữ hoa, chữ thường và số";
        }

        if (!confirmPassword.trim()) {
            newErrors.confirm = "Vui lòng xác nhận mật khẩu";
        } else if (confirmPassword !== newPassword) {
            newErrors.confirm = "Mật khẩu xác nhận không khớp";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Xử lý submit
    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            alert("Đổi mật khẩu thành công 🎉");
            setShowPasswordModal(false);
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setErrors({});
        }
    };

    return (
        <header className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 shadow-lg">
            <div className="flex items-center justify-end px-10 py-4">
                {/* Left Navigation */}
                {/* <nav className="flex space-x-8 text-lg font-semibold text-white">
                    <a href="/" className="hover:text-yellow-300 transition-colors hover:underline">Trang chủ</a>
                    <a href="/WareHouseTextNow" className="hover:text-yellow-300 transition-colors hover:underline">Kho TextNow</a>
                    <a href="/WareHouseTextFree" className="hover:text-yellow-300 transition-colors hover:underline">Kho TextFree</a>
                    <a href="/CheckAcc" className="hover:text-yellow-300 transition-colors hover:underline">Check Acc</a>
                    <a href="#" className="hover:text-yellow-300 transition-colors hover:underline">Quay đầu</a>
                </nav> */}

                {/* Right Actions */}
                <div className="flex items-center gap-4 relative">
                    {/* Dropdown user */}
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full hover:bg-white/30 transition"
                        >
                            <img
                                src="https://i.pravatar.cc/40"
                                alt="avatar"
                                className="w-8 h-8 rounded-full border-2 border-white"
                            />
                            <span className="font-medium">Người dùng</span>
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg py-2 z-50">
                                <button
                                    onClick={() => {
                                        setShowProfileModal(true);
                                        setMenuOpen(false);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                                >
                                    <User className="w-4 h-4" /> Quản lý thông tin
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPasswordModal(true);
                                        setMenuOpen(false);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                                >
                                    <Key className="w-4 h-4" /> Đổi mật khẩu
                                </button>
                                <button
                                    onClick={() => alert("Đăng xuất")}
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                >
                                    <LogOut className="w-4 h-4" /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Modal Quản lý thông tin */}
            {showProfileModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setShowProfileModal(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-black"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-semibold mb-4">Cập nhật thông tin</h2>
                        <form
                            className="space-y-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                                alert("Cập nhật thông tin thành công 🎉");
                                setShowProfileModal(false);
                            }}
                        >
                            <div>
                                <label className="block text-sm font-medium">Tên</label>
                                <input
                                    type="text"
                                    defaultValue="Người dùng demo"
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Email</label>
                                <input
                                    type="email"
                                    defaultValue="user@example.com"
                                    className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Vai trò</label>
                                <input
                                    type="text"
                                    defaultValue="Quản trị viên"
                                    disabled
                                    className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-100 text-gray-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowProfileModal(false)}
                                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal Đổi mật khẩu */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-black"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-semibold mb-4">Đổi mật khẩu</h2>
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
                                {errors.old && <p className="text-red-500 text-sm mt-1">{errors.old}</p>}
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
                                {errors.new && <p className="text-red-500 text-sm mt-1">{errors.new}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Xác nhận mật khẩu</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 ${errors.confirm ? "border-red-500" : "border-gray-300"
                                        }`}
                                />
                                {errors.confirm && <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>}
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
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
            )}
        </header>
    );
};

export default Header;
