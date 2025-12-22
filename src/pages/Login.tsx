import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { authApi, type LoginPayload } from "../api/auth.api";



const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: LoginPayload = {
      emailOrUsername,
      password,
    };

    try {
      setLoading(true);
      const res: any = await authApi.login(payload);
      console.log(res);
      // const { accessToken, user } = res.accessToken;
      localStorage.setItem("token", res?.data.accessToken);
      localStorage.setItem("user", JSON.stringify(res?.data.user));
      message.success("Đăng nhập thành công");
      navigate("/");
    }
    catch (error: any) {
      message.error(
        error?.response?.data?.message || "Đăng nhập thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {/* LEFT */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-[#F3F8FF] relative">
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>

          <div className="relative z-10">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mb-6">
              <span className="text-white font-bold text-lg">W</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Quản lý kho hàng &<br /> Hóa đơn thông minh
            </h1>

            <p className="text-gray-600 max-w-md">
              Hệ thống chuyên nghiệp giúp bạn tối ưu hóa quy trình kinh doanh,
              kiểm soát hàng hóa và xuất hóa đơn nhanh chóng.
            </p>
          </div>

          <div className="relative z-10 mt-10">
            <img
              src="https://images.unsplash.com/photo-1600267165603-61c0bdei"
              alt="dashboard"
              className="rounded-xl shadow-md"
            />
            <p className="text-sm text-gray-500 mt-3">
              Theo dõi tồn kho thời gian thực
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col justify-center p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Chào mừng trở lại
          </h2>
          <p className="text-gray-500 mb-8">
            Vui lòng nhập thông tin đăng nhập để truy cập hệ thống.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Tên đăng nhập hoặc Email
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Nhập email hoặc tên người dùng"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full bg-blue-600 text-white py-3 rounded-lg font-semibold
                hover:bg-blue-700 transition disabled:opacity-60
              "
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-400">hoặc</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <p className="text-center text-sm text-gray-600">
              Chưa có tài khoản?{" "}
              <a href="#" className="text-blue-600 font-medium hover:underline">
                Đăng ký ngay
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
