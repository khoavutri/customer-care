# TourBot

Trợ lý hỏi đáp du lịch dùng RAG (Retrieval‑Augmented Generation). Tập trung vào trải nghiệm hỏi đáp và gợi ý lịch trình từ dữ liệu đã nạp.

## Demo

* Live: [https://tourbot.site](https://tourbot.site)

## Yêu cầu hệ thống

* Node.js ≥ 18
* MongoDB (Atlas Vector Search hoặc MongoDB local)
* API key cho LLM (Perplexity)

## Cấu trúc thư mục (tham khảo)

```
root/
  server/   # Express + RAG API
  client/   # React + Vite (client)
```

## Cài đặt & chạy nhanh (Development)

1. Clone & cài đặt

```bash
git clone <repo-url>
cd <repo-name>

# Cài đặt API và Client
npm run i:all
```

2. Biến môi trường

**server/.env**

```bash
PORT=3000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/?retryWrites=true&w=majority
JWT_SECRET=<your-secret>
PERPLEXITY_KEY=<your-api-key>
```

3. Chạy dự án

```bash
# Từ thư mục gốc
npm start
```

Mặc định truy cập: [http://localhost:3000](http://localhost:3000)

## Ghi chú

* Production: tự cấu hình build/deploy theo nhu cầu (Docker, PM2, Vercel, v.v.).
* Cập nhật lại `<repo-url>` và các biến `.env` cho phù hợp môi trường sử dụng.
