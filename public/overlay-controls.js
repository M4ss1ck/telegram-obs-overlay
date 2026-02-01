// Overlay controls logic for preview mode
document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const isPreview = urlParams.get("preview") === "true";

  if (isPreview) {
    document.body.classList.add("preview-mode");

    const controlToggle = document.getElementById("control-toggle");
    const controlPanel = document.getElementById("overlay-controls");

    // Initialize inputs from URL or localStorage
    initializeInputs();

    // Show/hide controls
    controlToggle.addEventListener("click", () => {
      if (controlPanel.style.display === "block") {
        controlPanel.style.display = "none";
        controlToggle.textContent = "Show Controls";
      } else {
        controlPanel.style.display = "block";
        controlToggle.textContent = "Hide Controls";
      }
    });

    // Handle preset buttons
    document.querySelectorAll(".preset-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const preset = btn.getAttribute("data-preset");
        applyPreset(preset);
      });
    });

    // Handle opacity sliders
    document.getElementById("bg-opacity").addEventListener("input", (e) => {
      document.getElementById(
        "bg-opacity-value"
      ).textContent = `${e.target.value}%`;
    });

    document
      .getElementById("message-opacity")
      .addEventListener("input", (e) => {
        document.getElementById(
          "message-opacity-value"
        ).textContent = `${e.target.value}%`;
      });

    // Apply button
    document.getElementById("apply-btn").addEventListener("click", applySettings);
  }

  function initializeInputs() {
    // Get values from URL parameters or localStorage
    const theme =
      urlParams.get("theme") || localStorage.getItem("theme") || "dark";
    const displayTime =
      urlParams.get("displayTime") ||
      localStorage.getItem("display-time") ||
      "10";
    const maxMessages =
      urlParams.get("maxMessages") ||
      localStorage.getItem("max-messages") ||
      "5";
    const keepMessages =
      urlParams.get("keepMessages") === "true" ||
      localStorage.getItem("keepMessages") === "true";
    const useCustomColors =
      urlParams.get("useCustomColors") === "true" ||
      localStorage.getItem("useCustomColors") === "true";

    // Set initial values for general controls
    document.getElementById("display-time").value = displayTime;
    document.getElementById("max-messages").value = maxMessages;
    document.getElementById("keep-messages").checked = keepMessages;

    // Load custom colors if they exist and custom colors are enabled
    const backgroundColor =
      urlParams.get("backgroundColor") ||
      localStorage.getItem("backgroundColor");
    const messageBgColor =
      urlParams.get("messageBgColor") ||
      localStorage.getItem("messageBgColor");
    const textColor =
      urlParams.get("textColor") || localStorage.getItem("textColor");
    const nameColor =
      urlParams.get("nameColor") || localStorage.getItem("nameColor");

    if (
      useCustomColors &&
      (backgroundColor || messageBgColor || textColor || nameColor)
    ) {
      // Set custom color input values
      if (backgroundColor) {
        const [color, opacity] = parseColorAndOpacity(backgroundColor);
        document.getElementById("background-color").value = color;
        document.getElementById("bg-opacity").value = opacity;
        document.getElementById("bg-opacity-value").textContent = `${opacity}%`;
      }

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
    } else {
      // Set input values based on the active preset theme (uses presetColors from utils.js)
      const colors = presetColors[theme];
      if (colors) {
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
    }
  }

  function applyPreset(preset) {
    // Reset custom colors
    document.getElementById("background-color").value = "#1e1e1e";
    document.getElementById("message-bg-color").value = "#3c3c3c";
    document.getElementById("text-color").value = "#ffffff";
    document.getElementById("name-color").value = "#ffffff";
    document.getElementById("bg-opacity").value = 70;
    document.getElementById("bg-opacity-value").textContent = "70%";
    document.getElementById("message-opacity").value = 80;
    document.getElementById("message-opacity-value").textContent = "80%";

    // Apply specific preset configurations
    switch (preset) {
      case "light":
        document.getElementById("background-color").value = "#f0f0f0";
        document.getElementById("message-bg-color").value = "#ffffff";
        document.getElementById("text-color").value = "#333333";
        document.getElementById("name-color").value = "#333333";
        break;
      case "purple":
        document.getElementById("background-color").value = "#2e1065";
        document.getElementById("message-bg-color").value = "#53319c";
        document.getElementById("text-color").value = "#ffffff";
        document.getElementById("name-color").value = "#d8bfff";
        break;
      case "green":
        document.getElementById("background-color").value = "#003024";
        document.getElementById("message-bg-color").value = "#005c4b";
        document.getElementById("text-color").value = "#ffffff";
        document.getElementById("name-color").value = "#a7f3d0";
        break;
      case "gaming":
        document.getElementById("background-color").value = "#000000";
        document.getElementById("message-bg-color").value = "#141414";
        document.getElementById("text-color").value = "#00ff00";
        document.getElementById("name-color").value = "#00ffff";
        document.getElementById("bg-opacity").value = 50;
        document.getElementById("bg-opacity-value").textContent = "50%";
        document.getElementById("message-opacity").value = 90;
        document.getElementById("message-opacity-value").textContent = "90%";
        break;
      case "transparent":
        document.getElementById("background-color").value = "#000000";
        document.getElementById("message-bg-color").value = "#000000";
        document.getElementById("text-color").value = "#ffffff";
        document.getElementById("name-color").value = "#ffffff";
        document.getElementById("bg-opacity").value = 0;
        document.getElementById("bg-opacity-value").textContent = "0%";
        document.getElementById("message-opacity").value = 50;
        document.getElementById("message-opacity-value").textContent = "50%";
        break;
    }

    // Apply the theme directly to preview
    localStorage.setItem("theme", preset);
    localStorage.setItem("useCustomColors", "false");

    // Update URL parameters to reflect the theme change
    const url = new URL(window.location.href);
    url.searchParams.set("theme", preset);
    url.searchParams.set("useCustomColors", "false");
    url.searchParams.delete("backgroundColor");
    url.searchParams.delete("messageBgColor");
    url.searchParams.delete("textColor");
    url.searchParams.delete("nameColor");

    // Reload the page with new theme
    window.location.href = url.toString();
  }

  function applySettings() {
    // Get values from inputs
    const keepMessages = document.getElementById("keep-messages").checked;
    const displayTime = document.getElementById("display-time").value;
    const maxMessages = document.getElementById("max-messages").value;

    // Reload the page with new parameters
    const url = new URL(window.location.href);
    url.searchParams.set("keepMessages", keepMessages);
    url.searchParams.set("displayTime", displayTime);
    url.searchParams.set("maxMessages", maxMessages);
    url.searchParams.set("preview", "true");

    // Determine if we're using custom colors
    const useCustomColors = true; // In the controls panel we're always using custom colors

    // Get color values with opacity
    const bgColor = document.getElementById("background-color").value;
    const bgOpacity = document.getElementById("bg-opacity").value;
    const backgroundColor = convertToRgba(bgColor, bgOpacity);

    const msgBgColor = document.getElementById("message-bg-color").value;
    const msgOpacity = document.getElementById("message-opacity").value;
    const messageBgColor = convertToRgba(msgBgColor, msgOpacity);

    const textColor = document.getElementById("text-color").value;
    const nameColor = document.getElementById("name-color").value;

    // Save to localStorage
    localStorage.setItem("keepMessages", keepMessages);
    localStorage.setItem("display-time", displayTime);
    localStorage.setItem("max-messages", maxMessages);
    localStorage.setItem("backgroundColor", backgroundColor);
    localStorage.setItem("messageBgColor", messageBgColor);
    localStorage.setItem("textColor", textColor);
    localStorage.setItem("nameColor", nameColor);
    localStorage.setItem("useCustomColors", useCustomColors);

    // Clear theme from localStorage when using custom colors
    localStorage.removeItem("theme");

    // Update URL parameters to reflect custom colors
    url.searchParams.set("backgroundColor", backgroundColor);
    url.searchParams.set("messageBgColor", messageBgColor);
    url.searchParams.set("textColor", textColor);
    url.searchParams.set("nameColor", nameColor);
    url.searchParams.set("useCustomColors", useCustomColors);

    // Remove theme parameter when using custom colors
    url.searchParams.delete("theme");

    window.location.href = url.toString();
  }
});
