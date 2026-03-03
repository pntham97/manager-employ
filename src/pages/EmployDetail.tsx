import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { employeeApi, type EmployeeResponse, type UpdateEmployeeRequest, type TypeWork, type Company } from "../api/employee.api";
import { Document, Packer, Paragraph, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from "docx";
import jsPDF from "jspdf";
// Import fonts as side effects (they auto-register with jsPDF)
import "../assets/fonts/RobotoRegular.js";
import "../assets/fonts/Roboto-Bold.js";
import "../assets/fonts/NotoSans-Regular.js";
interface Supplier {
    id: number;
    name: string;
    status: boolean;
    createdAt: string;
}

interface Position {
    id: number;
    name: string;
    createdAt: string;
}


const EmployDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const employee = location.state?.employee as EmployeeResponse | undefined;
    const [showBankAccount, setShowBankAccount] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]); // Lưu tất cả suppliers để filter
    const [positions, setPositions] = useState<Position[]>([]);
    const [typeWorks, setTypeWorks] = useState<TypeWork[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
    const [formData, setFormData] = useState<UpdateEmployeeRequest | null>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement | null>(null);

    // Nếu không có employee data, có thể redirect về trang danh sách
    if (!employee) {
        // Có thể hiển thị thông báo hoặc redirect
        console.warn("No employee data found");
    }

    // Format ngày tháng
    const formatDate = (dateString: string | undefined | null): string => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (error) {
            return "N/A";
        }
    };

    // Format số điện thoại Việt Nam
    const formatPhoneNumber = (phone: string | null | undefined): string => {
        if (!phone) return "N/A";

        // Loại bỏ tất cả ký tự không phải số
        const cleaned = phone.replace(/\D/g, "");

        // Kiểm tra độ dài số điện thoại Việt Nam (10 hoặc 11 số)
        if (cleaned.length === 10) {
            // Định dạng: 0xxx xxx xxx
            return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
        } else if (cleaned.length === 11) {
            // Định dạng: 0xxx xxxx xxx
            return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`;
        } else if (cleaned.length === 9) {
            // Định dạng: xxx xxx xxx (thiếu số 0 đầu)
            return `0${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
        }

        // Nếu không đúng định dạng, trả về số gốc
        return phone;
    };

    // Format số tài khoản (che đi và chỉ hiển thị 4 số cuối)
    const formatBankAccount = (accountNumber: string | undefined | null): string => {
        if (!accountNumber) return "N/A";
        if (showBankAccount) {
            return accountNumber;
        }
        // Chỉ hiển thị 4 số cuối, các số đầu được thay bằng *
        if (accountNumber.length <= 4) {
            return accountNumber;
        }
        const lastFour = accountNumber.slice(-4);
        const masked = "*".repeat(accountNumber.length - 4);
        return `${masked}${lastFour}`;
    };

    // Load suppliers, positions, typeWorks và companies
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load suppliers và positions
                const suppliersPositionsRes = await employeeApi.getSuppliersPositions();
                if (suppliersPositionsRes.data) {
                    setSuppliers(suppliersPositionsRes.data.suppliers.filter((s: Supplier) => s.status === true));
                    setPositions(suppliersPositionsRes.data.positions);
                }

                // Load typeWorks và companies
                const typeWorksCompaniesRes = await employeeApi.getTypeWorksAndCompanies();
                if (typeWorksCompaniesRes.data) {
                    setTypeWorks(typeWorksCompaniesRes.data.typeWorks || []);
                    setCompanies(typeWorksCompaniesRes.data.companies || []);

                    // Cập nhật suppliers từ companies (ưu tiên suppliers từ companies vì có thông tin đầy đủ hơn)
                    const allSuppliersFromCompanies: Supplier[] = [];
                    typeWorksCompaniesRes.data.companies?.forEach((company: Company) => {
                        company.suppliers?.forEach((supplier) => {
                            if (supplier.status) {
                                allSuppliersFromCompanies.push({
                                    id: supplier.id,
                                    name: supplier.name,
                                    status: supplier.status,
                                    createdAt: supplier.createdAt,
                                });
                            }
                        });
                    });
                    // Lưu tất cả suppliers để filter sau này
                    if (allSuppliersFromCompanies.length > 0) {
                        setAllSuppliers(allSuppliersFromCompanies);
                        setSuppliers(allSuppliersFromCompanies);
                    }
                }
            } catch (error) {
                console.error("Failed to load data", error);
            }
        };
        loadData();
    }, []);

    // Khởi tạo formData từ employee khi vào chế độ edit
    useEffect(() => {
        if (isEditing && employee && companies.length > 0 && allSuppliers.length > 0) {
            // Tìm companyId từ supplierId của employee
            const employeeCompany = companies.find(c =>
                c.suppliers?.some(s => s.id === employee.supplierId)
            );

            if (employeeCompany) {
                setSelectedCompanyId(employeeCompany.id);
            }

            setFormData({
                name: employee.name || "",
                avatarUrl: employee.avatarUrl || "",
                phone: employee.phone || "",
                address: employee.address || "",
                positionId: employee.positionId || 0,
                supplierId: employee.supplierId || 0,
                typeWorkId: employee.typeWorkId || 0,
                joinDate: employee.joinDate ? employee.joinDate.split("T")[0] : "",
                gender: employee.gender ?? true,
                nationality: employee.nationality || "",
                dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.split("T")[0] : "",
                identityNumber: employee.identityNumber || "",
                taxCode: employee.taxCode || "",
                workEmail: employee.workEmail || "",
                bankName: employee.bankName || "",
                bankAccountNumber: employee.bankAccountNumber || "",
                bankAccountHolderName: employee.bankAccountHolderName || "",
                emergencyContactName: employee.emergencyContactName || "",
                emergencyContactPhone: employee.emergencyContactPhone || "",
            });
        }
    }, [isEditing, employee, companies, allSuppliers]);

    // Filter suppliers khi company được chọn
    useEffect(() => {
        if (selectedCompanyId && companies.length > 0) {
            const selectedCompany = companies.find(c => c.id === selectedCompanyId);
            if (selectedCompany && selectedCompany.suppliers) {
                const filteredSuppliers = selectedCompany.suppliers
                    .filter(s => s.status)
                    .map(s => ({
                        id: s.id,
                        name: s.name,
                        status: s.status,
                        createdAt: s.createdAt,
                    }));
                setSuppliers(filteredSuppliers);

                // Reset supplierId nếu supplier hiện tại không thuộc company mới
                if (formData && formData.supplierId) {
                    const currentSupplierExists = filteredSuppliers.some(s => s.id === formData.supplierId);
                    if (!currentSupplierExists) {
                        setFormData({ ...formData, supplierId: 0 });
                    }
                }
            }
        } else if (!selectedCompanyId && allSuppliers.length > 0) {
            // Nếu không chọn company, hiển thị tất cả suppliers
            setSuppliers(allSuppliers);
        }
    }, [selectedCompanyId, companies, allSuppliers, formData]);

    // Đóng menu export khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setShowExportMenu(false);
            }
        };

        if (showExportMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showExportMenu]);

    // Xử lý submit form
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!employee || !formData) return;

        try {
            setSubmitting(true);

            // ✅ GỘP URL avatar (nếu có upload mới)
            const submitData = {
                ...formData,
                avatarUrl: avatarUrl || formData.avatarUrl,
            };

            const response = await employeeApi.updateEmployee(
                employee.employeeId,
                submitData
            );

            if (response.data) {
                navigate("/EmployDetail", {
                    state: { employee: response.data },
                    replace: true
                });

                setIsEditing(false);
                alert("Cập nhật thông tin nhân viên thành công!");
            }
        } catch (error: any) {
            console.error("Failed to update employee", error);
            alert(
                error.response?.data?.message ||
                "Có lỗi xảy ra khi cập nhật thông tin nhân viên"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleAvatarClick = () => {
        if (!isEditing || uploading) return;
        fileInputRef.current?.click();
    };

    const uploadAvatarToCloudinary = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "suhuku");

        const res = await fetch(
            "https://api.cloudinary.com/v1_1/dyztuzywx/image/upload",
            {
                method: "POST",
                body: formData,
            }
        );

        if (!res.ok) {
            throw new Error("Upload failed");
        }

        const data = await res.json();
        return data.secure_url as string;
    };
    const handleAvatarChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // validate
        if (!file.type.startsWith("image/")) {
            alert("Chỉ được upload ảnh");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Ảnh tối đa 5MB");
            return;
        }

        // preview ngay
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);

        // upload
        try {
            setUploading(true);
            const url = await uploadAvatarToCloudinary(file);
            setAvatarUrl(url); // 👈 URL cloudinary
        } catch (err) {
            alert("Upload ảnh thất bại");
            setAvatarPreview(null);
        } finally {
            setUploading(false);
        }
    };
    // Xử lý xuất Word
    const handleExportWord = async () => {
        if (!employee) {
            alert("Không có dữ liệu nhân viên để xuất");
            return;
        }

        setShowExportMenu(false);

        try {
            // Tạo document Word
            const doc = new Document({
                sections: [
                    {
                        properties: {},
                        children: [
                            // Tiêu đề
                            new Paragraph({
                                text: "HỒ SƠ NHÂN VIÊN",
                                heading: HeadingLevel.HEADING_1,
                                alignment: AlignmentType.CENTER,
                                spacing: { after: 400 },
                            }),

                            // Thông tin cá nhân
                            new Paragraph({
                                text: "THÔNG TIN CÁ NHÂN",
                                heading: HeadingLevel.HEADING_2,
                                spacing: { before: 200, after: 200 },
                            }),
                            new Table({
                                width: { size: 100, type: WidthType.PERCENTAGE },
                                rows: [
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Họ và tên")] }),
                                            new TableCell({ children: [new Paragraph(employee.name || "N/A")] }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Ngày sinh")] }),
                                            new TableCell({ children: [new Paragraph(formatDate(employee.dateOfBirth))] }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Giới tính")] }),
                                            new TableCell({ children: [new Paragraph(employee.gender ? "Nam" : "Nữ")] }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("CCCD/CMND")] }),
                                            new TableCell({ children: [new Paragraph(employee.identityNumber || "N/A")] }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Quốc tịch")] }),
                                            new TableCell({ children: [new Paragraph(employee.nationality || "N/A")] }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Mã số thuế")] }),
                                            new TableCell({ children: [new Paragraph(employee.taxCode || "N/A")] }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Địa chỉ thường trú")] }),
                                            new TableCell({ children: [new Paragraph(employee.address || "N/A")] }),
                                        ],
                                    }),
                                ],
                            }),

                            new Paragraph({ text: "", spacing: { after: 200 } }),

                            // Thông tin liên hệ
                            new Paragraph({
                                text: "THÔNG TIN LIÊN HỆ",
                                heading: HeadingLevel.HEADING_2,
                                spacing: { before: 200, after: 200 },
                            }),
                            new Table({
                                width: { size: 100, type: WidthType.PERCENTAGE },
                                rows: [
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Email công việc")] }),
                                            new TableCell({ children: [new Paragraph(employee.workEmail || "N/A")] }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Số điện thoại")] }),
                                            new TableCell({ children: [new Paragraph(formatPhoneNumber(employee.phone))] }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Liên hệ khẩn cấp")] }),
                                            new TableCell({ children: [new Paragraph(`${employee.emergencyContactName || "N/A"} - ${formatPhoneNumber(employee.emergencyContactPhone)}`)] }),
                                        ],
                                    }),
                                ],
                            }),

                            new Paragraph({ text: "", spacing: { after: 200 } }),

                            // Thông tin ngân hàng
                            new Paragraph({
                                text: "THÔNG TIN NGÂN HÀNG",
                                heading: HeadingLevel.HEADING_2,
                                spacing: { before: 200, after: 200 },
                            }),
                            new Table({
                                width: { size: 100, type: WidthType.PERCENTAGE },
                                rows: [
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Ngân hàng")] }),
                                            new TableCell({ children: [new Paragraph(employee.bankName || "N/A")] }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Số tài khoản")] }),
                                            new TableCell({ children: [new Paragraph(employee.bankAccountNumber || "N/A")] }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Tên chủ tài khoản")] }),
                                            new TableCell({ children: [new Paragraph(employee.bankAccountHolderName || "N/A")] }),
                                        ],
                                    }),
                                ],
                            }),

                            new Paragraph({ text: "", spacing: { after: 200 } }),

                            // Thông tin công việc
                            new Paragraph({
                                text: "THÔNG TIN CÔNG VIỆC",
                                heading: HeadingLevel.HEADING_2,
                                spacing: { before: 200, after: 200 },
                            }),
                            new Table({
                                width: { size: 100, type: WidthType.PERCENTAGE },
                                rows: [
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Vị trí")] }),
                                            new TableCell({ children: [new Paragraph(employee.position?.name || "N/A")] }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Công ty")] }),
                                            new TableCell({ children: [new Paragraph(employee.company?.name || "N/A")] }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Văn phòng")] }),
                                            new TableCell({ children: [new Paragraph(employee.supplier?.name || "N/A")] }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Loại hình")] }),
                                            new TableCell({ children: [new Paragraph(employee.typeWork?.name || "N/A")] }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Ngày gia nhập")] }),
                                            new TableCell({ children: [new Paragraph(formatDate(employee.joinDate))] }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({ children: [new Paragraph("Thâm niên")] }),
                                            new TableCell({ children: [new Paragraph(calculateTenure(employee.joinDate))] }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    },
                ],
            });

            // Tạo file và download
            const blob = await Packer.toBlob(doc);
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `Ho_so_${employee.name?.replace(/\s+/g, "_") || "nhan_vien"}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            alert("Xuất file Word thành công!");
        } catch (error) {
            console.error("Lỗi khi xuất Word:", error);
            alert("Có lỗi xảy ra khi xuất file Word. Vui lòng thử lại.");
        }
    };

    const makeCircularImage = (imgDataUrl: string, size: number): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");
                if (!ctx) return reject("No canvas context");

                ctx.clearRect(0, 0, size, size);

                // Cắt tròn
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();

                ctx.drawImage(img, 0, 0, size, size);

                resolve(canvas.toDataURL("image/png"));
            };
            img.onerror = reject;
            img.src = imgDataUrl;
        });
    };



    //     setShowExportMenu(false);

    //     try {
    //         // Tạo PDF mới
    //         const pdf = new jsPDF("p", "mm", "a4");
    //         const pageWidth = pdf.internal.pageSize.getWidth();
    //         const pageHeight = pdf.internal.pageSize.getHeight();
    //         let yPosition = 20;

    //         // Hàm helper để thêm text với wrap
    //         const addText = (text: string, x: number, y: number, fontSize: number = 12, isBold: boolean = false, align: "left" | "center" | "right" = "left") => {
    //             pdf.setFontSize(fontSize);
    //             pdf.setFont("helvetica", isBold ? "bold" : "normal");
    //             const lines = pdf.splitTextToSize(text, pageWidth - 40);
    //             pdf.text(lines, x, y, { align });
    //             return y + (lines.length * fontSize * 0.4);
    //         };

    //         // Tiêu đề
    //         yPosition = addText("HỒ SƠ NHÂN VIÊN", pageWidth / 2, yPosition, 18, true, "center");
    //         yPosition += 10;

    //         // Thông tin cá nhân
    //         yPosition = addText("THÔNG TIN CÁ NHÂN", 20, yPosition, 14, true);
    //         yPosition += 5;
    //         pdf.setLineWidth(0.5);
    //         pdf.line(20, yPosition, pageWidth - 20, yPosition);
    //         yPosition += 8;

    //         const personalInfo = [
    //             ["Họ và tên", employee.name || "N/A"],
    //             ["Ngày sinh", formatDate(employee.dateOfBirth)],
    //             ["Giới tính", employee.gender ? "Nam" : "Nữ"],
    //             ["CCCD/CMND", employee.identityNumber || "N/A"],
    //             ["Quốc tịch", employee.nationality || "N/A"],
    //             ["Mã số thuế", employee.taxCode || "N/A"],
    //             ["Địa chỉ thường trú", employee.address || "N/A"],
    //         ];

    //         personalInfo.forEach(([label, value]) => {
    //             if (yPosition > pageHeight - 30) {
    //                 pdf.addPage();
    //                 yPosition = 20;
    //             }
    //             addText(`${label}:`, 25, yPosition, 11, false);
    //             yPosition = addText(value, 80, yPosition, 11, false);
    //             yPosition += 5;
    //         });

    //         yPosition += 5;

    //         // Thông tin liên hệ
    //         if (yPosition > pageHeight - 50) {
    //             pdf.addPage();
    //             yPosition = 20;
    //         }
    //         yPosition = addText("THÔNG TIN LIÊN HỆ", 20, yPosition, 14, true);
    //         yPosition += 5;
    //         pdf.line(20, yPosition, pageWidth - 20, yPosition);
    //         yPosition += 8;

    //         const contactInfo = [
    //             ["Email công việc", employee.workEmail || "N/A"],
    //             ["Số điện thoại", formatPhoneNumber(employee.phone)],
    //             ["Liên hệ khẩn cấp", `${employee.emergencyContactName || "N/A"} - ${formatPhoneNumber(employee.emergencyContactPhone)}`],
    //         ];

    //         contactInfo.forEach(([label, value]) => {
    //             if (yPosition > pageHeight - 30) {
    //                 pdf.addPage();
    //                 yPosition = 20;
    //             }
    //             addText(`${label}:`, 25, yPosition, 11, false);
    //             yPosition = addText(value, 80, yPosition, 11, false);
    //             yPosition += 5;
    //         });

    //         yPosition += 5;

    //         // Thông tin ngân hàng
    //         if (yPosition > pageHeight - 50) {
    //             pdf.addPage();
    //             yPosition = 20;
    //         }
    //         yPosition = addText("THÔNG TIN NGÂN HÀNG", 20, yPosition, 14, true);
    //         yPosition += 5;
    //         pdf.line(20, yPosition, pageWidth - 20, yPosition);
    //         yPosition += 8;

    //         const bankInfo = [
    //             ["Ngân hàng", employee.bankName || "N/A"],
    //             ["Số tài khoản", employee.bankAccountNumber || "N/A"],
    //             ["Tên chủ tài khoản", employee.bankAccountHolderName || "N/A"],
    //         ];

    //         bankInfo.forEach(([label, value]) => {
    //             if (yPosition > pageHeight - 30) {
    //                 pdf.addPage();
    //                 yPosition = 20;
    //             }
    //             addText(`${label}:`, 25, yPosition, 11, false);
    //             yPosition = addText(value, 80, yPosition, 11, false);
    //             yPosition += 5;
    //         });

    //         yPosition += 5;

    //         // Thông tin công việc
    //         if (yPosition > pageHeight - 50) {
    //             pdf.addPage();
    //             yPosition = 20;
    //         }
    //         yPosition = addText("THÔNG TIN CÔNG VIỆC", 20, yPosition, 14, true);
    //         yPosition += 5;
    //         pdf.line(20, yPosition, pageWidth - 20, yPosition);
    //         yPosition += 8;

    //         const workInfo = [
    //             ["Vị trí", employee.position?.name || "N/A"],
    //             ["Công ty", employee.company?.name || "N/A"],
    //             ["Văn phòng", employee.supplier?.name || "N/A"],
    //             ["Loại hình", employee.typeWork?.name || "N/A"],
    //             ["Ngày gia nhập", formatDate(employee.joinDate)],
    //             ["Thâm niên", calculateTenure(employee.joinDate)],
    //         ];

    //         workInfo.forEach(([label, value]) => {
    //             if (yPosition > pageHeight - 30) {
    //                 pdf.addPage();
    //                 yPosition = 20;
    //             }
    //             addText(`${label}:`, 25, yPosition, 11, false);
    //             yPosition = addText(value, 80, yPosition, 11, false);
    //             yPosition += 5;
    //         });

    //         // Lưu file
    //         pdf.save(`Ho_so_${employee.name?.replace(/\s+/g, "_") || "nhan_vien"}.pdf`);
    //         alert("Xuất file PDF thành công!");
    //     } catch (error) {
    //         console.error("Lỗi khi xuất PDF:", error);
    //         alert("Có lỗi xảy ra khi xuất file PDF. Vui lòng thử lại.");
    //     }
    // };
    // const handleExportPDF = async () => {
    //     if (!employee) {
    //         alert("Không có dữ liệu nhân viên để xuất");
    //         return;
    //     }

    //     setShowExportMenu(false);

    //     try {
    //         const pdf = new jsPDF("p", "mm", "a4");

    //         // Fonts are auto-registered when imported, use Roboto-Regular and Roboto-Bold
    //         pdf.setFont("Roboto-Regular", "normal");

    //         const pageWidth = pdf.internal.pageSize.getWidth();
    //         const pageHeight = pdf.internal.pageSize.getHeight();
    //         let yPosition = 20;

    //         // Helper function để thêm text
    //         const addText = (
    //             text: string,
    //             x: number,
    //             y: number,
    //             fontSize = 12,
    //             isBold = false,
    //             align: "left" | "center" | "right" = "left",
    //             maxWidth?: number
    //         ) => {
    //             pdf.setFont(isBold ? "Roboto-Bold" : "Roboto-Regular", "normal");
    //             pdf.setFontSize(fontSize);
    //             const width = maxWidth || pageWidth - 40;
    //             const lines = pdf.splitTextToSize(text, width);
    //             pdf.text(lines, x, y, { align });
    //             return y + lines.length * fontSize * 0.45;
    //         };

    //         // Helper function để thêm section header với background màu
    //         const addSectionHeader = (title: string, y: number) => {
    //             pdf.setFillColor(66, 133, 244);
    //             pdf.roundedRect(20, y - 5, pageWidth - 40, 8, 2, 2, "F");
    //             pdf.setTextColor(255, 255, 255);
    //             addText(title, 25, y + 2, 12, true);
    //             pdf.setTextColor(0, 0, 0);
    //             return y + 10;
    //         };

    //         // Helper function để thêm thông tin dạng key-value
    //         const addInfoRow = (label: string, value: string, y: number, labelWidth = 50) => {
    //             if (y > pageHeight - 30) {
    //                 pdf.addPage();
    //                 y = 20;
    //             }
    //             addText(`${label}:`, 25, y, 10, true, "left", labelWidth);
    //             addText(value || "N/A", 25 + labelWidth + 5, y, 10, false, "left", pageWidth - 50 - labelWidth);
    //             return y + 6;
    //         };

    //         // Helper function để vẽ card với 2 cột giống như trong ảnh
    //         const addTwoColumnCard = (title: string, leftColumn: [string, string][], rightColumn: [string, string][], y: number) => {
    //             // Kiểm tra nếu cần trang mới
    //             if (y > pageHeight - 80) {
    //                 pdf.addPage();
    //                 y = 20;
    //             }

    //             // Tính chiều cao card dựa trên số dòng tối đa
    //             const maxRows = Math.max(leftColumn.length, rightColumn.length);
    //             const cardHeight = maxRows * 7 + 20;
    //             pdf.setFillColor(248, 249, 250); // Màu xám nhạt
    //             pdf.setDrawColor(220, 220, 220);
    //             pdf.setLineWidth(0.5);
    //             pdf.roundedRect(20, y, pageWidth - 40, cardHeight, 3, 3, "FD");

    //             // Vẽ tiêu đề section với icon
    //             pdf.setFillColor(66, 133, 244);
    //             pdf.roundedRect(25, y + 5, pageWidth - 50, 7, 2, 2, "F");
    //             pdf.setTextColor(255, 255, 255);
    //             addText(title, 30, y + 9, 11, true);
    //             pdf.setTextColor(0, 0, 0);

    //             let currentY = y + 18;
    //             const columnWidth = (pageWidth - 80) / 2;
    //             const leftX = 30;
    //             const rightX = leftX + columnWidth + 20;
    //             const labelWidth = 60; // Chiều rộng cho label

    //             // Vẽ cột trái
    //             leftColumn.forEach(([label, value]) => {
    //                 pdf.setFont("Roboto-Bold", "normal");
    //                 pdf.setFontSize(9);
    //                 pdf.text(`${label}:`, leftX, currentY);
    //                 pdf.setFont("Roboto-Regular", "normal");
    //                 const valueText = value || "N/A";
    //                 const valueLines = pdf.splitTextToSize(valueText, columnWidth - labelWidth - 5);
    //                 pdf.text(valueLines, leftX + labelWidth, currentY);
    //                 currentY += Math.max(valueLines.length * 4, 7);
    //             });

    //             // Vẽ cột phải
    //             currentY = y + 18;
    //             rightColumn.forEach(([label, value]) => {
    //                 pdf.setFont("Roboto-Bold", "normal");
    //                 pdf.setFontSize(9);
    //                 pdf.text(`${label}:`, rightX, currentY);
    //                 pdf.setFont("Roboto-Regular", "normal");
    //                 const valueText = value || "N/A";
    //                 const valueLines = pdf.splitTextToSize(valueText, columnWidth - labelWidth - 5);
    //                 pdf.text(valueLines, rightX + labelWidth, currentY);
    //                 currentY += Math.max(valueLines.length * 4, 7);
    //             });

    //             return y + cardHeight + 10;
    //         };

    //         // ===== HEADER CARD GIỐNG NHƯ TRONG ẢNH =====
    //         // Vẽ background card cho header (màu trắng với border)
    //         pdf.setFillColor(255, 255, 255);
    //         pdf.setDrawColor(220, 220, 220);
    //         pdf.setLineWidth(0.5);
    //         pdf.roundedRect(20, yPosition, pageWidth - 40, 50, 3, 3, "FD");

    //         // Thêm avatar ở bên trái
    //         const avatarSize = 40;
    //         const avatarX = 30;
    //         const avatarY = yPosition + 5;

    //         // Hàm helper để load và thêm avatar
    //         const loadAndAddAvatar = async (imageSource: string | null | undefined): Promise<boolean> => {
    //             if (!imageSource) return false;

    //             return new Promise((resolve) => {
    //                 try {
    //                     const img = new Image();

    //                     // Nếu là blob URL hoặc data URL, không cần crossOrigin
    //                     if (imageSource.startsWith("blob:") || imageSource.startsWith("data:")) {
    //                         img.src = imageSource;
    //                     } else {
    //                         // Với URL từ internet, thử với crossOrigin
    //                         img.crossOrigin = "anonymous";
    //                         img.src = imageSource;
    //                     }

    //                     const timeout = setTimeout(() => {
    //                         resolve(false);
    //                     }, 5000); // Tăng timeout lên 5 giây

    //                     img.onload = () => {
    //                         clearTimeout(timeout);
    //                         try {
    //                             // Vẽ border tròn cho avatar
    //                             pdf.setDrawColor(200, 200, 200);
    //                             pdf.setLineWidth(1);
    //                             pdf.circle(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 1, "D");

    //                             // Thêm avatar (crop thành hình tròn)
    //                             const canvas = document.createElement("canvas");
    //                             canvas.width = 400;
    //                             canvas.height = 400;
    //                             const ctx = canvas.getContext("2d");
    //                             if (ctx) {
    //                                 // Vẽ hình tròn và clip
    //                                 ctx.beginPath();
    //                                 ctx.arc(200, 200, 200, 0, 2 * Math.PI);
    //                                 ctx.clip();

    //                                 // Vẽ ảnh vào canvas
    //                                 ctx.drawImage(img, 0, 0, 400, 400);

    //                                 // Convert sang data URL
    //                                 const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    //                                 pdf.addImage(dataUrl, "JPEG", avatarX, avatarY, avatarSize, avatarSize);
    //                             }
    //                             resolve(true);
    //                         } catch (err) {
    //                             console.warn("Không thể thêm avatar:", err);
    //                             resolve(false);
    //                         }
    //                     };

    //                     img.onerror = () => {
    //                         clearTimeout(timeout);
    //                         console.warn("Không thể load avatar từ:", imageSource);
    //                         resolve(false);
    //                     };
    //                 } catch (err) {
    //                     console.warn("Lỗi khi load avatar:", err);
    //                     resolve(false);
    //                 }
    //             });
    //         };

    //         // Thử load avatar theo thứ tự ưu tiên
    //         let avatarLoaded = false;
    //         if (avatarPreview) {
    //             avatarLoaded = await loadAndAddAvatar(avatarPreview);
    //         }
    //         if (!avatarLoaded && avatarUrl) {
    //             avatarLoaded = await loadAndAddAvatar(avatarUrl);
    //         }
    //         if (!avatarLoaded && employee.avatarUrl) {
    //             avatarLoaded = await loadAndAddAvatar(employee.avatarUrl);
    //         }
    //         // Fallback avatar mặc định nếu không load được
    //         if (!avatarLoaded) {
    //             const defaultAvatar = employee.gender
    //                 ? "https://blog.vn.revu.net/wp-content/uploads/2025/09/anh-son-tung-mtp-thumb.jpg"
    //                 : "https://i.pinimg.com/originals/4c/e5/2a/4ce52a5518ecb3daef9770148a80f21a.jpg";
    //             await loadAndAddAvatar(defaultAvatar);
    //         }

    //         // Thông tin bên phải avatar
    //         const infoStartX = avatarX + avatarSize + 15;
    //         let infoY = avatarY + 5;

    //         // Tên nhân viên (lớn, bold)
    //         pdf.setFont("Roboto-Bold", "normal");
    //         pdf.setFontSize(16);
    //         const nameText = employee.name || "N/A";
    //         pdf.text(nameText, infoStartX, infoY);

    //         // Status badge (Offline/Online) - inline với tên
    //         const statusText = employee.online ? "Đang hoạt động" : "Offline";
    //         const statusColor = employee.online ? [34, 197, 94] : [156, 163, 175];
    //         pdf.setFont("Roboto-Regular", "normal");
    //         pdf.setFontSize(8);
    //         const nameWidth = pdf.getTextWidth(nameText);
    //         const statusTextWidth = pdf.getTextWidth(statusText);
    //         const statusWidth = statusTextWidth + 8;
    //         const statusX = infoStartX + nameWidth + 8;
    //         const statusY = infoY - 3;

    //         // Vẽ badge background
    //         pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    //         pdf.roundedRect(statusX, statusY - 3, statusWidth, 6, 3, 3, "F");

    //         // Vẽ text badge
    //         pdf.setTextColor(255, 255, 255);
    //         pdf.text(statusText, statusX + 4, statusY);
    //         pdf.setTextColor(0, 0, 0);

    //         infoY += 8;

    //         // Role/Position
    //         pdf.setFont("Roboto-Regular", "normal");
    //         pdf.setFontSize(11);
    //         pdf.text(employee.position?.name || "N/A", infoStartX, infoY);
    //         infoY += 7;

    //         // Thông tin chi tiết (CCCD, Công ty, Đội) - hiển thị dọc
    //         pdf.setFontSize(9);
    //         const detailInfo = [
    //             `CCCD/CMND: #${employee.identityNumber || "N/A"}`,
    //             employee.company?.name || "N/A",
    //             employee.supplier?.name || "N/A",
    //         ];

    //         // Hiển thị thông tin chi tiết
    //         detailInfo.forEach((info) => {
    //             if (infoY > yPosition + 45) return; // Không vượt quá card
    //             pdf.text(info, infoStartX, infoY);
    //             infoY += 5;
    //         });

    //         yPosition += 55; // Di chuyển xuống sau header card

    //         // ===== THÔNG TIN CÁ NHÂN =====
    //         const personalInfoLeft: [string, string][] = [
    //             ["Họ và tên", employee.name || "N/A"],
    //             ["Ngày sinh", formatDate(employee.dateOfBirth)],
    //             ["CCCD/CMND", employee.identityNumber || "N/A"],
    //             ["Địa chỉ thường trú", employee.address || "N/A"],
    //         ];

    //         const personalInfoRight: [string, string][] = [
    //             ["Giới tính", employee.gender ? "Nam" : "Nữ"],
    //             ["Quốc tịch", employee.nationality || "N/A"],
    //             ["Mã số thuế", employee.taxCode || "N/A"],
    //         ];

    //         yPosition = addTwoColumnCard("Thông tin cá nhân", personalInfoLeft, personalInfoRight, yPosition);

    //         // ===== THÔNG TIN LIÊN HỆ =====
    //         const contactInfoLeft: [string, string][] = [
    //             ["Email công việc", employee.workEmail || "N/A"],
    //             ["Số điện thoại", formatPhoneNumber(employee.phone)],
    //         ];

    //         const contactInfoRight: [string, string][] = [
    //             ["Email cá nhân", employee.email || "N/A"],
    //             ["Liên hệ khẩn cấp", `${employee.emergencyContactName || "N/A"} - ${formatPhoneNumber(employee.emergencyContactPhone)}`],
    //         ];

    //         yPosition = addTwoColumnCard("Thông tin liên hệ", contactInfoLeft, contactInfoRight, yPosition);

    //         // ===== THÔNG TIN NGÂN HÀNG =====
    //         const bankInfoLeft: [string, string][] = [
    //             ["Ngân hàng", employee.bankName || "N/A"],
    //             ["Tên chủ tài khoản", employee.bankAccountHolderName || "N/A"],
    //         ];

    //         const bankInfoRight: [string, string][] = [
    //             ["Số tài khoản", employee.bankAccountNumber || "N/A"],
    //         ];

    //         yPosition = addTwoColumnCard("Thông tin ngân hàng", bankInfoLeft, bankInfoRight, yPosition);

    //         // ===== THÔNG TIN CÔNG VIỆC =====
    //         if (yPosition > pageHeight - 50) {
    //             pdf.addPage();
    //             yPosition = 20;
    //         }
    //         yPosition = addSectionHeader("THÔNG TIN CÔNG VIỆC", yPosition);

    //         const workInfo = [
    //             ["Vị trí", employee.position?.name || "N/A"],
    //             ["Công ty", employee.company?.name || "N/A"],
    //             ["Văn phòng", employee.supplier?.name || "N/A"],
    //             ["Loại hình", employee.typeWork?.name || "N/A"],
    //             ["Ngày gia nhập", formatDate(employee.joinDate)],
    //             ["Thâm niên", calculateTenure(employee.joinDate)],
    //         ];

    //         workInfo.forEach(([label, value]) => {
    //             yPosition = addInfoRow(label, value, yPosition);
    //         });

    //         // Footer với ngày xuất trên tất cả các trang
    //         const totalPages = pdf.internal.pages.length - 1;
    //         for (let i = 1; i <= totalPages; i++) {
    //             pdf.setPage(i);
    //             pdf.setFontSize(8);
    //             pdf.setTextColor(128, 128, 128);
    //             pdf.text(
    //                 `Xuất ngày: ${new Date().toLocaleDateString("vi-VN")} - Trang ${i}/${totalPages}`,
    //                 pageWidth / 2,
    //                 pageHeight - 10,
    //                 { align: "center" }
    //             );
    //             pdf.setTextColor(0, 0, 0);
    //         }

    //         // ===== LƯU FILE =====
    //         pdf.save(`Ho_so_${employee.name?.replace(/\s+/g, "_") || "nhan_vien"}.pdf`);
    //         alert("Xuất file PDF thành công!");
    //     } catch (error) {
    //         console.error("Lỗi khi xuất PDF:", error);
    //         alert("Có lỗi xảy ra khi xuất file PDF. Vui lòng thử lại.");
    //     }
    // };
    const handleExportPDF = async () => {
        if (!employee) {
            alert("Không có dữ liệu nhân viên để xuất");
            return;
        }

        setShowExportMenu(false);

        try {
            // Tạo PDF với định dạng A4
            const pdf = new jsPDF("p", "mm", "a4");

            // Thiết lập font mặc định (tên font đúng với addFont trong RobotoRegular.js/Roboto-Bold.js)
            pdf.setFont("Roboto-Regular", "normal");

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            let yPosition = 15;

            // ========== HEADER SECTION ==========
            // Header với background xanh
            pdf.setFillColor(59, 130, 246); // Màu blue-500
            pdf.rect(0, 0, pageWidth, 18, "F");

            // Logo/Tên công ty
            pdf.setTextColor(255, 255, 255);
            pdf.setFont("Roboto-Bold", "normal");
            pdf.setFontSize(12);
            pdf.text("SHROR & COMPANY", 20, 12);

            pdf.setFontSize(8);
            pdf.setFont("Roboto-Regular", "normal");
            pdf.text("HR Management System", pageWidth - 20, 12, { align: "right" });

            // ========== AVATAR SECTION ==========
            yPosition = 38;
            const avatarSize = 38;
            const avatarX = 22;
            const avatarY = yPosition;

            // Placeholder data URL (1x1 PNG) để luôn addImage thành công nếu tất cả nguồn ảnh đều lỗi
            const PLACEHOLDER_AVATAR =
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAnsB9bMbr5UAAAAASUVORK5CYII=";

            // Helper: fetch ảnh về dạng dataURL để tránh lỗi CORS
            const fetchImageAsDataUrl = async (source: string): Promise<string | null> => {
                // Nếu là data URL thì trả luôn
                if (source.startsWith("data:")) {
                    return source;
                }
                try {
                    const response = await fetch(source, { mode: "cors" });
                    if (!response.ok) return null;
                    const blob = await response.blob();
                    return await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = () => reject(reader.error);
                        reader.readAsDataURL(blob);
                    });
                } catch (error) {
                    console.warn("Không thể fetch avatar:", error);
                    return null;
                }
            };

            // Hàm load và thêm avatar, ưu tiên preview > mới upload > avatar cũ > default > placeholder
            const addAvatar = async () => {
                const candidateSources = [
                    avatarPreview,
                    avatarUrl,
                    employee.avatarUrl,
                    employee.gender
                        ? "https://media-cdn-v2.laodong.vn/storage/newsportal/2024/12/3/1430016/Sontung.jpg"
                        : "https://kenh14cdn.com/203336854389633024/2023/2/13/photo-9-1676247270161367009944.jpg",
                    PLACEHOLDER_AVATAR
                ].filter(Boolean) as string[];

                for (const source of candidateSources) {
                    const dataUrl = await fetchImageAsDataUrl(source);
                    if (!dataUrl) continue;

                    try {
                        // 🔥 render canvas lớn gấp 5 lần → nét khi thu nhỏ
                        const renderSize = avatarSize * 5;

                        const circularAvatar = await makeCircularImage(
                            dataUrl,
                            renderSize
                        );

                        // 🔥 viền trắng mỏng (nhìn sang)
                        pdf.setDrawColor(255, 255, 255);
                        pdf.setLineWidth(1);
                        pdf.circle(
                            avatarX + avatarSize / 2,
                            avatarY + avatarSize / 2,
                            avatarSize / 2 + 0.5,
                            "S"
                        );

                        // add ảnh tròn
                        pdf.addImage(
                            circularAvatar,
                            "PNG",
                            avatarX,
                            avatarY,
                            avatarSize,
                            avatarSize
                        );
                        return;
                    } catch (err) {
                        console.warn("Không thể xử lý avatar:", err);
                    }
                }
            };


            await addAvatar();

            // Thông tin tên và vị trí bên cạnh avatar
            const infoX = avatarX + avatarSize + 12;

            pdf.setFont("Roboto-Bold", "normal");
            pdf.setFontSize(15);
            pdf.text(employee.name || "N/A", infoX, avatarY + 11);
            pdf.setFont("Roboto-Bold", "normal");
            pdf.setFontSize(20);
            pdf.setTextColor(107, 114, 128);
            pdf.text(employee.name || "N/A", infoX, avatarY + 19);

            pdf.setFontSize(9);
            pdf.text(`Vị trí: ${employee.position?.name || "N/A"}`, infoX, avatarY + 26);


            yPosition = avatarY + avatarSize + 15;

            // ========== HELPER FUNCTIONS ==========
            const addSectionHeader = (title: string, y: number): number => {
                pdf.setFillColor(243, 244, 246);
                pdf.roundedRect(20, y, pageWidth - 40, 8, 2, 2, "F");

                pdf.setFont("Roboto-Bold", "normal");
                pdf.setFontSize(10);
                pdf.setTextColor(59, 130, 246);
                pdf.text(title, 25, y + 5.5);

                return y + 12;
            };
            const addInfoRow = (
                label: string,
                value: string,
                y: number,
                xOffset = 0,
                valueFont: "Roboto-Regular" | "Roboto-Bold" | "NotoSans-Regular" = "Roboto-Regular"
            ): number => {
                // Label
                pdf.setFont("Roboto-Bold", "normal");
                pdf.setFontSize(8);
                pdf.setTextColor(55, 65, 81);
                pdf.text(`${label}:`, 25 + xOffset, y);

                // Value
                pdf.setFont(valueFont, "normal");
                pdf.setTextColor(75, 85, 99);

                const maxWidth =
                    xOffset > 0 ? (pageWidth - 40) / 2 - 25 : pageWidth - 60;

                const safeValue = value || "N/A";
                const lines = pdf.splitTextToSize(safeValue, maxWidth);

                pdf.text(lines, 25 + xOffset + 35, y);

                return y + Math.max(6, lines.length * 4);
            };



            // ========== THÔNG TIN CÁ NHÂN ==========
            yPosition = addSectionHeader("THÔNG TIN CÁ NHÂN", yPosition);

            let currentY = yPosition;
            const columnWidth = (pageWidth - 40) / 2;

            // Cột trái
            currentY = addInfoRow("Họ và tên", employee.name || "N/A", currentY);
            currentY = addInfoRow("Ngày sinh", formatDate(employee.dateOfBirth), currentY);
            currentY = addInfoRow("CCCD/CMND", employee.identityNumber || "N/A", currentY);
            // currentY = addInfoRow("Quốc tịch", employee.nationality || "N/A", currentY);
            currentY = addInfoRow(
                "Quốc tịch",
                `${employee.nationality || "N/A"}`,
                currentY,
                0,
                "Roboto-Bold"
            );
            // currentY = addInfoRow(
            //     "Quốc tịch",
            //     `${employee.nationality || "N/A"}`,
            //     currentY,
            //     0,
            //     "Roboto-Regular"
            // );
            currentY = addInfoRow("Mã số thuế", employee.taxCode || "N/A", currentY);

            // Cột phải
            let rightY = yPosition;
            rightY = addInfoRow("Giới tính", employee.gender ? "Nam" : "Nữ", rightY, columnWidth);
            rightY = addInfoRow("Ngày gia nhập", formatDate(employee.joinDate), rightY, columnWidth);
            rightY = addInfoRow("Thâm niên", calculateTenure(employee.joinDate), rightY, columnWidth);
            // rightY = addInfoRow("Trạng thái", employee.online ? "Đang hoạt động" : "Offline", rightY, columnWidth);

            yPosition = Math.max(currentY, rightY) + 8;

            // ========== THÔNG TIN LIÊN HỆ ==========
            yPosition = addSectionHeader("THÔNG TIN LIÊN HỆ", yPosition);

            currentY = yPosition;
            currentY = addInfoRow("Email công việc", employee.workEmail || "N/A", currentY);
            currentY = addInfoRow("Email cá nhân", employee.email || "N/A", currentY);
            currentY = addInfoRow("Số điện thoại", formatPhoneNumber(employee.phone), currentY);
            // currentY = addInfoRow("Liên hệ khẩn cấp",
            //     `${employee.emergencyContactName || "N/A"} - ${formatPhoneNumber(employee.emergencyContactPhone)}`,
            //     currentY);
            currentY = addInfoRow(
                "Liên hệ khẩn cấp",
                `${employee.emergencyContactName || "N/A"} - ${formatPhoneNumber(employee.emergencyContactPhone)}`,
                currentY,
                0,
                "NotoSans-Regular"
            );


            yPosition = currentY + 8;

            // ========== THÔNG TIN NGÂN HÀNG ==========
            yPosition = addSectionHeader("THÔNG TIN NGÂN HÀNG", yPosition);

            currentY = yPosition;
            currentY = addInfoRow("Ngân hàng", employee.bankName || "N/A", currentY);
            currentY = addInfoRow("Số tài khoản", employee.bankAccountNumber || "N/A", currentY);
            // currentY = addInfoRow("Chủ tài khoản", employee.bankAccountHolderName || "N/A", currentY);
            currentY = addInfoRow(
                "Chủ tài khoản",
                employee.bankAccountHolderName || "N/A",
                currentY,
                0,
                "NotoSans-Regular"
            );

            // pdf.setFont("Roboto-Regular", "normal");
            // pdf.setFontSize(10);
            // pdf.setTextColor(107, 114, 128);


            yPosition = currentY + 8;

            // ========== THÔNG TIN CÔNG VIỆC ==========
            yPosition = addSectionHeader("THÔNG TIN CÔNG VIỆC", yPosition);

            currentY = yPosition;
            // currentY = addInfoRow("Vị trí", employee.position?.name || "N/A", currentY);
            currentY = addInfoRow(
                "Vị trí",
                employee.position?.name || "N/A",
                currentY,
                0,
                "NotoSans-Regular"
            );
            currentY = addInfoRow(
                "Công ty",
                employee.company?.name || "N/A",
                currentY,
                0,
                "NotoSans-Regular"
            );
            // currentY = addInfoRow("Văn phòng", employee.supplier?.name || "N/A", currentY);
            // currentY = addInfoRow("Loại hình", employee.typeWork?.name || "N/A", currentY);
            currentY = addInfoRow(
                "Văn phòng",
                employee.supplier?.name || "N/A",
                currentY,
                0,
                "NotoSans-Regular"
            );
            currentY = addInfoRow(
                "Loại hình",
                employee.typeWork?.name || "N/A",
                currentY,
                0,
                "NotoSans-Regular"
            );
            // Cột phải cho địa chỉ (nếu có)
            rightY = yPosition;
            if (employee.address && employee.address.length < 50) {
                rightY = addInfoRow("Địa chỉ", employee.address, rightY, columnWidth);
            }

            yPosition = Math.max(currentY, rightY) + 8;

            // ========== ĐỊA CHỈ ĐẦY ĐỦ (nếu còn chỗ) ==========
            if (employee.address && employee.address.length >= 50 && yPosition < pageHeight - 30) {
                yPosition = addSectionHeader("ĐỊA CHỈ THƯỜNG TRÚ", yPosition);
                currentY = yPosition;

                pdf.setFont("Roboto-Regular", "normal");
                pdf.setFontSize(8);
                pdf.setTextColor(75, 85, 99);

                const addressLines = pdf.splitTextToSize(employee.address, pageWidth - 40);
                pdf.text(addressLines, 25, currentY);

                yPosition = currentY + (addressLines.length * 4) + 8;
            }

            // ========== LINE SEPARATOR ==========
            if (yPosition < pageHeight - 20) {
                pdf.setDrawColor(229, 231, 235);
                pdf.setLineWidth(0.5);
                pdf.line(20, yPosition, pageWidth - 20, yPosition);
                yPosition += 10;
            }

            // ========== FOOTER ==========
            pdf.setFontSize(7);
            pdf.setTextColor(156, 163, 175);
            pdf.setFont("NotoSans-Regular", "normal");

            // Line footer
            pdf.setDrawColor(209, 213, 219);
            pdf.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);

            // Text footer
            pdf.text("Tài liệu bảo mật - Chỉ sử dụng nội bộ", pageWidth / 2, pageHeight - 10, { align: "center" });
            pdf.text(`Trang 1/1`, pageWidth - 20, pageHeight - 10, { align: "right" });

            // ========== LƯU FILE ==========
            const fileName = `Ho_so_${employee.name?.replace(/\s+/g, "_") || "nhan_vien"}.pdf`;
            pdf.save(fileName);

            alert("Xuất file PDF thành công!");
        } catch (error) {
            console.error("Lỗi khi xuất PDF:", error);
            alert("Có lỗi xảy ra khi xuất file PDF. Vui lòng thử lại.");
        }
    };
    // Tính thâm niên từ ngày gia nhập
    const calculateTenure = (joinDate: string | undefined | null): string => {
        if (!joinDate) return "N/A";
        try {
            const join = new Date(joinDate);
            const now = new Date();

            // Kiểm tra ngày hợp lệ
            if (isNaN(join.getTime())) {
                return "N/A";
            }

            // Tính số năm và tháng
            let years = now.getFullYear() - join.getFullYear();
            let months = now.getMonth() - join.getMonth();

            // Điều chỉnh nếu tháng hiện tại nhỏ hơn tháng gia nhập
            if (months < 0) {
                years--;
                months += 12;
            }

            // Điều chỉnh nếu ngày hiện tại nhỏ hơn ngày gia nhập trong tháng
            if (now.getDate() < join.getDate()) {
                months--;
                if (months < 0) {
                    years--;
                    months += 12;
                }
            }

            // Format kết quả
            const parts: string[] = [];
            if (years > 0) {
                parts.push(`${years} năm`);
            }
            if (months > 0) {
                parts.push(`${months} tháng`);
            }

            // Nếu chưa đủ 1 tháng
            if (parts.length === 0) {
                const days = Math.floor((now.getTime() - join.getTime()) / (1000 * 60 * 60 * 24));
                return `${days} ngày`;
            }

            return parts.join(", ");
        } catch (error) {
            return "N/A";
        }
    };


    return (
        <div className="mx-auto max-w-6xl space-y-6 py-8">

            <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                <span className="mx-2 text-gray-400">/</span>
                <Link to="/manager-employ" className="hover:text-primary transition-colors">Danh sách nhân viên</Link>
                <span className="mx-2 text-gray-400">/</span>
                <span className="font-medium text-gray-900 dark:text-white">{employee?.name}</span>
            </nav>

            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Hồ sơ nhân viên</h1>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">Quản lý thông tin chi tiết, hợp đồng và lịch sử công việc.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative" ref={exportMenuRef}>
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="flex items-center justify-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">print</span>
                            <span>In hồ sơ</span>
                            <span className="material-symbols-outlined text-[16px]">{showExportMenu ? "expand_less" : "expand_more"}</span>
                        </button>
                        {showExportMenu && (
                            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark shadow-lg z-50 overflow-hidden">
                                <button
                                    onClick={handleExportWord}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px] text-blue-600 dark:text-blue-400">description</span>
                                    <span>Xuất Word (.docx)</span>
                                </button>
                                <button
                                    onClick={handleExportPDF}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-t border-border-light dark:border-border-dark"
                                >
                                    <span className="material-symbols-outlined text-[20px] text-red-600 dark:text-red-400">picture_as_pdf</span>
                                    <span>Xuất PDF (.pdf)</span>
                                </button>
                            </div>
                        )}
                    </div>
                    {!isEditing ? (
                        <button
                            onClick={() => {
                                setIsEditing(true);

                                // ✅ reset trạng thái avatar để edit lại
                                setAvatarPreview(null);
                                setAvatarUrl(null);
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                }
                            }}
                            className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-black hover:text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
                        >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                            <span>Chỉnh sửa hồ sơ</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                setIsEditing(false);

                                // ✅ hủy upload, quay về avatar cũ
                                setAvatarPreview(null);
                                setAvatarUrl(null);
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                }
                            }}
                            className="flex items-center justify-center gap-2 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                            <span>Hủy</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-surface-light dark:bg-surface-dark shadow-sm border border-border-light dark:border-border-dark p-6">

                <div className="absolute right-0 top-0 h-32 w-32 -mr-8 -mt-8 rounded-full bg-primary/10 blur-3xl"></div>
                <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                        <div
                            onClick={handleAvatarClick}
                            className={`relative h-28 w-28 shrink-0 overflow-hidden rounded-full 
    border-4 border-white dark:border-gray-800 shadow-md
    ${isEditing ? "cursor-pointer group" : ""}`}
                        >
                            <img
                                alt="Chân dung nhân viên"
                                className="h-full w-full object-cover"
                                src={
                                    avatarPreview ||
                                    avatarUrl ||
                                    employee?.avatarUrl ||
                                    (employee?.gender
                                        ? "https://blog.vn.revu.net/wp-content/uploads/2025/09/anh-son-tung-mtp-thumb.jpg"
                                        : "https://i.pinimg.com/originals/4c/e5/2a/4ce52a5518ecb3daef9770148a80f21a.jpg")
                                }
                            />

                            {/* Overlay chỉ khi edit */}
                            {isEditing && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center 
            bg-black/40 opacity-0 group-hover:opacity-100 transition"
                                >
                                    {uploading ? (
                                        <span className="text-white text-sm">Uploading...</span>
                                    ) : (
                                        <span className="material-symbols-outlined text-white text-3xl">
                                            photo_camera
                                        </span>
                                    )}
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{employee?.name}</h2>
                                <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-900/30 dark:text-green-400"> {employee?.online ? "Đang hoạt động" : "Offline"}</span>
                            </div>
                            <p className="text-base text-gray-500 dark:text-gray-400">{employee?.position?.name}</p>
                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">badge</span>
                                    <span>CCCD/CMND: #{employee?.identityNumber}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">apartment</span>
                                    <span>{employee?.company?.name || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">business</span>
                                    <span>{employee?.supplier?.name || "N/A"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                    <span>{employee?.company?.address || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row gap-8 md:flex-col md:items-end md:gap-1 lg:flex-row lg:items-center lg:gap-8 border-t md:border-t-0 border-border-light dark:border-border-dark pt-4 md:pt-0">
                        <div className="text-left md:text-right lg:text-center">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày gia nhập</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatDate(employee?.joinDate)}</p>
                        </div>
                        <div className="text-left md:text-right lg:text-center">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Quản lý chi nhánh</p>
                            <div className="flex items-center gap-2 md:justify-end lg:justify-center">
                                {employee?.managers && employee.managers.length > 0 ? (
                                    employee.managers.map((manager) => (
                                        <div key={manager.employeeId} className="flex items-center gap-2">
                                            <div
                                                className="h-6 w-6 rounded-full bg-cover bg-center"
                                                style={{
                                                    backgroundImage: `url(${manager?.avatarUrl
                                                        ? manager.avatarUrl
                                                        : manager.gender
                                                            ? "https://blog.vn.revu.net/wp-content/uploads/2025/09/anh-son-tung-mtp-thumb.jpg"
                                                            : "https://cdn2.tuoitre.vn/thumb_w/480/471584752817336320/2025/7/31/edit-122946417b8bf2d5ab9a-17539298651421799809578.jpeg"
                                                        })`
                                                }}
                                            />
                                            <p className="font-bold text-gray-900 dark:text-white">{manager.name}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm font-medium text-gray-400 dark:text-gray-400">Chưa có quản lý chi nhánh</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 rounded-xl shadow-sm">
                <nav aria-label="Tabs" className="-mb-px flex space-x-8 overflow-x-auto">
                    <a aria-current="page" className="border-b-2 border-primary py-4 px-1 text-sm font-bold text-primary" href="#">Tổng quan</a>
                    <a className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" href="#">Hợp đồng</a>
                    <a className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" href="#">Lịch sử công việc</a>
                    <a className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" href="#">Lương &amp; Phúc lợi</a>
                    <a className="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" href="#">Tài liệu</a>
                </nav>
            </div>

            {isEditing && formData ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">person</span>
                                Thông tin cá nhân
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Họ và tên *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ảnh đại diện</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const url = prompt("Nhập URL ảnh đại diện:", formData.avatarUrl || "");
                                        if (url !== null) {
                                            setFormData({ ...formData, avatarUrl: url });
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">image</span>
                                    <span>Chỉnh sửa ảnh</span>
                                </button>
                            </div> */}
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Giới tính *</label>
                                <select
                                    required
                                    value={formData.gender ? "true" : "false"}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value === "true" })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="true">Nam</option>
                                    <option value="false">Nữ</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ngày sinh *</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.dateOfBirth}
                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Quốc tịch *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nationality}
                                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">CCCD/CMND *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.identityNumber}
                                    onChange={(e) => setFormData({ ...formData, identityNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Mã số thuế *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.taxCode}
                                    onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Địa chỉ thường trú *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">contact_phone</span>
                                Thông tin liên hệ
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email công việc *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.workEmail}
                                    onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Số điện thoại *</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tên người liên hệ khẩn cấp *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.emergencyContactName}
                                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">SĐT người liên hệ khẩn cấp *</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.emergencyContactPhone}
                                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">account_balance</span>
                                Thông tin ngân hàng
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ngân hàng *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Số tài khoản *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.bankAccountNumber}
                                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tên chủ tài khoản *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.bankAccountHolderName}
                                    onChange={(e) => setFormData({ ...formData, bankAccountHolderName: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">work</span>
                                Thông tin công việc
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Vị trí *</label>
                                <select
                                    required
                                    value={formData.positionId}
                                    onChange={(e) => setFormData({ ...formData, positionId: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Chọn vị trí</option>
                                    {positions.map((pos) => (
                                        <option key={pos.id} value={pos.id}>
                                            {pos.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Công ty *</label>
                                <select
                                    required
                                    value={selectedCompanyId || ""}
                                    onChange={(e) => {
                                        const companyId = e.target.value ? Number(e.target.value) : null;
                                        setSelectedCompanyId(companyId);
                                        // Reset supplierId khi đổi company
                                        if (formData) {
                                            setFormData({ ...formData, supplierId: 0 });
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Chọn công ty</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Văn phòng *</label>
                                <select
                                    required
                                    value={formData.supplierId}
                                    onChange={(e) => setFormData({ ...formData, supplierId: Number(e.target.value) })}
                                    disabled={!selectedCompanyId}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">{selectedCompanyId ? "Chọn văn phòng" : "Vui lòng chọn công ty trước"}</option>
                                    {suppliers.map((sup) => (
                                        <option key={sup.id} value={sup.id}>
                                            {sup.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Loại hình *</label>
                                <select
                                    required
                                    value={formData.typeWorkId}
                                    onChange={(e) => setFormData({ ...formData, typeWorkId: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Chọn loại hình</option>
                                    {typeWorks.map((typeWork) => (
                                        <option key={typeWork.id} value={typeWork.id}>
                                            {typeWork.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Ngày gia nhập *</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.joinDate}
                                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2 border border-border-light dark:border-border-dark rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">person</span>
                                    Thông tin cá nhân
                                </h3>
                            </div>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Họ và tên</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Giới tính</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.gender ? "Nam" : "Nữ"}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ngày sinh</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{formatDate(employee?.dateOfBirth)}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Quốc tịch</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.nationality}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">CCCD/CMND</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.identityNumber}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Mã số thuế</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.taxCode}</dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Địa chỉ thường trú</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.address}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">contact_phone</span>
                                    Thông tin liên hệ
                                </h3>
                            </div>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email công việc</dt>
                                    <dd className="mt-1 text-sm font-semibold text-primary">{employee?.workEmail}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email cá nhân</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.email}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Số điện thoại</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.phone}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Liên hệ khẩn cấp</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.emergencyContactName} - {formatPhoneNumber(employee?.emergencyContactPhone)}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">account_balance</span>
                                    Thông tin ngân hàng
                                </h3>
                            </div>
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ngân hàng</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.bankName}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Số tài khoản</dt>
                                    <dd className="mt-1 flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                                            {formatBankAccount(employee?.bankAccountNumber)}
                                        </span>
                                        <button
                                            onClick={() => setShowBankAccount(!showBankAccount)}
                                            className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                                            title={showBankAccount ? "Ẩn số tài khoản" : "Hiện số tài khoản"}
                                        >
                                            <span className="material-icons-outlined text-sm">
                                                {showBankAccount ? "visibility_off" : "visibility"}
                                            </span>
                                        </button>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tên chủ tài khoản</dt>
                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{employee?.bankAccountHolderName}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <div className="space-y-6 lg:col-span-1">
                        <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">work</span>
                                Thông tin công việc
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Loại hình</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{employee?.typeWork?.name}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Ngày chính thức</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(employee?.joinDate)}</span>
                                </div>
                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Thâm niên</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{calculateTenure(employee?.joinDate)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Văn phòng</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{employee?.supplier?.name}</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                            <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">description</span>
                                Hợp đồng hiện tại
                            </h3>
                            <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-red-100 text-red-600 p-2 rounded-lg">
                                        <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="truncate text-sm font-bold text-gray-900 dark:text-white">HDLD-2023-056.pdf</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Hợp đồng lao động không xác định thời hạn</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-green-600 font-medium">Đã ký ngày 12/07/2023</span>
                                    <a className="text-primary hover:underline" href="#">Tải về</a>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-sm border border-border-light dark:border-border-dark">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">history</span>
                                    Lịch sử
                                </h3>
                                <a className="text-xs font-medium text-primary hover:underline" href="#">Xem tất cả</a>
                            </div>
                            <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-3 space-y-8">

                                <div className="relative ml-6">
                                    <span className="absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-blue-500 dark:border-gray-900"></span>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Thăng chức Senior Engineer</h4>
                                    <p className="text-xs text-gray-500 mt-1">01/01/2023</p>
                                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">Được bổ nhiệm vị trí mới sau đánh giá hiệu suất năm 2022.</p>
                                </div>

                                <div className="relative ml-6">
                                    <span className="absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-gray-300 dark:border-gray-900 dark:bg-gray-600"></span>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Ký hợp đồng chính thức</h4>
                                    <p className="text-xs text-gray-500 mt-1">12/07/2021</p>
                                </div>

                                <div className="relative ml-6">
                                    <span className="absolute -left-[33px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-gray-300 dark:border-gray-900 dark:bg-gray-600"></span>
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Gia nhập công ty</h4>
                                    <p className="text-xs text-gray-500 mt-1">12/05/2021</p>
                                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">Vị trí: Software Engineer (Thử việc)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployDetail;
