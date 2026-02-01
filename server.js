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
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error("Error: BOT_TOKEN environment variable not set.");
  process.exit(1);
}

// Validate bot token format (numeric_id:alphanumeric_secret)
const TOKEN_REGEX = /^\d+:[A-Za-z0-9_-]+$/;
if (!TOKEN_REGEX.test(BOT_TOKEN)) {
  console.error(
    "Error: BOT_TOKEN format is invalid. Expected format: 123456789:ABCdefGHI...",
  );
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

let botUsername = bot.botInfo?.username;

if (!botUsername) {
  bot.telegram.getMe().then((me) => {
    botUsername = me.username;
  });
}

// Add /chatid command handler
bot.command("chatid", (ctx) => {
  // Use MarkdownV2 for formatting, ensuring special characters are escaped
  const chatId = ctx.chat.id
    .toString()
    .replace(/([\\`*_\[\]\(\)~>#+\-=|{}\.!])/g, "\\$1");
  ctx.reply(`The ID for this chat is: \`${chatId}\``, {
    parse_mode: "MarkdownV2",
  });
  console.log(`Replied with Chat ID ${ctx.chat.id} in chat ${ctx.chat.id}`);
});

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- API Endpoint for Bot Info ---
app.get("/api/bot-info", (req, res) => {
  res.json({ username: botUsername });
});
// --- End API Endpoint ---

app.get("/overlay", (req, res) => {
  // The chat ID will be passed via socket connection, not URL query for this setup
  res.sendFile(path.join(__dirname, "public", "overlay.html"));
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Helper function to get file URL from Telegram
async function getFileUrl(fileId) {
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`,
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

// --- Modified Socket Connection Logic ---
let clientsByChatId = {}; // Store sockets by chat ID

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  let subscribedChatId = null; // Keep track of the chat ID this socket is for

  // Client should send its chat ID upon connection
  socket.on("subscribe", (chatId) => {
    if (!chatId) {
      console.log(`Client ${socket.id} did not provide a chat ID.`);
      // Maybe disconnect or send an error? For now, just log.
      return;
    }
    chatId = chatId.toString(); // Ensure it's a string
    subscribedChatId = chatId;
    console.log(`Client ${socket.id} subscribed to chat ID: ${chatId}`);

    if (!clientsByChatId[chatId]) {
      clientsByChatId[chatId] = [];
    }
    clientsByChatId[chatId].push(socket);

    // Send confirmation back to client (optional)
    socket.emit("subscribed", chatId);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    if (subscribedChatId && clientsByChatId[subscribedChatId]) {
      // Remove the socket from the list for that chat ID
      clientsByChatId[subscribedChatId] = clientsByChatId[
        subscribedChatId
      ].filter((s) => s.id !== socket.id);

      // If no more clients for this chat ID, clean up the entry
      if (clientsByChatId[subscribedChatId].length === 0) {
        delete clientsByChatId[subscribedChatId];
        console.log(`No more clients for chat ID ${subscribedChatId}.`);
      }
    }
  });
});
// --- End Modified Socket Connection Logic ---

// --- Modified Telegram Bot Message Handler ---
bot.on("message", async (ctx) => {
  const chatId = ctx.chat.id.toString();
  const targetClients = clientsByChatId[chatId];

  // Only process if there are connected overlay clients for this chat
  if (targetClients && targetClients.length > 0) {
    console.log(
      `Message received from chat ${chatId}, forwarding to ${targetClients.length} clients.`,
    );
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

    // Emit the message ONLY to clients subscribed to this chat ID
    targetClients.forEach((socket) => {
      socket.emit("new-message", message);
    });

    console.log(`Forwarded message to chat ID ${chatId}:`, message);
  } else {
    // Optional: Log messages from unsubscribed chats for debugging
    // console.log(`Message received from chat ${chatId}, but no clients subscribed.`);
  }
});
// --- End Modified Message Handler ---

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Configuration page: http://localhost:${PORT}/`);
  // The overlay URL is now dynamic based on settings, generated on the config page
});

// Start the bot
console.log("Starting Telegram bot...");
bot.launch().catch((err) => {
  console.error("Error starting Telegram bot:", err.message);
  process.exit(1);
});

// Enable graceful stop
process.once("SIGINT", () => {
  console.log("SIGINT received, stopping bot...");
  bot.stop("SIGINT");
  process.exit(0); // Ensure the process exits
});
process.once("SIGTERM", () => {
  console.log("SIGTERM received, stopping bot...");
  bot.stop("SIGTERM");
  process.exit(0); // Ensure the process exits
});
