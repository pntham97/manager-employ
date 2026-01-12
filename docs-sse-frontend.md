## Hướng dẫn Frontend - SSE Realtime Notifications

### 📋 Tổng quan

Backend cung cấp Server-Sent Events (SSE) để nhận thông báo realtime về:
- **History Schedule**: Thông báo khi có yêu cầu mới cần duyệt hoặc bị xóa  
  - Endpoint frontend gọi (qua `VITE_API_BASE_URL`): `/realtime/history-schudule/stream`
- **Employee Status**: Thông báo về trạng thái online/offline của nhân viên  
  - Endpoint frontend gọi (qua `VITE_API_BASE_URL`): `/realtime/employee-status/stream`

### 🔑 Điểm quan trọng

#### 1. Authorization Header - BẮT BUỘC

**EventSource** mặc định **KHÔNG** hỗ trợ custom headers, nên **bắt buộc** dùng:
- `event-source-polyfill` (đã được sử dụng trong project), hoặc
- `fetch` + `ReadableStream` nếu cần tuỳ biến sâu hơn.

Trong project hiện tại, token được lấy qua `tokenService.getAccessToken()` trong `src/utils/token.ts` và được gắn vào header:

```ts
import { EventSourcePolyfill } from "event-source-polyfill";
import { tokenService } from "../utils/token";

const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "";
const streamUrl = `${baseUrl}/realtime/history-schudule/stream`;

const token = tokenService.getAccessToken();

const historyStream = new EventSourcePolyfill(streamUrl, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

Ví dụ mở **hai stream** cùng lúc:

```ts
import { EventSourcePolyfill } from "event-source-polyfill";
import { tokenService } from "../utils/token";

const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "";
const token = tokenService.getAccessToken();

// 1. History Schedule Stream
const historyStream = new EventSourcePolyfill(
  `${baseUrl}/realtime/history-schudule/stream`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

// 2. Employee Status Stream
const employeeStatusStream = new EventSourcePolyfill(
  `${baseUrl}/realtime/employee-status/stream`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
```

#### 2. Event names & data

- `connected`: gửi ngay sau khi kết nối thành công.
- `heartbeat`: gửi mỗi 1 phút để giữ kết nối, data `"ping"`.
- `newHistorySchudule`: gửi khi có yêu cầu schedule mới cần duyệt, data là JSON `HistorySchuduleResponse`.
- `deleteHistorySchudule`: gửi khi 1 yêu cầu bị xoá (đã duyệt/từ chối/hủy), data là `historyId` (number).
- `employeeStatus`: gửi khi trạng thái online/offline của nhân viên thay đổi, data là JSON `EmployeeStatusNotification`.

Ví dụ lắng nghe:

```ts
historyStream.addEventListener("newHistorySchudule", (e: MessageEvent) => {
  const data = JSON.parse(e.data);
  // Cập nhật danh sách chờ duyệt
});

historyStream.addEventListener("deleteHistorySchudule", (e: MessageEvent) => {
  const historyId = Number(e.data);
  // Xoá phần tử khỏi UI
});

employeeStatusStream.addEventListener("employeeStatus", (e: MessageEvent) => {
  const data = JSON.parse(e.data);
  // Cập nhật trạng thái online/offline của nhân viên
});
```

#### 3. Error handling & 401 Unauthorized

```ts
historyStream.onerror = (err: any) => {
  const status = err?.status || err?.target?.status;

  if (status === 401) {
    // Token hết hạn hoặc không hợp lệ:
    // - Thử refresh token (qua authApi/axios interceptors)
    // - Nếu thất bại thì redirect /login
  } else {
    // Lỗi mạng, timeout, ... => có thể retry theo chiến lược reconnect
  }
};
```

Trong code hiện có (`SidebarLeft`, `ScheduleApproval`, `ManagerEmploy`), khi gặp lỗi không phải 401 sẽ:
- Đóng kết nối hiện tại
- Thử reconnect tối đa N lần (mặc định 5) với delay (mặc định 3000 ms).

#### 4. Reconnection strategy (đã áp dụng trong code)

- Đếm số lần reconnect (`reconnectAttempts`).
- Giới hạn `maxReconnectAttempts`.
- Dùng `setTimeout` để reconnect sau một khoảng delay.
- Nếu vượt quá số lần cho phép thì log lỗi và dừng reconnect.

#### 5. Cleanup khi component unmount

Tất cả nơi mở SSE đều cần:
- Gọi `es.close()` trong `useEffect` cleanup.
- Huỷ `setTimeout` nếu có (clear reconnect timer).

Mẫu chuẩn trong project:

```ts
useEffect(() => {
  let es: EventSourcePolyfill | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

  const connectSSE = () => {
    // khởi tạo es = new EventSourcePolyfill(...)
  };

  connectSSE();

  return () => {
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (es) es.close();
  };
}, []);
```

#### 6. Quyền truy cập & phân quyền

- Chỉ **ADMIN** và **MANAGER** được phép subscribe:
  - `/realtime/history-schudule/stream`
  - `/realtime/employee-status/stream`
- Frontend đang kiểm tra quyền bằng cách đọc `localStorage.getItem("user")` và xem `role` trước khi tạo SSE.

### Checklist cho Frontend

- [x] Sử dụng `EventSourcePolyfill` thay vì `EventSource` mặc định.
- [x] Gửi `Authorization: Bearer <token>` trong headers (qua `tokenService.getAccessToken()`).
- [x] Xử lý lỗi 401 (token hết hạn) ở tầng HTTP (axios + refresh token), SSE dừng reconnect khi 401.
- [x] Đóng connection và clear timeout khi component unmount.
- [x] Tạo **2 connections riêng** nếu cần cả hai streams: history schedule + employee status.

