import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useParams } from 'react-router-dom';
import { useTaskBoard } from '../hooks/useTaskBoard';
import { getProgressColor } from '../utils/taskboard';
import { TaskDetailModal } from '../components/project/TaskDetailModal';

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
        showMembersSection,
        setShowMembersSection,
        showDeadlineSection,
        setShowDeadlineSection,
        showAttachmentsSection,
        setShowAttachmentsSection,
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

    // const addLabelToTask = async (color: string) => {
    //     if (!selectedTaskId) return;

    //     const task = data.tasks[selectedTaskId];
    //     const labels = task.labels || [];

    //     if (labels.includes(color)) return;

    //     const newLabels = [...labels, color];

    //     // Update UI
    //     setData(prev => ({
    //         ...prev,
    //         tasks: {
    //             ...prev.tasks,
    //             [selectedTaskId]: {
    //                 ...task,
    //                 labels: newLabels
    //             }
    //         }
    //     }));

    //     // Call API
    //     try {
    //         const numericTaskId = Number(selectedTaskId.replace('task-', ''));

    //         await projectApi.updateBoardTask(numericTaskId, {
    //             labelColors: newLabels
    //         });

    //     } catch (err) {
    //         console.error("Failed to update labels", err);
    //         toast.error("Không thể cập nhật nhãn");
    //     }

    //     setOpenLabel(false);
    // };

    // const removeLabel = async (color: string) => {
    //     if (!selectedTaskId) return;

    //     const task = data.tasks[selectedTaskId];
    //     const labels = task.labels || [];

    //     const newLabels = labels.filter(c => c !== color);

    //     // Update UI
    //     setData(prev => ({
    //         ...prev,
    //         tasks: {
    //             ...prev.tasks,
    //             [selectedTaskId]: {
    //                 ...task,
    //                 labels: newLabels
    //             }
    //         }
    //     }));

    //     // Call API
    //     try {
    //         const numericTaskId = Number(selectedTaskId.replace('task-', ''));

    //         await projectApi.updateBoardTask(numericTaskId, {
    //             labelColors: newLabels
    //         });

    //     } catch (err) {
    //         console.error("Failed to remove label", err);
    //         toast.error("Không thể xoá nhãn");
    //     }
    // };

    return (
        <div className="w-full h-full p-8 overflow-x-auto bg-slate-50 dark:bg-slate-950 min-h-screen">
            {selectedTask && (
                <TaskDetailModal
                    selectedTask={selectedTask}
                    selectedTaskColumn={selectedTaskColumn ?? undefined}
                    data={{ columns: data.columns, columnOrder: data.columnOrder }}
                    projectMembers={projectMembers}
                    tempTitle={tempTitle}
                    setTempTitle={setTempTitle}
                    tempDescription={tempDescription}
                    setTempDescription={setTempDescription}
                    isEditingDescription={isEditingDescription}
                    setIsEditingDescription={setIsEditingDescription}
                    handleEditDescription={handleEditDescription}
                    updateTask={updateTask}
                    isMemberDropdownOpen={isMemberDropdownOpen}
                    setIsMemberDropdownOpen={setIsMemberDropdownOpen}
                    showChecklistSection={showChecklistSection}
                    setShowChecklistSection={setShowChecklistSection}
                    showMembersSection={showMembersSection}
                    setShowMembersSection={setShowMembersSection}
                    showDeadlineSection={showDeadlineSection}
                    setShowDeadlineSection={setShowDeadlineSection}
                    showAttachmentsSection={showAttachmentsSection}
                    setShowAttachmentsSection={setShowAttachmentsSection}
                    isAddingChecklistItem={isAddingChecklistItem}
                    setIsAddingChecklistItem={setIsAddingChecklistItem}
                    newChecklistItemText={newChecklistItemText}
                    setNewChecklistItemText={setNewChecklistItemText}
                    isColumnDropdownOpen={isColumnDropdownOpen}
                    setIsColumnDropdownOpen={setIsColumnDropdownOpen}
                    setSelectedTaskId={setSelectedTaskId}
                    moveTaskToColumn={moveTaskToColumn}
                    toggleSubTask={toggleSubTask}
                    addSubTask={addSubTask}
                    fetchTaskDetail={fetchTaskDetail}
                />
            )}


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
                                                            {task.labels && task.labels.length > 0 && (
                                                                <div className="flex gap-1 flex-wrap">
                                                                    {task.labels.map((color, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            className="w-10 h-2 rounded-sm"
                                                                            style={{ backgroundColor: color }}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}
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
