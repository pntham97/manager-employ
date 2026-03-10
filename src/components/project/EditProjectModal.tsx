import { useEffect, useState, useCallback } from "react";
import { projectApi } from "../../api/project.api";
import { employeeApi, type Company } from "../../api/employee.api";
import type {
    ProjectStatus,
    ProjectType,
    ProjectAssignment,
    EmployeeListItem,
    ProjectItem
} from "../../types/project";
import { toast } from "react-hot-toast";

interface EditProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: ProjectItem | null;
    onUpdateSuccess: () => void;
}

const EditProjectModal = ({ isOpen, onClose, project, onUpdateSuccess }: EditProjectModalProps) => {
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

    // Assignments state
    const [assignments, setAssignments] = useState<(ProjectAssignment & { name: string })[]>([]);

    // Employee search state
    const [employeeSearch, setEmployeeSearch] = useState("");
    const [employeeResults, setEmployeeResults] = useState<EmployeeListItem[]>([]);
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        if (!isOpen) return;

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

                if (project) {
                    try {
                        const detailedRes = await projectApi.getProjectById(project.id);
                        const detailedProject = detailedRes.data;

                        setForm({
                            projectName: detailedProject.projectName,
                            description: detailedProject.description || "",
                            startDate: detailedProject.startDate.split('T')[0],
                            deadline: detailedProject.deadline.split('T')[0],
                            statusId: detailedProject.status.id.toString(),
                            typeId: detailedProject.type.id.toString(),
                        });

                        // Map from detailed assignments (user specified role field)
                        // If assignments is missing, fallback to members
                        const memberData = detailedProject.assignments || detailedProject.members || [];
                        const initialAssignments = memberData.map((m: any) => ({
                            employeeId: m.employeeId,
                            role: m.role || "",
                            name: m.employeeName || m.name
                        }));
                        setAssignments(initialAssignments);
                    } catch (detailErr) {
                        console.error("Failed to fetch project details", detailErr);
                        // Fallback to basic info from props
                        setForm({
                            projectName: project.projectName,
                            description: project.description || "",
                            startDate: project.startDate.split('T')[0],
                            deadline: project.deadline.split('T')[0],
                            statusId: project.status.id.toString(),
                            typeId: project.type.id.toString(),
                        });
                        setAssignments(project.members.map((m: any) => ({
                            employeeId: m.employeeId,
                            role: m.role || "",
                            name: m.name
                        })));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch initial data", err);
                toast.error("Không thể tải dữ liệu cấu hình");
            }
        };
        fetchData();
    }, [isOpen, project]);

    const handleSearchEmployees = useCallback(async (isLoadMore = false) => {
        if (!isLoadMore) {
            setCurrentPage(0);
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
                setShowEmployeeDropdown(true);
            }
        } catch (err) {
            console.error("Search failed", err);
            toast.error("Tìm kiếm nhân viên thất bại");
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
                name: employee.name
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

        if (!project) return;
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
            await projectApi.updateProject(project.id, payload);
            toast.success("Cập nhật dự án thành công!");
            onUpdateSuccess();
            onClose();
        } catch (err: any) {
            console.error("Update project failed", err);
            toast.error(err.response?.data?.message || "Có lỗi xảy ra khi cập nhật dự án");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const currentSuppliers = companies.find((c: Company) => c.id === Number(selectedCompanyId))?.suppliers || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl md:max-w-6xl max-h-[95vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[24px] sm:text-[28px]">edit_note</span>
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">Cập nhật Dự án</h2>
                            <p className="text-slate-500 text-xs sm:text-sm font-medium truncate hidden sm:block">Chỉnh sửa thông tin và nhân sự cho dự án hiện tại.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all shrink-0"
                    >
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col gap-6 sm:gap-10 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-10">
                        {/* Basic Info (Left) */}
                        <div className="md:col-span-12 lg:col-span-5 flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 pl-1">Tên dự án <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="projectName"
                                    value={form.projectName}
                                    onChange={handleChange}
                                    placeholder="Tên dự án..."
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl h-14 px-5 text-slate-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 pl-1">Mô tả chi tiết</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Mô tả..."
                                    rows={4}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-slate-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Ngày bắt đầu</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={form.startDate}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-12 px-4 text-sm font-bold focus:border-primary outline-none transition-colors"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Hạn chót</label>
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={form.deadline}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-12 px-4 text-sm font-bold focus:border-primary outline-none transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Trạng thái</label>
                                    <select
                                        name="statusId"
                                        value={form.statusId}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-12 px-4 text-sm font-bold outline-none focus:border-primary transition-colors cursor-pointer"
                                        required
                                    >
                                        <option value="">Chọn...</option>
                                        {statuses.map(s => <option key={s.id} value={s.id}>{s.description}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Loại hình</label>
                                    <select
                                        name="typeId"
                                        value={form.typeId}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-12 px-4 text-sm font-bold outline-none focus:border-primary transition-colors cursor-pointer"
                                        required
                                    >
                                        <option value="">Chọn...</option>
                                        {types.map(t => <option key={t.id} value={t.id}>{t.description}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Assignments (Right) */}
                        <div className="md:col-span-12 lg:col-span-7 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 pl-1">Nhân sự tham gia ({assignments.length})</label>
                                <button
                                    type="button"
                                    onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
                                    className="text-primary text-xs font-black uppercase tracking-wider hover:underline"
                                >
                                    {showEmployeeDropdown ? 'Thu gọn' : 'Thêm nhân viên'}
                                </button>
                            </div>

                            {showEmployeeDropdown && (
                                <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Công ty</label>
                                            <select
                                                value={selectedCompanyId}
                                                onChange={(e) => {
                                                    setSelectedCompanyId(e.target.value);
                                                    setSelectedSupplierId("");
                                                }}
                                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-10 px-3 text-xs outline-none focus:border-primary"
                                            >
                                                <option value="">Tất cả công ty</option>
                                                {companies.map((c: Company) => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Nhà cung cấp</label>
                                            <select
                                                value={selectedSupplierId}
                                                onChange={(e) => setSelectedSupplierId(e.target.value)}
                                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-10 px-3 text-xs outline-none focus:border-primary disabled:opacity-50"
                                                disabled={!selectedCompanyId}
                                            >
                                                <option value="">Tất cả nhà cung cấp</option>
                                                {currentSuppliers.map((s: any) => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Từ khóa</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Tìm tên..."
                                                    value={employeeSearch}
                                                    onChange={(e) => setEmployeeSearch(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchEmployees(false))}
                                                    className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-10 px-3 text-xs"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleSearchEmployees(false)}
                                                    className="px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs shrink-0"
                                                >
                                                    Tìm
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar mt-2">
                                        {employeeResults.map(emp => (
                                            <div
                                                key={emp.employeeId}
                                                onClick={() => addMemberToProject(emp)}
                                                className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between hover:border-primary cursor-pointer transition-colors"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold">{emp.name}</span>
                                                    <span className="text-[10px] text-slate-400">{emp.position.name}</span>
                                                </div>
                                                <span className="material-symbols-outlined text-primary text-[18px]">add_circle</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                                    {assignments.map((assignment, index) => (
                                        <div key={index} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col gap-4 group relative hover:border-primary/30 transition-colors shadow-sm">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
                                                        <span className="material-symbols-outlined text-[20px]">person</span>
                                                    </div>
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <p className="text-[13px] font-black text-slate-900 dark:text-white uppercase truncate leading-tight" title={assignment.name}>{assignment.name}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAssignment(index)}
                                                    className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
                                                    title="Xóa khỏi dự án"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>

                                            <div className="flex flex-col gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Vai trò đảm nhiệm</label>
                                                <input
                                                    type="text"
                                                    placeholder="Nhập vai trò (VD: Quản lý, Dev...)"
                                                    value={assignment.role}
                                                    onChange={(e) => updateAssignmentRole(index, e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-10 px-3 text-[13px] font-bold text-slate-700 dark:text-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {assignments.length === 0 && (
                                    <div className="py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex flex-col items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                                        <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-300 shadow-sm">
                                            <span className="material-symbols-outlined text-3xl">person_add</span>
                                        </div>
                                        <div>
                                            <p className="text-slate-900 dark:text-white text-sm font-bold">Chưa có nhân sự nào tham gia</p>
                                            <p className="text-slate-500 text-xs mt-1">Sử dụng thanh tìm kiếm phía trên để thêm thành viên</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="sticky bottom-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 p-6 sm:p-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-6 py-3 text-slate-600 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="group relative w-full sm:w-auto min-w-[180px] h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 p-[1px] transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                        >
                            <div className="flex h-full w-full items-center justify-center gap-2 rounded-[0.7rem] bg-gradient-to-br from-indigo-600 to-violet-700 px-8 text-white transition-all duration-300 group-hover:bg-none">
                                {submitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[20px] transition-transform duration-500 group-hover:rotate-12">save</span>
                                        <span className="font-black">Lưu thay đổi</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProjectModal;
