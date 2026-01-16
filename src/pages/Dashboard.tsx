import React, { useState } from "react";
import { Table } from "antd";
import { Search, Bell, Ellipsis, Plus, Tag } from 'lucide-react';
import type { ColumnsType } from "antd/es/table";

export type EmployeeStatus = "official" | "probation" | "intern";

const activities = [
    {
        id: 1,
        title: "Chính sách mới cập nhật",
        description: "Bộ phận HR đã cập nhật quy định về nghỉ phép năm 2024.",
        time: "2 giờ trước",
    },
    {
        id: 2,
        title: "Yêu cầu nghỉ phép: Lan Anh",
        description: "Xin nghỉ 2 ngày (28/10 - 29/10) vì lý do cá nhân.",
        time: "5 giờ trước",
    },
    {
        id: 3,
        title: "Hoàn thành đánh giá Q3",
        description: "Team Marketing đã nộp báo cáo đánh giá hiệu suất.",
        time: "1 ngày trước",
    },
];

export interface Employee {
    id: number;
    name: string;
    avatar: string;
    position: string;
    status: EmployeeStatus;
    startDate: string;
}

export const employees: Employee[] = [
    {
        id: 1,
        name: "Trần Thị Mai",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBarVozfrH7Z8aIJTBCow8aQpKbfYkFkR6Ct-98wWh8z9Io1tHj0Z_1TzUp0Np7yaZ1GbstcIEJ5R4fyV_qtuJPUW9ctvlWnrWX4lFhQ1c4WoGzllYXsnG8mbOt-GtFYwYeDd9vays9rU4dv42NGaxh9hmOmjNs9iCGVsSx7cw2axMYrSKuWzHPiMrqSda36wFa61hPTONzD_RA8IpEozH96RlCUOOOZYpNj9QdB47pwHNoTMUUarDD-bgi0qH5C97v3ZYjUfykyS4",
        position: "UX Designer",
        status: "official",
        startDate: "24/10/2023",
    },
    {
        id: 2,
        name: "Lê Văn Hùng",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvnyT5_MsvEsSSJqeavLRsR5metXi55mcitYb0kg8Xa70KgTdz3pf_Lr593l5QoLR1WR_UXcrewPDRuCAd_t-X-gJpcyOrhV8i5aDfhrT-cvy0RcZN59oAeHWvAAVarZ2u4fsKCO9bZrT4_J_p4bIl8PI6u1kdjq36yZL1FboZbkST9g-UXME8OMItNNe_9sQxOxOAKkHDVYHVjtBeGeY51kV_c41IHFs_ckev-NcjeX6FVcjmcSpA2xolGBYv6xsb41wCW8YF1rA",
        position: "Frontend Dev",
        status: "probation",
        startDate: "20/10/2023",
    },
    {
        id: 3,
        name: "Nguyễn Văn A",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxUhwU9y-Lz-LGAV4luAOio7TyFhwYCjxtj2eUOUvGQ5BUttrV926xWf9IEwUOmZEHGGnMbZG8kFXJXEyjckmC8W9F3_OVAC8CoCQ1nd188NvIGsXBSeL_6AqNfWB8Ywd6ua57i8bqRN6mkOlywa0TH8VKEDWRzWSsyVuVtAU_Egk6lkBHyqGwjWFcPA_15qtLYPvFnL_A-ridfxqR7TPzkUXAfsxsML8hLZgXCrqJad68Y9k7cqWkSuugEnWwQXZx9XH8uwXzmLY",
        position: "Marketing Intern",
        status: "intern",
        startDate: "18/10/2023",
    },
];


export const statusMap: Record<
    EmployeeStatus,
    { label: string; color: string }
> = {
    official: {
        label: "Chính thức",
        color: "green",
    },
    probation: {
        label: "Thử việc",
        color: "red",
    },
    intern: {
        label: "Thực tập",
        color: "blue",
    },
};
const Dashboard: React.FC = () => {

    const [activeId, setActiveId] = useState(activities[0].id);
    const columns: ColumnsType<Employee> = [
        {
            title: "Nhân viên",
            dataIndex: "name",
            key: "name",
            render: (record: any) => (
                <div className="flex items-center gap-3">
                    <img
                        src={record.avatar}
                        alt={record.name}
                        className="w-9 h-9 rounded-full object-cover"
                    />
                    <span className="font-medium text-[#111318] dark:text-white">
                        {record.name}
                    </span>
                </div>
            ),
        },
        {
            title: "Vị trí",
            dataIndex: "position",
            key: "position",
            className: "text-[#616f89] dark:text-gray-400",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: EmployeeStatus) => {
                const s = statusMap[status];
                return (
                    // <div  className={`rounded-full text-${s.color}-500  px-3 py-1 bg-${s.color}-500`}>
                    //     {s.label}
                    // </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${s.color}-100 text-${s.color}-700 dark:bg-${s.color}-900/30 dark:text-${s.color}-400`}>
                        <span className={`w-1.5 h-1.5 rounded-full bg-${s.color}-500`}></span>
                        {s.label}
                    </span>

                );
            }
        },
        {
            title: "Ngày bắt đầu",
            dataIndex: "startDate",
            key: "startDate",
            align: "right",
            className: "text-[#616f89] dark:text-gray-400",
        },
    ];



    return (
        // <section className="bg-white dark:bg-gray-900 shadow-xl p-6">

        <div className="h-full ">
            <header className="fixed ml-[256px]  z-50 top-0 left-0 right-0 w-[calc(100%-256px)]  bg-white/95 backdrop-blur border-b border-gray-200">
                <div className="px-16 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-6" >
                        <h3 className="text-[#111318] dark:text-white text-2xl font-bold">Trang tổng quan </h3>
                        <div className="relative w-64 hidden sm:block">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="text-[#69696b]" />
                            </div>
                            <input className="block w-full bg-[#f6f7f8] pl-10 pr-3 py-2 border-none rounded-lg bg-background-light dark:bg-slate-800 text-sm placeholder-slate-500 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-900 transition-all" placeholder="Tìm kiếm nhân viên, tài liệu ...." type="text" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">

                        <button className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                            <Bell />
                            <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border border-white dark:border-[#1a2632]"></span>
                        </button>

                        {/* 
                        <button
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium
               rounded-lg text-white bg-blue-600
               hover:bg-blue-700 transition"
                        >
                            <span className="text-lg leading-none">+</span>
                            Nhập hàng mới
                        </button> */}
                    </div>
                </div>
            </header>
            <div className="pt-[60px] pb-[40px]">
                <main className=" px-16 pt-[60px]  space-y-6">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-xl font-semibold dark:text-white">Chào buổi sáng, Minh! 👋</h3>
                        <p className="text-[#616f89] dark:text-gray-400 text-sm">Dưới đây là tóm tắt hoạt động nhân sự hôm nay.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                        <div className="flex flex-col gap-3 rounded-xl p-5 bg-white dark:bg-[#1A202C] border border-[#f0f2f4] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium">Tổng nhân viên</p>
                                <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg text-[20px]">groups</span>
                            </div>
                            <div>
                                <p className="text-[#111318] dark:text-white text-2xl font-bold">124</p>
                                <p className="text-[#07883b] text-xs font-medium flex items-center gap-1 mt-1">
                                    <span className="material-symbols-outlined text-[14px]">trending_up</span>
                                    +2% tháng này
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 rounded-xl p-5 bg-white dark:bg-[#1A202C] border border-[#f0f2f4] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium">Dự án đang chạy</p>
                                <span className="material-symbols-outlined text-[#f59e0b] bg-[#f59e0b]/10 p-1.5 rounded-lg text-[20px]">rocket_launch</span>
                            </div>
                            <div>
                                <p className="text-[#111318] dark:text-white text-2xl font-bold">8</p>
                                <p className="text-[#616f89] dark:text-gray-500 text-xs font-medium mt-1">
                                    2 dự án sắp deadline
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 rounded-xl p-5 bg-white dark:bg-[#1A202C] border border-[#f0f2f4] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium">Chờ duyệt nghỉ</p>
                                <span className="material-symbols-outlined text-[#ef4444] bg-[#ef4444]/10 p-1.5 rounded-lg text-[20px]">event_busy</span>
                            </div>
                            <div>
                                <p className="text-[#111318] dark:text-white text-2xl font-bold">12</p>
                                <p className="text-[#616f89] dark:text-gray-500 text-xs font-medium mt-1">
                                    Cần xử lý trong ngày
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 rounded-xl p-5 bg-gradient-to-br from-[#135bec] to-[#1e40af] text-white shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <p className="text-white/80 text-sm font-medium">Trả lương kế tiếp</p>
                                <span className="material-symbols-outlined text-white bg-white/20 p-1.5 rounded-lg text-[20px]">calendar_month</span>
                            </div>
                            <div>
                                <p className="text-white text-2xl font-bold">30/10</p>
                                <p className="text-white/80 text-xs font-medium mt-1">
                                    Còn 5 ngày nữa
                                </p>
                            </div>
                        </div>
                    </div>


                    <div className="flex gap-6 items-start">
                        <div className="w-full">
                            <div className=" rounded-xl   ">
                                <div className="rounded-xl mb-6 bg-white dark:bg-[#1A202C] border border-[#f0f2f4] dark:border-gray-800 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-[#111318] dark:text-white text-lg font-bold">Hiệu suất dự án</h3>
                                            <p className="text-[#616f89] dark:text-gray-400 text-sm">Phân bổ khối lượng công việc tháng 10</p>
                                        </div>
                                        <button className="p-2 hover:bg-[#f0f2f4] dark:hover:bg-gray-800 rounded-lg">
                                            <span className="material-symbols-outlined text-[#616f89] dark:text-gray-400"><Ellipsis /></span>
                                        </button>
                                    </div>

                                    <div className="w-full h-[240px] flex items-end justify-between gap-4 px-2">

                                        <div className="flex flex-col items-center gap-2 flex-1 group">
                                            <div className="w-full bg-[#f0f2f4] dark:bg-gray-800 rounded-t-md relative h-[200px] flex items-end overflow-hidden group-hover:bg-[#e2e4e7] dark:group-hover:bg-gray-700 transition-colors">
                                                <div className="w-full bg-primary transition-all duration-500 bg-blue-600 rounded-t-md h-[65%]" ></div>
                                            </div>
                                            <span className="text-xs font-medium text-[#616f89] dark:text-gray-400">Website</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 flex-1 group">
                                            <div className="w-full bg-[#f0f2f4] dark:bg-gray-800 rounded-t-md relative h-[200px] flex items-end overflow-hidden group-hover:bg-[#e2e4e7] dark:group-hover:bg-gray-700 transition-colors">
                                                <div className="w-full bg-primary/80 transition-all duration-500 bg-blue-600 rounded-t-md h-[85%]" ></div>
                                            </div>
                                            <span className="text-xs font-medium text-[#616f89] dark:text-gray-400">Mobile App</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 flex-1 group">
                                            <div className="w-full bg-[#f0f2f4] dark:bg-gray-800 rounded-t-md relative h-[200px] flex items-end overflow-hidden group-hover:bg-[#e2e4e7] dark:group-hover:bg-gray-700 transition-colors">
                                                <div className="w-full bg-primary/60 transition-all duration-500 bg-blue-600 rounded-t-md h-[25%] " ></div>
                                            </div>
                                            <span className="text-xs font-medium text-[#616f89] dark:text-gray-400">Marketing</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 flex-1 group">
                                            <div className="w-full bg-[#f0f2f4] dark:bg-gray-800 rounded-t-md relative h-[200px] flex items-end overflow-hidden group-hover:bg-[#e2e4e7] dark:group-hover:bg-gray-700 transition-colors">
                                                <div className="w-full bg-primary transition-all duration-500 bg-blue-600 rounded-t-md h-[45%]" ></div>
                                            </div>
                                            <span className="text-xs font-medium text-[#616f89] dark:text-gray-400">Hệ thống</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 flex-1 group">
                                            <div className="w-full bg-[#f0f2f4] dark:bg-gray-800 rounded-t-md relative h-[200px] flex items-end overflow-hidden group-hover:bg-[#e2e4e7] dark:group-hover:bg-gray-700 transition-colors">
                                                <div className="w-full bg-primary/40 transition-all duration-500 bg-blue-600 rounded-t-md h-[55%]" ></div>
                                            </div>
                                            <span className="text-xs font-medium text-[#616f89] dark:text-gray-400">Nội bộ</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Header */}
                                <div className="rounded-xl bg-white dark:bg-[#1A202C] border border-[#f0f2f4] dark:border-gray-800 shadow-sm overflow-hidden">
                                    {/* Header */}
                                    <div className="p-6 border-b border-[#f0f2f4] dark:border-gray-800 flex justify-between items-center">
                                        <h3 className="text-[#111318] dark:text-white text-lg font-bold">
                                            Nhân viên mới gần đây
                                        </h3>
                                        <button className="text-primary text-sm font-medium hover:underline">
                                            Xem tất cả
                                        </button>
                                    </div>

                                    {/* Table */}
                                    <Table
                                        columns={columns}
                                        dataSource={employees}
                                        rowKey="id"
                                        pagination={{
                                            pageSize: 5,
                                            showSizeChanger: false,
                                        }}
                                    />
                                </div>
                            </div>



                        </div>
                        <div className="max-w-[360px] w-full">
                            <div className="rounded-xl mb-[20px] bg-white dark:bg-[#1A202C] border border-[#f0f2f4] dark:border-gray-800 p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[#111318] dark:text-white text-lg font-bold">Cần làm ngay</h3>
                                    <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <span className="material-symbols-outlined text-primary">  <Plus /></span>
                                    </button>
                                </div>
                                <div className="flex flex-col gap-3">
                                    <label className="flex items-start gap-3 p-3 rounded-lg border border-[#f0f2f4] dark:border-gray-700 hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                                        <input className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" type="checkbox" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-[#111318] dark:text-white group-hover:text-primary transition-colors">Duyệt bảng lương T10</span>
                                            <span className="text-xs text-[#616f89] dark:text-gray-400">Hạn chót: Hôm nay</span>
                                        </div>
                                    </label>
                                    <label className="flex items-start gap-3 p-3 rounded-lg border border-[#f0f2f4] dark:border-gray-700 hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                                        <input className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" type="checkbox" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-[#111318] dark:text-white group-hover:text-primary transition-colors">Phỏng vấn Senior Dev</span>
                                            <span className="text-xs text-[#616f89] dark:text-gray-400">14:00 PM - Phòng họp 2</span>
                                        </div>
                                    </label>
                                    <label className="flex items-start gap-3 p-3 rounded-lg border border-[#f0f2f4] dark:border-gray-700 hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                                        <input className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" type="checkbox" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-[#111318] dark:text-white group-hover:text-primary transition-colors">Ký hợp đồng nhân viên mới</span>
                                            <span className="text-xs text-[#616f89] dark:text-gray-400">3 hồ sơ chờ ký</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div className="rounded-xl bg-white dark:bg-[#1A202C] border border-[#f0f2f4] dark:border-gray-800 p-6 shadow-sm flex-1">
                                <h3 className="text-[#111318] dark:text-white text-lg font-bold mb-4">
                                    Hoạt động gần đây
                                </h3>

                                <div className="relative pl-4 border-l-2 border-[#f0f2f4] dark:border-gray-700 space-y-6">
                                    {activities.map((item) => {
                                        const isActive = activeId === item.id;

                                        return (
                                            <div
                                                key={item.id}
                                                className="relative cursor-pointer"
                                                onClick={() => setActiveId(item.id)}
                                            >
                                                {/* Chấm tròn */}
                                                <div
                                                    className={`
                                                             absolute -left-[21px] mt-1.5
                                                             w-2.5 h-2.5 rounded-full
                                                             ring-4 ring-white dark:ring-[#1A202C]
                                                             transition-all duration-200
                                                             ${isActive
                                                            ? "bg-blue-500 scale-110"
                                                            : "bg-gray-300 dark:bg-gray-600"
                                                        }
            `}
                                                />

                                                <p className="text-sm font-medium text-[#111318] dark:text-white">
                                                    {item.title}
                                                </p>
                                                <p className="text-xs text-[#616f89] dark:text-gray-400 mt-0.5">
                                                    {item.description}
                                                </p>
                                                <p className="text-[11px] text-[#9ca3af] mt-2">{item.time}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>

                    </div>


                </main>
            </div>
        </div>
        // </section>

    );
};

export default Dashboard;
