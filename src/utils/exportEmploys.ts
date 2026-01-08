import * as XLSX from "xlsx";

export const exportEmployeesToExcel = (employees: any[]) => {
    if (!employees || employees.length === 0) return;

    const data = employees.map((emp) => ({
        "ID": emp.employeeId,
        "Họ tên": emp.name,
        "Email": emp.email,
        "SĐT": emp.phone,
        "Công ty": emp.company?.name,
        "Đội / Supplier": emp.supplier?.name,
        "Chức vụ": emp.position?.name,
        "Hình thức làm việc": emp.typeWork?.name,
        "Ngày vào làm": emp.joinDate,
        "Giới tính": emp.gender ? "Nam" : "Nữ",
        "Quốc tịch": emp.nationality,
        "Ngày sinh": emp.dateOfBirth,
        "CCCD": emp.identityNumber,
        "MST": emp.taxCode,
        "Email công việc": emp.workEmail,
        "Ngân hàng": emp.bankName,
        "Số tài khoản": emp.bankAccountNumber,
        "Chủ tài khoản": emp.bankAccountHolderName,
        "Người liên hệ khẩn cấp": emp.emergencyContactName,
        "SĐT khẩn cấp": emp.emergencyContactPhone,
        "Trạng thái online": emp.online ? "Online" : "Offline"
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Danh sách nhân viên"
    );

    XLSX.writeFile(
        workbook,
        `nhan_vien_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
};
