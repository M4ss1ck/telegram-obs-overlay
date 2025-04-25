document.addEventListener("DOMContentLoaded", () => {
  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const isPreview = urlParams.get("preview") === "true";

  console.log(`Overlay Mode: ${isPreview ? "Preview" : "Live"}`);

  // Remove controls if not in preview mode
  if (!isPreview) {
    const controlToggle = document.getElementById("control-toggle");
    const controlPanel = document.getElementById("overlay-controls");
    if (controlToggle) controlToggle.remove();
    if (controlPanel) controlPanel.remove();
    console.log("Controls removed for live overlay.");
  }

  // Load settings PRIMARILY from URL parameters
  const theme = urlParams.get("theme") || "dark"; // Default to dark if param missing
  const maxMessages = parseInt(urlParams.get("maxMessages") || 5);
  const displayTime = parseInt(urlParams.get("displayTime") || 10) * 1000;
  const keepMessages = urlParams.get("keepMessages") === "true";
  const useCustomColors = urlParams.get("useCustomColors") === "true";

  // Get custom colors from URL params only
  const backgroundColor = urlParams.get("backgroundColor"); // Should be transparent if set
  const messageBgColor = urlParams.get("messageBgColor");
  const textColor = urlParams.get("textColor");
  const nameColor = urlParams.get("nameColor");

  console.log("Loaded Settings from URL:", {
    theme,
    maxMessages,
    displayTime,
    keepMessages,
    useCustomColors,
    backgroundColor,
    messageBgColor,
    textColor,
    nameColor,
  });

  // Apply theme or custom colors
  const container = document.getElementById("messages-container");

  // First, remove any existing theme classes
  container.className = ""; // Clear all classes first

  if (useCustomColors && (messageBgColor || textColor || nameColor)) {
    // Apply custom colors - background is always transparent via URL param or CSS default
    container.classList.add("custom-theme");
    console.log("Applying custom theme from URL");

    // Set CSS variables for custom theme
    container.style.setProperty(
      "--background-color",
      backgroundColor || "transparent"
    );
    container.style.setProperty(
      "--message-background",
      messageBgColor || "rgba(60, 60, 60, 0.8)" // Default fallback
    );
    container.style.setProperty("--text-color", textColor || "#ffffff");
    container.style.setProperty("--name-color", nameColor || "#ffffff");

    // Clear theme class if switching to custom
    container.classList.remove(
      ...Array.from(container.classList).filter((cls) =>
        cls.startsWith("theme-")
      )
    );
  } else if (theme) {
    // Apply theme from preset - all themes have transparent backgrounds
    container.classList.add(`theme-${theme}`);
    console.log(`Applying theme from URL: ${theme}`);

    // Reset any custom style properties if switching to theme
    container.style.removeProperty("--background-color");
    container.style.removeProperty("--message-background");
    container.style.removeProperty("--text-color");
    container.style.removeProperty("--name-color");
    container.classList.remove("custom-theme");
  } else {
    // Fallback to dark theme if no theme or custom colors are set in URL
    container.classList.add("theme-dark");
    console.log("Applied fallback dark theme (URL params missing)");
  }

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
      timer: keepMessages
        ? null
        : setTimeout(() => {
            removeMessage(message.id);
          }, displayTime),
    });

    // Remove oldest message if we exceed maxMessages and not keeping all messages
    if (!keepMessages && messages.length > maxMessages) {
      const oldestMessage = messages.shift();
      if (oldestMessage.timer) {
        // Check if timer exists before clearing
        clearTimeout(oldestMessage.timer);
      }
      removeElement(oldestMessage.element); // Use helper function for removal
    }
  }

  // Function to remove a message element with animation
  function removeElement(element) {
    if (!element) return; // Guard against null element
    // Add exiting class for animation
    element.classList.add("exiting");

    // Remove element after animation
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }, 500); // Match animation duration
  }

  // Function to find and remove a message by ID
  function removeMessage(id) {
    const index = messages.findIndex((m) => m.id === id);
    if (index !== -1) {
      const { element, timer } = messages[index];
      if (timer) {
        // Clear timeout if it exists
        clearTimeout(timer);
      }
      removeElement(element); // Use helper function for removal
      // Remove from messages array
      messages.splice(index, 1);
    }
  }

  // Demo messages for preview mode
  if (isPreview) {
    // Get preset if specified
    // const preset = urlParams.get("preset"); // 'preset' param isn't strictly needed here

    // Create demo messages array
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
        text: "You can customize the theme, colors, and message display time in the settings.",
        from: "Jane Smith",
        date: new Date().toISOString(),
        type: "text",
      },
      {
        id: 3,
        text: keepMessages
          ? "Messages will stay on screen since 'Keep Messages' is enabled."
          : "Messages will disappear after the specified time.",
        from: "Bob Johnson",
        date: new Date().toISOString(),
        type: "text",
      },
    ];

    // Display demo messages with a delay
    demoMessages.forEach((message, index) => {
      setTimeout(() => {
        displayMessage(message);
      }, index * 1500); // Increased delay for better preview
    });
  }
});
