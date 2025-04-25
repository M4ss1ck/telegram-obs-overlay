document.addEventListener("DOMContentLoaded", () => {
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

  // Apply settings button
  const applySettingsBtn = document.getElementById("apply-settings");
  applySettingsBtn.addEventListener("click", () => {
    const maxMessages = document.getElementById("max-messages").value;
    const displayTime = document.getElementById("display-time").value;
    const theme = document.getElementById("theme").value;

    // Store settings in localStorage
    localStorage.setItem("max-messages", maxMessages);
    localStorage.setItem("display-time", displayTime);
    localStorage.setItem("theme", theme);

    // Update preview
    const previewFrame = document.getElementById("preview-frame");
    previewFrame.src = `/overlay?preview=true&theme=${theme}&maxMessages=${maxMessages}&displayTime=${displayTime}`;

    // Show feedback
    const originalText = applySettingsBtn.textContent;
    applySettingsBtn.textContent = "Settings Applied!";
    setTimeout(() => {
      applySettingsBtn.textContent = originalText;
    }, 2000);
  });

  // Load settings from localStorage if available
  const savedMaxMessages = localStorage.getItem("max-messages");
  const savedDisplayTime = localStorage.getItem("display-time");
  const savedTheme = localStorage.getItem("theme");

  if (savedMaxMessages) {
    document.getElementById("max-messages").value = savedMaxMessages;
  }

  if (savedDisplayTime) {
    document.getElementById("display-time").value = savedDisplayTime;
  }

  if (savedTheme) {
    document.getElementById("theme").value = savedTheme;
  }

  // Update preview with saved settings
  const previewFrame = document.getElementById("preview-frame");
  previewFrame.src = `/overlay?preview=true&theme=${
    savedTheme || "dark"
  }&maxMessages=${savedMaxMessages || 5}&displayTime=${savedDisplayTime || 10}`;
});
