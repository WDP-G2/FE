# Coding Rules (FE)

## Styling
- Dùng Tailwind utility để style cho component React (layout, spacing, typography, colors).
- Giữ các biến theme (CSS variables như `--bg`, `--text`, ...) trong `src/index.css`.
- Hạn chế viết CSS “component-level” trong file `.css` riêng; chỉ dùng khi cần (animation/legacy style khó chuyển).

## React code
- Viết component dạng function, ưu tiên hooks.
- Giữ JSX dễ đọc: tách component con khi file quá dài hoặc logic UI phức tạp.
- Dùng HTML/ARIA đúng ngữ nghĩa (ví dụ `button`, `section`, `alt` cho ảnh khi có ý nghĩa).

## Tailwind habits
- Tránh arbitrary values khi không cần (ví dụ dùng `p-4`, `gap-6` thay vì `p-[17px]`).
- Nếu có class dài, cân nhắc tách thành biến/const (nhưng không lạm dụng).

## Imports
- Import từ ngoài trước, import nội bộ sau; import CSS ở đầu file.
- Dùng alias `@/` trỏ tới `src/` (ví dụ `import { apiClient } from '@/api'`).

## Cấu trúc thư mục `src/`

```
src/
├── api/          # HTTP client (fetch), gọi endpoint thô
├── services/     # Business logic, gọi api theo domain (userService, ...)
├── pages/        # Màn hình / route page
├── components/   # UI tái sử dụng (ui/, layout/)
├── hooks/        # Custom React hooks (useApi, ...)
├── utils/        # Hàm tiện ích (HttpError, format, ...)
├── constants/    # Hằng số (API_ENDPOINTS, ROUTES)
├── config/       # Cấu hình env (API_BASE_URL)
├── contexts/     # React Context providers
└── assets/       # Ảnh, icon tĩnh
```

**Luồng gọi API:** `Page/Component` → `hook` (tuỳ chọn) → `service` → `api/client` → backend.

