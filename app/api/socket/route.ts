import { NextRequest, NextResponse } from "next/server";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "node:http";

let io: SocketIOServer | undefined;

export async function GET(req: NextRequest) {
  if (!io) {
    // Create HTTP server for Socket.io
    const httpServer = createServer();
    io = new SocketIOServer(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? ["https://your-production-domain.com"]
            : ["http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // Socket.io event handlers
    io.on("connection", (socket) => {
      console.log(`[Socket.io] User connected: ${socket.id}`);

      // Join user to their personal room
      socket.on("join-user-room", (userId: string) => {
        socket.join(`user:${userId}`);
        console.log(`[Socket.io] User ${userId} joined their room`);
      });

      // Handle routine progress updates
      socket.on("routine-progress", (data) => {
        socket.to(`user:${data.userId}`).emit("routine-progress-update", data);
      });

      // Handle task completion
      socket.on("task-completed", (data) => {
        io?.to(`user:${data.userId}`).emit("task-status-change", data);
      });

      // Handle new routine creation
      socket.on("routine-created", (data) => {
        io?.to(`user:${data.userId}`).emit("new-routine", data);
      });

      // Handle playlist updates
      socket.on("playlist-updated", (data) => {
        io?.to(`user:${data.userId}`).emit("playlist-change", data);
      });

      // Realtime chat/conversation
      socket.on("send-message", (data) => {
        const { userId, message, timestamp, type } = data;

        // Broadcast to user's room (could be extended for group conversations)
        io?.to(`user:${userId}`).emit("new-message", {
          id: `msg_${Date.now()}`,
          userId,
          message,
          timestamp,
          type: type || "user",
        });
      });

      // AI assistant conversation
      socket.on("ai-conversation", async (data) => {
        const { userId, message, conversationId } = data;

        // Emit typing indicator
        socket
          .to(`user:${userId}`)
          .emit("ai-typing", { conversationId, typing: true });

        try {
          // Here you could integrate with your AI service (Gemini)
          // For now, we'll simulate an AI response
          setTimeout(() => {
            io?.to(`user:${userId}`).emit("ai-response", {
              conversationId,
              response:
                "I'm here to help with your learning journey! How can I assist you today?",
              timestamp: new Date().toISOString(),
            });

            io?.to(`user:${userId}`).emit("ai-typing", {
              conversationId,
              typing: false,
            });
          }, 1500);
        } catch (error) {
          socket.to(`user:${userId}`).emit("ai-error", {
            conversationId,
            error: "Failed to get AI response",
          });
        }
      });

      socket.on("disconnect", () => {
        console.log(`[Socket.io] User disconnected: ${socket.id}`);
      });
    });

    // Start the Socket.io server on port 3001
    const port = process.env.SOCKET_PORT || 3001;
    httpServer.listen(port, () => {
      console.log(`[Socket.io] Server running on port ${port}`);
    });
  }

  return NextResponse.json({ message: "Socket.io server initialized" });
}
