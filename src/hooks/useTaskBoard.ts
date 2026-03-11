import { useState, useEffect, useCallback } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import { projectApi } from '../api/project.api';
import { toast } from 'react-toastify';
import type { SubTaskItem } from '../types/project';
import type { Task, ColumnData, BoardData } from '../interfaces/taskboard';

const INITIAL_BOARD: BoardData = {
    tasks: {},
    columns: {
        'column-1': { id: 'column-1', title: 'To Do', taskIds: [] },
        'column-2': { id: 'column-2', title: 'In Progress', taskIds: [] },
        'column-3': { id: 'column-3', title: 'Done', taskIds: [] },
    },
    columnOrder: ['column-1', 'column-2', 'column-3'],
};

export function useTaskBoard(projectId: string | undefined) {
    const [boardId, setBoardId] = useState<number | null>(null);
    const [data, setData] = useState<BoardData>(INITIAL_BOARD);
    const [loading, setLoading] = useState(true);
    const [projectMembers, setProjectMembers] = useState<any[]>([]);
    const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
    const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

    const [newTaskContent, setNewTaskContent] = useState('');
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [isAddingTask, setIsAddingTask] = useState<string | null>(null);
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [tempDescription, setTempDescription] = useState('');
    const [isAddingChecklistItem, setIsAddingChecklistItem] = useState(false);
    const [newChecklistItemText, setNewChecklistItemText] = useState('');
    const [tempTitle, setTempTitle] = useState('');
    const [showChecklistSection, setShowChecklistSection] = useState(false);

    const fetchTaskDetail = useCallback(async (taskKey: string | null) => {
        if (!taskKey) return;
        const numericTaskId = Number(taskKey.replace('task-', ''));
        try {
            const res = await projectApi.getBoardTaskDetail(numericTaskId);
            if (res.data) {
                const t = res.data;
                setData(prev => ({
                    ...prev,
                    tasks: {
                        ...prev.tasks,
                        [taskKey]: {
                            ...prev.tasks[taskKey],
                            content: t.title,
                            description: t.description,
                            deadline: t.deadline,
                            assignments: t.listAssignmentEmployee,
                            progress: t.progress ?? 0,
                            subTasks: t.subTasks ?? []
                        }
                    }
                }));
            }
        } catch (err) {
            console.error("Failed to fetch task detail", err);
        }
    }, []);

    useEffect(() => {
        if (selectedTaskId && data.tasks[selectedTaskId]) {
            const task = data.tasks[selectedTaskId];
            setTempTitle(task.content);
            setTempDescription(task.description || '');
        }
    }, [selectedTaskId, data.tasks]);

    // Auto-show checklist section when task has subTasks
    useEffect(() => {
        if (selectedTaskId && data.tasks[selectedTaskId]) {
            const subCount = data.tasks[selectedTaskId].subTasks?.length ?? 0;
            if (subCount > 0) {
                setShowChecklistSection(true);
            }
        } else {
            setShowChecklistSection(false);
        }
    }, [selectedTaskId, data.tasks]);

    useEffect(() => {
        const fetchTasks = async () => {
            if (!projectId) return;
            try {
                setLoading(true);
                const res = await projectApi.getBoardTasksByProjectId(Number(projectId));
                if (res.data && res.data.length > 0) {
                    const board = res.data[0];
                    setBoardId(board.id);
                    const tasksObj: Record<string, Task> = {};
                    const columnsObj: Record<string, ColumnData> = {};
                    const columnOrder: string[] = [];

                    board.columns.sort((a, b) => a.position - b.position).forEach(col => {
                        const colId = `column-${col.id}`;
                        const taskIds: string[] = [];
                        col.tasks.sort((a, b) => a.position - b.position).forEach(t => {
                            taskIds.push(`task-${t.id}`);
                        });
                        columnsObj[colId] = { id: colId, title: col.title, taskIds };
                        columnOrder.push(colId);
                    });

                    if (board.tasks && Array.isArray(board.tasks)) {
                        board.tasks.forEach(t => {
                            const taskId = `task-${t.id}`;
                            tasksObj[taskId] = {
                                id: taskId,
                                content: t.title,
                                description: t.description,
                                deadline: t.deadline,
                                assignments: t.listAssignmentEmployee,
                                progress: t.progress ?? 0,
                                subTasks: t.subTasks ?? []
                            };
                        });
                    } else {
                        board.columns.forEach(col => {
                            col.tasks.forEach(t => {
                                const taskId = `task-${t.id}`;
                                if (!tasksObj[taskId]) {
                                    tasksObj[taskId] = {
                                        id: taskId,
                                        content: t.title,
                                        description: t.description,
                                        progress: t.progress ?? 0,
                                        subTasks: t.subTasks ?? [],
                                        assignments: t.listAssignmentEmployee
                                    };
                                }
                            });
                        });
                    }

                    const projectRes = await projectApi.getProjectById(Number(projectId));
                    if (projectRes.data) {
                        setProjectMembers(projectRes.data.assignments || []);
                    }

                    setData({ tasks: tasksObj, columns: columnsObj, columnOrder });
                } else {
                    const projectRes = await projectApi.getProjectById(Number(projectId));
                    const project = projectRes.data;

                    if (project) {
                        setProjectMembers(project.assignments || []);

                        const createPayload = {
                            projectId: Number(projectId),
                            title: project.projectName,
                            description: `Phân chia công việc cho ${project.projectName}`,
                            columns: [
                                { title: "To Do", position: 1 },
                                { title: "In Progress", position: 2 },
                                { title: "Done", position: 3 }
                            ]
                        };

                        const newBoardRes = await projectApi.createBoardTask(createPayload);
                        if (newBoardRes.data) {
                            toast.info("Đã khởi tạo bảng công việc mới cho dự án");
                            const board = newBoardRes.data;
                            setBoardId(board.id);
                            const tasksObj: Record<string, Task> = {};
                            const columnsObj: Record<string, ColumnData> = {};
                            const columnOrder: string[] = [];

                            board.columns.forEach(col => {
                                const colId = `column-${col.id}`;
                                columnsObj[colId] = { id: colId, title: col.title, taskIds: [] };
                                columnOrder.push(colId);
                            });

                            setData({ tasks: tasksObj, columns: columnsObj, columnOrder });
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch or create board tasks", err);
                toast.error("Không thể tải bảng công việc");
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [projectId]);

    useEffect(() => {
        fetchTaskDetail(selectedTaskId);
    }, [selectedTaskId, fetchTaskDetail]);

    const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
        setData(prev => ({
            ...prev,
            tasks: {
                ...prev.tasks,
                [taskId]: { ...prev.tasks[taskId], ...updates },
            },
        }));

        const numericTaskId = Number(taskId.replace('task-', ''));
        try {
            const payload: any = {};
            if (updates.content !== undefined) payload.title = updates.content;
            if (updates.description !== undefined) payload.description = updates.description;
            if (updates.deadline !== undefined) payload.deadline = updates.deadline;
            if (updates.assignments !== undefined) {
                payload.projectAssignmentIds = updates.assignments.map(a => a.id);
            }
            await projectApi.updateBoardTask(numericTaskId, payload);
        } catch (err) {
            console.error("Failed to update task on server", err);
            toast.error("Không thể lưu thay đổi vào máy chủ");
        }
    }, []);

    const onDragEnd = useCallback(async (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const startColumn = data.columns[source.droppableId];
        const finishColumn = data.columns[destination.droppableId];

        if (startColumn === finishColumn) {
            const newTaskIds = Array.from(startColumn.taskIds);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);

            setData(prev => ({
                ...prev,
                columns: {
                    ...prev.columns,
                    [startColumn.id]: { ...startColumn, taskIds: newTaskIds },
                },
            }));

            try {
                const numericTaskId = Number(draggableId.replace('task-', ''));
                await projectApi.updateBoardTask(numericTaskId, { position: destination.index + 1 });
            } catch (err) {
                console.error("Failed to sync same-column task move", err);
                toast.error("Không thể thay đổi thứ tự công việc");
            }
            return;
        }

        const startTaskIds = Array.from(startColumn.taskIds);
        startTaskIds.splice(source.index, 1);
        const finishTaskIds = Array.from(finishColumn.taskIds);
        finishTaskIds.push(draggableId);

        setData(prev => ({
            ...prev,
            columns: {
                ...prev.columns,
                [startColumn.id]: { ...startColumn, taskIds: startTaskIds },
                [finishColumn.id]: { ...finishColumn, taskIds: finishTaskIds },
            },
        }));

        try {
            const numericTaskId = Number(draggableId.replace('task-', ''));
            const numericFinishColumnId = Number(destination.droppableId.replace('column-', ''));
            await projectApi.updateBoardTask(numericTaskId, {
                columnTaskId: numericFinishColumnId,
                position: finishTaskIds.length
            });
        } catch (err) {
            console.error("Failed to sync cross-column task move", err);
            toast.error("Không thể di chuyển công việc");
        }
    }, [data.columns]);

    const addTask = useCallback(async (columnId: string) => {
        if (!newTaskContent.trim() || !boardId) return;

        const numericColumnId = Number(columnId.replace('column-', ''));
        const column = data.columns[columnId];
        const newPosition = column.taskIds.length + 1;

        try {
            const res = await projectApi.createTask({
                title: newTaskContent.trim(),
                columnTaskId: numericColumnId,
                boardTaskId: boardId,
                position: newPosition
            });

            if (res.data) {
                const newTaskFromServer = res.data;
                const newTaskId = `task-${newTaskFromServer.id}`;
                const newTask: Task = {
                    id: newTaskId,
                    content: newTaskFromServer.title,
                    description: newTaskFromServer.description,
                    deadline: newTaskFromServer.deadline,
                    assignments: newTaskFromServer.listAssignmentEmployee
                };

                const newTaskIds = Array.from(column.taskIds);
                newTaskIds.push(newTaskId);

                setData(prev => ({
                    ...prev,
                    tasks: { ...prev.tasks, [newTaskId]: newTask },
                    columns: {
                        ...prev.columns,
                        [columnId]: { ...column, taskIds: newTaskIds },
                    },
                }));

                setNewTaskContent('');
                setIsAddingTask(null);
                toast.success("Đã thêm công việc mới");
            }
        } catch (error) {
            console.error("Lỗi khi thêm công việc:", error);
            toast.error("Không thể thêm công việc mới. Vui lòng thử lại.");
        }
    }, [newTaskContent, boardId, data.columns]);

    const toggleSubTask = useCallback(async (taskId: string, subTask: SubTaskItem) => {
        try {
            await projectApi.updateSubTask(subTask.id, { isDone: !subTask.isDone });
            await fetchTaskDetail(taskId);
        } catch (err) {
            console.error("Failed to toggle sub task", err);
            toast.error("Không thể cập nhật công việc con");
        }
    }, [fetchTaskDetail]);

    const handleEditDescription = useCallback(() => {
        const task = selectedTaskId ? data.tasks[selectedTaskId] : null;
        if (task) {
            setTempDescription(task.description || '');
            setIsEditingDescription(true);
        }
    }, [selectedTaskId, data.tasks]);

    const addSubTask = useCallback(async (taskId: string, text: string) => {
        if (!text.trim()) return;
        const numericTaskId = Number(taskId.replace('task-', ''));
        try {
            await projectApi.createSubTask({ title: text.trim(), taskId: numericTaskId });
            setNewChecklistItemText('');
            setIsAddingChecklistItem(false);
            await fetchTaskDetail(taskId);
        } catch (err) {
            console.error("Failed to add sub task", err);
            toast.error("Không thể thêm công việc con");
        }
    }, [fetchTaskDetail]);

    const addColumn = useCallback(async () => {
        if (!newColumnTitle.trim() || !boardId) return;

        try {
            const res = await projectApi.addColumn(boardId, {
                title: newColumnTitle,
                position: data.columnOrder.length + 1
            });

            if (res.data) {
                const newCol = res.data;
                const newColumnId = `column-${newCol.id}`;
                const newColumn: ColumnData = { id: newColumnId, title: newCol.title, taskIds: [] };

                setData(prev => ({
                    ...prev,
                    columns: { ...prev.columns, [newColumnId]: newColumn },
                    columnOrder: [...prev.columnOrder, newColumnId],
                }));

                setNewColumnTitle('');
                setIsAddingColumn(false);
                toast.success("Đã thêm cột mới thành công");
            }
        } catch (err) {
            console.error("Failed to add column", err);
            toast.error("Không thể thêm cột mới");
        }
    }, [newColumnTitle, boardId, data.columnOrder.length]);

    const updateColumnTitle = useCallback(async (columnId: string, newTitle: string) => {
        if (!newTitle.trim() || !boardId) {
            setEditingColumnId(null);
            return;
        }

        const newData = {
            ...data,
            columns: {
                ...data.columns,
                [columnId]: { ...data.columns[columnId], title: newTitle },
            },
        };

        setData(newData);
        setEditingColumnId(null);

        try {
            const payload = newData.columnOrder.map((id, index) => ({
                title: newData.columns[id].title,
                position: index + 1
            }));
            await projectApi.updateBoardTaskColumns(boardId, payload);
        } catch (err) {
            console.error("Failed to sync column title", err);
            toast.error("Không thể cập nhật tên cột");
        }
    }, [data, boardId]);

    const deleteTask = useCallback(async (columnId: string, taskId: string) => {
        const column = data.columns[columnId];
        const newTaskIds = column.taskIds.filter(id => id !== taskId);
        const newTasks = { ...data.tasks };
        const numericTaskId = Number(taskId.replace('task-', ''));
        delete newTasks[taskId];

        setData(prev => ({
            ...prev,
            tasks: newTasks,
            columns: {
                ...prev.columns,
                [columnId]: { ...column, taskIds: newTaskIds },
            },
        }));

        try {
            await projectApi.deleteTask(numericTaskId);
            toast.success("Đã xoá công việc");
        } catch (err) {
            console.error("Failed to delete task on server", err);
            toast.error("Không thể xoá công việc trên máy chủ");
        }
    }, [data]);

    const deleteColumn = useCallback(async (columnId: string) => {
        if (!boardId || !window.confirm('Bạn có chắc chắn muốn xoá cột này và tất cả các thẻ bên trong?')) return;

        const numericId = Number(columnId.replace('column-', ''));
        const isNumericId = !isNaN(numericId) && numericId < 1e12;

        const newColumns = { ...data.columns };
        const deletedColumnTaskIds = newColumns[columnId].taskIds;
        delete newColumns[columnId];

        const newTasks = { ...data.tasks };
        deletedColumnTaskIds.forEach(taskId => delete newTasks[taskId]);

        const newColumnOrder = data.columnOrder.filter(id => id !== columnId);
        const newData = { tasks: newTasks, columns: newColumns, columnOrder: newColumnOrder };

        setData(newData);

        try {
            if (isNumericId) {
                await projectApi.deleteColumn(numericId);
            } else {
                const payload = newColumnOrder.map((id, index) => ({
                    title: newData.columns[id].title,
                    position: index + 1
                }));
                await projectApi.updateBoardTaskColumns(boardId, payload);
            }
        } catch (err) {
            console.error("Failed to sync deletion", err);
            toast.error("Không thể xoá cột");
        }
    }, [boardId, data]);

    const moveTaskToColumn = useCallback(async (taskId: string, targetColumnId: string) => {
        const currentColumn = Object.values(data.columns).find(col => col.taskIds.includes(taskId));
        if (!currentColumn || currentColumn.id === targetColumnId) return;

        const targetColumn = data.columns[targetColumnId];
        if (!targetColumn) return;

        const newCurrentTaskIds = currentColumn.taskIds.filter(id => id !== taskId);
        const newTargetTaskIds = [...targetColumn.taskIds, taskId];

        setData(prev => ({
            ...prev,
            columns: {
                ...prev.columns,
                [currentColumn.id]: { ...currentColumn, taskIds: newCurrentTaskIds },
                [targetColumnId]: { ...targetColumn, taskIds: newTargetTaskIds },
            },
        }));
        setIsColumnDropdownOpen(false);

        try {
            const numericTaskId = Number(taskId.replace('task-', ''));
            const numericTargetColumnId = Number(targetColumnId.replace('column-', ''));
            await projectApi.updateBoardTask(numericTaskId, {
                columnTaskId: numericTargetColumnId,
                position: newTargetTaskIds.length
            });
            toast.success("Đã chuyển công việc sang cột mới");
        } catch (err) {
            console.error("Failed to move task to column", err);
            toast.error("Không thể chuyển công việc");
        }
    }, [data.columns]);

    const selectedTask = selectedTaskId ? data.tasks[selectedTaskId] : null;
    const selectedTaskColumn = selectedTaskId
        ? Object.values(data.columns).find(col => col.taskIds.includes(selectedTaskId))
        : null;

    return {
        // Board state
        data,
        loading,
        boardId,
        projectMembers,

        // Task modal state
        selectedTaskId,
        setSelectedTaskId,
        selectedTask,
        selectedTaskColumn,

        // UI state
        isMemberDropdownOpen,
        setIsMemberDropdownOpen,
        isColumnDropdownOpen,
        setIsColumnDropdownOpen,
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

        // Actions
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
        moveTaskToColumn,
    };
}
