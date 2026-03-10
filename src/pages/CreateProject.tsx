import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { projectApi } from "../api/project.api";
import { employeeApi, type Company } from "../api/employee.api";
import type {
    ProjectStatus,
    ProjectType,
    ProjectAssignment,
    EmployeeListItem
} from "../types/project";
import { toast } from "react-hot-toast";

const CreateProject = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [statuses, setStatuses] = useState<ProjectStatus[]>([]);
    const [types, setTypes] = useState<ProjectType[]>([]);

    // Filter data
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
    const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");

    // Form state
    const [form, setForm] = useState({
        projectName: "",
        description: "",
        startDate: "",
        deadline: "",
        statusId: "",
        typeId: "",
    });

    // Assignments state (storing more info for display)
    const [assignments, setAssignments] = useState<(ProjectAssignment & { name: string; position: string })[]>([]);

    // Employee search & pagination state
    const [employeeSearch, setEmployeeSearch] = useState("");
    const [employeeResults, setEmployeeResults] = useState<EmployeeListItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [metaRes, companyRes] = await Promise.all([
                    projectApi.getMetadata(),
                    employeeApi.getTypeWorksAndCompanies()
                ]);

                if (metaRes.data && metaRes.data.statuses) {
                    setStatuses(metaRes.data.statuses);
                    setTypes(metaRes.data.types);
                }

                if (companyRes.data && companyRes.data.companies) {
                    setCompanies(companyRes.data.companies);
                }
            } catch (err) {
                console.error("Failed to fetch initial data", err);
                toast.error("Không thể tải dữ liệu cấu hình");
            }
        };
        fetchData();
    }, []);

    const handleSearchEmployees = useCallback(async (isLoadMore = false) => {
        if (!isLoadMore) {
            setIsSearching(true);
            setCurrentPage(0);
        } else {
            setLoadingMore(true);
        }

        const pageToFetch = isLoadMore ? currentPage + 1 : 0;

        try {
            const params: any = {
                employeeName: employeeSearch,
                size: 12,
                page: pageToFetch
            };
            if (selectedCompanyId) params.companyId = Number(selectedCompanyId);
            if (selectedSupplierId) params.supplierId = Number(selectedSupplierId);

            const res = await projectApi.getEmployeeList(params);
            if (res.data && res.data.content) {
                if (isLoadMore) {
                    setEmployeeResults(prev => [...prev, ...res.data.content]);
                } else {
                    setEmployeeResults(res.data.content);
                }
                setCurrentPage(pageToFetch);
                setHasMore(pageToFetch < res.data.totalPages - 1);
                setShowEmployeeDropdown(true);
            }
        } catch (err) {
            console.error("Search failed", err);
            toast.error("Tìm kiếm nhân viên thất bại");
        } finally {
            setIsSearching(false);
            setLoadingMore(false);
        }
    }, [employeeSearch, selectedCompanyId, selectedSupplierId, currentPage]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const addMemberToProject = (employee: EmployeeListItem) => {
        if (assignments.some(a => a.employeeId === employee.employeeId)) {
            toast.error("Nhân viên này đã được thêm vào dự án");
            return;
        }
        setAssignments([
            ...assignments,
            {
                employeeId: employee.employeeId,
                role: "",
                name: employee.name,
                position: employee.position.name
            }
        ]);
        toast.success(`Đã thêm ${employee.name}`);
    };

    const removeAssignment = (index: number) => {
        setAssignments(assignments.filter((_, i) => i !== index));
    };

    const updateAssignmentRole = (index: number, role: string) => {
        const newAssignments = [...assignments];
        newAssignments[index].role = role;
        setAssignments(newAssignments);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.projectName || !form.startDate || !form.deadline || !form.statusId || !form.typeId) {
            toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc");
            return;
        }

        const payload = {
            ...form,
            statusId: Number(form.statusId),
            typeId: Number(form.typeId),
            assignments: assignments.map(({ employeeId, role }) => ({ employeeId, role }))
        };

        setSubmitting(true);
        try {
            await projectApi.createProject(payload);

            toast.success("Tạo dự án thành công!");
            navigate("/projects");
        } catch (err: any) {
            console.error("Create project failed", err);
            toast.error(err.response?.data?.message || "Có lỗi xảy ra khi tạo dự án");
        } finally {
            setSubmitting(false);
        }
    };

    const currentSuppliers = companies.find(c => c.id === Number(selectedCompanyId))?.suppliers || [];

    return (
        <div className="flex flex-col w-full max-w-7xl mx-auto px-6 md:px-12 py-10 gap-10">
            {/* Breadcrumbs & Navigation */}
            <div className="flex flex-col gap-6">
                <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[20px]">home</span>
                        Trang chủ
                    </Link>
                    <span className="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>
                    <Link to="/projects" className="hover:text-primary transition-colors">Dự án</Link>
                    <span className="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>
                    <span className="text-slate-900 dark:text-white">Tạo mới dự án</span>
                </nav>

                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Thiết lập Dự án mới</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal">Hoàn thành các bước bên dưới để khởi tạo một dự án mới vào hệ thống quản lý.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-12">
                {/* Section 1: Thông tin cơ bản */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-8 py-5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">assignment</span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Thông tin cơ bản</h2>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Tên dự án <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="projectName"
                                value={form.projectName}
                                onChange={handleChange}
                                placeholder="VD: Hệ thống Quản lý Nhân sự v2.0"
                                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl h-12 px-4 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Mô tả chi tiết</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Ghi chú chi tiết về mục tiêu và phạm vi của dự án..."
                                rows={4}
                                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none resize-none"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Ngày bắt đầu <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">calendar_today</span>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={form.startDate}
                                    onChange={handleChange}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl h-12 pl-10 pr-4 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Hạn chót hoàn thành <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">event_busy</span>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={form.deadline}
                                    onChange={handleChange}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl h-12 pl-10 pr-4 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Trạng thái dự án <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    name="statusId"
                                    value={form.statusId}
                                    onChange={handleChange}
                                    className="w-full appearance-none bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl h-12 px-4 pr-10 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none cursor-pointer"
                                    required
                                >
                                    <option value="">Lựa chọn trạng thái...</option>
                                    {statuses.map(s => (
                                        <option key={s.id} value={s.id}>{s.description}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Loại hình dự án <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    name="typeId"
                                    value={form.typeId}
                                    onChange={handleChange}
                                    className="w-full appearance-none bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl h-12 px-4 pr-10 text-slate-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none cursor-pointer"
                                    required
                                >
                                    <option value="">Lựa chọn loại hình...</option>
                                    {types.map(t => (
                                        <option key={t.id} value={t.id}>{t.description}</option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Tìm kiếm & Phân công */}
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">person_search</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tìm kiếm & Thêm nhân sự</h2>
                            <p className="text-slate-500 text-sm">Sử dụng bộ lọc và bấm nút tìm kiếm để chọn nhân viên.</p>
                        </div>
                    </div>

                    {/* Filter Area */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col gap-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Công ty</label>
                                <select
                                    value={selectedCompanyId}
                                    onChange={(e) => {
                                        setSelectedCompanyId(e.target.value);
                                        setSelectedSupplierId("");
                                    }}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl h-12 px-4 text-sm outline-none focus:border-primary shadow-sm"
                                >
                                    <option value="">Tất cả công ty</option>
                                    {companies.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Nhà cung cấp</label>
                                <select
                                    value={selectedSupplierId}
                                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl h-12 px-4 text-sm outline-none focus:border-primary shadow-sm disabled:opacity-50"
                                    disabled={!selectedCompanyId}
                                >
                                    <option value="">Tất cả nhà cung cấp</option>
                                    {currentSuppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">Tên nhân viên</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Nhập tên..."
                                        value={employeeSearch}
                                        onChange={(e) => setEmployeeSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchEmployees(false))}
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl h-12 px-4 pr-10 text-sm outline-none focus:border-primary shadow-sm"
                                    />
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleSearchEmployees(false)}
                                disabled={isSearching}
                                className="h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-95 shadow-md disabled:opacity-50"
                            >
                                {isSearching ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[20px]">filter_list</span>
                                        Tìm kiếm
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Search Results Drawer/List */}
                        {showEmployeeDropdown && (
                            <div className="border-t border-slate-200 dark:border-slate-800 pt-6 animate-in fade-in slide-in-from-top-4 duration-300 mt-2">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold text-slate-600 uppercase tracking-tighter">Kết quả tìm kiếm ({employeeResults.length})</h4>
                                    <button
                                        type="button"
                                        onClick={() => setShowEmployeeDropdown(false)}
                                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">close</span>
                                    </button>
                                </div>
                                {employeeResults.length > 0 ? (
                                    <div className="flex flex-col gap-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {employeeResults.map(emp => (
                                                <div
                                                    key={emp.employeeId}
                                                    onClick={() => addMemberToProject(emp)}
                                                    className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col gap-3 hover:border-primary hover:shadow-md hover:shadow-primary/5 cursor-pointer transition-all group relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="material-symbols-outlined text-primary text-[18px]">add</span>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                                            <span className="material-symbols-outlined text-[24px]">account_circle</span>
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="font-bold text-slate-900 dark:text-white text-sm truncate">{emp.name}</span>
                                                            <span className="text-[10px] text-slate-500 font-medium truncate">{emp.position.name}</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 mt-1 border-t border-slate-50 dark:border-slate-800 pt-2">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Công ty</span>
                                                            <span className="text-[10px] text-slate-600 dark:text-slate-400 truncate">{emp.company.name}</span>
                                                        </div>
                                                        <div className="flex flex-col gap-0.5 border-l border-slate-50 dark:border-slate-800 pl-2">
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Supplier</span>
                                                            <span className="text-[10px] text-slate-600 dark:text-slate-400 truncate">{emp.supplier.name}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {hasMore && (
                                            <div className="flex justify-center pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSearchEmployees(true)}
                                                    disabled={loadingMore}
                                                    className="flex items-center gap-2 px-8 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                                                >
                                                    {loadingMore ? (
                                                        <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-600 rounded-full animate-spin"></div>
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined text-[20px]">expand_more</span>
                                                            Xem thêm nhân sự
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-slate-400 italic bg-white dark:bg-slate-950/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                        Không tìm thấy nhân viên phù hợp.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Assigned Members List */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
                                <span className="material-symbols-outlined text-primary">groups_3</span>
                                Nhân sự trong dự án ({assignments.length})
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {assignments.map((assignment, index) => (
                                <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 flex flex-col gap-4 relative group hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                                    <button
                                        type="button"
                                        onClick={() => removeAssignment(index)}
                                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">person_remove</span>
                                    </button>

                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
                                            <span className="material-symbols-outlined text-[28px]">person</span>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-slate-900 dark:text-white text-sm uppercase truncate">{assignment.name}</span>
                                            <span className="text-[11px] text-slate-500 font-medium truncate">{assignment.position}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5 mt-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Vai trò đảm nhiệm</label>
                                        <input
                                            type="text"
                                            placeholder="Chưa xác định vai trò..."
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg h-10 px-3 text-sm font-medium focus:border-primary outline-none transition-all placeholder:italic"
                                            value={assignment.role}
                                            onChange={(e) => updateAssignmentRole(index, e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}

                            {assignments.length === 0 && (
                                <div className="md:col-span-2 lg:col-span-3 py-20 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
                                    <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                                        <span className="material-symbols-outlined text-4xl">group_add</span>
                                    </div>
                                    <p className="text-slate-400 text-sm font-bold">Chưa có thành viên nào được thêm vào dự án này.</p>
                                    <p className="text-slate-400 text-xs mt-1">Sử dụng bộ lọc phía trên để bắt đầu thêm nhân sự.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-4 mb-20">
                    <button
                        type="button"
                        onClick={() => navigate("/projects")}
                        className="px-8 py-3 text-slate-600 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="group relative min-w-[220px] h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-[1px] transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    >
                        <div className="flex h-full w-full items-center justify-center gap-2 rounded-[0.95rem] bg-gradient-to-br from-blue-600 to-indigo-700 px-8 text-white transition-all duration-300 group-hover:bg-none">
                            {submitting ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-white transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">rocket_launch</span>
                                    <span className="font-black tracking-tight">Khởi chạy Dự án</span>
                                </>
                            )}
                        </div>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProject;
