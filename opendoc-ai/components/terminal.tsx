"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { io, Socket } from "socket.io-client";
import { Icons } from "./icons";

interface TerminalProps {
  sshConfig: {
    host: string;
    username: string;
    privateKey: string;
  };
}

export function Terminal({ sshConfig }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<"connecting" | "ready" | "error" | "closed">("connecting");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize XTerm with scoped package
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: "Geist Mono, monospace",
      theme: {
        background: "#000000",
        foreground: "#00FF00",
      },
      allowProposedApi: true // Required for some addons in v6
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    
    // Important: term.open must happen BEFORE fit()
    term.open(terminalRef.current);

    let resizeFrame: number;
    const safeFit = () => {
      try {
        // Kiểm tra xem terminal đã được gắn vào DOM và có kích thước chưa
        if (terminalRef.current && terminalRef.current.offsetHeight > 0) {
          fitAddon.fit();
        } else {
          resizeFrame = requestAnimationFrame(safeFit);
        }
      } catch (e) {
        console.warn("XTerm fit error:", e);
      }
    };

    resizeFrame = requestAnimationFrame(safeFit);
    xtermRef.current = term;

    // Initialize Socket.io
    // Kết nối đến Server riêng ở port 3001
    const socketUrl = process.env.NEXT_PUBLIC_SITE_URL 
      ? process.env.NEXT_PUBLIC_SITE_URL.replace(/:\d+$/, '') + ":3001" 
      : `http://${window.location.hostname}:3001`;

    const socket = io(socketUrl, {
      reconnectionAttempts: 5,
      timeout: 10000,
      transports: ["websocket"], // Ép dùng websocket để tránh lỗi CORS khi dùng polling
    });
    
    socketRef.current = socket;

    socket.on("connect", () => {
      term.writeln("\x1b[33m>>> Connected to bridge. Initiating SSH...\x1b[0m");
      socket.emit("ssh-connect", sshConfig);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setStatus("error");
      setErrorMessage("Không thể kết nối đến máy chủ Socket.io. Hãy đảm bảo bạn đang chạy server-vps.js");
      term.writeln("\x1b[31m>>> Socket.io Connection Error. Check server console.\x1b[0m");
    });

    socket.on("ssh-ready", () => {
      setStatus("ready");
      term.clear();
      term.writeln("\x1b[32m--- VPS Connected Successfully ---\x1b[0m\r\n");
    });

    socket.on("terminal-output", (data: string) => {
      term.write(data);
    });

    socket.on("ssh-error", (err: string) => {
      setStatus("error");
      setErrorMessage(err);
      term.writeln(`\r\n\x1b[31mError: ${err}\x1b[0m`);
    });

    socket.on("disconnect", () => {
      setStatus("closed");
      term.writeln("\r\n\x1b[33mConnection closed.\x1b[0m");
    });

    term.onData((data) => {
      if (socket.connected) {
        socket.emit("terminal-input", data);
      }
    });

    const handleResize = () => {
      safeFit();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(resizeFrame);
      socket.disconnect();
      term.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [sshConfig]);

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-xl border border-border bg-black p-2 shadow-2xl">
      <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2 px-2">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${
            status === 'ready' ? 'bg-green-500 animate-pulse' : 
            status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
          <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
            Linux Terminal - {sshConfig.host}
          </span>
        </div>
        {(status === "connecting" || status === "ready") && (
          <Icons.Loader className="h-3 w-3 animate-spin text-white/50" />
        )}
      </div>
      
      {status === "error" && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-6 text-center backdrop-blur-sm">
          <Icons.Alert className="mb-4 h-12 w-12 text-red-500" />
          <h3 className="text-lg font-bold text-white">Lỗi kết nối Terminal</h3>
          <p className="mt-2 max-w-md text-sm text-red-400">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 rounded-md bg-white px-4 py-2 text-sm font-bold text-black hover:bg-white/90"
          >
            Thử lại
          </button>
        </div>
      )}
      
      <div ref={terminalRef} className="h-[calc(100%-40px)] w-full" />
    </div>
  );
}
