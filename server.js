require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");
const { Telegraf } = require("telegraf");
const axios = require("axios");

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Initialize Telegram bot
const bot = new Telegraf(process.env.BOT_TOKEN);
const CHAT_ID = process.env.CHAT_ID;
const BOT_TOKEN = process.env.BOT_TOKEN;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/overlay", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "overlay.html"));
});

// Helper function to get file URL from Telegram
async function getFileUrl(fileId) {
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`
    );
    if (
      response.data &&
      response.data.result &&
      response.data.result.file_path
    ) {
      return `https://api.telegram.org/file/bot${BOT_TOKEN}/${response.data.result.file_path}`;
    }
    return null;
  } catch (error) {
    console.error("Error getting file URL:", error.message);
    return null;
  }
}

// Socket connection
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Telegram bot message handler
bot.on("message", async (ctx) => {
  // Only process messages from the specified chat
  if (ctx.chat.id.toString() === CHAT_ID) {
    const message = {
      id: ctx.message.message_id,
      text: ctx.message.text || "",
      from: ctx.message.from.first_name,
      date: new Date(ctx.message.date * 1000).toISOString(),
      type: "text",
    };

    // Handle different message types
    if (ctx.message.photo) {
      message.type = "photo";
      const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
      message.fileId = fileId;
      message.fileUrl = await getFileUrl(fileId);
      message.caption = ctx.message.caption || "";
    } else if (ctx.message.sticker) {
      message.type = "sticker";
      const fileId = ctx.message.sticker.file_id;
      message.fileId = fileId;
      message.fileUrl = await getFileUrl(fileId);
    } else if (ctx.message.animation) {
      message.type = "animation";
      const fileId = ctx.message.animation.file_id;
      message.fileId = fileId;
      message.fileUrl = await getFileUrl(fileId);
      message.caption = ctx.message.caption || "";
    }

    // Emit the message to all connected clients
    io.emit("new-message", message);
    console.log("New message:", message);
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Overlay available at: http://localhost:${PORT}/overlay`);
});

// Start the bot
bot.launch().catch((err) => {
  console.error("Error starting Telegram bot:", err);
});

console.log("Telegram bot started");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
