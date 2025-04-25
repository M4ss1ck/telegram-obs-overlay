document.addEventListener("DOMContentLoaded", () => {
  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const isPreview = urlParams.get("preview") === "true";
  const chatId = urlParams.get("chatId"); // <-- Get Chat ID

  console.log(`Overlay Mode: ${isPreview ? "Preview" : "Live"}`);
  console.log(`Target Chat ID: ${chatId || "None Provided"}`); // Log Chat ID

  if (!chatId && !isPreview) {
    // If not in preview and no chat ID, display an error and don't connect
    const container = document.getElementById("messages-container");
    container.innerHTML = `<div class="message system-message error">Error: No Chat ID provided in the Overlay URL. Please configure it on the main page.</div>`;
    console.error("Overlay Error: No Chat ID provided in URL.");
    return; // Stop execution
  }

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
    // Subscribe to the chat ID immediately after connecting
    if (chatId) {
      console.log(`Subscribing to chat ID: ${chatId}`);
      socket.emit("subscribe", chatId);
    } else if (isPreview) {
      console.log("Preview mode: Not subscribing to a specific chat ID.");
      // In preview, we might show placeholder messages instead of connecting
    }
  });

  socket.on("subscribed", (confirmedChatId) => {
    console.log(`Successfully subscribed to chat ID: ${confirmedChatId}`);
    // You could potentially display a "Connected to chat X" message here
    // If in preview mode, maybe clear any initial demo messages now?
    if (isPreview) {
      // clearDemoMessages(); // Example function if demo messages were shown initially
    }
  });

  socket.on("new-message", (message) => {
    // Clear any initial "no chat id" error message if present
    const errorMsg = document.querySelector(".system-message.error");
    if (errorMsg) errorMsg.remove();
    // Clear demo messages if they exist and we receive a real message
    if (isPreview) {
      clearDemoMessages(); // Clear demos once real data arrives
    }
    displayMessage(message);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server.");
    // Optionally display a disconnected message
    const container = document.getElementById("messages-container");
    // Avoid adding multiple disconnect messages
    if (!container.querySelector(".system-message.disconnected")) {
      const disconnectMsg = document.createElement("div");
      disconnectMsg.className = "message system-message disconnected";
      disconnectMsg.textContent = "Disconnected. Trying to reconnect...";
      // Prepend maybe? or handle differently
      container.insertBefore(disconnectMsg, container.firstChild);
    }
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

  // --- Demo messages logic ---
  let demoInterval = null; // Keep track of interval timer

  function clearDemoMessages() {
    if (demoInterval) {
      clearInterval(demoInterval);
      demoInterval = null;
    }
    const demoMsgs = document.querySelectorAll(".message.demo");
    demoMsgs.forEach((msg) => removeElement(msg)); // Use existing remove animation
    messages = messages.filter((m) => !m.isDemo); // Clear from internal array too
    console.log("Cleared demo messages.");
  }

  // Demo messages for preview mode
  if (isPreview) {
    // Clear any previous demo messages if settings are reapplied
    clearDemoMessages();

    const demoMessages = [
      {
        id: "demo1",
        text: "Hello OBS!",
        from: "Streamer",
        date: new Date().toISOString(),
        type: "text",
        isDemo: true,
      },
      {
        id: "demo2",
        text: "This is a test message.",
        from: "Viewer1",
        date: new Date().toISOString(),
        type: "text",
        isDemo: true,
      },
      {
        id: "demo3",
        fileUrl: "https://via.placeholder.com/50x50.png?text=Sticker",
        from: "Bot",
        date: new Date().toISOString(),
        type: "sticker",
        isDemo: true,
      },
      {
        id: "demo4",
        caption: "Look at this!",
        fileUrl: "https://via.placeholder.com/150x100.png?text=Image",
        from: "Viewer2",
        date: new Date().toISOString(),
        type: "photo",
        isDemo: true,
      },
    ];

    let demoIndex = 0;
    function showNextDemo() {
      // If real messages arrived, stop demos
      if (!demoInterval) return;

      // Clear old demo messages respecting maxMessages limit if keepMessages is false
      if (
        !keepMessages &&
        messages.filter((m) => m.isDemo).length >= maxMessages
      ) {
        const oldestDemo = messages.find((m) => m.isDemo);
        if (oldestDemo) {
          removeMessage(oldestDemo.id);
        }
      }

      const demoMsg = demoMessages[demoIndex % demoMessages.length];
      // Ensure unique ID for repeated demos
      displayMessage({
        ...demoMsg,
        id: `demo${Date.now()}${demoIndex}`,
        element: null,
      }); // Pass null element initially
      demoIndex++;
    }

    // Only show demo messages if a chat ID isn't provided (or always show if desired)
    //if (!chatId) { // Option 1: Show only if no real connection intended
    console.log("Preview mode: Displaying demo messages.");
    // Show first message immediately
    showNextDemo();
    // Show subsequent messages on an interval
    demoInterval = setInterval(showNextDemo, 5000); // Show a new demo every 5s
    //} else { // Option 2: Chat ID provided, wait for real messages
    //    console.log("Preview mode with Chat ID: Waiting for real messages...");
    //    const container = document.getElementById("messages-container");
    //    container.innerHTML = `<div class="message system-message">Preview Mode: Waiting for messages from Chat ID ${chatId}...</div>`;
    //}
  }
  // --- End Demo Messages Logic ---
});
