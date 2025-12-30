import React, { useEffect, useState } from "react";
import { Home, Archive, ChevronRight, ChevronDown, Settings, Users, Truck, ScrollTextIcon } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
// import logo from "../assets/images/logo.png";
import { User, LogOut, Key, X } from "lucide-react";
import { authApi } from "../api/auth.api";
import { message } from "antd";
import { tokenService } from "../utils/token";

const SidebarLeft: React.FC = () => {
    const [openPartner, setOpenPartner] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // State đổi mật khẩu
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<{ old?: string; new?: string; confirm?: string }>({});
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        if (location.pathname.startsWith("/partners")) {
            setOpenPartner(true);
        }
    }, [location.pathname]);

    // 👉 class cho menu chính
    const navItemClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-3 py-3 rounded-lg transition
     ${isActive
            ? "bg-blue-50 text-blue-600"
            : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
        }`;

    const isPartnerActive = location.pathname.startsWith("/partners");


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

    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await authApi.logout(); // 🔥 gọi API logout

            // Xóa local storage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            tokenService.clearTokens();
            message.success("Đã đăng xuất");
            navigate("/login");
        } catch (error) {
            // Dù API lỗi vẫn logout local để tránh kẹt user
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            message.warning("Phiên đăng nhập đã hết hạn");
            // navigate("/login");
        }
    };


    return (
        <aside
            className={`h-screen bg-white from-sky-500 to-indigo-600 text-black shadow-lg flex flex-col transition-all duration-300 ${collapsed ? "w-20" : "w-64"
                }`}
        >
            {/* Header Logo + Toggle */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/30">
                {/* Logo + Text chỉ hiện khi chưa collapse */}
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        {/* <img
                            src={logo}
                            alt="MyApp Logo"
                            className="w-8 h-8 rounded-lg"
                            style={{ width: '40px', height: '38px' }}
                        /> */}
                        <h3 className="text-lg font-medium">WareManager</h3>
                    </div>

                )}

                {/* Toggle button luôn hiện */}
                {/* <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-md hover:bg-white/20 transition ml-auto"
                >
                    <Menu className="w-6 h-6" />
                </button> */}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 text-base font-medium">
                {/* DASHBOARD */}
                <NavLink to="/" end className={navItemClass}>
                    <Home className="w-5 h-5" />
                    {!collapsed && <span>Tổng quan</span>}
                </NavLink>

                {/* HÀNG HÓA */}
                <NavLink to="/Wage" className={navItemClass}>
                    <Archive className="w-5 h-5" />
                    {!collapsed && <span>Bảng lương</span>}
                </NavLink>
                <NavLink to="/Projects" className={navItemClass}>
                    <span className="material-symbols-outlined fill text-primary">work</span>
                    {!collapsed && <span>Dự án</span>}
                </NavLink>

                {/* HÓA ĐƠN */}
                <NavLink to="/Calendar" className={navItemClass}>
                    <ScrollTextIcon className="w-5 h-5" />
                    {!collapsed && <span>Lịch làm việc</span>}
                </NavLink>
                <NavLink to="/ManagerEmploy" className={navItemClass}>
                    <ScrollTextIcon className="w-5 h-5" />
                    {!collapsed && <span>Hồ sơ nhân viên</span>}
                </NavLink>

                {/* ĐỐI TÁC (CHA) */}
                {/* <button
                    onClick={() => setOpenPartner(!openPartner)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-lg transition
          ${isPartnerActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <Users className="w-5 h-5" />
                        {!collapsed && <span>Đối tác</span>}
                    </div>

                    {!collapsed &&
                        (openPartner ? (
                            <ChevronDown className="w-4 h-4" />
                        ) : (
                            <ChevronRight className="w-4 h-4" />
                        ))}
                </button> */}

                {/* SUB MENU */}
                {/* {!collapsed && openPartner && (
                    <div className="ml-8 space-y-1">
                        <NavLink
                            to="/partners/suppliers"
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
               ${isActive
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                }`
                            }
                        >
                            <Truck className="w-4 h-4" />
                            <span>Nhà cung cấp</span>
                        </NavLink>

                        <NavLink
                            to="/partners/customers"
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
               ${isActive
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                }`
                            }
                        >
                            <User className="w-4 h-4" />
                            <span>Khách hàng</span>
                        </NavLink>
                        <NavLink
                            to="/partners/account"
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition
               ${isActive
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                                }`
                            }
                        >
                            <User className="w-4 h-4" />
                            <span>Danh sách tài khoản</span>
                        </NavLink>
                    </div>
                )} */}

                <div className="border-t border-gray-300 my-2" />

                {/* SETTINGS */}
                <NavLink to="/Settings" className={navItemClass}>
                    <Settings className="w-5 h-5" />
                    {!collapsed && <span>Cài đặt</span>}
                </NavLink>
            </nav>
            <div className="flex items-cente border-t border-gray-200 px-3 py-3">
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
                            className="flex items-center gap-2 bg-white/20 text-black px-4 py-2 rounded-full hover:bg-white/30 transition"
                        >
                            <img
                                src="https://i.pravatar.cc/40"
                                alt="avatar"
                                className="w-8 h-8 rounded-full border-2 border-white"
                            />
                            <div className="flex items-start flex-col leading-tight">
                                <span className="font-semibold text-gray-800">
                                    Nguyễn Văn A
                                </span>
                                <span className="text-sm text-gray-500">
                                    Quản lý kho
                                </span>
                            </div>
                        </button>

                        {menuOpen && (
                            <div className="absolute bottom-full -right-[30px] mb-2 w-52 bg-white rounded-xl shadow-lg py-2 z-50">
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
                                    onClick={handleLogout}
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
        </aside>
    );
};

export default SidebarLeft;
