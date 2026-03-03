import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("Người dùng demo");
    const [email, setEmail] = useState("user@example.com");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // TODO: call API update profile ở đây
        console.log({ name, email });

        alert("Cập nhật thông tin thành công 🎉");
        navigate(-1); // quay lại trang trước
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
                <h2 className="text-2xl font-semibold mb-6 text-center">
                    Cập nhật thông tin
                </h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium">Tên</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Vai trò</label>
                        <input
                            type="text"
                            value="Quản trị viên"
                            disabled
                            className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-100 text-gray-500"
                        />
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
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;