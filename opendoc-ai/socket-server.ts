import { createServer } from "http";
import { Server } from "socket.io";
import { Client } from "ssh2";
import * as dotenv from "dotenv";
import path from "path";

// Nạp các biến môi trường từ file .env
const environment = process.env.NODE_ENV || "development";

// Chọn file .env tương ứng
const envFileName =
  environment === "production" ? ".env.production" : ".env.local";

// Nạp file .env với đường dẫn tuyệt đối từ thư mục gốc của project
dotenv.config({ path: path.resolve(process.cwd(), envFileName) });

const port = 3001; // Port riêng cho Socket.io Bridge
const server = createServer();

// Lấy danh sách origin cho phép từ biến môi trường
const allowedOrigins = [
  "http://localhost:3000", 
  "http://127.0.0.1:3000",
  process.env.NEXT_PUBLIC_SITE_URL,
  "https://opendoc.ngobatai.dev" // Tên miền của bạn
].filter(Boolean) as string[];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log(">>> [Socket] Client connected:", socket.id);

  const conn = new Client();

  socket.on("ssh-connect", (config) => {
    console.log(`>>> [SSH] Attempting connection to ${config.host}...`);

    // 1. Lấy Key gốc từ file .env
    const rawKey = process.env.SSH_PRIVATE_KEY || "";

    conn
      .on("ready", () => {
        console.log(">>> [SSH] Connection ready");
        socket.emit("ssh-ready");

        conn.shell((err, stream) => {
          if (err) {
            console.error(">>> [SSH] Shell error:", err.message);
            socket.emit("ssh-error", err.message);
            return;
          }

          socket.on("terminal-input", (data) => {
            stream.write(data);
          });

          stream.on("data", (data: Buffer) => {
            socket.emit("terminal-output", data.toString());
          });

          stream.on("close", () => {
            console.log(">>> [SSH] Stream closed");
            conn.end();
            socket.disconnect();
          });
        });
      })
      .on("error", (err) => {
        console.error(">>> [SSH] Connection error:", err.message);
        socket.emit("ssh-error", err.message);
      })
      .connect({
        host: config.host,
        port: 22,
        username: config.username, // Thường là 'root'
        privateKey: rawKey, // Đã dùng key chuẩn hóa từ .env
      });
  });

  socket.on("disconnect", () => {
    console.log(">>> [Socket] Client disconnected");
    conn.end();
  });
});

server.listen(port, () => {
  console.log(`\n================================================`);
  console.log(`🚀 Socket.io SSH Bridge is running on:`);
  console.log(`👉 http://localhost:${port}`);
  console.log(`================================================\n`);
});
