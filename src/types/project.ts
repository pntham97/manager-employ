export interface ProjectStatus {
    id: number;
    statusName: string;
    description: string;
}

export interface ProjectType {
    id: number;
    typeName: string;
    description: string;
}

export interface ProjectMetadata {
    statuses: ProjectStatus[];
    types: ProjectType[];
}

export interface ProjectAssignment {
    employeeId: number;
    role: string;
}

export interface CreateProjectPayload {
    projectName: string;
    description?: string;
    startDate: string; // YYYY-MM-DD
    deadline: string; // YYYY-MM-DD
    statusId: number;
    typeId: number;
    assignments?: ProjectAssignment[];
}

export interface CreateTaskPayload {
    title: string;
    columnTaskId: number;
    boardTaskId: number;
    position: number;
}

export interface SubTaskRequest {
    title: string;
    taskId: number;
}

export interface SubTaskUpdateRequest {
    title?: string;
    isDone?: boolean;
}

export interface UpdateProjectPayload extends CreateProjectPayload { }

export interface EmployeeListItem {
    employeeId: number;
    name: string;
    email: string;
    company: { id: number; name: string };
    supplier: { id: number; name: string };
    position: { name: string };
}

export interface EmployeeListResponse {
    content: EmployeeListItem[];
    totalElements: number;
    totalPages: number;
}

export interface EmployeeListParams {
    companyId?: number;
    supplierId?: number;
    employeeName?: string;
    page?: number;
    size?: number;
}

export interface ProjectListParams {
    page?: number;
    size?: number;
    projectName?: string;
    statusId?: number;
}

export interface ProjectItem {
    id: number;
    projectName: string;
    description: string;
    startDate: string;
    deadline: string;
    status: ProjectStatus;
    type: ProjectType;
    progress: number;
    boardTaskId?: number | null;
    members: Array<{
        employeeId: number;
        name: string;
        avatarUrl?: string;
        role?: string;
        position?: string | { name: string };
    }>;
    assignments?: Array<{
        id: number;
        employeeId: number;
        employeeName: string;
        role: string;
        assignedAt: string;
    }>;
}

export interface ProjectListResponse {
    content: ProjectItem[];
    totalElements: number;
    totalPages: number;
    totalInProgress: number;
    totalCompleted: number;
    totalOverdue: number;
}

// Board Task Types (Updated Hierarchy)
export interface TaskAssignment {
    id: number;
    employeeId: number;
    employeeName: string;
    avatarUrl?: string; // Tên cũ là avatarUrl hoặc avatar
    role: string;
    assignedAt: string;
}

export interface TaskItem {
    id: number;
    title: string;
    description: string;
    position: number;
    columnTaskId?: number;
    boardTaskId?: number;
    createdAt?: string;
    deadline?: string;
    listAssignmentEmployee?: TaskAssignment[];
    progress?: number;
    subTasks?: SubTaskItem[];
    labelColors: string[];
}

export interface SubTaskItem {
    id: number;
    title: string;
    taskId: number;
    isDone: boolean;
    progress: number;
    createdAt: string;
}

export interface ColumnTask {
    id: number;
    title: string;
    position: number;
    tasks: TaskItem[];
}

export interface BoardTask {
    id: number;
    title: string;
    description: string;
    projectId: number;
    createdAt: string;
    columns: ColumnTask[];
    tasks: TaskItem[];
}

export interface CreateBoardTaskColumnPayload {
    title: string;
    position: number;
}

export interface CreateBoardTaskPayload {
    title: string;
    description: string;
    projectId: number;
    columns?: CreateBoardTaskColumnPayload[];
}

export interface BoardTaskResponse extends BoardTask { }

export interface UpdateColumnsPayload {
    title: string;
    position: number;
}

export interface AddColumnPayload {
    title: string;
    position: number;
}

export interface ColumnTaskResponse extends ColumnTask { }

export interface TaskUpdateRequest {
    title?: string;
    description?: string;
    columnTaskId?: number;
    position?: number;
    deadline?: string;
    projectAssignmentIds?: number[];
    labelColors: string[];
}
