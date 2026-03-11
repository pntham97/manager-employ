import type { TaskAssignment, SubTaskItem } from '../types/project';

export interface Activity {
    id: string;
    user: string;
    action: string;
    timestamp: string;
}

export interface Task {
    id: string;
    content: string;
    description?: string;
    labels?: string[];
    subTasks?: SubTaskItem[];
    progress?: number;
    activity?: Activity[];
    coverImage?: string;
    category?: string;
    deadline?: string;
    assignments?: TaskAssignment[];
}

export interface ColumnData {
    id: string;
    title: string;
    taskIds: string[];
}

export interface BoardData {
    tasks: Record<string, Task>;
    columns: Record<string, ColumnData>;
    columnOrder: string[];
}
