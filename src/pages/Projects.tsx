import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { projectApi } from "../api/project.api";
import type { ProjectItem } from "../types/project";
import { toast } from "react-hot-toast";
import EditProjectModal from "../components/project/EditProjectModal";

const Projects = () => {
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<number | "">("");

    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);

    const handleEditClick = (e: React.MouseEvent, project: ProjectItem) => {
        e.preventDefault(); // Prevent navigating to the board if we click edit
        setEditingProject(project);
        setIsEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setEditingProject(null);
    };

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const params: any = {
                page: 0,
                size: 50,
            };
            if (searchTerm) params.projectName = searchTerm;
            if (selectedStatus !== "") params.statusId = selectedStatus;

            const res = await projectApi.getProjectList(params);
            if (res.data) {
                const data: any = res.data;
                console.log("Projects API Data:", data);

                let projectList: any[] = [];
                let total = 0, inProgress = 0, completed = 0, overdue = 0;

                if (Array.isArray(data)) {
                    projectList = data;
                } else if (data.data && Array.isArray(data.data)) {
                    projectList = data.data;
                } else if (data.content && Array.isArray(data.content)) {
                    projectList = data.content;
                    total = data.totalElements || 0;
                    inProgress = data.totalInProgress || 0;
                    completed = data.totalCompleted || 0;
                    overdue = data.totalOverdue || 0;
                }

                // Normalize data structure for UI
                const normalizedProjects = projectList.map((p: any) => ({
                    ...p,
                    progress: p.progress || 0,
                    members: p.members || (p.assignments ? p.assignments.map((a: any) => a.employee || a) : [])
                }));
                setProjects(normalizedProjects);

                if (!data.content) {
                    total = projectList.length;
                    inProgress = projectList.filter((p: any) => p.status?.statusName === 'IN_PROGRESS' || p.status?.description?.toLowerCase().includes('đang')).length;
                    completed = projectList.filter((p: any) => p.status?.statusName === 'COMPLETED' || p.status?.description?.toLowerCase().includes('hoàn thành')).length;
                    overdue = projectList.filter((p: any) => p.status?.statusName === 'OVERDUE' || p.status?.description?.toLowerCase().includes('quá hạn')).length;
                }

                setStats({ total, inProgress, completed, overdue });
            }
        } catch (err) {
            console.error("Failed to fetch projects", err);
            toast.error("Không thể tải danh sách dự án");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [selectedStatus]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchProjects();
    };

    const getStatusColor = (statusName: string) => {
        const name = statusName.toLowerCase();
        if (name.includes("hoàn thành")) return "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400";
        if (name.includes("đang thực hiện")) return "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400";
        if (name.includes("quá hạn") || name.includes("tạm dừng")) return "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400";
        return "bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400";
    };

    const getProgressBarColor = (statusName: string) => {
        const name = statusName.toLowerCase();
        if (name.includes("hoàn thành")) return "bg-green-600";
        if (name.includes("đang thực hiện")) return "bg-blue-600";
        if (name.includes("quá hạn")) return "bg-red-600";
        return "bg-slate-400";
    };

    return (
        <div className="max-w-[1240px] h-full py-10 px-6 mx-auto flex flex-col gap-10">
            {/* Header & Breadcrumbs */}
            <div className="flex flex-col gap-6">
                <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[20px]">home</span>
                        Trang chủ
                    </Link>
                    <span className="material-symbols-outlined text-slate-300 text-[18px]">chevron_right</span>
                    <span className="text-slate-900 dark:text-white">Quản lý dự án</span>
                </nav>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Trung tâm Dự án</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">Theo dõi tiến độ, phân công nhân sự và quản lý thời hạn cho toàn bộ tổ chức.</p>
                    </div>
                    <Link to="/projects/create">
                        <button className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 h-14 font-bold transition-all shadow-xl hover:shadow-slate-500/20 hover:scale-[1.02] active:scale-98 whitespace-nowrap">
                            <span className="material-symbols-outlined text-[24px]">add_circle</span>
                            <span>Thiết lập Dự án mới</span>
                        </button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Tổng dự án", value: stats.total, icon: "inventory_2", color: "slate", trend: "+2", sub: "so với tháng trước" },
                    { label: "Đang thực hiện", value: stats.inProgress, icon: "rocket_launch", color: "blue", trend: "Hoạt động", sub: "tích cực" },
                    { label: "Hoàn thành", value: stats.completed, icon: "verified", color: "green", trend: "Hiệu quả", sub: "+12%" },
                    { label: "Trễ hạn / Cần chú ý", value: stats.overdue, icon: "priority_high", color: "red", trend: "Cảnh báo", sub: "cần xử lý" },
                ].map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{item.label}</p>
                            <div className={`p-2 rounded-xl bg-${item.color}-500/10 text-${item.color}-600 dark:text-${item.color}-400`}>
                                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{item.value}</p>
                            <div className="flex items-center gap-1.5 mt-3">
                                <span className={`text-${item.color}-600 text-xs font-bold`}>{item.trend}</span>
                                <span className="text-slate-400 text-xs font-medium">{item.sub}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-3 rounded-[2rem] flex flex-col md:flex-row gap-3">
                <form onSubmit={handleSearch} className="flex-1 min-w-0">
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm theo tên dự án..."
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] h-14 pl-12 pr-6 text-slate-900 dark:text-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                        />
                    </div>
                </form>

                <div className="flex items-center gap-2 overflow-x-auto px-2 md:px-0">
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value === "" ? "" : Number(e.target.value))}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl h-14 px-5 text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-primary cursor-pointer shadow-sm min-w-[180px]"
                    >
                        <option value="">Mọi trạng thái</option>
                        <option value="1">Đang lập kế hoạch</option>
                        <option value="2">Đang thực hiện</option>
                        <option value="3">Hoàn thành</option>
                        <option value="4">Tạm dừng</option>
                    </select>

                    <div className="h-8 w-px bg-slate-300 dark:bg-slate-700 mx-2 hidden md:block"></div>

                    <div className="flex bg-white dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <button className="p-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm">
                            <span className="material-symbols-outlined text-[20px] block">grid_view</span>
                        </button>
                        <button className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[20px] block">view_list</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Project Grid */}
            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-slate-400 font-bold animate-pulse">Đang tải danh sách dự án...</p>
                </div>
            ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            to={`/projects/${project.id}/board`}
                            className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
                        >
                            {/* Decorative line color based on status */}
                            <div className={`absolute top-0 left-0 right-0 h-1.5 ${getProgressBarColor(project.status.description)} opacity-40`} />

                            <div className="flex justify-between items-start mb-6">
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{project.type.description}</span>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">{project.projectName}</h3>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(project.status.description)}`}>
                                        {project.status.description}
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2 italic">
                                {project.description || "Không có mô tả chi tiết cho dự án này."}
                            </p>

                            <div className="mb-6">
                                <div className="flex justify-between text-[11px] font-bold mb-2">
                                    <span className="text-slate-400 uppercase tracking-wider">Tiến trình đạt được</span>
                                    <span className="text-slate-900 dark:text-white">{project.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressBarColor(project.status.description)}`}
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div>

                                <div className="flex items-center gap-3 mt-5">
                                    <button
                                        onClick={(e) => handleEditClick(e, project)}
                                        className="flex-1 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-primary/10 transition-colors pointer-events-auto text-xs font-bold"
                                        title="Chỉnh sửa dự án"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">edit</span>
                                        Cập nhật
                                    </button>
                                    {project.boardTaskId === null ? (
                                        <div className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold tracking-tight px-2 pointer-events-none">
                                            <span className="material-symbols-outlined text-[16px]">warning</span>
                                            Chưa phân task
                                        </div>
                                    ) : (
                                        <div className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl text-xs font-bold tracking-tight px-2 pointer-events-none">
                                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                            Đã phân task
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex -space-x-3">
                                    {project.members && project.members.length > 0 ? (
                                        <>
                                            {project.members.slice(0, 3).map((member, idx) => (
                                                <div
                                                    key={idx}
                                                    title={member.name}
                                                    className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 flex items-center justify-center overflow-hidden"
                                                >
                                                    {member.avatarUrl ? (
                                                        <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-slate-400 text-xl">person</span>
                                                    )}
                                                </div>
                                            ))}
                                            {project.members.length > 3 && (
                                                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                                    +{project.members.length - 3}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-[10px] font-bold text-slate-400 uppercase italic">Chưa phân công</div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[11px] font-black tracking-tight">
                                    <span className="material-symbols-outlined text-[16px]">event</span>
                                    {new Date(project.deadline).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-32 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                    <div className="w-20 h-20 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-300 mb-6 shadow-sm">
                        <span className="material-symbols-outlined text-5xl">folder_off</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Không tìm thấy dự án</h3>
                    <p className="text-slate-500 mt-2 max-w-xs text-center font-medium">Bạn chưa khởi tạo dự án nào hoặc từ khóa tìm kiếm chưa chính xác.</p>
                </div>
            )}

            <EditProjectModal
                isOpen={isEditModalOpen}
                onClose={handleEditModalClose}
                project={editingProject}
                onUpdateSuccess={fetchProjects}
            />
        </div>
    );
};

export default Projects;
