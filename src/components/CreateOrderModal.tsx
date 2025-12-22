import React from "react";
import { X } from "lucide-react";

interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
                {/* Nút đóng góc phải */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
                >
                    <X size={22} />
                </button>

                {/* Tiêu đề */}
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                    Tạo Đơn Hàng
                </h2>

                {/* Form */}
                <form className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">
                            Tên Khách Hàng
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            placeholder="Nhập tên khách hàng"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700">
                            Loại Hàng
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            placeholder="Nhập loại hàng"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700">
                            Kho hàng
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            placeholder="Kho hàng"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">
                                Tồn kho
                            </label>
                            <input
                                type="number"
                                className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">
                                Số lượng
                            </label>
                            <input
                                type="number"
                                className="mt-1 block w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-between mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-red-500 text-white px-6 py-2 rounded-xl shadow hover:bg-red-600 transition font-semibold"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={onSubmit}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-xl shadow hover:opacity-90 transition font-semibold"
                        >
                            Tạo đơn & Xuất Excel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateOrderModal;
