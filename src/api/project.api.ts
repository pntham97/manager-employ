import axiosClient from "./axiosClient";
import type { ApiResponse } from "../types/api.type";
import type {
    ProjectMetadata,
    CreateProjectPayload,
    EmployeeListResponse,
    EmployeeListParams,
    ProjectListResponse,
    ProjectListParams,
    ProjectItem,
    UpdateProjectPayload,
    BoardTaskResponse,
    CreateBoardTaskPayload,
    UpdateColumnsPayload,
    AddColumnPayload,
    ColumnTaskResponse,
    CreateTaskPayload,
    TaskItem,
    TaskUpdateRequest,
    SubTaskItem,
    SubTaskRequest,
    SubTaskUpdateRequest
} from "../types/project";

export const projectApi = {
    getMetadata(): Promise<ApiResponse<ProjectMetadata>> {
        return axiosClient.get("/v1/projects/metadata");
    },

    createProject(data: CreateProjectPayload): Promise<ApiResponse<any>> {
        return axiosClient.post("/v1/projects", data);
    },

    getEmployeeList(params: EmployeeListParams): Promise<ApiResponse<EmployeeListResponse>> {
        return axiosClient.get("employee/list", { params });
    },

    getProjectList(params: ProjectListParams): Promise<ApiResponse<ProjectListResponse>> {
        return axiosClient.get("/v1/projects", { params });
    },

    getProjectById(id: number): Promise<ApiResponse<ProjectItem>> {
        return axiosClient.get(`/v1/projects/${id}`);
    },

    updateProject(id: number, data: UpdateProjectPayload): Promise<ApiResponse<any>> {
        return axiosClient.put(`/v1/projects/${id}`, data);
    },

    // Board Task APIs
    createBoardTask(payload: CreateBoardTaskPayload): Promise<ApiResponse<BoardTaskResponse>> {
        return axiosClient.post("/v1/projects/board-tasks", payload);
    },

    createTask(payload: CreateTaskPayload): Promise<ApiResponse<TaskItem>> {
        return axiosClient.post("/v1/projects/board-tasks/tasks", payload);
    },

    createSubTask(payload: SubTaskRequest): Promise<ApiResponse<SubTaskItem>> {
        return axiosClient.post("/v1/projects/board-tasks/subtasks", payload);
    },

    getBoardTaskDetail(taskId: number): Promise<ApiResponse<TaskItem>> {
        return axiosClient.get(`/v1/projects/board-tasks/tasks/${taskId}`);
    },

    updateBoardTask(taskId: number, payload: TaskUpdateRequest): Promise<ApiResponse<TaskItem>> {
        return axiosClient.put(`/v1/projects/board-tasks/tasks/${taskId}`, payload);
    },

    updateSubTask(subTaskId: number, payload: SubTaskUpdateRequest): Promise<ApiResponse<SubTaskItem>> {
        return axiosClient.put(`/v1/projects/board-tasks/subtasks/${subTaskId}`, payload);
    },

    getBoardTasksByProjectId(projectId: number): Promise<ApiResponse<BoardTaskResponse[]>> {
        return axiosClient.get(`/v1/projects/board-tasks/project/${projectId}`);
    },

    deleteTask(taskId: number): Promise<ApiResponse<any>> {
        return axiosClient.delete(`/v1/projects/board-tasks/tasks/${taskId}`);
    },

    deleteSubTask(subTaskId: number): Promise<ApiResponse<any>> {
        return axiosClient.delete(`/v1/projects/board-tasks/subtasks/${subTaskId}`);
    },

    updateBoardTaskColumns(boardTaskId: number, payload: UpdateColumnsPayload[]): Promise<ApiResponse<any>> {
        return axiosClient.put(`/v1/projects/board-tasks/${boardTaskId}/columns`, payload);
    },

    deleteColumn(columnId: number): Promise<ApiResponse<any>> {
        return axiosClient.delete(`/v1/projects/board-tasks/columns/${columnId}`);
    },

    addColumn(boardTaskId: number, payload: AddColumnPayload): Promise<ApiResponse<ColumnTaskResponse>> {
        return axiosClient.post(`/v1/projects/board-tasks/${boardTaskId}/columns`, payload);
    }
};
