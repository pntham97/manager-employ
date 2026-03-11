import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useParams } from 'react-router-dom';
import { projectApi } from '../api/project.api';
import { toast } from 'react-toastify';
import { useTaskBoard } from '../hooks/useTaskBoard';
import { getProgressColor } from '../utils/taskboard';
import { RichTextEditor } from '../components/RichTextEditor';

const TaskBoard = () => {
    const { id } = useParams<{ id: string }>();
    const {
        data,
        loading,
        projectMembers,
        setSelectedTaskId,
        selectedTask,
        selectedTaskColumn,
        isMemberDropdownOpen,
        setIsMemberDropdownOpen,
        newTaskContent,
        setNewTaskContent,
        isAddingTask,
        setIsAddingTask,
        isAddingColumn,
        setIsAddingColumn,
        newColumnTitle,
        setNewColumnTitle,
        editingColumnId,
        setEditingColumnId,
        isEditingDescription,
        setIsEditingDescription,
        tempDescription,
        setTempDescription,
        tempTitle,
        setTempTitle,
        isAddingChecklistItem,
        setIsAddingChecklistItem,
        newChecklistItemText,
        setNewChecklistItemText,
        showChecklistSection,
        setShowChecklistSection,
        fetchTaskDetail,
        updateTask,
        onDragEnd,
        addTask,
        toggleSubTask,
        handleEditDescription,
        addSubTask,
        addColumn,
        updateColumnTitle,
        deleteTask,
        deleteColumn,
        isColumnDropdownOpen,
        setIsColumnDropdownOpen,
        moveTaskToColumn,
    } = useTaskBoard(id);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-100px)] items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Đang tải bảng công việc...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-8 overflow-x-auto bg-slate-50 dark:bg-slate-950 min-h-screen">
            {/* Modal Detail Task */}
            {selectedTask && (
                <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#f4f5f7] dark:bg-slate-900 w-full max-w-[900px] h-[90vh] rounded-xl overflow-hidden shadow-2xl flex flex-col relative animate-in fade-in zoom-in duration-200">
                        {/* Task Cover & Top bar */}
                        <div className="h-[160px] bg-orange-400 relative">
                            {selectedTask.coverImage && (
                                <img src={selectedTask.coverImage} className="w-full h-full object-cover" alt="cover" />
                            )}
                            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
                                <div className="relative">
                                    <button
                                        onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
                                        className="bg-white/90 hover:bg-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm"
                                    >
                                        {selectedTaskColumn?.title || 'Danh mục'} <span className="material-symbols-outlined text-sm">expand_more</span>
                                    </button>
                                    {isColumnDropdownOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setIsColumnDropdownOpen(false)}
                                            />
                                            <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="px-3 pb-2 border-b border-slate-100 dark:border-slate-700 mb-2">
                                                    <p className="text-[11px] font-bold text-slate-500 uppercase">Chuyển sang cột</p>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto">
                                                    {data.columnOrder.map((columnId) => {
                                                        const column = data.columns[columnId];
                                                        const isCurrent = columnId === selectedTaskColumn?.id;
                                                        return (
                                                            <button
                                                                key={columnId}
                                                                onClick={() => {
                                                                    if (!isCurrent && selectedTask) {
                                                                        moveTaskToColumn(selectedTask.id, columnId);
                                                                    }
                                                                }}
                                                                disabled={isCurrent}
                                                                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors ${
                                                                    isCurrent
                                                                        ? 'bg-slate-100 dark:bg-slate-700/50 text-slate-400 cursor-not-allowed'
                                                                        : 'hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200'
                                                                }`}
                                                            >
                                                                {isCurrent && <span className="material-symbols-outlined text-[16px]">check</span>}
                                                                {column.title}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button className="w-8 h-8 rounded-md bg-white/90 hover:bg-white flex items-center justify-center shadow-sm">
                                        <span className="material-symbols-outlined text-[18px]">image</span>
                                    </button>
                                    <button className="w-8 h-8 rounded-md bg-white/90 hover:bg-white flex items-center justify-center shadow-sm">
                                        <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                                    </button>
                                    <button
                                        onClick={() => setSelectedTaskId(null)}
                                        className="w-8 h-8 rounded-md bg-white/90 hover:bg-white flex items-center justify-center shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
                            {/* Left Content */}
                            <div className="flex-1 space-y-8">
                                {/* Title */}
                                <div className="flex gap-4">
                                    <span className="material-symbols-outlined text-slate-500 mt-2">radio_button_unchecked</span>
                                    <div className="flex-1">
                                        <input
                                            className="text-2xl font-black bg-transparent w-full border-2 border-transparent focus:border-primary rounded-md px-3 py-1 outline-none text-slate-800 dark:text-white transition-all"
                                            value={tempTitle}
                                            onBlur={() => {
                                                if (tempTitle.trim() && tempTitle.trim() !== selectedTask.content) {
                                                    updateTask(selectedTask.id, { content: tempTitle.trim() });
                                                } else {
                                                    setTempTitle(selectedTask.content); // Reset if empty
                                                }
                                            }}
                                            onChange={(e) => setTempTitle(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.currentTarget.blur();
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4 ml-10">
                                    {/* Labels */}
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Nhãn</p>
                                        <div className="flex gap-2">
                                            {selectedTask.labels?.map((color, idx) => (
                                                <div key={idx} style={{ backgroundColor: color }} className="w-12 h-8 rounded-md" />
                                            ))}
                                            <button className="w-8 h-8 rounded-md bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 hover:bg-slate-300">
                                                <span className="material-symbols-outlined text-[18px]">add</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Deadline */}
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Hạn chót</p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="date"
                                                value={selectedTask.deadline || ''}
                                                onChange={(e) => updateTask(selectedTask.id, { deadline: e.target.value })}
                                                className="bg-slate-200 dark:bg-slate-800 px-3 py-1.5 rounded-md text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-primary"
                                            />
                                            {selectedTask.deadline && (
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded ${new Date(selectedTask.deadline) < new Date()
                                                    ? 'bg-red-100 text-red-600'
                                                    : 'bg-green-100 text-green-600'
                                                    }`}>
                                                    {new Date(selectedTask.deadline) < new Date() ? 'Quá hạn' : 'Đang thực hiện'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Members */}
                                    <div className="relative">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Thành viên</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedTask.assignments?.map((assign, idx) => (
                                                <div
                                                    key={idx}
                                                    title={`${assign.employeeName} (${assign.role})`}
                                                    className="group relative w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-800 text-primary overflow-hidden shadow-sm hover:ring-2 hover:ring-primary transition-all"
                                                >
                                                    {assign.avatarUrl ? (
                                                        <img src={assign.avatarUrl} alt={assign.employeeName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{assign.employeeName.charAt(0)}</span>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newAssignments = selectedTask.assignments?.filter(a => a.id !== assign.id) || [];
                                                            updateTask(selectedTask.id, { assignments: newAssignments });
                                                        }}
                                                        className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                                    >
                                                        <span className="material-symbols-outlined text-xs">close</span>
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
                                                className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors shadow-sm"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">add</span>
                                            </button>
                                        </div>

                                        {/* Member Selection Dropdown */}
                                        {isMemberDropdownOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setIsMemberDropdownOpen(false)}
                                                />
                                                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-20 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <div className="px-3 pb-2 border-b border-slate-100 dark:border-slate-700 mb-2">
                                                        <p className="text-[11px] font-bold text-slate-500 uppercase">Thành viên dự án</p>
                                                    </div>
                                                    <div className="max-h-60 overflow-y-auto px-1">
                                                        {projectMembers.length > 0 ? (
                                                            projectMembers.map((member) => {
                                                                const isAssigned = selectedTask.assignments?.some(a => a.employeeId === member.employeeId);
                                                                return (
                                                                    <button
                                                                        key={member.id}
                                                                        onClick={() => {
                                                                            let newAssignments = [...(selectedTask.assignments || [])];
                                                                            if (isAssigned) {
                                                                                newAssignments = newAssignments.filter(a => a.employeeId !== member.employeeId);
                                                                            } else {
                                                                                // Map project assignment to task assignment structure
                                                                                newAssignments.push({
                                                                                    id: member.id, // This is the ProjectAssignment ID
                                                                                    employeeId: member.employeeId,
                                                                                    employeeName: member.employeeName,
                                                                                    role: member.role,
                                                                                    assignedAt: new Date().toISOString()
                                                                                });
                                                                            }
                                                                            updateTask(selectedTask.id, { assignments: newAssignments });
                                                                        }}
                                                                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors rounded-md group text-left"
                                                                    >
                                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                                                            {member.avatarUrl ? (
                                                                                <img src={member.avatarUrl} alt={member.employeeName} className="w-full h-full rounded-full object-cover" />
                                                                            ) : (
                                                                                member.employeeName.charAt(0)
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{member.employeeName}</p>
                                                                            <p className="text-[10px] text-slate-500">{member.role}</p>
                                                                        </div>
                                                                        {isAssigned && (
                                                                            <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                                                                        )}
                                                                    </button>
                                                                );
                                                            })
                                                        ) : (
                                                            <p className="text-xs text-slate-500 italic px-3 py-2 text-center">Không có thành viên nào trong dự án</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 ml-10">
                                    <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
                                        <span className="material-symbols-outlined text-[18px]">add</span> Thêm
                                    </button>
                                    <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
                                        <span className="material-symbols-outlined text-[18px]">schedule</span> Ngày
                                    </button>
                                    <button
                                        onClick={() => setShowChecklistSection(prev => !prev)}
                                        className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm ${showChecklistSection
                                            ? 'bg-primary/10 border-primary text-primary hover:bg-primary/20'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">checklist_rtl</span> Việc cần làm
                                        {selectedTask.subTasks && selectedTask.subTasks.length > 0 && (
                                            <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px]">{selectedTask.subTasks.length}</span>
                                        )}
                                    </button>
                                    <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
                                        <span className="material-symbols-outlined text-[18px]">person_add</span> Thành viên
                                    </button>
                                    <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
                                        <span className="material-symbols-outlined text-[18px]">attach_file</span> Đính kèm
                                    </button>
                                </div>

                                {/* Description */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-slate-500">subject</span>
                                            <h4 className="font-black text-slate-800 dark:text-slate-100">Mô tả</h4>
                                        </div>
                                        {!isEditingDescription && selectedTask.description && (
                                            <button
                                                onClick={handleEditDescription}
                                                className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
                                            >
                                                Chỉnh sửa
                                            </button>
                                        )}
                                    </div>

                                    <div className="ml-10">
                                        <RichTextEditor
                                            value={tempDescription}
                                            onChange={setTempDescription}
                                            editing={isEditingDescription}
                                            onEditClick={handleEditDescription}
                                            onSave={() => {
                                                updateTask(selectedTask.id, { description: tempDescription });
                                                setIsEditingDescription(false);
                                            }}
                                            onCancel={() => setIsEditingDescription(false)}
                                            placeholder="Thêm mô tả chi tiết hơn..."
                                            minHeight="150px"
                                            saveLabel="Lưu"
                                            cancelLabel="Hủy"
                                        />
                                    </div>
                                </div>

                                {/* Checklist */}
                                {showChecklistSection && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-slate-500">check_box</span>
                                            <h4 className="font-black text-slate-800 dark:text-slate-100">Việc cần làm</h4>
                                        </div>
                                        <button
                                            onClick={() => toast.info("Chức năng xoá công việc con sẽ được hỗ trợ sau.")}
                                            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
                                        >
                                            Xoá
                                        </button>
                                    </div>
                                    <div className="ml-10 space-y-4">
                                        {(() => {
                                            const raw = selectedTask.progress ?? 0;
                                            const subCount = selectedTask.subTasks?.length ?? 0;
                                            const display = (raw === 99 && subCount % 2 === 1) ? 100 : raw;
                                            const colors = getProgressColor(display);
                                            return (
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-[10px] font-bold min-w-[25px] ${colors.text}`}>{display}%</span>
                                                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${colors.bar} transition-all duration-300`}
                                                            style={{ width: `${display}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                        <div className="space-y-1">
                                            {selectedTask.subTasks?.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-3 group cursor-pointer hover:bg-slate-400/5 p-1.5 rounded-lg transition-all"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={item.isDone}
                                                        className="w-4 h-4 rounded accent-primary border-slate-300 dark:border-slate-700 cursor-pointer"
                                                        onChange={() => toggleSubTask(selectedTask.id, item)}
                                                    />
                                                    <div className="flex-1 flex items-center justify-between" onClick={() => toggleSubTask(selectedTask.id, item)}>
                                                        <span className={`text-sm font-medium transition-all ${item.isDone ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                                                            {item.title}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                projectApi.deleteSubTask(item.id)
                                                                    .then(() => {
                                                                        toast.success("Đã xoá công việc con");
                                                                        fetchTaskDetail(selectedTask.id);
                                                                    })
                                                                    .catch((err) => {
                                                                        console.error("Failed to delete sub task", err);
                                                                        toast.error("Không thể xoá công việc con");
                                                                    });
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-all text-slate-400 hover:text-red-500"
                                                            title="Xoá mục"
                                                        >
                                                            <span className="material-symbols-outlined text-[18px]">close</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {isAddingChecklistItem ? (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                <textarea
                                                    autoFocus
                                                    placeholder="Thêm một mục"
                                                    value={newChecklistItemText}
                                                    onChange={(e) => setNewChecklistItemText(e.target.value)}
                                                    className="w-full bg-white dark:bg-slate-950 border-2 border-primary rounded-lg p-3 text-sm outline-none shadow-lg shadow-primary/5 min-h-[80px] resize-none"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            addSubTask(selectedTask.id, newChecklistItemText);
                                                        }
                                                        if (e.key === 'Escape') {
                                                            setIsAddingChecklistItem(false);
                                                            setNewChecklistItemText('');
                                                        }
                                                    }}
                                                />
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => addSubTask(selectedTask.id, newChecklistItemText)}
                                                        className="bg-primary text-white text-xs font-bold px-4 py-2 rounded hover:bg-primary/90 transition-all active:scale-95"
                                                    >
                                                        Thêm
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setIsAddingChecklistItem(false);
                                                            setNewChecklistItemText('');
                                                        }}
                                                        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors px-2"
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setIsAddingChecklistItem(true)}
                                                className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-4 py-1.5 rounded-md text-xs font-bold text-slate-600 dark:text-slate-300 transition-all active:scale-95"
                                            >
                                                Thêm một mục
                                            </button>
                                        )}
                                    </div>
                                </div>
                                )}
                            </div>

                            {/* Right Content - Activity */}
                            <div className="w-full md:w-[320px] border-l border-slate-200 dark:border-slate-800 pl-0 md:pl-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-500">comment</span>
                                        <h4 className="font-black text-slate-800 dark:text-slate-100 uppercase text-sm">Nhận xét và hoạt động</h4>
                                    </div>
                                    <button className="bg-slate-200 dark:bg-slate-800 px-3 py-1.5 rounded-md text-[10px] font-bold">Hiện chi tiết</button>
                                </div>

                                <div className="mb-8">
                                    <input
                                        placeholder="Viết bình luận..."
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-lg text-sm outline-none shadow-sm focus:border-primary"
                                    />
                                </div>

                                <div className="space-y-6">
                                    {selectedTask.activity?.map((act) => (
                                        <div key={act.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-[10px] font-bold">
                                                {act.user.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-700 dark:text-slate-300">
                                                    <span className="font-bold">{act.user}</span> {act.action}
                                                </p>
                                                <p className="text-[10px] text-primary hover:underline cursor-pointer mt-1">{act.timestamp}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Bảng Công Việc (Kanban Board)</h1>
                <p className="text-slate-500">Quản lý các công việc của bạn bằng cách kéo thả giữa các cột.</p>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-6 items-start">
                    {data.columnOrder.map((columnId) => {
                        const column = data.columns[columnId];
                        const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

                        return (
                            <div
                                key={column.id}
                                className="bg-slate-200 dark:bg-slate-900 rounded-2xl p-4 w-[350px] flex-shrink-0 flex flex-col max-h-[calc(100vh-200px)] border border-slate-300 dark:border-slate-800 shadow-sm group"
                            >
                                <div className="flex items-center justify-between mb-4 px-1">
                                    {editingColumnId === column.id ? (
                                        <input
                                            autoFocus
                                            className="bg-white dark:bg-slate-950 border border-primary rounded px-2 py-1 text-sm font-bold w-full mr-2 outline-none"
                                            defaultValue={column.title}
                                            onBlur={(e) => updateColumnTitle(column.id, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    updateColumnTitle(column.id, (e.target as HTMLInputElement).value);
                                                }
                                                if (e.key === 'Escape') {
                                                    setEditingColumnId(null);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <h3
                                            className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer hover:text-primary transition-colors flex-1"
                                            onClick={() => setEditingColumnId(column.id)}
                                        >
                                            {column.title}
                                        </h3>
                                    )}
                                    <button
                                        onClick={() => deleteColumn(column.id)}
                                        className="text-slate-300 hover:text-red-500 transition-colors ml-1 p-1 opacity-0 group-hover:opacity-100"
                                        title="Xoá cột"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                    </button>
                                    <div className="bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-1 rounded-full ml-2">
                                        {tasks.length}
                                    </div>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`flex-1 overflow-y-auto min-h-[100px] flex flex-col gap-3 rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-slate-300/50 dark:bg-slate-800/50' : ''
                                                }`}
                                        >
                                            {tasks.map((task, index) => (
                                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                                    {(provided: any, snapshot: any) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => setSelectedTaskId(task.id)}
                                                            className={`bg-white dark:bg-slate-950 p-4 rounded-xl border-2 transition-all shadow-sm group cursor-pointer ${snapshot.isDragging
                                                                ? 'border-primary/50 shadow-lg shadow-primary/10 rotate-2 scale-105 z-50'
                                                                : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                                                }`}
                                                        >
                                                            <div className="flex justify-between items-start mb-2 group-actions">
                                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1">{task.content}</p>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteTask(column.id, task.id);
                                                                    }}
                                                                    className="text-slate-300 hover:text-red-500 transition-colors ml-2 opacity-0 group-hover:opacity-100"
                                                                    title="Xoá công việc"
                                                                >
                                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                                </button>
                                                            </div>
                                                            <div className="mt-4 flex flex-col gap-2 group">
                                                                <div className="flex items-center gap-2">
                                                                    {(() => {
                                                                        const raw = task.progress ?? 0;
                                                                        const subCount = task.subTasks?.length ?? 0;
                                                                        const p = (raw === 99 && subCount % 2 === 1) ? 100 : raw;
                                                                        const c = getProgressColor(p);
                                                                        return (
                                                                            <>
                                                                                <span className={`text-[10px] font-bold min-w-[28px] ${c.text}`}>{p}%</span>
                                                                                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                                    <div
                                                                                        className={`h-full ${c.bar} transition-all duration-300`}
                                                                                        style={{ width: `${p}%` }}
                                                                                    />
                                                                                </div>
                                                                            </>
                                                                        );
                                                                    })()}
                                                                </div>
                                                                <div className="flex -space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {task.assignments && task.assignments.length > 0 ? (
                                                                        task.assignments.slice(0, 3).map((assign, idx) => (
                                                                            <div
                                                                                key={idx}
                                                                                title={assign.employeeName}
                                                                                className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] border-2 border-white dark:border-slate-950 text-primary font-bold overflow-hidden"
                                                                            >
                                                                                {assign.avatarUrl ? (
                                                                                    <img src={assign.avatarUrl} alt={assign.employeeName} className="w-full h-full object-cover" />
                                                                                ) : (
                                                                                    <span>{assign.employeeName.charAt(0)}</span>
                                                                                )}
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] border-2 border-white dark:border-slate-950 text-slate-400 font-bold">
                                                                            ?
                                                                        </div>
                                                                    )}
                                                                    {task.assignments && task.assignments.length > 3 && (
                                                                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] border-2 border-white dark:border-slate-950 text-slate-500 font-bold">
                                                                            +{task.assignments.length - 3}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>

                                <div className="mt-4">
                                    {isAddingTask === column.id ? (
                                        <div className="bg-white dark:bg-slate-950 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                                            <textarea
                                                autoFocus
                                                value={newTaskContent}
                                                onChange={(e) => setNewTaskContent(e.target.value)}
                                                placeholder="Nhập tiêu đề thẻ..."
                                                className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none outline-none text-slate-800 dark:text-slate-200"
                                                rows={3}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        addTask(column.id);
                                                    }
                                                }}
                                            />
                                            <div className="flex items-center gap-2 mt-2">
                                                <button
                                                    onClick={() => addTask(column.id)}
                                                    className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                                                >
                                                    Thêm thẻ
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsAddingTask(null);
                                                        setNewTaskContent('');
                                                    }}
                                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2"
                                                >
                                                    <span className="material-symbols-outlined text-sm block">close</span>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setIsAddingTask(column.id)}
                                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-slate-500 hover:bg-slate-300/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200 transition-colors text-sm font-bold"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">add</span>
                                            Thêm thẻ mới
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Add New Column */}
                    <div className="w-[350px] flex-shrink-0">
                        {isAddingColumn ? (
                            <div className="bg-slate-200 dark:bg-slate-900 rounded-2xl p-4 border border-slate-300 dark:border-slate-800 shadow-sm">
                                <input
                                    autoFocus
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none focus:border-primary mb-3"
                                    placeholder="Nhập tên cột..."
                                    value={newColumnTitle}
                                    onChange={(e) => setNewColumnTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') addColumn();
                                        if (e.key === 'Escape') setIsAddingColumn(false);
                                    }}
                                />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={addColumn}
                                        className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        Thêm cột
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsAddingColumn(false);
                                            setNewColumnTitle('');
                                        }}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2"
                                    >
                                        <span className="material-symbols-outlined text-sm block">close</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAddingColumn(true)}
                                className="w-full h-[60px] flex items-center justify-center gap-2 rounded-2xl bg-slate-200/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-900 hover:text-slate-800 dark:hover:text-slate-200 transition-all font-bold"
                            >
                                <span className="material-symbols-outlined">add_column</span>
                                <span>Thêm cột mới</span>
                            </button>
                        )}
                    </div>
                </div>
            </DragDropContext>
        </div >
    );
};

export default TaskBoard;
