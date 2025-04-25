document.addEventListener("DOMContentLoaded", () => {
  // --- Fetch and display bot username ---
  const botUsernameElements = document.querySelectorAll(
    "#bot-username, .bot-username-inline"
  );
  fetch("/api/bot-info")
    .then((response) => response.json())
    .then((data) => {
      const username = data.username
        ? `@${data.username}`
        : "Error loading username";
      botUsernameElements.forEach((el) => (el.textContent = username));
    })
    .catch((error) => {
      console.error("Error fetching bot info:", error);
      botUsernameElements.forEach(
        (el) => (el.textContent = "Error loading username")
      );
    });
  // --- End Bot Username ---

  // Set the overlay URL
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  const overlayUrl = `${protocol}//${hostname}:${port}/overlay`;

  const overlayUrlInput = document.getElementById("overlay-url");
  overlayUrlInput.value = overlayUrl;

  // Copy button functionality
  const copyBtn = document.getElementById("copy-btn");
  copyBtn.addEventListener("click", () => {
    overlayUrlInput.select();
    document.execCommand("copy");

    // Show feedback
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  });

  // Tab switching
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons and tabs
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((t) => t.classList.remove("active"));

      // Add active class to clicked button and corresponding tab
      btn.classList.add("active");
      const tabId = `${btn.getAttribute("data-tab")}-tab`;
      document.getElementById(tabId).classList.add("active");
    });
  });

  // Color picker opacity sliders
  document.getElementById("bg-opacity").addEventListener("input", function () {
    document.getElementById("bg-opacity-value").textContent = `${this.value}%`;
  });

  document
    .getElementById("message-opacity")
    .addEventListener("input", function () {
      document.getElementById(
        "message-opacity-value"
      ).textContent = `${this.value}%`;
    });

  // Preset theme cards
  const presetCards = document.querySelectorAll(".preset-card");
  presetCards.forEach((card) => {
    card.addEventListener("click", () => {
      presetCards.forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");

      const preset = card.getAttribute("data-preset");
      document.getElementById("theme").value = preset;

      // Reset custom colors checkbox
      document.getElementById("use-custom-colors").checked = false;

      // Apply the preset colors to the color pickers
      if (presetColors[preset]) {
        const colors = presetColors[preset];
        document.getElementById("background-color").value = colors.bg;
        document.getElementById("bg-opacity").value = colors.bgOpacity;
        document.getElementById(
          "bg-opacity-value"
        ).textContent = `${colors.bgOpacity}%`;

        document.getElementById("message-bg-color").value = colors.msgBg;
        document.getElementById("message-opacity").value = colors.msgOpacity;
        document.getElementById(
          "message-opacity-value"
        ).textContent = `${colors.msgOpacity}%`;

        document.getElementById("text-color").value = colors.text;
        document.getElementById("name-color").value = colors.name;
      }

      // Update overlay URL and preview immediately
      document.getElementById("overlay-url").value = generateOverlayUrl();
      updatePreview();
    });
  });

  // Color preset values - keep background color transparent but customize message colors
  const presetColors = {
    dark: {
      bg: "#1e1e1e",
      bgOpacity: 0, // Always transparent
      msgBg: "#3c3c3c",
      msgOpacity: 80,
      text: "#ffffff",
      name: "#ffffff",
    },
    light: {
      bg: "#f0f0f0",
      bgOpacity: 0, // Always transparent
      msgBg: "#ffffff",
      msgOpacity: 90,
      text: "#333333",
      name: "#333333",
    },
    transparent: {
      bg: "#000000",
      bgOpacity: 0, // Always transparent
      msgBg: "#000000",
      msgOpacity: 50,
      text: "#ffffff",
      name: "#ffffff",
    },
    purple: {
      bg: "#2e1065",
      bgOpacity: 0, // Always transparent
      msgBg: "#53319c",
      msgOpacity: 80,
      text: "#ffffff",
      name: "#d8bfff",
    },
    green: {
      bg: "#003024",
      bgOpacity: 0, // Always transparent
      msgBg: "#005c4b",
      msgOpacity: 80,
      text: "#ffffff",
      name: "#a7f3d0",
    },
    gaming: {
      bg: "#000000",
      bgOpacity: 0, // Always transparent
      msgBg: "#141414",
      msgOpacity: 90,
      text: "#00ff00",
      name: "#00ffff",
    },
  };

  // Apply settings button
  const applySettingsBtn = document.getElementById("apply-settings");
  applySettingsBtn.addEventListener("click", () => {
    const chatId = document.getElementById("chat-id").value.trim();
    const maxMessages = document.getElementById("max-messages").value;
    const displayTime = document.getElementById("display-time").value;
    const keepMessages = document.getElementById("keep-messages").checked;
    const theme = document.getElementById("theme").value;
    const useCustomColors =
      document.getElementById("use-custom-colors").checked;

    // Store base settings in localStorage
    localStorage.setItem("chat-id", chatId);
    localStorage.setItem("max-messages", maxMessages);
    localStorage.setItem("display-time", displayTime);
    localStorage.setItem("theme", theme);
    localStorage.setItem("keepMessages", keepMessages);
    localStorage.setItem("useCustomColors", useCustomColors);

    // Store custom colors if used
    if (useCustomColors) {
      const backgroundColor = "rgba(0, 0, 0, 0)";
      const msgBgColor = document.getElementById("message-bg-color").value;
      const msgOpacity = document.getElementById("message-opacity").value;
      const messageBgColor = convertToRgba(msgBgColor, msgOpacity);
      const textColor = document.getElementById("text-color").value;
      const nameColor = document.getElementById("name-color").value;
      localStorage.setItem("backgroundColor", backgroundColor);
      localStorage.setItem("messageBgColor", messageBgColor);
      localStorage.setItem("textColor", textColor);
      localStorage.setItem("nameColor", nameColor);
    } else {
      // Clear custom colors from localStorage if using a theme
      localStorage.removeItem("backgroundColor");
      localStorage.removeItem("messageBgColor");
      localStorage.removeItem("textColor");
      localStorage.removeItem("nameColor");
    }

    // Generate the full URL for the overlay
    const fullOverlayUrl = generateOverlayUrl();
    document.getElementById("overlay-url").value = fullOverlayUrl;

    // Update preview frame src with the preview version of the URL
    updatePreview();

    // Show feedback
    const originalText = applySettingsBtn.textContent;
    applySettingsBtn.textContent = "Settings Applied!";
    setTimeout(() => {
      applySettingsBtn.textContent = originalText;
    }, 2000);
  });

  // Helper function to convert hex to rgba
  function convertToRgba(hex, opacity) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  }

  // Apply theme presets to color pickers
  document.getElementById("theme").addEventListener("change", function () {
    const theme = this.value;
    if (presetColors[theme]) {
      const colors = presetColors[theme];
      document.getElementById("background-color").value = colors.bg;
      document.getElementById("bg-opacity").value = colors.bgOpacity;
      document.getElementById(
        "bg-opacity-value"
      ).textContent = `${colors.bgOpacity}%`;

      document.getElementById("message-bg-color").value = colors.msgBg;
      document.getElementById("message-opacity").value = colors.msgOpacity;
      document.getElementById(
        "message-opacity-value"
      ).textContent = `${colors.msgOpacity}%`;

      document.getElementById("text-color").value = colors.text;
      document.getElementById("name-color").value = colors.name;

      // Update preset selection
      presetCards.forEach((card) => {
        card.classList.remove("selected");
        if (card.getAttribute("data-preset") === theme) {
          card.classList.add("selected");
        }
      });

      // Set custom colors checkbox to false when theme is selected
      document.getElementById("use-custom-colors").checked = false;

      // Update overlay URL and preview immediately
      document.getElementById("overlay-url").value = generateOverlayUrl();
      updatePreview();
    }
  });

  // Load settings from localStorage if available
  const loadSettings = () => {
    const savedChatId = localStorage.getItem("chat-id");
    const savedMaxMessages = localStorage.getItem("max-messages");
    const savedDisplayTime = localStorage.getItem("display-time");
    const savedTheme = localStorage.getItem("theme");
    const savedKeepMessages = localStorage.getItem("keepMessages");
    const savedUseCustomColors = localStorage.getItem("useCustomColors");

    if (savedChatId) {
      document.getElementById("chat-id").value = savedChatId;
    }

    if (savedMaxMessages) {
      document.getElementById("max-messages").value = savedMaxMessages;
    }

    if (savedDisplayTime) {
      document.getElementById("display-time").value = savedDisplayTime;
    }

    if (savedKeepMessages === "true") {
      document.getElementById("keep-messages").checked = true;
    }

    // Set the custom colors checkbox state based on localStorage
    if (savedUseCustomColors === "true") {
      document.getElementById("use-custom-colors").checked = true;
    } else {
      document.getElementById("use-custom-colors").checked = false;
    }

    // Load theme selection
    if (savedTheme) {
      document.getElementById("theme").value = savedTheme;

      // Select the matching preset card
      presetCards.forEach((card) => {
        card.classList.remove("selected");
        if (card.getAttribute("data-preset") === savedTheme) {
          card.classList.add("selected");
        }
      });
    }

    // Apply either theme colors or custom colors
    if (savedUseCustomColors === "true") {
      // Load custom colors
      const backgroundColor = localStorage.getItem("backgroundColor");
      const messageBgColor = localStorage.getItem("messageBgColor");
      const textColor = localStorage.getItem("textColor");
      const nameColor = localStorage.getItem("nameColor");

      if (messageBgColor) {
        const [color, opacity] = parseColorAndOpacity(messageBgColor);
        document.getElementById("message-bg-color").value = color;
        document.getElementById("message-opacity").value = opacity;
        document.getElementById(
          "message-opacity-value"
        ).textContent = `${opacity}%`;
      }

      if (textColor) {
        document.getElementById("text-color").value = textColor;
      }

      if (nameColor) {
        document.getElementById("name-color").value = nameColor;
      }

      if (backgroundColor) {
        const [color, opacity] = parseColorAndOpacity(backgroundColor);
        document.getElementById("background-color").value = color;
        // Background is always transparent for OBS
        document.getElementById("bg-opacity").value = 0;
        document.getElementById("bg-opacity-value").textContent = "0%";
      }
    } else if (savedTheme && presetColors[savedTheme]) {
      // Apply theme colors to color pickers
      const colors = presetColors[savedTheme];
      document.getElementById("background-color").value = colors.bg;
      document.getElementById("bg-opacity").value = colors.bgOpacity;
      document.getElementById(
        "bg-opacity-value"
      ).textContent = `${colors.bgOpacity}%`;

      document.getElementById("message-bg-color").value = colors.msgBg;
      document.getElementById("message-opacity").value = colors.msgOpacity;
      document.getElementById(
        "message-opacity-value"
      ).textContent = `${colors.msgOpacity}%`;

      document.getElementById("text-color").value = colors.text;
      document.getElementById("name-color").value = colors.name;
    }

    // Set initial overlay URL and update preview
    document.getElementById("overlay-url").value = generateOverlayUrl();
    updatePreview();
  };

  // Parse rgba string to hex color and opacity value
  function parseColorAndOpacity(rgba) {
    const match = rgba.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      const opacity = Math.round(parseFloat(match[4]) * 100);

      // Convert RGB to hex
      const hex =
        "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
      return [`#${hex}`, opacity];
    }
    return ["#ffffff", 100];
  }

  // Helper function to generate the full overlay URL with all settings
  function generateOverlayUrl() {
    const chatId = document.getElementById("chat-id").value.trim();
    const maxMessages = document.getElementById("max-messages").value;
    const displayTime = document.getElementById("display-time").value;
    const keepMessages = document.getElementById("keep-messages").checked;
    const theme = document.getElementById("theme").value;
    const useCustomColors =
      document.getElementById("use-custom-colors").checked;

    // Base URL from current window location
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    let baseUrl = `${protocol}//${hostname}:${port}/overlay`; // Use the actual overlay path

    // Add chatId as the FIRST parameter for clarity and potential server-side routing
    let params = `?chatId=${encodeURIComponent(chatId)}`;
    params += `&maxMessages=${maxMessages}`;
    params += `&displayTime=${displayTime}`;
    params += `&keepMessages=${keepMessages}`;

    if (useCustomColors) {
      const backgroundColor = "rgba(0, 0, 0, 0)"; // Always transparent background
      const msgBgColor = document.getElementById("message-bg-color").value;
      const msgOpacity = document.getElementById("message-opacity").value;
      const messageBgColor = convertToRgba(msgBgColor, msgOpacity);
      const textColor = document.getElementById("text-color").value;
      const nameColor = document.getElementById("name-color").value;

      params += `&backgroundColor=${encodeURIComponent(backgroundColor)}`;
      params += `&messageBgColor=${encodeURIComponent(messageBgColor)}`;
      params += `&textColor=${encodeURIComponent(textColor)}`;
      params += `&nameColor=${encodeURIComponent(nameColor)}`;
      params += `&useCustomColors=true`;
    } else {
      params += `&theme=${theme}`;
      params += `&useCustomColors=false`;
    }

    return baseUrl + params;
  }

  // Update preview iframe with current settings
  function updatePreview() {
    const chatId = document.getElementById("chat-id").value.trim();
    const maxMessages = document.getElementById("max-messages").value;
    const displayTime = document.getElementById("display-time").value;
    const keepMessages = document.getElementById("keep-messages").checked;
    const useCustomColors =
      document.getElementById("use-custom-colors").checked;

    // Base preview URL includes necessary parameters for overlay.js
    let previewUrl = `/overlay?preview=true`;
    previewUrl += `&chatId=${encodeURIComponent(chatId)}`;
    previewUrl += `&maxMessages=${maxMessages}`;
    previewUrl += `&displayTime=${displayTime}`;
    previewUrl += `&keepMessages=${keepMessages}`;

    if (useCustomColors) {
      // Always use transparent background
      const backgroundColor = "rgba(0, 0, 0, 0)";

      // Get message colors
      const msgBgColor = document.getElementById("message-bg-color").value;
      const msgOpacity = document.getElementById("message-opacity").value;
      const messageBgColor = convertToRgba(msgBgColor, msgOpacity);

      const textColor = document.getElementById("text-color").value;
      const nameColor = document.getElementById("name-color").value;

      previewUrl += `&backgroundColor=${encodeURIComponent(backgroundColor)}`;
      previewUrl += `&messageBgColor=${encodeURIComponent(messageBgColor)}`;
      previewUrl += `&textColor=${encodeURIComponent(textColor)}`;
      previewUrl += `&nameColor=${encodeURIComponent(nameColor)}`;
      previewUrl += `&useCustomColors=true`;
    }

    const previewFrame = document.getElementById("preview-frame");
    if (previewFrame) {
      // Only update src if chat ID is provided, otherwise show blank
      if (chatId) {
        console.log("Updating preview with URL:", previewUrl);
        previewFrame.src = previewUrl;
      } else {
        console.log("Chat ID missing, clearing preview.");
        previewFrame.src = "about:blank";
      }
    } else {
      console.error("Preview frame element not found");
    }
  }

  // Disable background opacity slider since we always want transparent backgrounds
  document.getElementById("bg-opacity").disabled = true;
  document.getElementById("bg-opacity").value = 0;
  document.getElementById("bg-opacity-value").textContent = "0%";

  // Add a note about transparent backgrounds
  const bgLabel = document.querySelector('label[for="background-color"]');
  if (bgLabel) {
    bgLabel.innerHTML =
      "Background Color: <small>(Always transparent for OBS)</small>";
  }

  // Initialize everything
  loadSettings();
});
