# CareerTwin — Figma Exact Frontend

Bản này thay frontend lệch layout bằng 16 frame lấy trực tiếp từ đúng node Figma đã cung cấp.

## Cách chạy trên Windows PowerShell

```powershell
npm.cmd install
npx.cmd prisma generate
npx.cmd prisma db push
npm.cmd run db:seed
npm.cmd run dev
```

`npm run dev` sẽ tự tải và cache các frame Figma vào `public/figma/` nếu máy đang có Internet. Nếu tải tạm thời thất bại, giao diện sẽ dùng URL Figma dự phòng.

Mở: `http://localhost:3000/login` hoặc `http://localhost:3000/dashboard`.

## Nguyên tắc responsive

Các frame dashboard/app được giữ nguyên hệ tọa độ 1440×1024 và chỉ scale đồng nhất theo chiều rộng trình duyệt. Không dùng grid reflow để tránh card nhảy vị trí hoặc bị bó thành cột.

## Backend

Thư mục `app/api`, `lib`, `prisma` và recommendation engine của project gốc được giữ lại. Prisma được khóa ở 6.19.3 để tương thích schema hiện tại.

## Ghi chú

Frontend hiện tại là bản **pixel-lock trực tiếp theo frame Figma** để bảo đảm kiểm tra UI 1:1 và luồng điều hướng chính. Các form nhập liệu phức tạp sẽ cần nối lại vào API sau khi UI được duyệt; backend không bị xóa.
