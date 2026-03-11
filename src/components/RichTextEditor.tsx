import { useRef, useLayoutEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';

const TB_SEP = () => (
    <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 mx-1" aria-hidden />
);

export interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    onSave?: () => void;
    onCancel?: () => void;
    placeholder?: string;
    editing: boolean;
    onEditClick?: () => void;
    minHeight?: string;
    saveLabel?: string;
    cancelLabel?: string;
    helpLabel?: string;
    className?: string;
}

export function RichTextEditor({
    value,
    onChange,
    onSave,
    onCancel,
    placeholder = 'Thêm nội dung...',
    editing,
    onEditClick,
    minHeight = '150px',
    saveLabel = 'Lưu',
    cancelLabel = 'Hủy',
    helpLabel = 'Trợ giúp định dạng',
    className = '',
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const hasInitializedRef = useRef(false);
    const [isHeadingOpen, setIsHeadingOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    useLayoutEffect(() => {
        if (editing) {
            if (editorRef.current && !hasInitializedRef.current) {
                editorRef.current.innerHTML = value || '';
                hasInitializedRef.current = true;
            }
        } else {
            hasInitializedRef.current = false;
        }
    }, [editing, value]);

    const exec = useCallback((command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    }, []);

    const insertLink = useCallback(() => {
        const url = window.prompt('Nhập URL:', 'https://');
        if (url) exec('createLink', url);
    }, [exec]);

    const insertBlockquote = useCallback(() => exec('formatBlock', '<blockquote>'), [exec]);

    const insertHR = useCallback(() => exec('insertHorizontalRule'), [exec]);

    const indent = useCallback(() => exec('indent'), [exec]);
    const outdent = useCallback(() => exec('outdent'), [exec]);

    const uploadToCloudinary = useCallback(async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'suhuku');

        const res = await fetch('https://api.cloudinary.com/v1_1/dyztuzywx/image/upload', {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        return data.secure_url as string;
    }, []);

    const handleFileAttach = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';

        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Chỉ được upload ảnh');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ảnh tối đa 5MB');
            return;
        }

        try {
            setUploading(true);
            const url = await uploadToCloudinary(file);

            const img = document.createElement('img');
            img.src = url;
            img.alt = file.name;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.display = 'block';
            img.style.margin = '8px 0';

            const selection = window.getSelection();
            const range = selection?.rangeCount ? selection.getRangeAt(0) : null;

            if (editorRef.current) {
                if (range && editorRef.current.contains(range.commonAncestorContainer)) {
                    range.deleteContents();
                    range.insertNode(img);
                    range.setStartAfter(img);
                    range.setEndAfter(img);
                } else {
                    editorRef.current.appendChild(img);
                }
                selection?.removeAllRanges();
                const newRange = document.createRange();
                newRange.setStartAfter(img);
                newRange.collapse(true);
                selection?.addRange(newRange);
                editorRef.current.focus();
                onChange(editorRef.current.innerHTML);
                toast.success('Đã tải ảnh lên thành công');
            }
        } catch (err) {
            toast.error('Upload ảnh thất bại');
        } finally {
            setUploading(false);
        }
    }, [onChange, uploadToCloudinary]);

    const shortcuts = [
        { keys: 'Ctrl+B', desc: 'Đậm' },
        { keys: 'Ctrl+I', desc: 'Nghiêng' },
        { keys: 'Ctrl+U', desc: 'Gạch chân' },
        { keys: 'Ctrl+Z', desc: 'Hoàn tác' },
        { keys: 'Ctrl+Y', desc: 'Làm lại' },
    ];

    if (!editing) {
        return (
            <div
                onClick={onEditClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onEditClick?.()}
                className={`p-3 rounded-lg text-sm transition-all cursor-pointer min-h-[50px] prose prose-sm dark:prose-invert max-w-none
                    ${value
                        ? 'hover:bg-slate-100 dark:hover:bg-slate-800'
                        : 'bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 italic text-slate-400'
                    } ${className}`}
                dangerouslySetInnerHTML={{ __html: value || placeholder }}
            />
        );
    }

    return (
        <div className={`space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 ${className}`}>
            <div className="bg-white dark:bg-slate-950 border-2 border-primary rounded-lg overflow-hidden flex flex-col shadow-lg shadow-primary/5">
                {/* Toolbar */}
                <div className="flex items-center flex-wrap gap-1 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    {/* Heading dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsHeadingOpen(!isHeadingOpen)}
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400"
                            title="Đoạn văn"
                        >
                            Đoạn <span className="material-symbols-outlined text-[14px]">expand_more</span>
                        </button>
                        {isHeadingOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsHeadingOpen(false)} />
                                <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-20 py-1">
                                    {[
                                        { tag: 'p', label: 'Đoạn văn' },
                                        { tag: 'h1', label: 'Tiêu đề 1' },
                                        { tag: 'h2', label: 'Tiêu đề 2' },
                                        { tag: 'h3', label: 'Tiêu đề 3' },
                                    ].map(({ tag, label }) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => { exec('formatBlock', `<${tag}>`); setIsHeadingOpen(false); }}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <TB_SEP />

                    <button type="button" onClick={() => exec('bold')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400" title="Đậm">
                        <span className="material-symbols-outlined text-[18px] font-bold">format_bold</span>
                    </button>
                    <button type="button" onClick={() => exec('italic')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400" title="Nghiêng">
                        <span className="material-symbols-outlined text-[18px]">format_italic</span>
                    </button>
                    <button type="button" onClick={() => exec('underline')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400" title="Gạch chân">
                        <span className="material-symbols-outlined text-[18px]">format_underlined</span>
                    </button>
                    <button type="button" onClick={() => exec('strikeThrough')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400" title="Gạch ngang">
                        <span className="material-symbols-outlined text-[18px]">strikethrough_s</span>
                    </button>

                    <TB_SEP />

                    <button type="button" onClick={() => exec('justifyLeft')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400" title="Căn trái">
                        <span className="material-symbols-outlined text-[18px]">format_align_left</span>
                    </button>
                    <button type="button" onClick={() => exec('justifyCenter')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400" title="Căn giữa">
                        <span className="material-symbols-outlined text-[18px]">format_align_center</span>
                    </button>
                    <button type="button" onClick={() => exec('justifyRight')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400" title="Căn phải">
                        <span className="material-symbols-outlined text-[18px]">format_align_right</span>
                    </button>

                    <TB_SEP />

                    <button type="button" onClick={() => exec('insertUnorderedList')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400" title="Danh sách dấu đầu dòng">
                        <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
                    </button>
                    <button type="button" onClick={() => exec('insertOrderedList')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400" title="Danh sách đánh số">
                        <span className="material-symbols-outlined text-[18px]">format_list_numbered</span>
                    </button>

                    <TB_SEP />

                    <button type="button" onClick={insertBlockquote} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400" title="Trích dẫn">
                        <span className="material-symbols-outlined text-[18px]">format_quote</span>
                    </button>
                    <button type="button" onClick={insertLink} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400" title="Chèn liên kết">
                        <span className="material-symbols-outlined text-[18px]">link</span>
                    </button>
                    <button type="button" onClick={insertHR} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400" title="Đường kẻ ngang">
                        <span className="material-symbols-outlined text-[18px]">horizontal_rule</span>
                    </button>

                    <TB_SEP />

                    <button type="button" onClick={indent} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400" title="Thụt vào">
                        <span className="material-symbols-outlined text-[18px]">format_indent_increase</span>
                    </button>
                    <button type="button" onClick={outdent} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400" title="Thụt ra">
                        <span className="material-symbols-outlined text-[18px]">format_indent_decrease</span>
                    </button>

                    <TB_SEP />

                    <button type="button" onClick={() => exec('removeFormat')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400" title="Xóa định dạng">
                        <span className="material-symbols-outlined text-[18px]">format_clear</span>
                    </button>

                    <div className="flex-1" />
                    <TB_SEP />

                    <label className={`p-1.5 rounded text-slate-600 dark:text-slate-400 cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`} title="Đính kèm ảnh">
                        {uploading ? (
                            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-[18px]">attach_file</span>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileAttach} disabled={uploading} />
                    </label>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsHelpOpen(!isHelpOpen)}
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-400"
                            title={helpLabel}
                        >
                            <span className="material-symbols-outlined text-[18px]">help</span>
                        </button>
                        {isHelpOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsHelpOpen(false)} />
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-20 py-2 px-3">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">{helpLabel}</p>
                                    <div className="space-y-1 text-xs">
                                        {shortcuts.map(({ keys, desc }) => (
                                            <div key={keys} className="flex justify-between gap-4">
                                                <kbd className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px]">{keys}</kbd>
                                                <span className="text-slate-600 dark:text-slate-300">{desc}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    autoFocus
                    onInput={(e) => onChange(e.currentTarget.innerHTML)}
                    onFocus={(e) => {
                        const range = document.createRange();
                        const sel = window.getSelection();
                        range.selectNodeContents(e.currentTarget);
                        range.collapse(false);
                        sel?.removeAllRanges();
                        sel?.addRange(range);
                    }}
                    style={{ minHeight }}
                    className="w-full p-4 bg-transparent outline-none text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed prose prose-sm dark:prose-invert max-w-none focus:ring-0"
                />
            </div>

            {(onSave || onCancel) && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {onSave && (
                            <button type="button" onClick={onSave} className="bg-primary text-white text-xs font-bold px-4 py-2 rounded shadow-md shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                                {saveLabel}
                            </button>
                        )}
                        {onCancel && (
                            <button type="button" onClick={onCancel} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors px-2">
                                {cancelLabel}
                            </button>
                        )}
                    </div>
                    <button type="button" className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400 transition-colors">
                        {helpLabel}
                    </button>
                </div>
            )}
        </div>
    );
}
