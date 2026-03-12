import { useRef, useState, useCallback } from "react";
import { projectApi } from "../../api/project.api";
import { toast } from "react-toastify";
import { RichTextEditor } from "../RichTextEditor";
import { getProgressColor } from "../../utils/taskboard";
import type { Task, ColumnData } from "../../interfaces/taskboard";
import type { SubTaskItem } from "../../types/project";

export interface TaskDetailModalProps {
  selectedTask: Task;
  selectedTaskColumn: ColumnData | undefined;
  data: { columns: Record<string, ColumnData>; columnOrder: string[] };
  projectMembers: any[];
  tempTitle: string;
  setTempTitle: (v: string) => void;
  tempDescription: string;
  setTempDescription: (v: string) => void;
  isEditingDescription: boolean;
  setIsEditingDescription: (v: boolean) => void;
  handleEditDescription: () => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void | Promise<void>;
  isMemberDropdownOpen: boolean;
  setIsMemberDropdownOpen: (v: boolean) => void;
  showChecklistSection: boolean;
  setShowChecklistSection: (v: boolean | ((prev: boolean) => boolean)) => void;
  showMembersSection: boolean;
  setShowMembersSection: (v: boolean | ((prev: boolean) => boolean)) => void;
  showDeadlineSection: boolean;
  setShowDeadlineSection: (v: boolean | ((prev: boolean) => boolean)) => void;
  showAttachmentsSection: boolean;
  setShowAttachmentsSection: (
    v: boolean | ((prev: boolean) => boolean),
  ) => void;
  isAddingChecklistItem: boolean;
  setIsAddingChecklistItem: (v: boolean) => void;
  newChecklistItemText: string;
  setNewChecklistItemText: (v: string) => void;
  isColumnDropdownOpen: boolean;
  setIsColumnDropdownOpen: (v: boolean) => void;
  setSelectedTaskId: (v: string | null) => void;
  moveTaskToColumn: (taskId: string, columnId: string) => void | Promise<void>;
  toggleSubTask: (taskId: string, subTask: SubTaskItem) => void | Promise<void>;
  addSubTask: (taskId: string, text: string) => void | Promise<void>;
  fetchTaskDetail: (taskId: string | null) => void | Promise<void>;
}

export function TaskDetailModal({
  selectedTask,
  selectedTaskColumn,
  data,
  projectMembers,
  tempTitle,
  setTempTitle,
  tempDescription,
  setTempDescription,
  isEditingDescription,
  setIsEditingDescription,
  handleEditDescription,
  updateTask,
  isMemberDropdownOpen,
  setIsMemberDropdownOpen,
  showChecklistSection,
  setShowChecklistSection,
  showMembersSection,
  setShowMembersSection,
  showDeadlineSection,
  setShowDeadlineSection,
  showAttachmentsSection,
  setShowAttachmentsSection,
  isAddingChecklistItem,
  setIsAddingChecklistItem,
  newChecklistItemText,
  setNewChecklistItemText,
  isColumnDropdownOpen,
  setIsColumnDropdownOpen,
  setSelectedTaskId,
  moveTaskToColumn,
  toggleSubTask,
  addSubTask,
  fetchTaskDetail,
}: TaskDetailModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const getFileType = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toUpperCase() || "FILE";
    const map: Record<string, string> = {
      CSV: "CSV",
      PDF: "PDF",
      DOC: "DOC",
      DOCX: "DOC",
      XLS: "XLS",
      XLSX: "XLS",
      PNG: "PNG",
      JPG: "JPG",
      JPEG: "JPG",
    };
    return map[ext] || ext;
  };

  const uploadToCloudinary = useCallback(
    async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "suhuku");

      const isImage = file.type.startsWith("image/");
      const endpoint = isImage
        ? "https://api.cloudinary.com/v1_1/dyztuzywx/image/upload"
        : "https://api.cloudinary.com/v1_1/dyztuzywx/raw/upload";

      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.secure_url as string;
    },
    [],
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      e.target.value = "";

      if (!files?.length) return;

      const file = files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File tối đa 10MB");
        return;
      }

      setUploadingAttachment(true);
      let url: string;

      try {
        url = await uploadToCloudinary(file);
      } catch (err) {
        console.error("Cloudinary upload failed", err);
        toast.info("Lưu file tạm thời (chưa tải lên máy chủ)");
        url = URL.createObjectURL(file);
      } finally {
        setUploadingAttachment(false);
      }

      const newAttachment = {
        id: `attach-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        type: getFileType(file.name),
        url,
        addedAt: new Date().toISOString(),
      };

      const current = selectedTask.attachments || [];
      updateTask(selectedTask.id, {
        attachments: [...current, newAttachment],
      });
      toast.success("Đã thêm file đính kèm");
      setShowAttachmentsSection(true);
    },
    [
      selectedTask.id,
      selectedTask.attachments,
      updateTask,
      uploadToCloudinary,
      setShowAttachmentsSection,
    ],
  );

  const handleAttachClick = useCallback(() => {
    setShowAttachmentsSection(true);
    fileInputRef.current?.click();
  }, [setShowAttachmentsSection]);

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#f4f5f7] dark:bg-slate-900 w-full max-w-[900px] h-[90vh] rounded-xl overflow-hidden shadow-2xl flex flex-col relative animate-in fade-in zoom-in duration-200">
        {/* Task Cover & Top bar */}
        <div className="h-[160px] bg-orange-400 relative">
          {selectedTask.coverImage && (
            <img
              src={selectedTask.coverImage}
              className="w-full h-full object-cover"
              alt="cover"
            />
          )}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
            <div className="relative">
              <button
                onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
                className="bg-white/90 hover:bg-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                {selectedTaskColumn?.title || "Danh mục"}{" "}
                <span className="material-symbols-outlined text-sm">
                  expand_more
                </span>
              </button>
              {isColumnDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsColumnDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 pb-2 border-b border-slate-100 dark:border-slate-700 mb-2">
                      <p className="text-[11px] font-bold text-slate-500 uppercase">
                        Chuyển sang cột
                      </p>
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
                                ? "bg-slate-100 dark:bg-slate-700/50 text-slate-400 cursor-not-allowed"
                                : "hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200"
                            }`}
                          >
                            {isCurrent && (
                              <span className="material-symbols-outlined text-[16px]">
                                check
                              </span>
                            )}
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
                <span className="material-symbols-outlined text-[18px]">
                  image
                </span>
              </button>
              <button className="w-8 h-8 rounded-md bg-white/90 hover:bg-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[18px]">
                  more_horiz
                </span>
              </button>
              <button
                onClick={() => setSelectedTaskId(null)}
                className="w-8 h-8 rounded-md bg-white/90 hover:bg-white flex items-center justify-center shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
          {/* Left Content */}
          <div className="flex-1 space-y-8">
            {/* Title */}
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-slate-500 mt-2">
                radio_button_unchecked
              </span>
              <div className="flex-1">
                <input
                  className="text-2xl font-black bg-transparent w-full border-2 border-transparent focus:border-primary rounded-md px-3 py-1 outline-none text-slate-800 dark:text-white transition-all"
                  value={tempTitle}
                  onBlur={() => {
                    if (
                      tempTitle.trim() &&
                      tempTitle.trim() !== selectedTask.content
                    ) {
                      updateTask(selectedTask.id, {
                        content: tempTitle.trim(),
                      });
                    } else {
                      setTempTitle(selectedTask.content);
                    }
                  }}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 ml-10">
              <button className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>{" "}
                Thêm
              </button>
              <button
                onClick={() => setShowDeadlineSection((prev) => !prev)}
                className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm ${
                  showDeadlineSection
                    ? "bg-primary/10 border-primary text-primary hover:bg-primary/20"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  schedule
                </span>{" "}
                Ngày
                {selectedTask.deadline && (
                  <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px]">
                    ✓
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowChecklistSection((prev) => !prev)}
                className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm ${
                  showChecklistSection
                    ? "bg-primary/10 border-primary text-primary hover:bg-primary/20"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  checklist_rtl
                </span>{" "}
                Việc cần làm
                {selectedTask.subTasks && selectedTask.subTasks.length > 0 && (
                  <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px]">
                    {selectedTask.subTasks.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowMembersSection((prev) => !prev)}
                className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm ${
                  showMembersSection
                    ? "bg-primary/10 border-primary text-primary hover:bg-primary/20"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  person_add
                </span>{" "}
                Thành viên
                {selectedTask.assignments &&
                  selectedTask.assignments.length > 0 && (
                    <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px]">
                      {selectedTask.assignments.length}
                    </span>
                  )}
              </button>
              <button
                onClick={handleAttachClick}
                disabled={uploadingAttachment}
                className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm disabled:opacity-50 ${
                  showAttachmentsSection
                    ? "bg-primary/10 border-primary text-primary hover:bg-primary/20"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  attach_file
                </span>{" "}
                Đính kèm
                {selectedTask.attachments &&
                  selectedTask.attachments.length > 0 && (
                    <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[10px]">
                      {selectedTask.attachments.length}
                    </span>
                  )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="*/*"
              onChange={handleFileSelect}
            />

            <div className="flex flex-wrap gap-4 ml-10">
              {/* Deadline */}
              {showDeadlineSection && (
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">
                    Hạn chót
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={selectedTask.deadline || ""}
                      onChange={(e) =>
                        updateTask(selectedTask.id, {
                          deadline: e.target.value,
                        })
                      }
                      className="bg-slate-200 dark:bg-slate-800 px-3 py-1.5 rounded-md text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-primary"
                    />
                    {selectedTask.deadline && (
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded ${
                          new Date(selectedTask.deadline) < new Date()
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {new Date(selectedTask.deadline) < new Date()
                          ? "Quá hạn"
                          : "Đang thực hiện"}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Members */}
              {showMembersSection && (
                <div className="relative">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">
                    Thành viên
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.assignments?.map((assign, idx) => (
                      <div
                        key={idx}
                        title={`${assign.employeeName} (${assign.role})`}
                        className="group relative w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold border-2 border-white dark:border-slate-800 text-primary overflow-hidden shadow-sm hover:ring-2 hover:ring-primary transition-all"
                      >
                        {assign.avatarUrl ? (
                          <img
                            src={assign.avatarUrl}
                            alt={assign.employeeName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{assign.employeeName.charAt(0)}</span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newAssignments =
                              selectedTask.assignments?.filter(
                                (a) => a.id !== assign.id,
                              ) || [];
                            updateTask(selectedTask.id, {
                              assignments: newAssignments,
                            });
                          }}
                          className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <span className="material-symbols-outlined text-xs">
                            close
                          </span>
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        setIsMemberDropdownOpen(!isMemberDropdownOpen)
                      }
                      className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        add
                      </span>
                    </button>
                  </div>

                  {isMemberDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsMemberDropdownOpen(false)}
                      />
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-20 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-3 pb-2 border-b border-slate-100 dark:border-slate-700 mb-2">
                          <p className="text-[11px] font-bold text-slate-500 uppercase">
                            Thành viên dự án
                          </p>
                        </div>
                        <div className="max-h-60 overflow-y-auto px-1">
                          {projectMembers.length > 0 ? (
                            projectMembers.map((member) => {
                              const isAssigned = selectedTask.assignments?.some(
                                (a) => a.employeeId === member.employeeId,
                              );
                              return (
                                <button
                                  key={member.id}
                                  onClick={() => {
                                    let newAssignments = [
                                      ...(selectedTask.assignments || []),
                                    ];
                                    if (isAssigned) {
                                      newAssignments = newAssignments.filter(
                                        (a) =>
                                          a.employeeId !== member.employeeId,
                                      );
                                    } else {
                                      newAssignments.push({
                                        id: member.id,
                                        employeeId: member.employeeId,
                                        employeeName: member.employeeName,
                                        role: member.role,
                                        assignedAt: new Date().toISOString(),
                                      });
                                    }
                                    updateTask(selectedTask.id, {
                                      assignments: newAssignments,
                                    });
                                  }}
                                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors rounded-md group text-left"
                                >
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                    {member.avatarUrl ? (
                                      <img
                                        src={member.avatarUrl}
                                        alt={member.employeeName}
                                        className="w-full h-full rounded-full object-cover"
                                      />
                                    ) : (
                                      member.employeeName.charAt(0)
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                      {member.employeeName}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                      {member.role}
                                    </p>
                                  </div>
                                  {isAssigned && (
                                    <span className="material-symbols-outlined text-primary text-[18px]">
                                      check
                                    </span>
                                  )}
                                </button>
                              );
                            })
                          ) : (
                            <p className="text-xs text-slate-500 italic px-3 py-2 text-center">
                              Không có thành viên nào trong dự án
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-500">
                    subject
                  </span>
                  <h4 className="font-black text-slate-800 dark:text-slate-100">
                    Mô tả
                  </h4>
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
                    updateTask(selectedTask.id, {
                      description: tempDescription,
                    });
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

            {/* Attachments - below Mô tả */}
            {showAttachmentsSection && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-500">
                      attach_file
                    </span>
                    <h4 className="font-black text-slate-800 dark:text-slate-100">
                      Files
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAttachment}
                    className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
                  >
                    Thêm
                  </button>
                </div>

                <div className="ml-10 space-y-3">
                  {selectedTask.attachments &&
                  selectedTask.attachments.length > 0 ? (
                    selectedTask.attachments.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-4 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm"
                      >
                        <div className="flex-shrink-0 w-14 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 border-b-2 border-primary">
                            {file.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Added just now
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                            title="Mở file"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              open_in_new
                            </span>
                          </a>
                          <button
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                            title="Tùy chọn"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              more_horiz
                            </span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic py-4">
                      Chưa có file đính kèm
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAttachment}
                    className="flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      add
                    </span>
                    {uploadingAttachment ? "Đang tải lên..." : "Thêm file"}
                  </button>
                </div>
              </div>
            )}

            {/* Checklist */}
            {showChecklistSection && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-500">
                      check_box
                    </span>
                    <h4 className="font-black text-slate-800 dark:text-slate-100">
                      Việc cần làm
                    </h4>
                  </div>
                  <button
                    onClick={() =>
                      toast.info(
                        "Chức năng xoá công việc con sẽ được hỗ trợ sau.",
                      )
                    }
                    className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
                  >
                    Xoá
                  </button>
                </div>
                <div className="ml-10 space-y-4">
                  {(() => {
                    const raw = selectedTask.progress ?? 0;
                    const subCount = selectedTask.subTasks?.length ?? 0;
                    const display =
                      raw === 99 && subCount % 2 === 1 ? 100 : raw;
                    const colors = getProgressColor(display);
                    return (
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-[10px] font-bold min-w-[25px] ${colors.text}`}
                        >
                          {display}%
                        </span>
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
                        <div
                          className="flex-1 flex items-center justify-between"
                          onClick={() => toggleSubTask(selectedTask.id, item)}
                        >
                          <span
                            className={`text-sm font-medium transition-all ${item.isDone ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-300"}`}
                          >
                            {item.title}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              projectApi
                                .deleteSubTask(item.id)
                                .then(() => {
                                  toast.success("Đã xoá công việc con");
                                  fetchTaskDetail(selectedTask.id);
                                })
                                .catch((err) => {
                                  console.error(
                                    "Failed to delete sub task",
                                    err,
                                  );
                                  toast.error("Không thể xoá công việc con");
                                });
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-all text-slate-400 hover:text-red-500"
                            title="Xoá mục"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              close
                            </span>
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
                        onChange={(e) =>
                          setNewChecklistItemText(e.target.value)
                        }
                        className="w-full bg-white dark:bg-slate-950 border-2 border-primary rounded-lg p-3 text-sm outline-none shadow-lg shadow-primary/5 min-h-[80px] resize-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            addSubTask(selectedTask.id, newChecklistItemText);
                          }
                          if (e.key === "Escape") {
                            setIsAddingChecklistItem(false);
                            setNewChecklistItemText("");
                          }
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            addSubTask(selectedTask.id, newChecklistItemText)
                          }
                          className="bg-primary text-white text-xs font-bold px-4 py-2 rounded hover:bg-primary/90 transition-all active:scale-95"
                        >
                          Thêm
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingChecklistItem(false);
                            setNewChecklistItemText("");
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
                <span className="material-symbols-outlined text-slate-500">
                  comment
                </span>
                <h4 className="font-black text-slate-800 dark:text-slate-100 uppercase text-sm">
                  Nhận xét và hoạt động
                </h4>
              </div>
              <button className="bg-slate-200 dark:bg-slate-800 px-3 py-1.5 rounded-md text-[10px] font-bold">
                Hiện chi tiết
              </button>
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
                    <p className="text-[10px] text-primary hover:underline cursor-pointer mt-1">
                      {act.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
