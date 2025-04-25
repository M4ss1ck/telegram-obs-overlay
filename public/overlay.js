document.addEventListener("DOMContentLoaded", () => {
  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const theme =
    urlParams.get("theme") || localStorage.getItem("theme") || "dark";
  const maxMessages = parseInt(
    urlParams.get("maxMessages") || localStorage.getItem("max-messages") || 5
  );
  const displayTime =
    parseInt(
      urlParams.get("displayTime") || localStorage.getItem("display-time") || 10
    ) * 1000;

  // Apply theme
  const container = document.getElementById("messages-container");
  container.className = `theme-${theme}`;

  // Connect to WebSocket server
  const socket = io();

  // Store active messages
  let messages = [];

  // WebSocket event handlers
  socket.on("connect", () => {
    console.log("Connected to server");
  });

  socket.on("new-message", (message) => {
    displayMessage(message);
  });

  // Function to display a message
  function displayMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.dataset.id = message.id;

    // Create message header
    const messageHeader = document.createElement("div");
    messageHeader.classList.add("message-header");

    const senderName = document.createElement("span");
    senderName.classList.add("sender-name");
    senderName.textContent = message.from;

    const messageTime = document.createElement("span");
    messageTime.classList.add("message-time");
    messageTime.textContent = new Date(message.date).toLocaleTimeString();

    messageHeader.appendChild(senderName);
    messageHeader.appendChild(messageTime);
    messageElement.appendChild(messageHeader);

    // Handle different message types
    if (message.type === "text") {
      const messageText = document.createElement("div");
      messageText.classList.add("message-text");
      messageText.textContent = message.text;
      messageElement.appendChild(messageText);
    } else if (message.type === "photo") {
      if (message.caption) {
        const captionText = document.createElement("div");
        captionText.classList.add("message-text");
        captionText.textContent = message.caption;
        messageElement.appendChild(captionText);
      }

      if (message.fileUrl) {
        const image = document.createElement("img");
        image.classList.add("message-image");
        image.src = message.fileUrl;
        image.alt = message.caption || "Image";
        messageElement.appendChild(image);
      } else {
        const placeholder = document.createElement("div");
        placeholder.classList.add("message-text");
        placeholder.textContent = "[Image]";
        messageElement.appendChild(placeholder);
      }
    } else if (message.type === "sticker") {
      if (message.fileUrl) {
        const sticker = document.createElement("img");
        sticker.classList.add("message-sticker");
        sticker.src = message.fileUrl;
        sticker.alt = "Sticker";
        messageElement.appendChild(sticker);
      } else {
        const placeholder = document.createElement("div");
        placeholder.classList.add("message-text");
        placeholder.textContent = "[Sticker]";
        messageElement.appendChild(placeholder);
      }
    } else if (message.type === "animation") {
      if (message.caption) {
        const captionText = document.createElement("div");
        captionText.classList.add("message-text");
        captionText.textContent = message.caption;
        messageElement.appendChild(captionText);
      }

      if (message.fileUrl) {
        const video = document.createElement("video");
        video.classList.add("message-animation");
        video.src = message.fileUrl;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        messageElement.appendChild(video);
      } else {
        const placeholder = document.createElement("div");
        placeholder.classList.add("message-text");
        placeholder.textContent = "[Animation]";
        messageElement.appendChild(placeholder);
      }
    }

    // Add message to container
    container.appendChild(messageElement);

    // Add to messages array
    messages.push({
      element: messageElement,
      id: message.id,
      timer: setTimeout(() => {
        removeMessage(message.id);
      }, displayTime),
    });

    // Remove oldest message if we exceed maxMessages
    if (messages.length > maxMessages) {
      const oldestMessage = messages.shift();
      clearTimeout(oldestMessage.timer);
      removeMessage(oldestMessage.id);
    }
  }

  // Function to remove a message
  function removeMessage(id) {
    const index = messages.findIndex((m) => m.id === id);
    if (index !== -1) {
      const { element } = messages[index];

      // Add exiting class for animation
      element.classList.add("exiting");

      // Remove element after animation
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      }, 500);

      // Remove from messages array
      messages.splice(index, 1);
    }
  }

  // Demo messages for preview mode
  if (urlParams.get("preview") === "true") {
    const demoMessages = [
      {
        id: 1,
        text: "Hello everyone! This is a preview of the Telegram OBS overlay.",
        from: "John Doe",
        date: new Date().toISOString(),
        type: "text",
      },
      {
        id: 2,
        text: "You can customize the theme, maximum messages, and display time in the settings.",
        from: "Jane Smith",
        date: new Date().toISOString(),
        type: "text",
      },
      {
        id: 3,
        text: "The messages will automatically disappear after the specified time.",
        from: "Bob Johnson",
        date: new Date().toISOString(),
        type: "text",
      },
    ];

    // Display demo messages with a delay
    demoMessages.forEach((message, index) => {
      setTimeout(() => {
        displayMessage(message);
      }, index * 1000);
    });
  }
});
