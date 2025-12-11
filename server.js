const { createServer } = require("node:http");
const { parse } = require("node:url");
const next = require("next");
const { Server: SocketIOServer } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // Initialize Socket.io
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: dev ? "http://localhost:3000" : false,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket.io event handlers
  io.on("connection", (socket) => {
    console.log(`[Socket.io] User connected: ${socket.id}`);

    // Join user to their personal room
    socket.on("join-user-room", (userId) => {
      socket.join(`user:${userId}`);
      console.log(`[Socket.io] User ${userId} joined their room`);
    });

    // Handle routine progress updates
    socket.on("routine-progress", (data) => {
      socket.to(`user:${data.userId}`).emit("routine-progress-update", data);
    });

    // Handle task completion
    socket.on("task-completed", (data) => {
      io.to(`user:${data.userId}`).emit("task-status-change", data);
    });

    // Handle new routine creation
    socket.on("routine-created", (data) => {
      io.to(`user:${data.userId}`).emit("new-routine", data);
    });

    // Handle playlist updates
    socket.on("playlist-updated", (data) => {
      io.to(`user:${data.userId}`).emit("playlist-change", data);
    });

    // Realtime chat/conversation
    socket.on("send-message", (data) => {
      const { userId, message, timestamp, type } = data;

      // Broadcast to user's room
      io.to(`user:${userId}`).emit("new-message", {
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
        // Simulate AI response (replace with actual AI integration)
        setTimeout(() => {
          const responses = [
            "Great question! I'm here to help you optimize your learning journey.",
            "Based on your progress, I'd recommend focusing on consistency rather than speed.",
            "Your learning streak is impressive! Keep up the excellent work.",
            "Would you like me to suggest some study techniques for better retention?",
            "I noticed you've completed several videos today. How are you feeling about the content?",
          ];

          const randomResponse =
            responses[Math.floor(Math.random() * responses.length)];

          io.to(`user:${userId}`).emit("ai-response", {
            conversationId,
            response: randomResponse,
            timestamp: new Date().toISOString(),
          });

          io.to(`user:${userId}`).emit("ai-typing", {
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

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.io server running on the same port`);
    });
});
