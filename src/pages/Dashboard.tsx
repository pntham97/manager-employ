import React, { useEffect, useMemo, useState } from "react";
import { Table, Select, Modal, Form, Input, DatePicker } from "antd";
import { Search, Bell, Ellipsis, Plus, Pencil, Check } from 'lucide-react';
import type { ColumnsType } from "antd/es/table";
import { dashboardApi, type DashboardSummaryResponse, type ProcessImmediatelyResponse } from "../api/dashboard";
import { employeeApi, type TypeWork } from "../api/employee.api";
import { toast } from "react-toastify";
export type EmployeeStatus = "official" | "probation" | "intern";
import dayjs from "dayjs";
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
    avatarUrl?: string | null;
    positionId?: number;
    positionName?: string;
    typeWorkId?: number;
    typeWorkName?: string;
    createdAt?: string;
}

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
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
    const [processImmediately, setProcessImmediately] = useState<ProcessImmediatelyResponse[]>([]);
    const [positions, setPositions] = useState<Array<{ id: number; name: string }>>([]);
    const [typeWorks, setTypeWorks] = useState<TypeWork[]>([]);
    const [editingEmployeeIds, setEditingEmployeeIds] = useState<Record<number, boolean>>({});
    const [editableRowIds, setEditableRowIds] = useState<Record<number, boolean>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const currentUserName = useMemo(() => {
        try {
            const raw = localStorage.getItem("user");
            if (!raw) return "bạn";
            const user = JSON.parse(raw);
            return user?.name || user?.fullName || user?.username || "bạn";
        } catch {
            return "bạn";
        }
    }, []);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoadingSummary(true);
                const res = await dashboardApi.getSummary();
                console.log(res);
                if (!mounted) return;
                const payload = (res as any)?.data?.data ?? (res as any)?.data;
                setSummary(payload);
            } catch (e) {
                console.error("Failed to load dashboard summary", e);
            } finally {
                if (mounted) setLoadingSummary(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const [posRes, twRes] = await Promise.all([
                    employeeApi.getSuppliersPositions(),
                    employeeApi.getTypeWorksAndCompanies(),
                ]);
                if (!mounted) return;
                setPositions(posRes.data?.positions ?? []);
                setTypeWorks(twRes.data?.typeWorks ?? []);
            } catch (e) {
                console.error("Failed to load positions/typeWorks", e);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);
    useEffect(() => {
        let mounted = true;

        const fetchProcessImmediately = async () => {
            try {
                setLoadingSummary(true);

                const res = await dashboardApi.getProcessImmediately();
                if (!mounted) return;
                console.log("processImmediately" + res.data)
                setProcessImmediately(res.data ?? []);
                console.log("processImmediately" + processImmediately)
            } catch (e) {
                console.error("Failed to load dashboard process immediately", e);
            } finally {
                if (mounted) setLoadingSummary(false);
            }
        };

        fetchProcessImmediately();

        return () => {
            mounted = false;
        };
    }, []);
    const recentEmployees: Employee[] = useMemo(() => {
        const list = summary?.recentEmployees ?? [];
        return list.map((e) => ({
            id: e.employeeId,
            name: e.name,
            avatarUrl: e.avatarUrl,
            positionId: e.positionId,
            positionName: e.position?.name,
            typeWorkId: e.typeWork?.id,
            typeWorkName: e.typeWork?.name,
            createdAt: e.createdAt,
        }));
    }, [summary]);

    const updateEmployeeQuick = async (employeeId: number, patch: { positionId?: number; typeWorkId?: number }) => {
        try {
            setEditingEmployeeIds(prev => ({ ...prev, [employeeId]: true }));
            await employeeApi.updateEmployee(employeeId, patch as any);
            toast.success("Đã cập nhật nhân viên");
        } catch (e: any) {
            console.error("Failed to quick update employee", e);
            toast.error(e?.response?.data?.message || "Không thể cập nhật (cần API hỗ trợ cập nhật nhanh)");
            throw e;
        } finally {
            setEditingEmployeeIds(prev => ({ ...prev, [employeeId]: false }));
        }
    };

    const columns: ColumnsType<Employee> = [
        {
            title: "Nhân viên",
            dataIndex: "name",
            key: "name",
            render: (_: unknown, record: Employee) => (
                <div className="flex items-center gap-3">
                    <img
                        src={record.avatarUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(record.name)}
                        alt={record.name}
                        className="w-9 h-9 rounded-full object-cover"
                    />
                    <div className="flex flex-col leading-tight">
                        <span className="font-medium text-[#111318] dark:text-white">
                            {record.name}
                        </span>

                    </div>
                </div>
            ),
        },
        {
            title: "Vị trí",
            dataIndex: "positionId",
            key: "position",
            className: "text-[#616f89] dark:text-gray-400",
            render: (_: unknown, record: Employee) => (
                editableRowIds[record.id] ? (
                    <Select
                        value={record.positionId}
                        style={{ width: "100%" }}
                        size="small"
                        loading={!!editingEmployeeIds[record.id]}
                        placeholder="Chọn vị trí"
                        options={positions.map(p => ({ value: p.id, label: p.name }))}
                        onChange={async (value) => {
                            const prev = summary;
                            setSummary(s => {
                                if (!s) return s;
                                return {
                                    ...s,
                                    recentEmployees: s.recentEmployees.map(e =>
                                        e.employeeId === record.id
                                            ? {
                                                ...e,
                                                positionId: value,
                                                position: { ...(e.position as any), id: value, name: positions.find(p => p.id === value)?.name || "" }
                                            }
                                            : e
                                    )
                                };
                            });
                            try {
                                await updateEmployeeQuick(record.id, { positionId: value });
                                setEditableRowIds(prev => ({ ...prev, [record.id]: false }));
                            } catch {
                                setSummary(prev);
                            }
                        }}
                    />
                ) : (
                    <span className="text-sm text-[#616f89] dark:text-gray-400">
                        {record.positionName || "-"}
                    </span>
                )
            ),
        },
        {
            title: "Loại việc",
            dataIndex: "typeWorkId",
            key: "typeWorkName",
            className: "text-[#616f89] dark:text-gray-400",
            render: (_: unknown, record: Employee) => (
                editableRowIds[record.id] ? (
                    <Select
                        value={record.typeWorkId}
                        style={{ width: "100%" }}
                        size="small"
                        loading={!!editingEmployeeIds[record.id]}
                        placeholder="Chọn loại việc"
                        options={typeWorks.map(tw => ({ value: tw.id, label: tw.name }))}
                        onChange={async (value) => {
                            const prev = summary;
                            setSummary(s => {
                                if (!s) return s;
                                return {
                                    ...s,
                                    recentEmployees: s.recentEmployees.map(e =>
                                        e.employeeId === record.id
                                            ? {
                                                ...e,
                                                typeWork: { ...(e.typeWork as any), id: value, name: typeWorks.find(t => t.id === value)?.name || "" }
                                            }
                                            : e
                                    )
                                };
                            });
                            try {
                                await updateEmployeeQuick(record.id, { typeWorkId: value });
                                setEditableRowIds(prev => ({ ...prev, [record.id]: false }));
                            } catch {
                                setSummary(prev);
                            }
                        }}
                    />
                ) : (
                    <span className="text-sm text-[#616f89] dark:text-gray-400">
                        {record.typeWorkName || "-"}
                    </span>
                )
            ),
        },
        {
            title: "",
            key: "actions",
            align: "right",
            render: (_: unknown, record: Employee) => (
                <button
                    type="button"
                    onClick={() => setEditableRowIds(prev => ({ ...prev, [record.id]: !prev[record.id] }))}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                        ${editableRowIds[record.id]
                            ? "bg-primary text-red hover:bg-primary/90"
                            : "bg-primary/10 text-primary hover:bg-primary/15"
                        }`}
                >
                    {editableRowIds[record.id] ? (
                        <>
                            <Check size={14} />
                            Xong
                        </>
                    ) : (
                        <>
                            <Pencil size={14} />
                            Chỉnh sửa
                        </>
                    )}
                </button>
            ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            align: "right",
            className: "text-[#616f89] dark:text-gray-400",
            render: (v: string | undefined) => {
                if (!v) return "";
                const d = new Date(v);
                if (isNaN(d.getTime())) return v;
                return d.toLocaleString("vi-VN");
            },
        },
    ];
    const openModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleSubmitProcessImmediately = async () => {
        try {
            const values = await form.validateFields();

            const payload = {
                name: values.name,
                deadline: values.deadline.format("YYYY-MM-DD")
            };

            console.log("submit processImmediately", payload);

            // gọi API tạo task
            await dashboardApi.createProcessImmediately(payload);

            toast.success("Đã thêm công việc");

            setIsModalOpen(false);
            form.resetFields();

            // reload list
            const res = await dashboardApi.getProcessImmediately();
            const payloadData = (res as any)?.data?.data ?? (res as any)?.data;
            setProcessImmediately(payloadData);

        } catch (err) {
            console.error(err);
        }
    };
    const handleToggleProcessImmediately = async (checked: boolean, data: ProcessImmediatelyResponse) => {
        try {
            const updatedData = {
                ...data,
                isDone: checked,
            };

            await dashboardApi.updateProcessImmediately(updatedData);

            setProcessImmediately(prev =>
                prev.map(item =>
                    item.id === data.id ? { ...item, isDone: checked } : item
                )
            );

            toast.success("Đã cập nhật trạng thái");
        } catch (err) {
            console.error(err);
            toast.error("Cập nhật thất bại");
        }
    };
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
                        <h3 className="text-xl font-semibold dark:text-white">Chào buổi sáng, {currentUserName}! 👋</h3>
                        <p className="text-[#616f89] dark:text-gray-400 text-sm">Dưới đây là tóm tắt hoạt động nhân sự hôm nay.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                        <div className="flex flex-col gap-3 rounded-xl p-5 bg-white dark:bg-[#1A202C] border border-[#f0f2f4] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium">Tổng nhân viên</p>
                                <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-lg text-[20px]">groups</span>
                            </div>
                            <div>
                                <p className="text-[#111318] dark:text-white text-2xl font-bold">
                                    {summary?.totalEmployeesInSupplierHmt ?? 0}
                                </p>
                                <p className="text-[#07883b] text-xs font-medium flex items-center gap-1 mt-1">
                                    <span className="material-symbols-outlined text-[14px]">trending_up</span>
                                    +{summary?.employeeGrowthPercentMoM ?? 0}% tháng này
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 rounded-xl p-5 bg-white dark:bg-[#1A202C] border border-[#f0f2f4] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium">Dự án đang chạy</p>
                                <span className="material-symbols-outlined text-[#f59e0b] bg-[#f59e0b]/10 p-1.5 rounded-lg text-[20px]">rocket_launch</span>
                            </div>
                            <div>
                                <p className="text-[#111318] dark:text-white text-2xl font-bold">
                                    {summary?.totalProjectsInProgress ?? 0}
                                </p>
                                <p className="text-[#616f89] dark:text-gray-500 text-xs font-medium mt-1">
                                    {summary?.totalProjectsInProgressNearDeadline ?? 0} dự án sắp deadline
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 rounded-xl p-5 bg-white dark:bg-[#1A202C] border border-[#f0f2f4] dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium">Chờ duyệt nghỉ</p>
                                <span className="material-symbols-outlined text-[#ef4444] bg-[#ef4444]/10 p-1.5 rounded-lg text-[20px]">event_busy</span>
                            </div>
                            <div>
                                <p className="text-[#111318] dark:text-white text-2xl font-bold">
                                    {summary?.totalHistorySchedulePending ?? 0}
                                </p>
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
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-[#111318] dark:text-white text-lg font-bold">Hiệu suất dự án theo loại</h3>
                                            <p className="text-[#616f89] dark:text-gray-400 text-sm">
                                                Dự án trong tháng hiện tại theo từng loại
                                            </p>
                                        </div>
                                        <button className="p-2 hover:bg-[#f0f2f4] dark:hover:bg-gray-800 rounded-lg">
                                            <span className="material-symbols-outlined text-[#616f89] dark:text-gray-400">
                                                <Ellipsis />
                                            </span>
                                        </button>
                                    </div>
                                    <div className="w-full h-[240px] flex items-end justify-between gap-4 px-2">
                                        {(summary?.projectsByTypeInCurrentMonth ?? []).map((group) => {
                                            const totalProjects = group.projects.length;
                                            const avgProgress =
                                                totalProjects > 0
                                                    ? Math.round(
                                                        group.projects.reduce(
                                                            (sum: number, p: { progress: number }) =>
                                                                sum + (p.progress ?? 0),
                                                            0
                                                        ) / totalProjects
                                                    )
                                                    : 0;
                                            return (
                                                <div
                                                    key={group.type.id}
                                                    className="flex flex-col items-center gap-2 flex-1 group"
                                                >
                                                    <div className="w-full bg-[#f0f2f4] dark:bg-gray-800 rounded-t-md relative h-[200px] flex items-end overflow-hidden group-hover:bg-[#e2e4e7] dark:group-hover:bg-gray-700 transition-colors">
                                                        <div
                                                            className="w-full bg-blue-600 transition-all duration-500 rounded-t-md"
                                                            style={{ height: `${Math.max(avgProgress, 5)}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-center space-y-1">
                                                        <span className="text-xs font-medium text-[#111318] dark:text-white block">
                                                            {group.type.description}
                                                        </span>
                                                        <span className="text-[11px] text-[#616f89] dark:text-gray-400 block">
                                                            {totalProjects} dự án • {avgProgress}%
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(!summary?.projectsByTypeInCurrentMonth ||
                                            summary.projectsByTypeInCurrentMonth.length === 0) && (
                                                <div className="flex-1 flex items-center justify-center text-sm text-[#9ca3af]">
                                                    Chưa có dự án nào trong tháng hiện tại.
                                                </div>
                                            )}
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
                                        loading={loadingSummary}
                                        dataSource={recentEmployees}
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
                                    <button
                                        onClick={openModal}
                                        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >                                        <span className="material-symbols-outlined text-primary">  <Plus /></span>
                                    </button>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {processImmediately.map((item: any) => {
                                        return (
                                            <label className="flex items-start gap-3 p-3 rounded-lg border border-[#f0f2f4] dark:border-gray-700 hover:bg-[#f9fafb] dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                                                key={item.id}>
                                                <input
                                                    type="checkbox"
                                                    className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                                    checked={item.isDone}
                                                    onChange={(e) =>
                                                        handleToggleProcessImmediately(e.target.checked, item)
                                                    }
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-[#111318] dark:text-white group-hover:text-primary transition-colors">{item?.name}</span>
                                                    <span className="text-xs text-[#616f89] dark:text-gray-400">                {dayjs(item.deadline).format("DD/MM/YYYY")}
                                                    </span>
                                                </div>
                                            </label>
                                        );
                                    })}

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
            <Modal
                title="Thêm công việc cần làm ngay"
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={handleSubmitProcessImmediately}
                okText="Lưu"
                cancelText="Huỷ"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Nội dung"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
                    >
                        <Input placeholder="Nhập nội dung công việc..." />
                    </Form.Item>

                    <Form.Item
                        label="Deadline"
                        name="deadline"
                        rules={[{ required: true, message: "Vui lòng chọn deadline" }]}
                    >
                        <DatePicker
                            style={{ width: "100%" }}
                            format="DD/MM/YYYY"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
        // </section>

    );
};

export default Dashboard;
